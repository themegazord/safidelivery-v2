<?php

namespace App\Services\Empresa\CardapioDigital;

use App\Http\Resources\CardapioDigital\ComboPedidoResource;
use App\Http\Resources\CardapioDigital\ItemPedidoResource;
use App\Http\Resources\CardapioDigital\TamanhoPizzaPedidoResource;
use App\Models\CategoriaTamanho;
use App\Models\Combo;
use App\Models\Configuracao;
use App\Models\Empresa;
use App\Models\HorarioFuncionamento;
use App\Models\HorarioIndisponibilidade;
use App\Models\Item;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;

class CardapioService
{
    public Collection $cardapiosLoja;

    public function categoriasDisponiveis(Empresa $empresa, string $tipo_funcionamento): array
    {
        $categorias = [];
        $hoje = now()->dayOfWeek;
        $this->carregaCardapios($empresa, $tipo_funcionamento);

        foreach ($this->cardapiosLoja as $cardapio) {
            $diasCardapio = array_map('intval', $cardapio->dias_funcionamento ?? []);
            if (in_array($hoje, $diasCardapio)) {
                foreach ($cardapio->categorias as $categoria) {
                    $diasCategoria = array_map('intval', $categoria->dias_funcionamento ?? []);
                    if (in_array($hoje, $diasCategoria)) {
                        $categorias[] = [
                            'id' => $categoria->id,
                            'nome' => $categoria->nome,
                        ];
                    }
                }
            }
        }

        return $categorias;
    }

    public function cardapioHoje(): array
    {
        $hoje = now()->dayOfWeek;
        foreach ($this->cardapiosLoja as $cardapio) {
            $diasCardapio = array_map('intval', $cardapio->dias_funcionamento ?? []);
            if (in_array($hoje, $diasCardapio)) {
                return $cardapio->toArray();
            }
        }
        return [];
    }

    public function getItemPedido(int $item_id): array
    {
        $item = Item::query()
            ->with('grupo_complemento.complementos', 'categoria')
            ->find($item_id, ['id', 'nome', 'preco', 'desconto', 'valor_desconto', 'descricao', 'imagem', 'tipo', 'categoria_id']);

        return [
            'item' => new ItemPedidoResource($item),
        ];
    }

    public function getItemPizzaPedido(int $tamanho_id, int $qtdeSabor, int $menorValorTamanho): array
    {
        $categoriaTamanho = CategoriaTamanho::query()
            ->with(['precosPorTamanho.item', 'categoria.massas', 'categoria.bordas'])
            ->find($tamanho_id);

        if (! $categoriaTamanho) {
            return [];
        }

        return [
            'tamanho' => new TamanhoPizzaPedidoResource($categoriaTamanho, $qtdeSabor, $menorValorTamanho),
        ];
    }

    public function setItemComboPedido(int $combo_id): array
    {
        $combo = Combo::with([
            'meta',
            'grupos' => fn($q) => $q->orderBy('ordem')->with([
                'entradas' => fn($q) => $q->where('tipo', 'item'),
            ]),
            'entradas' => fn($q) => $q->where('tipo', 'complemento')->with([
                'grupoComplemento' => fn($q) => $q->select(['id', 'nome', 'qtd_maxima', 'obrigatoriedade']),
            ]),
            'categoria'
        ])->find($combo_id);

        return (new ComboPedidoResource($combo))->resolve();
    }

    public function validaRecebePedidos(string $tipo_funcionamento, int $empresa_id): bool
    {
        // Obtém a empresa pelo ID
        $empresa = Empresa::find($empresa_id);

        // Obtém o fuso horário da empresa
        $fusoEmpresa = array_values(array_filter($empresa->fusosHorarios(), fn($fuso) => $fuso['id'] === intval($empresa->configuracoes->where('configuracao', 'fuso_horario')->first()->valor)))[0];

        // Obtém a data e hora atual no fuso horário da empresa
        $hoje = Carbon::now($fusoEmpresa['name'])->toDateString();
        $horaAtual = Carbon::now()->format('H:i');
        $diaSemana = Carbon::now()->dayOfWeek;
        $diaAnterior = ($diaSemana === 0) ? 6 : $diaSemana - 1; // Ajuste para considerar o domingo (0) como o dia anterior ao sábado (6)


        // Verifica se há alguma indisponibilidade programada para a empresa no dia atual
        if (HorarioIndisponibilidade::whereDate('data_inicio', '<=', $hoje)->whereDate('data_fim', '>=', $hoje)->exists()) {
            return false;
        }

        // Verifica configurações globais de funcionamento da empresa
        $configuracao = Configuracao::whereEmpresaId($empresa_id)->whereConfiguracao('funcionamentoEstabelecimento')->first()?->valor;
        if ($configuracao === null)
            return false; // Empresa sem configuração
        if ($configuracao === 'fechado')
            return false; // Empresa fechada
        if ($configuracao === 'sempre')
            return true; // Empresa sempre aberta

        // Obtém os horários de funcionamento normais para o dia atual e tipo de funcionamento
        $horariosHoje = HorarioFuncionamento::whereEmpresaId($empresa_id)
            ->where('dia_semana', $diaSemana)
            ->where('tipo_funcionamento', $tipo_funcionamento)
            ->whereStatus(true)
            ->get();

        // Verifica se o horário atual está dentro de algum período de funcionamento do dia
        foreach ($horariosHoje as $horario) {
            if ($horaAtual >= $horario->hora_inicio && $horaAtual <= $horario->hora_fim) {
                return true;
            }
        }

        // Verifica se o horário atual está dentro de algum período de funcionamento do dia
        foreach ($horariosHoje as $horario) {
            if ($horario->hora_inicio > $horario->hora_fim && $horaAtual >= $horario->hora_inicio && $horaAtual <= "23:59") {
                return true;
            }
        }

        // Obtém os horários que começaram no dia anterior e atravessam a meia-noite
        $horariosOntem = HorarioFuncionamento::whereEmpresaId($empresa_id)
            ->where('dia_semana', $diaAnterior)
            ->where('tipo_funcionamento', $tipo_funcionamento)
            ->whereStatus(true)
            ->where('hora_inicio', '>', '12:00:00') // Considera horários que começaram à noite
            ->where('hora_fim', '<', '12:00:00') // Considera horários que terminam na madrugada
            ->get();

        // Verifica se o horário atual está dentro do intervalo desses horários noturnos
        foreach ($horariosOntem as $horario) {
            if ($horaAtual <= $horario->hora_fim) {
                return true;
            }
        }

        // Se nenhuma das verificações permitir o funcionamento, retorna falso
        return false;
    }

    private function carregaCardapios(Empresa $empresa, string $tipo_funcionamento): void
    {
        $this->cardapiosLoja = $empresa->cardapios()
            ->where('tipo_funcionamento', $tipo_funcionamento)
            ->select([
                'id',
                'nome',
                'descricao',
                'dias_funcionamento',
                'tipo_funcionamento',
            ])
            ->with([
                'categorias' => fn($q) => $q
                    ->orderBy('ordem', 'asc')
                    ->select([
                        'id',
                        'cardapio_id',
                        'tipo',
                        'nome',
                        'dias_funcionamento',
                        'ordem',
                    ])
                    ->with([
                        'itens' => fn($q) => $q
                            ->whereNotIn('tipo', ['CON'])
                            ->select([
                                'id',
                                'categoria_id',
                                'nome',
                                'descricao',
                                'preco',
                                'desconto',
                                'valor_desconto',
                                'imagem',
                                'peso',
                                'qtde_pessoas',
                                'classificacao',
                                'dias_funcionamento',
                            ])
                            ->with([
                                'grupo_complemento' => fn($q) => $q
                                    ->select([
                                        'id',
                                        'item_id',
                                        'nome',
                                        'qtd_maxima',
                                        'obrigatoriedade',
                                    ])
                                    ->with([
                                        'complementos' => fn($q) => $q
                                            ->select([
                                                'id',
                                                'grupo_id',
                                                'nome',
                                                'preco',
                                            ]),
                                    ]),
                            ]),

                        'combos' => fn($q) => $q
                            ->select([
                                'id',
                                'categoria_id',
                                'nome',
                                'descricao',
                                'preco',
                                'imagem',
                                'dias_funcionamento',
                            ]),

                        'tamanhos' => fn($q) => $q
                            ->select([
                                'id',
                                'categoria_id',
                                'nome',
                                'qtde_pedacos',
                                'qtde_sabores',
                            ])
                            ->with([
                                'precosPorTamanho' => fn($q) => $q
                                    ->where('status', true)
                                    ->select([
                                        'id',
                                        'tamanho_id',
                                        'item_id',
                                        'preco',
                                        'status',
                                        'dias_funcionamento',
                                    ])
                                    ->with([
                                        'item' => fn($q) => $q
                                            ->select([
                                                'id',
                                                'nome',
                                                'imagem',
                                            ]),
                                    ]),
                            ]),
                    ]),
            ])
            ->get();
    }
}

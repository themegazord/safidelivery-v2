<?php

namespace App\Services\Fidelidade;

use App\Models\CategoriaBorda;
use App\Models\CategoriaMassa;
use App\Models\CategoriaTamanho;
use App\Models\FidelidadeConfig;
use App\Models\FidelidadeProgresso;
use App\Models\Item;
use App\Models\ItemPreco;
use App\Models\Pedido;
use App\Models\PedidoComboItem;
use App\Models\PedidoComplemento;
use App\Models\PedidoItem;
use App\Models\PedidoSaborPizza;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class FidelidadeService
{
    /**
     * Chamado ao concluir um pedido (status → entregue ou finalizado).
     * Incrementa o progresso do cliente e gera recompensa ao atingir a meta.
     */
    public function registrarPedidoConcluido(Pedido $pedido): void
    {
        if (is_null($pedido->cliente_id)) {
            return;
        }

        $config = FidelidadeConfig::where('empresa_id', $pedido->empresa_id)->ativo()->first();

        if (is_null($config)) {
            return;
        }

        // Pedido onde a recompensa de fidelidade foi aplicada não conta para o próximo ciclo
        if (! is_null($pedido->fidelidade_recompensa_aplicada)) {
            return;
        }

        // Verifica se o tipo de atendimento deste pedido está habilitado para fidelidade
        $tipoFuncionamento = match ($pedido->tipo) {
            'M' => 'mesa',
            default => $pedido->valor_frete !== null ? 'delivery' : 'retirada',
        };

        if (! in_array($tipoFuncionamento, $config->tipos_funcionamento_efetivos)) {
            return;
        }

        DB::transaction(function () use ($pedido, $config) {
            $progresso = FidelidadeProgresso::firstOrCreate(
                ['cliente_id' => $pedido->cliente_id, 'empresa_id' => $pedido->empresa_id],
                ['contador_atual' => 0, 'valor_acumulado' => 0, 'recompensa_disponivel' => false],
            );

            // Não sobrescreve recompensa já disponível — aguarda o cliente usar
            if ($progresso->recompensa_disponivel) {
                return;
            }

            if ($config->tipo_gatilho === 'qtd_pedidos') {
                $progresso->contador_atual += 1;
            } else {
                $progresso->valor_acumulado += $pedido->financeiro?->total ?? 0;
            }

            $atingiu = $config->tipo_gatilho === 'qtd_pedidos'
                ? $progresso->contador_atual >= $config->valor_gatilho
                : $progresso->valor_acumulado >= $config->valor_gatilho;

            if ($atingiu) {
                $progresso->recompensa_disponivel = true;
                $progresso->recompensa_tipo = $config->tipo_recompensa;
                $progresso->recompensa_valor = $config->valor_recompensa;
                $progresso->recompensa_expira_em = $config->validade_dias
                    ? now()->addDays($config->validade_dias)->toDateString()
                    : null;
                $progresso->contador_atual = 0;
                $progresso->valor_acumulado = 0;
            }

            $progresso->save();
        });
    }

    /**
     * Retorna os top 5 itens/pizzas/combos mais pedidos pelo cliente naquele estabelecimento,
     * respeitando os filtros de valor máximo e categorias bloqueadas da config.
     * Retorna uma coleção mista de itens (tipo='I'), tamanhos de pizza (tipo='P') e combos (tipo='C').
     */
    public function getItensPremioDisponiveis(int $clienteId, int $empresaId): Collection
    {
        $config = FidelidadeConfig::where('empresa_id', $empresaId)->ativo()->first();

        $queryItens = DB::table('pedido_itens as pi')
            ->join('pedidos as p', 'p.id', '=', 'pi.pedido_id')
            ->join('itens as i', 'i.id', '=', 'pi.item_id')
            ->where('p.empresa_id', $empresaId)
            ->where('p.cliente_id', $clienteId)
            ->whereIn('p.status', ['entregue', 'finalizado'])
            ->where('pi.item_premio', false)
            ->where('pi.tipo', 'I')
            ->whereNull('p.deleted_at')
            ->whereNull('i.deleted_at')
            ->whereNotNull('pi.item_id');

        if ($config?->valor_max_premio) {
            $queryItens->where('i.preco', '<=', $config->valor_max_premio);
        }

        if (! empty($config?->categorias_bloqueadas)) {
            $queryItens->whereNotIn('i.categoria_id', $config->categorias_bloqueadas);
        }

        $itens = $queryItens
            ->select('i.id', 'i.nome', 'i.preco', 'i.imagem', DB::raw("'I' as tipo"), DB::raw('COUNT(*) as total_pedidos'))
            ->groupBy('i.id', 'i.nome', 'i.preco', 'i.imagem')
            ->orderByDesc('total_pedidos')
            ->limit(5)
            ->get();

        $queryPizzas = DB::table('pedido_itens as pi')
            ->join('pedidos as p', 'p.id', '=', 'pi.pedido_id')
            ->join('categoria_tamanho as ct', 'ct.id', '=', 'pi.tamanho_id')
            ->join('categorias as c', 'c.id', '=', 'ct.categoria_id')
            ->where('p.empresa_id', $empresaId)
            ->where('p.cliente_id', $clienteId)
            ->whereIn('p.status', ['entregue', 'finalizado'])
            ->where('pi.item_premio', false)
            ->where('pi.tipo', 'P')
            ->whereNull('p.deleted_at')
            ->whereNull('c.deleted_at')
            ->whereNotNull('pi.tamanho_id');

        if (! empty($config?->categorias_bloqueadas)) {
            $queryPizzas->whereNotIn('ct.categoria_id', $config->categorias_bloqueadas);
        }

        $pizzas = $queryPizzas
            ->select('ct.id', DB::raw("CONCAT(c.nome, ' ', ct.nome) as nome"), DB::raw('NULL as preco'), DB::raw('NULL as imagem'), DB::raw("'P' as tipo"), DB::raw('COUNT(*) as total_pedidos'))
            ->groupBy('ct.id', 'c.nome', 'ct.nome', 'ct.categoria_id')
            ->orderByDesc('total_pedidos')
            ->limit(5)
            ->get();

        $queryCombos = DB::table('pedido_itens as pi')
            ->join('pedidos as p', 'p.id', '=', 'pi.pedido_id')
            ->join('itens as i', 'i.id', '=', 'pi.item_id')
            ->leftJoin('combos_meta as cm', 'cm.combo_id', '=', 'i.id')
            ->where('p.empresa_id', $empresaId)
            ->where('p.cliente_id', $clienteId)
            ->whereIn('p.status', ['entregue', 'finalizado'])
            ->where('pi.item_premio', false)
            ->where('pi.tipo', 'C')
            ->where('i.tipo', 'CON')
            ->whereNull('p.deleted_at')
            ->whereNull('i.deleted_at')
            ->whereNotNull('pi.item_id');

        if ($config?->valor_max_premio) {
            $queryCombos->where(function ($q) use ($config) {
                $q->whereNull('cm.preco_combo')
                    ->orWhere('cm.preco_combo', '<=', $config->valor_max_premio);
            });
        }

        if (! empty($config?->categorias_bloqueadas)) {
            $queryCombos->whereNotIn('i.categoria_id', $config->categorias_bloqueadas);
        }

        $combos = $queryCombos
            ->select('i.id', 'i.nome', DB::raw('cm.preco_combo as preco'), 'i.imagem', DB::raw("'C' as tipo"), DB::raw('COUNT(*) as total_pedidos'))
            ->groupBy('i.id', 'i.nome', 'cm.preco_combo', 'i.imagem')
            ->orderByDesc('total_pedidos')
            ->limit(5)
            ->get();

        return $itens->concat($pizzas)->concat($combos)
            ->sortByDesc('total_pedidos')
            ->take(5)
            ->values();
    }

    /**
     * Aplica a recompensa no pedido conforme o tipo configurado.
     */
    public function aplicarRecompensa(Pedido $pedido, ?int $itemId = null, string $tipo = 'I', array $complementos = [], ?array $pizzaConfig = null, ?array $comboConfig = null): void
    {
        if (is_null($pedido->cliente_id)) {
            abort(422, 'Pedido sem cliente identificado.');
        }

        $progresso = FidelidadeProgresso::where('cliente_id', $pedido->cliente_id)
            ->where('empresa_id', $pedido->empresa_id)
            ->first();

        if (is_null($progresso) || ! $progresso->recompensa_disponivel) {
            abort(422, 'Nenhuma recompensa disponível para este cliente.');
        }

        $this->verificarRecompensaExpirada($pedido->cliente_id, $pedido->empresa_id);

        $progresso->refresh();
        if (! $progresso->recompensa_disponivel) {
            abort(422, 'A recompensa expirou.');
        }

        DB::transaction(function () use ($pedido, $progresso, $itemId, $tipo, $complementos, $pizzaConfig, $comboConfig) {
            match ($progresso->recompensa_tipo) {
                'item_gratis' => $this->aplicarItemGratis($pedido, $progresso, $itemId, $tipo, $complementos, $pizzaConfig, $comboConfig),
                'frete_gratis' => $this->aplicarFreteGratis($pedido, $progresso),
                'desconto_percentual' => $this->aplicarDescontoPercentual($pedido, $progresso),
                'desconto_fixo' => $this->aplicarDescontoFixo($pedido, $progresso),
            };

            $progresso->recompensa_disponivel = false;
            $progresso->recompensa_usada_em = now();
            $progresso->recompensa_tipo = null;
            $progresso->recompensa_valor = null;
            $progresso->recompensa_expira_em = null;
            $progresso->save();
        });
    }

    /**
     * Limpa recompensa expirada, se aplicável.
     */
    public function verificarRecompensaExpirada(int $clienteId, int $empresaId): void
    {
        FidelidadeProgresso::where('cliente_id', $clienteId)
            ->where('empresa_id', $empresaId)
            ->where('recompensa_disponivel', true)
            ->whereNotNull('recompensa_expira_em')
            ->where('recompensa_expira_em', '<', now()->toDateString())
            ->update([
                'recompensa_disponivel' => false,
                'recompensa_tipo' => null,
                'recompensa_valor' => null,
                'recompensa_expira_em' => null,
            ]);
    }

    private function aplicarItemGratis(Pedido $pedido, FidelidadeProgresso $progresso, ?int $itemId, string $tipo = 'I', array $complementos = [], ?array $pizzaConfig = null, ?array $comboConfig = null): void
    {
        if ($tipo === 'C') {
            if (is_null($comboConfig)) {
                abort(422, 'Configuração do combo não fornecida.');
            }
            $this->aplicarComboGratis($pedido, $comboConfig);

            return;
        }

        if ($tipo === 'P') {
            if (is_null($pizzaConfig)) {
                abort(422, 'Configuração da pizza não fornecida.');
            }
            $this->aplicarPizzaGratis($pedido, $pizzaConfig);

            return;
        }

        // tipo 'I'
        if (is_null($itemId)) {
            abort(422, 'Selecione um item para a recompensa.');
        }

        $disponiveis = $this->getItensPremioDisponiveis($pedido->cliente_id, $pedido->empresa_id);
        $itemDisponivel = $disponiveis->first(fn ($i) => $i->id == $itemId && $i->tipo === 'I');

        if (is_null($itemDisponivel)) {
            abort(422, 'Item selecionado não está disponível como prêmio.');
        }

        $itemModel = Item::find($itemId);

        $totalComplementos = 0;
        foreach ($complementos as $grupoComplementos) {
            foreach ($grupoComplementos['complementos'] as $complemento) {
                $totalComplementos += floatval($complemento['preco']) * intval($complemento['qtde']);
            }
        }

        $subtotal = $itemModel->preco + $totalComplementos;

        $pedidoItem = PedidoItem::create([
            'pedido_id' => $pedido->id,
            'item_id' => $itemModel->id,
            'uuid' => Str::uuid(),
            'nome' => $itemModel->nome,
            'quantidade' => 1,
            'preco_unitario' => $itemModel->preco,
            'subtotal' => $subtotal,
            'tipo' => 'I',
            'item_premio' => true,
            'preco_original' => $itemModel->preco,
        ]);

        foreach ($complementos as $grupoComplementos) {
            foreach ($grupoComplementos['complementos'] as $complementoId => $complemento) {
                if (intval($complemento['qtde']) > 0) {
                    PedidoComplemento::create([
                        'pedido_item_id' => $pedidoItem->id,
                        'complemento_id' => $complementoId,
                        'uuid' => Str::uuid(),
                        'nome' => $complemento['nome'],
                        'qtde' => $complemento['qtde'],
                        'preco_unitario' => $complemento['preco'],
                    ]);
                }
            }
        }

        if ($pedido->financeiro) {
            $pedido->financeiro->update([
                'subtotal_itens' => $pedido->financeiro->subtotal_itens + $subtotal,
                'valor_desconto' => ($pedido->financeiro->valor_desconto ?? 0) + $subtotal,
            ]);
        }

        $pedido->update(['fidelidade_recompensa_aplicada' => 'item_gratis']);
    }

    private function aplicarComboGratis(Pedido $pedido, array $comboConfig): void
    {
        $disponiveis = $this->getItensPremioDisponiveis($pedido->cliente_id, $pedido->empresa_id);
        $comboDisponivel = $disponiveis->first(fn ($i) => $i->id == $comboConfig['combo_id'] && $i->tipo === 'C');

        if (is_null($comboDisponivel)) {
            abort(422, 'Combo selecionado não está disponível como prêmio.');
        }

        $tipoPreco = $comboConfig['tipo_preco'] ?? 'preco_combo';

        if ($tipoPreco === 'preco_combo') {
            $precoOriginal = (float) ($comboConfig['preco_fixo'] ?? 0);
        } else {
            $precoOriginal = 0;
            foreach ($comboConfig['grupos'] ?? [] as $grupo) {
                foreach ($grupo['itens'] ?? [] as $itemData) {
                    if (($itemData['qtde'] ?? 0) > 0) {
                        $precoOriginal += (float) ($itemData['preco'] ?? 0) * (int) $itemData['qtde'];
                    }
                }
            }
            foreach ($comboConfig['grupos_complemento'] ?? [] as $gcData) {
                foreach ($gcData['complementos'] ?? [] as $compData) {
                    if (($compData['qtde'] ?? 0) > 0) {
                        $precoOriginal += (float) ($compData['preco'] ?? 0) * (int) $compData['qtde'];
                    }
                }
            }
        }

        $pedidoItem = PedidoItem::create([
            'pedido_id' => $pedido->id,
            'item_id' => $comboConfig['combo_id'],
            'uuid' => Str::uuid(),
            'nome' => $comboConfig['nome'],
            'quantidade' => 1,
            'preco_unitario' => 0,
            'subtotal' => 0,
            'tipo' => 'C',
            'tipo_preco' => $comboConfig['tipo_preco'] ?? 'preco_combo',
            'item_premio' => true,
            'preco_original' => $precoOriginal,
        ]);

        foreach ($comboConfig['grupos'] ?? [] as $grupoId => $grupo) {
            foreach ($grupo['itens'] ?? [] as $referenciaId => $itemData) {
                if (($itemData['qtde'] ?? 0) > 0) {
                    PedidoComboItem::create([
                        'pedido_item_id' => $pedidoItem->id,
                        'uuid' => Str::uuid(),
                        'referencia_id' => $referenciaId,
                        'tipo' => 'item',
                        'grupo_nome' => $grupo['nome'],
                        'item_nome' => $itemData['nome'],
                        'preco_unitario' => $itemData['preco'] ?? 0,
                        'qtde' => $itemData['qtde'],
                    ]);
                }
            }
        }

        foreach ($comboConfig['grupos_complemento'] ?? [] as $gcId => $gcData) {
            foreach ($gcData['complementos'] ?? [] as $referenciaId => $compData) {
                if (($compData['qtde'] ?? 0) > 0) {
                    PedidoComboItem::create([
                        'pedido_item_id' => $pedidoItem->id,
                        'uuid' => Str::uuid(),
                        'referencia_id' => $referenciaId,
                        'tipo' => 'complemento',
                        'grupo_nome' => $gcData['nome'],
                        'item_nome' => $compData['nome'],
                        'preco_unitario' => $compData['preco'] ?? 0,
                        'qtde' => $compData['qtde'],
                    ]);
                }
            }
        }

        if ($pedido->financeiro) {
            $pedido->financeiro->update([
                'subtotal_itens' => $pedido->financeiro->subtotal_itens + $precoOriginal,
                'valor_desconto' => ($pedido->financeiro->valor_desconto ?? 0) + $precoOriginal,
            ]);
        }

        $pedido->update(['fidelidade_recompensa_aplicada' => 'item_gratis']);
    }

    private function aplicarPizzaGratis(Pedido $pedido, array $pizzaConfig): void
    {
        $tamanho = CategoriaTamanho::with(['categoria'])->find($pizzaConfig['tamanho_id']);

        if (! $tamanho) {
            abort(422, 'Tamanho de pizza inválido.');
        }

        $saboresSelecionados = array_filter($pizzaConfig['itens'] ?? [], fn ($s) => $s['qtde_selecionada'] > 0);

        if (empty($saboresSelecionados)) {
            abort(422, 'Selecione ao menos um sabor.');
        }

        $qtdSabor = $pizzaConfig['qtd_sabor'] ?? 1;
        $qtdSaborNome = $qtdSabor > 1 ? $qtdSabor.' SABORES' : '';
        $nome = $tamanho->categoria->nome.' '.$tamanho->nome.($qtdSaborNome ? ' '.$qtdSaborNome : '');

        $precoSabores = array_sum(array_map(
            fn ($s) => floatval(str_replace(',', '.', $s['preco_unitario'])) * intval($s['qtde_selecionada']),
            $saboresSelecionados
        ));

        $precoBordaId = $pizzaConfig['bordaSelecionada'] ?? null;
        $precoBorda = $precoBordaId ? (float) (CategoriaBorda::find($precoBordaId)?->preco ?? 0) : 0;

        $precoMassaId = $pizzaConfig['massaSelecionada'] ?? null;
        $precoMassa = $precoMassaId ? (float) (CategoriaMassa::find($precoMassaId)?->preco ?? 0) : 0;

        $precoOriginal = $precoSabores + $precoBorda + $precoMassa;

        $pedidoItem = PedidoItem::create([
            'pedido_id' => $pedido->id,
            'item_id' => null,
            'borda_id' => $precoBordaId,
            'massa_id' => $precoMassaId,
            'preco_borda' => $precoBorda,
            'preco_massa' => $precoMassa,
            'tamanho_id' => $tamanho->id,
            'uuid' => Str::uuid(),
            'nome' => $nome,
            'quantidade' => 1,
            'preco_unitario' => 0,
            'subtotal' => 0,
            'tipo' => 'P',
            'item_premio' => true,
            'preco_original' => $precoOriginal,
        ]);

        foreach ($saboresSelecionados as $sabor) {
            $itemPreco = ItemPreco::find($sabor['id']);
            PedidoSaborPizza::create([
                'pedido_item_id' => $pedidoItem->id,
                'sabor_id' => $itemPreco->item_id,
                'uuid' => Str::uuid(),
                'nome' => $sabor['nome'],
                'descricao' => $sabor['descricao'] ?? null,
                'preco_unitario' => floatval(str_replace(',', '.', $sabor['preco_unitario'])),
                'qtde_fracionada' => $this->defineQuantidadeDecimal($sabor['nome']),
                'qtde' => $sabor['qtde_selecionada'],
            ]);
        }

        if ($pedido->financeiro) {
            $pedido->financeiro->update([
                'subtotal_itens' => $pedido->financeiro->subtotal_itens + $precoOriginal,
                'valor_desconto' => ($pedido->financeiro->valor_desconto ?? 0) + $precoOriginal,
            ]);
        }

        $pedido->update(['fidelidade_recompensa_aplicada' => 'item_gratis']);
    }

    private function aplicarFreteGratis(Pedido $pedido, FidelidadeProgresso $progresso): void
    {
        $freteOriginal = $pedido->valor_frete;

        $pedido->update([
            'frete_original' => $freteOriginal,
            'valor_frete' => 0,
            'fidelidade_recompensa_aplicada' => 'frete_gratis',
        ]);

        if ($pedido->financeiro) {
            $pedido->financeiro->update(['total' => max(0, $pedido->financeiro->total - $freteOriginal)]);
        }
    }

    private function baseCalculo(Pedido $pedido): float
    {
        $config = $pedido->empresa->fidelidadeConfig;

        if ($config?->base_calculo_desconto === 'total_pedido') {
            return (float) $pedido->financeiro->total;
        }

        return (float) $pedido->itens()->where('item_premio', false)->sum('subtotal');
    }

    private function aplicarDescontoPercentual(Pedido $pedido, FidelidadeProgresso $progresso): void
    {
        $config = $pedido->empresa->fidelidadeConfig;
        $desconto = round($this->baseCalculo($pedido) * ($progresso->recompensa_valor / 100), 2);

        $pedido->update([
            'fidelidade_desconto' => $desconto,
            'fidelidade_percentual' => $progresso->recompensa_valor,
            'fidelidade_base_calculo' => $config?->base_calculo_desconto ?? 'subtotal_itens',
            'fidelidade_recompensa_aplicada' => 'desconto_percentual',
        ]);

        if ($pedido->financeiro) {
            $pedido->financeiro->update([
                'total' => max(0, $pedido->financeiro->total - $desconto),
                'valor_desconto' => ($pedido->financeiro->valor_desconto ?? 0) + $desconto,
            ]);
        }
    }

    private function aplicarDescontoFixo(Pedido $pedido, FidelidadeProgresso $progresso): void
    {
        $desconto = min($progresso->recompensa_valor, (float) $pedido->financeiro->total);

        $pedido->update([
            'fidelidade_desconto' => $desconto,
            'fidelidade_recompensa_aplicada' => 'desconto_fixo',
        ]);

        if ($pedido->financeiro) {
            $pedido->financeiro->update([
                'total' => max(0, $pedido->financeiro->total - $desconto),
                'valor_desconto' => ($pedido->financeiro->valor_desconto ?? 0) + $desconto,
            ]);
        }
    }

    private function defineQuantidadeDecimal(string $nome): float|int
    {
        return match (substr($nome, 0, 3)) {
            '1/2' => .5,
            '1/3' => .3,
            '1/4' => .25,
            default => 1
        };
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Pedido extends Model
{
    use SoftDeletes;

    protected $table = 'pedidos';

    public const STATUS_FINALIZADOS_SUCESSO = ['entregue', 'entregue para mesa', 'finalizado'];

    public const STATUS_CANCELADOS = ['cancelado', 'pix expirado'];

    protected $fillable = ['ifood_display_id', 'pedido_ifood_id', 'ifood_entregue_por', 'endereco_entrega_ifood', 'mesa', 'comanda', 'informa_comanda_manual', 'empresa_id', 'cliente_id', 'tipo', 'status', 'prioridade', 'observacao', 'codigo_coleta', 'valor_frete', 'endereco_entrega_id', 'nome', 'telefone', 'cpf_cnpj_ifood', 'eh_agendado', 'data_agendamento_inicio', 'data_agendamento_fim', 'data_inicio_preparo', 'fidelidade_recompensa_aplicada', 'fidelidade_desconto', 'fidelidade_percentual', 'fidelidade_base_calculo', 'frete_original'];

    public function itens(): HasMany
    {
        return $this->hasMany(PedidoItem::class);
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class); // Ou User::class, se usar autenticação.
    }

    public function enderecoEntregaIfood(): BelongsTo
    {
        return $this->belongsTo(Endereco::class, 'endereco_entrega_ifood', 'id');
    }

    public function enderecoEntrega(): BelongsTo
    {
        return $this->belongsTo(Endereco::class, 'endereco_entrega_id');
    }

    public function getEnderecoDeEntregaAttribute(): ?Endereco
    {
        return $this->enderecoEntrega ?? $this->cliente?->endereco;
    }

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class);
    }

    public function financeiro(): HasOne
    {
        return $this->hasOne(FinanceiroPedido::class, 'pedido_id');
    }

    public function justificativaCancelamento(): BelongsTo
    {
        return $this->belongsTo(JustificativaCancelamentoPedido::class);
    }

    public function integracaoIfood(): BelongsTo
    {
        return $this->belongsTo(PedidoIntegracaoIfood::class, 'pedido_ifood_id', 'orderId');
    }

    public function cupomUsadoNoPedido(): BelongsToMany
    {
        return $this->belongsToMany(Promocao::class, 'promocao_usada', 'pedido_id', 'promocao_id');
    }

    public function cuponsUsadoNoIfood(): HasMany
    {
        return $this->hasMany(PromocaoUsadaIfood::class, 'pedido_id');
    }

    public function dadosRetiradaPedido(): HasOne
    {
        return $this->hasOne(DadosRetiradaPedido::class, 'pedido_ifood_id', 'pedido_ifood_id');
    }

    public function cashback(): HasOne
    {
        return $this->hasOne(CashbackCredito::class);
    }

    public function defineTipoPedido(): string
    {
        return match ($this->tipo) {
            'D' => 'Delivery',
            'M' => 'Atendimento em mesa',
            'R' => 'Retirada no estabelecimento'
        };
    }

    public function defineCorDependendoStatus(): string
    {
        return match ($this->status) {
            'pendente' => 'bg-yellow-500 text-white',
            'aceito' => 'bg-green-500 text-white',
            'sendo preparado' => 'bg-sky-500 text-white',
            'sendo entregue' => 'bg-purple-500 text-white',
            'pronto para entrega' => 'bg-cyan-500 text-white',
            'entregue para mesa' => 'bg-green-500 text-white',
            'entregue' => 'bg-green-500 text-white',
            'finalizado' => 'bg-green-500 text-white',
            'pedido feito' => 'bg-green-500 text-white',
            'cancelado' => 'bg-red-500 text-white',
            'pix expirado' => 'bg-gray-500 text-white',
            'confirmar pix' => 'bg-yellow-500 text-white',
            'aguardando_item_premio' => 'bg-yellow-500 text-white',
        };
    }

    public function defineStatusPedidoCliente(): string
    {
        return match ($this->status) {
            'pendente' => 'Pedido pendente',
            'aceito' => 'Pedido aceito',
            'sendo preparado' => 'Pedido está sendo preparado',
            'sendo entregue' => 'Pedido está sendo entregue',
            'pronto para entrega' => 'Esperando entregador',
            'entregue' => 'Pedido entregue',
            'finalizado' => 'Pedido da mesa finalizado',
            'entregue para mesa' => 'Pedido entregue na mesa',
            'pedido feito' => 'Pedido feito',
            'cancelado' => 'Pedido cancelado',
            'pix expirado' => 'Pix expirado',
            'confirmar pix' => 'Esperando a confirmação do Pix',
            'aguardando_item_premio' => 'Aguardando seleção do item grátis',
        };
    }

    public function ehPrioridade(): bool
    {
        return (bool) $this->prioridade;
    }
}

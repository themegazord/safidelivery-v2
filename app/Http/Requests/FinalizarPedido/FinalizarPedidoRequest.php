<?php

namespace App\Http\Requests\FinalizarPedido;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class FinalizarPedidoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'pedido' => ['required', 'array', 'min:1'],
            'pedido.*.id' => ['required', 'integer'],
            'pedido.*.quantidade' => ['required', 'integer', 'min:1'],
            'pedido.*.total' => ['required', 'numeric'],
            'pedido.*.tipo' => ['required', 'string', 'in:PRE,BEB,IND,PIZ,CON'],
            'forma_pagamento' => ['required_unless:tipo_funcionamento,mesa'],
            'frete' => ['nullable', 'numeric'],
            'subtotal' => ['required', 'numeric'],
            'total' => ['required', 'numeric'],
            'observacao' => ['nullable', 'string'],
            'cliente' => ['nullable', 'array'],
            'cupom' => ['nullable', 'string'],
            'usar_cashback' => ['nullable', 'boolean'],
            'resgate_fidelidade' => ['nullable', 'array'],
            'resgate_fidelidade.usar' => ['nullable', 'boolean'],
            'resgate_fidelidade.item_id' => ['nullable', 'integer'],
            'resgate_fidelidade.tipo' => ['nullable', 'string', 'in:I,P,C'],
            'resgate_fidelidade.complementos' => ['nullable', 'array'],
            'resgate_fidelidade.pizza_config' => ['nullable', 'array'],
            'resgate_fidelidade.combo_config' => ['nullable', 'array'],
            'tipo_funcionamento' => ['required', 'in:delivery,retirada,mesa'],
            'interacao_id' => ['required', 'string'],
            'configuracoes'    => ['required', 'array'],
            'mesa'             => ['nullable', 'numeric'],
            'nome_cliente'     => ['nullable', 'string'],
            'telefone_cliente' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'required' => 'O :attribute é obrigatório.',
            'required_unless' => 'O :attribute é obrigatório.',
            'array' => 'O :attribute deve ser uma lista.',
            'numeric' => 'O :attribute deve ser um número.',
            'integer' => 'O :attribute deve ser um número inteiro.',
            'min' => 'O :attribute deve ter pelo menos :min.',
            'in' => 'O :attribute selecionado é inválido.',
        ];
    }

    public function attributes(): array
    {
        return [
            'pedido' => 'pedido',
            'forma_pagamento' => 'forma de pagamento',
            'frete' => 'frete',
            'subtotal' => 'subtotal',
            'total' => 'total',
            'observacao' => 'observação',
            'cliente' => 'cliente',
            'tipo_funcionamento' => 'tipo de funcionamento',
            'interacao_id' => 'interação',
            'configuracoes' => 'configurações',
        ];
    }
}

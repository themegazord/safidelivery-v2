<?php

namespace App\Http\Requests\Promocoes;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PromocaoRequest extends FormRequest
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
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $promocaoId = $this->route('cupom_id') ? base64_decode($this->route('cupom_id')) : null;

        return [
            'nome_cupom' => [
                'required',
                'string',
                'max:50',
                Rule::unique('promocao', 'nome_cupom')->ignore($promocaoId),
            ],
            'descricao_cupom' => ['required', 'string'],
            'valido_cliente_novo' => ['required', 'boolean'],
            'onde_afetara' => ['required', Rule::in(['produto', 'frete'])],
            'tipo_cupom' => ['required', Rule::in(['reais', 'porcentagem'])],
            'valor_desconto' => ['required', 'numeric', 'min:0'],
            'valor_minimo_pedido' => ['required', 'numeric', 'min:0'],
            'valor_maximo_desconto' => ['required', 'numeric', 'min:0'],
            'qtde_clientes_usabilidade' => ['required', Rule::in(['ilimitado', 'limitado'])],
            'qtde_clientes' => ['required', 'integer', 'min:0'],
            'qtde_usos' => ['required', 'integer', 'min:0'],
            'uso_unico' => ['required', 'boolean'],
            'data_vencimento' => ['required', 'date'],
            'dias_disponiveis' => ['required', 'array', 'min:1'],
            'dias_disponiveis.*' => ['integer', 'between:0,6'],
            'cupom_visivel' => ['required', 'boolean'],
            'status' => ['required', Rule::in(['ativo', 'inativo'])],
        ];
    }

    public function messages(): array
    {
        return [
            'required' => 'Campo obrigatório',
            'nome_cupom.unique' => 'Promoção já existe.',
            'nome_cupom.max' => 'O cupom deve conter no máximo 50 caracteres.',
            'dias_disponiveis.min' => 'Selecione ao menos um dia da semana.',
        ];
    }
}

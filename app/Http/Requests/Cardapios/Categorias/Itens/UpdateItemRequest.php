<?php

namespace App\Http\Requests\Cardapios\Categorias\Itens;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateItemRequest extends FormRequest
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
            'nome' => ['required'],
            'tipo' => ['required'],
            'external_id' => ['nullable'],
            'categoria_id' => ['nullable', 'integer'],
            'preco' => ['required_if:tipo,PRE,BEB,IND', 'numeric'],
            'desconto' => ['nullable', 'boolean'],
            'valor_desconto' => ['nullable', 'numeric'],
            'porcentagem_desconto' => ['nullable', 'numeric'],
            'descricao' => ['nullable', 'string'],
            'qtde_pessoas' => ['nullable'],
            'peso' => ['nullable'],
            'gramagem' => ['nullable', 'string'],
            'eh_bebida' => ['nullable', 'boolean'],
            'imagem' => ['nullable', 'string'],
            'classificacao' => ['nullable', 'array'],
            'classificacao.*.value' => ['required_with:classificacao', 'string'],
            'classificacao.*.status' => ['required_with:classificacao', 'boolean'],
            'dias_funcionamento' => ['nullable', 'array'],
            'dias_funcionamento.*' => [],
            'precos' => ['required_if:tipo,PIZ', 'array'],
            'precos.*.tamanho_id' => ['nullable'],
            'precos.*.status' => ['nullable', 'boolean'],
            'precos.*.preco' => ['nullable', 'numeric'],
            'precos.*.dias_funcionamento' => ['nullable', 'array'],
        ];
    }

    public function messages(): array
    {
        return [
            'required' => "O campo ':attribute' é obrigatório.",
            'required_if' => "O campo ':attribute' é obrigatório."
        ];
    }

    public function attributes(): array {
        return [
            'precos' => 'preços',
            'preco' => 'preço'
        ];
    }
}

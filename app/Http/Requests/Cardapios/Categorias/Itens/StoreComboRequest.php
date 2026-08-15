<?php

namespace App\Http\Requests\Cardapios\Categorias\Itens;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreComboRequest extends FormRequest
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
            'external_id' => ['nullable'],
            'categoria_id' => ['nullable', 'integer'],
            'descricao' => ['nullable', 'string'],
            'imagem' => ['nullable', 'string'],
            'classificacao' => ['nullable', 'array'],
            'classificacao.*.value' => ['required_with:classificacao', 'string'],
            'classificacao.*.status' => ['required_with:classificacao', 'boolean'],
            'dias_funcionamento' => ['nullable', 'array'],
            'dias_funcionamento.*' => [],

            'tipo_preco' => ['required', 'in:preco_combo,preco_item'],
            'meta' => ['required', 'array'],
            'meta.preco_combo' => ['nullable', 'required_if:tipo_preco,preco_combo', 'numeric'],
            'meta.desconto_combo' => ['nullable', 'numeric'],

            'grupos' => ['nullable', 'array'],
            'grupos.*.nome' => ['required_with:grupos', 'string'],
            'grupos.*.ordem' => ['nullable', 'integer'],
            'grupos.*.configuracao' => ['nullable', 'array'],
            'grupos.*.configuracao.obrigatorio' => ['nullable', 'boolean'],
            'grupos.*.configuracao.qtd_minima' => ['nullable', 'integer', 'min:0'],
            'grupos.*.configuracao.qtd_maxima' => ['nullable', 'integer', 'min:1'],
            'grupos.*.entradas' => ['nullable', 'array'],
            'grupos.*.entradas.*.referencia_id' => ['required', 'integer', 'exists:itens,id'],

            'grupos_complemento' => ['nullable', 'array'],
            'grupos_complemento.*.grupo_complemento_id' => ['required', 'integer', 'exists:grupo_complemento,id'],
            'grupos_complemento.*.complementos' => ['nullable', 'array'],
            'grupos_complemento.*.complementos.*.referencia_id' => ['required', 'integer', 'exists:complementos,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'required' => "O campo ':attribute' é obrigatório.",
            'required_if' => "O campo ':attribute' é obrigatório.",
            'required_with' => "O campo ':attribute' é obrigatório.",
        ];
    }

    public function attributes(): array
    {
        return [
            'meta.preco_combo' => 'preço do combo',
            'meta.desconto_combo' => 'desconto do combo',
        ];
    }
}

<?php

namespace App\Http\Requests\Cardapios\Categorias\Itens\GrupoComplemento;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreGrupoComplementoRequest extends FormRequest
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
            'obrigatoriedade' => ['required', 'boolean'],
            'qtd_minima' => ['required', 'integer', 'min:0'],
            'qtd_maxima' => ['required', 'integer', 'min:1'],
            'complementos' => ['nullable', 'array'],
            'complementos.*.nome' => ['required'],
            'complementos.*.imagem' => ['nullable'],
            'complementos.*.external_id' => ['required'],
            'complementos.*.descricao' => ['nullable'],
            'complementos.*.preco' => ['required'],
            'complementos.*.status' => ['required', 'boolean']
        ];
    }

    public function messages(): array
    {
        return [
            'required' => 'O :attribute é obrigatório',
            'boolean' => 'O :attribute deve ser verdadeiro ou falso',
            'integer' => 'O :attribute deve ser um número inteiro',
            'array' => 'O :attribute deve ser uma lista',
            'qtd_minima.min' => 'A quantidade mínima não pode ser negativa',
            'qtd_maxima.min' => 'A quantidade máxima deve ser de pelo menos 1',
        ];
    }

    public function attributes(): array
    {
        return [
            'nome' => 'nome do grupo',
            'obrigatoriedade' => 'obrigatoriedade',
            'qtd_minima' => 'quantidade mínima',
            'qtd_maxima' => 'quantidade máxima',
            'complementos' => 'complementos',
            'complementos.*.nome' => 'nome do complemento',
            'complementos.*.imagem' => 'imagem do complemento',
            'complementos.*.external_id' => 'código PDV do complemento',
            'complementos.*.descricao' => 'descrição do complemento',
            'complementos.*.preco' => 'preço do complemento',
            'complementos.*.status' => 'status do complemento',
        ];
    }
}

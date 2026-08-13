<?php

namespace App\Http\Requests\Cardapios\Categorias\Itens\GrupoComplemento;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CopiaGruposComplementoSelecionadosRequest extends FormRequest
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
            'grupos' => ['required', 'array', 'min:1'],
            'grupos.*.id' => ['required', 'integer', 'exists:grupo_complemento,id'],
            'grupos.*.obrigatoriedade' => ['required', 'boolean'],
            'grupos.*.qtd_minima' => ['required', 'integer', 'min:0'],
            'grupos.*.qtd_maxima' => ['required', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'required' => 'O :attribute é obrigatório',
            'boolean' => 'O :attribute deve ser verdadeiro ou falso',
            'integer' => 'O :attribute deve ser um número inteiro',
            'grupos.*.id.exists' => 'Um dos grupos selecionados não existe',
            'grupos.*.qtd_minima.min' => 'A quantidade mínima não pode ser negativa',
            'grupos.*.qtd_maxima.min' => 'A quantidade máxima deve ser de pelo menos 1',
        ];
    }

    public function attributes(): array
    {
        return [
            'grupos' => 'grupos selecionados',
            'grupos.*.obrigatoriedade' => 'obrigatoriedade',
            'grupos.*.qtd_minima' => 'quantidade mínima',
            'grupos.*.qtd_maxima' => 'quantidade máxima',
        ];
    }
}

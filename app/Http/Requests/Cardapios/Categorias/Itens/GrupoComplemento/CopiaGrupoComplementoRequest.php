<?php

namespace App\Http\Requests\Cardapios\Categorias\Itens\GrupoComplemento;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CopiaGrupoComplementoRequest extends FormRequest
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
            'categoria_id' => ['required', 'exists:categorias,id'],
            'item_id' => ['required', 'exists:itens,id']
        ];
    }

    public function messages(): array
    {
        return [
            'required' => 'O :attribute é obrigatório',
            'categoria_id.exists' => 'A categoria selecionada não existe',
            'item_id.exists' => 'O item selecionado não existe',
        ];
    }

    public function attributes(): array
    {
        return [
            'categoria_id' => 'categoria',
            'item_id' => 'item',
        ];
    }
}

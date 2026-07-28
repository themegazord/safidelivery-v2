<?php

namespace App\Http\Requests\Cardapios;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Override;

class CloneCardapioRequest extends FormRequest
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
            'novoNomeCardapio' => 'required'
        ];
    }

    public function messages(): array {
        return [
            'required' => "O campo ':attribute' é obrigatório."
        ];
    }

    public function attributes()
    {
        return [
            'novoNomeCardapio' => 'novo nome do cardápio'
        ];
    }
}

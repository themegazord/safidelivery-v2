<?php

namespace App\Http\Requests\Cardapios\Categorias\Itens;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class DestroyImagemItemRequest extends FormRequest
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
            'url' => ['required', 'string', 'url'],
        ];
    }

    public function messages(): array
    {
        return [
            'url.required' => 'A URL da imagem é obrigatória.',
            'url.url' => 'A URL da imagem é inválida.',
        ];
    }
}

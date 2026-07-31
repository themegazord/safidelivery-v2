<?php

namespace App\Http\Requests\Cardapios\Categorias\Itens;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreImagemItemRequest extends FormRequest
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
            'imagem' => ['image', 'max:2048', 'mimes:jpg'],
        ];
    }

    public function messages(): array
    {
        return [
            'image' => 'Deve ser encaminhado uma imagem',
            'max' => 'A imagem deve conter no máximo 2mb.',
            'mimes:jpg' => 'Aceitamos apenas .jpg'
        ];
    }
}

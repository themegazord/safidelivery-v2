<?php

namespace App\Http\Requests\FinalizarPedido;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Override;

class ValidacaoCupomRequest extends FormRequest
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
            'cupom' => 'required',
            'subtotal' => 'required',
            'interacao_id' => 'required',
            'frete' => 'nullable|numeric',
        ];
    }

    public function messages(): array {
        return [
            'required' => 'O :attribute é obrigatório.'
        ];
    }
}

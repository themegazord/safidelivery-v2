<?php

namespace App\Http\Requests\Cardapios;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCardapioRequest extends FormRequest
{
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
            'empresa_id' => ['required'],
            'nome' => ['required', 'max:50'],
            'descricao' => ['required', 'max:255'],
            'dias_funcionamento' => ['required'],
            'tipo_funcionamento' => ['required'],
        ];
    }

    public function messages(): array {
        return [
            'required' => "O campo ':attribute' é obrigatório.",
            'max' => ":attribute deve ter :max caracteres.",
        ];
    }

    public function attributes(): array {
        return [
            'descricao' => 'descrição',
            'dias_funcionamento' => 'dias de funcionamento',
            'tipo_funcionamento' => 'tipo de funcionamento'
        ];
    }
}

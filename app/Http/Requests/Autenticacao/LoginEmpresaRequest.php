<?php

namespace App\Http\Requests\Autenticacao;

use Illuminate\Foundation\Http\FormRequest;

class LoginEmpresaRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => 'required|max:255|email|exists:users',
            'password' => 'required'
        ];
    }
    public function messages(): array
    {
        return [
            'required' => 'Campo obrigatório',
            'email.email' => 'O :attribute é inválido',
            'email.exists' => 'O :attribute é inexistente',
            'email.max' => 'O :attribute deve conter no máximo 255 caracteres.'
        ];
    }

    public function attributes(): array
    {
        return [
            'email' => 'email',
            'password' => 'senha'
        ];
    }
}

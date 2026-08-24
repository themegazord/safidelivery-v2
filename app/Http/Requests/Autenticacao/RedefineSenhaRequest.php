<?php

namespace App\Http\Requests\Autenticacao;

use App\Rules\RecaptchaValido;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RedefineSenhaRequest extends FormRequest
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
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', Password::min(8)->letters()->numbers()],
            'g-recaptcha-response' => ['required', new RecaptchaValido('redefinir_senha')],
        ];
    }

    public function messages(): array
    {
        return [
            'required' => 'Campo obrigatório',
            'email.email' => 'O :attribute é inválido',
            'password.confirmed' => 'A confirmação de senha não confere',
            'password.min' => 'A :attribute deve ter no mínimo :min caracteres',
            'password.letters' => 'A :attribute deve conter pelo menos uma letra',
            'password.numbers' => 'A :attribute deve conter pelo menos um número',
        ];
    }

    public function attributes(): array
    {
        return [
            'email' => 'e-mail',
            'password' => 'senha',
        ];
    }
}

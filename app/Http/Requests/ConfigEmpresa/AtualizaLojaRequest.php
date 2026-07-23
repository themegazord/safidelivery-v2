<?php

namespace App\Http\Requests\ConfigEmpresa;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AtualizaLojaRequest extends FormRequest
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
            'logo' => ['nullable', 'image', 'mimes:jpeg,jpg,png', 'max:4096'],
            'capa' => ['nullable', 'image', 'mimes:jpeg,jpg,png', 'max:4096'],
            'razao_social' => ['required', 'string', 'max:255'],
            'nome_fantasia' => ['required', 'string', 'max:255'],
            'cnpj' => [
                'required',
                'string',
                'size:14',
                Rule::unique('empresas', 'cnpj')->ignore($this->route('cnpj'), 'cnpj'),
            ],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('empresas', 'email')->ignore($this->route('cnpj'), 'cnpj'),
            ],
            'cep' => ['required', 'string', 'size:8'],
            'logradouro' => ['required', 'string', 'max:255'],
            'numero' => ['required', 'string', 'max:20'],
            'complemento' => ['nullable', 'string', 'max:255'],
            'bairro' => ['required', 'string', 'max:255'],
            'cidade' => ['required', 'string', 'max:255'],
            'uf' => ['required', 'string', 'size:2'],
        ];
    }

    public function messages(): array
    {
        return [
            'required' => 'O :attribute é obrigatório',
            'logo.image' => 'A :attribute deve ser uma imagem',
            'logo.mimes' => 'A :attribute deve estar no formato JPEG, JPG ou PNG',
            'capa.image' => 'A :attribute deve ser uma imagem',
            'capa.mimes' => 'A :attribute deve estar no formato JPEG, JPG ou PNG',
            'cnpj.size' => 'O :attribute deve conter :size números',
            'cnpj.unique' => 'Esse :attribute já está em uso',
            'email.email' => 'O :attribute é inválido',
            'email.unique' => 'Esse :attribute já está em uso',
            'cep.size' => 'O :attribute deve conter :size números',
            'uf.size' => 'O :attribute deve conter :size letras',
        ];
    }

    public function attributes(): array
    {
        return [
            'logo' => 'logo',
            'capa' => 'capa',
            'razao_social' => 'razão social',
            'nome_fantasia' => 'nome fantasia',
            'cnpj' => 'CNPJ',
            'email' => 'email',
            'cep' => 'CEP',
            'logradouro' => 'logradouro',
            'numero' => 'número',
            'complemento' => 'complemento',
            'bairro' => 'bairro',
            'cidade' => 'cidade',
            'uf' => 'UF',
        ];
    }
}

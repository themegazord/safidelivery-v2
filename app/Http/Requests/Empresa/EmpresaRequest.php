<?php

namespace App\Http\Requests\Empresa;

use App\Rules\ValidaCNPJ;
use Illuminate\Foundation\Http\FormRequest;

class EmpresaRequest extends FormRequest
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
			'razao_social' => 'required|max:255',
			'nome_fantasia' => 'required|max:255',
			'cnpj' => ['required', 'size:14', 'unique:empresas,cnpj', new ValidaCNPJ],
			'email' => 'required|max:255|unique:empresas,email',
			'logradouro' => 'required|max:255',
			'numero' => 'required|numeric|max:99999',
			'cep' => 'required|size:8',
			'bairro' => 'required|max:255',
			'cidade' => 'required|max:255',
			'uf' => 'required|size:2',
			'complemento' => 'nullable|max:255',
			'telefone_contato' => 'max:15',
			'telefone_comercial' => 'max:15',
			'telefone_whatsapp' => 'max:15'
		];
	}

	public function messages(): array
	{
		return [
			'required' => 'Campo obrigatório',
			'max:255' => 'O campo deve conter no máximo 255 caracteres',
			'max:99999' => 'O número deve ser no máximo 5 dígitos',
			'max:15' => 'O campo deve conter no máximo 15 caracteres',
			'cnpj.size' => 'O CNPJ deve conter 14 caracteres',
			'cnpj.unique' => 'Esse CNPJ já está sendo usado por outra empresa.',
			'email.unique' => 'Esse email já está sendo usado por outra empresa.',
			'uf.size' => 'A UF deve conter 2 caracteres',
			'cep.size' => 'O CEP deve conter 8 caracteres',
			'numero.required' => 'O número deve ser numérico',
		];
	}

	public function attributes(): array
	{
		return [
			'razao_social' => 'razão social',
			'nome_fantasia' => 'nome fantasia',
			'cnpj' => 'CNPJ',
			'email' => 'e-mail',
			'logradouro' => 'logradouro',
			'numero' => 'número',
			'cep' => 'CEP',
			'bairro' => 'bairro',
			'cidade' => 'cidade',
			'uf' => 'UF',
			'complemento' => 'complemento',
			'telefone_contato' => 'telefone de contato',
			'telefone_comercial' => 'telefone comercial',
			'telefone_whatsapp' => 'telefone WhatsApp',
		];
	}
}

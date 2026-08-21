<?php

namespace App\Http\Requests\Empresa;

use Illuminate\Foundation\Http\FormRequest;

class FormaPagamentoRequest extends FormRequest
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
			'formas.*.codigo_pdv' => ['required'],
			'formas.*.descricao' => ['required'],
			'formas.*.tipo' => ['required'],
			'formas.*.ativo' => ['required', 'boolean']
		];
	}

	public function messages()
	{
		return [
			'required' => 'O campo :attributes é obrigatório',
			'boolean' => 'O campo :attributes deve ser booleano',
		];
	}

	public function attributes(): array {
		return [
			'formas.*.codigo_pdv' => 'código do SAFI',
			'formas.*.descricao' => 'descrição',
			'formas.*.tipo' => 'tipo',
		];
	}
}

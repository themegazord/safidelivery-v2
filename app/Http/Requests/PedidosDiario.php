<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class PedidosDiario extends FormRequest
{
  /**
   * Determine if the user is authorized to make this request.
   */
  public function authorize(): bool
  {
    return true;
  }

  public function failedValidation(Validator $validator)
  {
      throw new HttpResponseException(response()->json([
          'erro' => 'Erro de validação',
          'mensagens' => $validator->errors(),
      ], 422));
  }

  /**
   * Get the validation rules that apply to the request.
   *
   * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
   */
  public function rules(): array
  {
    return [
      'cnpj' => ['required', 'exists:empresas,cnpj', 'size:14']
    ];
  }

  public function messages(): array {
    return [
      'cnpj.required' => 'CNPJ requerido',
      'cnpj.exists' => 'O CNPJ não existe no banco de dados',
      'data_hora.date_format' => 'O campo data_hora deve estar no formato Y-m-d H:i:s',
      'cnpj.size' => 'O CNPJ deve conter 14 caracteres.'
    ];
  }
}

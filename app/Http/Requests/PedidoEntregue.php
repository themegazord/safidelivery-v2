<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class PedidoEntregue extends FormRequest
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
      'data_hora' => ['date_format:Y-m-d H:i:s'],
    ];
  }

  public function failedValidation(Validator $validator)
  {
      throw new HttpResponseException(response()->json([
          'erro' => 'Erro de validação',
          'mensagens' => $validator->errors(),
      ], 422));
  }

  public function messages(): array {
    return [
      'data_hora.date_format' => 'O campo data_hora deve estar no formato Y-m-d H:i:s',
    ];
  }
}

<?php

namespace App\Http\Requests\Cashback;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CashbackConfigRequest extends FormRequest
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
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'status' => ['required', 'boolean'],
            'cashback_tipo' => ['required_if:status,true', 'nullable', Rule::in(['porcentagem', 'fixo'])],
            'cashback_porcentagem' => ['required_if:cashback_tipo,porcentagem', 'nullable', 'numeric', 'min:0', 'max:100'],
            'base_calculo_porcentagem' => ['required_if:cashback_tipo,porcentagem', 'nullable', Rule::in(['subtotal', 'subtotal_liquido'])],
            'cashback_fixo' => ['required_if:cashback_tipo,fixo', 'nullable', 'numeric', 'min:0'],
            'dias_validade' => ['required_if:status,true', 'nullable', 'integer', 'min:1'],
            'tipos_funcionamento' => ['required_if:status,true', 'nullable', 'array', 'min:1'],
            'tipos_funcionamento.*' => [Rule::in(['delivery', 'retirada', 'mesa'])],
        ];
    }

    public function messages(): array
    {
        return [
            'cashback_tipo.required_if' => 'O tipo de cashback é obrigatório quando o cashback está ativo.',
            'cashback_porcentagem.required_if' => 'O percentual é obrigatório para cashback por porcentagem.',
            'base_calculo_porcentagem.required_if' => 'A base de cálculo é obrigatória para cashback por porcentagem.',
            'cashback_porcentagem.max' => 'O percentual não pode ser maior que 100%.',
            'cashback_fixo.required_if' => 'O valor fixo é obrigatório para cashback de valor fixo.',
            'dias_validade.required_if' => 'Os dias de validade são obrigatórios quando o cashback está ativo.',
            'dias_validade.min' => 'Os dias de validade deve ser de no mínimo 1 dia.',
            'tipos_funcionamento.required_if' => 'Selecione ao menos um tipo de atendimento.',
        ];
    }
}

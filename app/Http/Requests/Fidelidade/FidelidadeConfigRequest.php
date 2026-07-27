<?php

namespace App\Http\Requests\Fidelidade;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class FidelidadeConfigRequest extends FormRequest
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
            'ativo' => ['required', 'boolean'],
            'tipo_gatilho' => ['required_if:ativo,true', 'nullable', Rule::in(['qtd_pedidos', 'valor_acumulado'])],
            'valor_gatilho' => ['required_if:ativo,true', 'nullable', 'numeric', 'min:1'],
            'tipo_recompensa' => ['required_if:ativo,true', 'nullable', Rule::in(['item_gratis', 'frete_gratis', 'desconto_percentual', 'desconto_fixo'])],
            'valor_recompensa' => [
                'nullable', 'numeric', 'min:0',
                'required_if:tipo_recompensa,desconto_percentual',
                'required_if:tipo_recompensa,desconto_fixo',
                Rule::when($this->input('tipo_recompensa') === 'desconto_percentual', ['max:100']),
            ],
            'base_calculo_desconto' => ['required', Rule::in(['subtotal_itens', 'total_pedido'])],
            'valor_max_premio' => ['nullable', 'numeric', 'min:0'],
            'categorias_bloqueadas' => ['nullable', 'array'],
            'categorias_bloqueadas.*' => ['integer'],
            'validade_dias' => ['nullable', 'integer', 'min:1'],
            'tipos_funcionamento' => ['required_if:ativo,true', 'nullable', 'array', 'min:1'],
            'tipos_funcionamento.*' => [Rule::in(['delivery', 'retirada', 'mesa'])],
        ];
    }

    public function messages(): array
    {
        return [
            'tipo_gatilho.required_if' => 'O gatilho é obrigatório quando o programa está ativo.',
            'valor_gatilho.required_if' => 'O valor do gatilho é obrigatório quando o programa está ativo.',
            'valor_gatilho.min' => 'O valor do gatilho deve ser pelo menos 1.',
            'tipo_recompensa.required_if' => 'A recompensa é obrigatória quando o programa está ativo.',
            'valor_recompensa.required_if' => 'O valor da recompensa é obrigatório para este tipo.',
            'valor_recompensa.max' => 'O percentual não pode ser maior que 100%.',
            'validade_dias.min' => 'A validade deve ser de pelo menos 1 dia.',
            'tipos_funcionamento.required_if' => 'Selecione ao menos um tipo de atendimento.',
        ];
    }

    public function attributes(): array
    {
        return [
            'tipo_gatilho' => 'tipo de gatilho',
            'valor_gatilho' => 'valor do gatilho',
            'tipo_recompensa' => 'tipo de recompensa',
            'valor_recompensa' => 'valor da recompensa',
            'valor_max_premio' => 'valor máximo do prêmio',
            'validade_dias' => 'dias de validade',
        ];
    }
}

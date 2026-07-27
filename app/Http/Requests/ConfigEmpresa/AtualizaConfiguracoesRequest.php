<?php

namespace App\Http\Requests\ConfigEmpresa;

use App\Enums\ModoCalculoFrete;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AtualizaConfiguracoesRequest extends FormRequest
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
            'aceite_automatico' => ['required', 'boolean'],
            'aceite_automatico_ifood' => ['required', 'boolean'],
            'media_tempo_preparo' => ['nullable', 'date_format:H:i'],
            'modo_calculo_frete' => ['nullable', Rule::enum(ModoCalculoFrete::class)],
            'replicar_informacao_importacao' => ['required', 'boolean'],
            'informa_mesa_comanda' => ['required', 'boolean'],
            'modo_atendente' => ['required', 'boolean'],
            'periodo_inatividade_cliente' => ['nullable', 'integer', 'min:0'],
            'fora_area_entrega' => ['required', Rule::in(['bloquear', 'taxa_maxima'])],
            'multiplas_formas_pagamento' => ['required', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'required' => 'O campo :attribute é obrigatório',
            'media_tempo_preparo.date_format' => 'O :attribute deve estar no formato HH:MM',
            'periodo_inatividade_cliente.integer' => 'O :attribute deve ser um número inteiro',
            'periodo_inatividade_cliente.min' => 'O :attribute não pode ser negativo',
        ];
    }

    public function attributes(): array
    {
        return [
            'aceite_automatico' => 'aceite automático',
            'aceite_automatico_ifood' => 'aceite automático do iFood',
            'media_tempo_preparo' => 'tempo médio de preparo',
            'modo_calculo_frete' => 'modo de cálculo de tempo de entrega',
            'replicar_informacao_importacao' => 'replicação de importação',
            'informa_mesa_comanda' => 'identificação de comanda',
            'modo_atendente' => 'modo atendente',
            'periodo_inatividade_cliente' => 'período de inatividade do cliente',
            'fora_area_entrega' => 'comportamento fora da área de entrega',
            'multiplas_formas_pagamento' => 'múltiplas formas de pagamento',
        ];
    }
}

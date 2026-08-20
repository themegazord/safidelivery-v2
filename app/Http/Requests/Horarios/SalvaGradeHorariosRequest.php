<?php

namespace App\Http\Requests\Horarios;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SalvaGradeHorariosRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['tipo_funcionamento' => $this->route('tipo_funcionamento')]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'tipo_funcionamento' => ['required', Rule::in(['delivery', 'retirada', 'mesa'])],
            'horarios' => ['present', 'array'],
            'horarios.*.dia_semana' => ['required', 'integer', 'between:0,6'],
            'horarios.*.hora_inicio' => ['required', 'date_format:H:i'],
            'horarios.*.hora_fim' => ['required', 'date_format:H:i'],
            'horarios.*.status' => ['required', 'boolean'],
        ];
    }
}

<?php

namespace App\Http\Requests\Horarios;

use App\Models\Empresa;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AtualizaFuncionamentoEstabelecimentoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $idsFusosValidos = array_column((new Empresa)->fusosHorarios(), 'id');

        return [
            'funcionamentoEstabelecimento' => ['required', Rule::in(['sempre', 'fechado', 'horarios'])],
            'fuso_horario' => ['required', 'integer', Rule::in($idsFusosValidos)],
        ];
    }
}

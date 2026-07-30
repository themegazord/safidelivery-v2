<?php

namespace App\Http\Requests\Cardapios\Categorias;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCategoriaRequest extends FormRequest
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
            'tipo' => ['required'],
            'nome' => ['required', 'max:50'],
            'dias_funcionamento' => ['array'],
            'dias_funcionamento.*' => ['integer', 'between:0,6'],
            'tamanhos' => ['required_if:tipo,P'],
            'massas' => ['required_if:tipo,P'],
            'bordas' => ['required_if:tipo,P'],
            'tamanhos.*.external_id' => ['required_if:tipo,P'],
            'tamanhos.*.nome' => ['required_if:tipo,P', 'max:50'],
            'tamanhos.*.qtde_pedacos' => ['required_if:tipo,P'],
            'tamanhos.*.qtde_sabores' => ['required_if:tipo,P'],
            'massas.*.nome' => ['required_if:tipo,P', 'max:50'],
            'massas.*.preco' => ['required_if:tipo,P'],
            'bordas.*.nome' => ['required_if:tipo,P', 'max:50'],
            'bordas.*.preco' => ['required_if:tipo,P'],
        ];
    }

    public function messages(): array
    {
        return [
            'required' => "O campo ':attribute' é obrigatório.",
            'required_if' => "O campo ':attribute' é obrigatório.",
            'max' => "O campo ':attribute' deve conter no máximo :max caracteres.",
        ];
    }

    public function attributes(): array
    {
        return [
            'tipo' => 'tipo da categoria',
            'nome' => 'nome da categoria',
            'dias_funcionamento' => 'dias de funcionamento',
            'tamanhos' => 'tamanhos',
            'massas' => 'massas',
            'bordas' => 'bordas',
            'tamanhos.*.external_id' => 'código PDV do tamanho',
            'tamanhos.*.nome' => 'nome do tamanho',
            'tamanhos.*.qtde_pedacos' => 'quantidade de pedaços',
            'tamanhos.*.qtde_sabores' => 'quantidade de sabores',
            'massas.*.nome' => 'nome da massa',
            'massas.*.preco' => 'preço da massa',
            'bordas.*.nome' => 'nome da borda',
            'bordas.*.preco' => 'preço da borda',
        ];
    }
}

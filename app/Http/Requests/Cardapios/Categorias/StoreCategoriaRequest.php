<?php

namespace App\Http\Requests\Cardapios\Categorias;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreCategoriaRequest extends FormRequest
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
            'tamanho' => ['required_if:tipo,P'],
            'massa' => ['required_if:tipo,P'],
            'borda' => ['required_if:tipo,P'],
            'tamanho.*.external_id' => ['required_if:tipo,P'],
            'tamanho.*.nome' => ['required_if:tipo,P', 'max:50'],
            'tamanho.*.qtde_pedacos' => ['required_if:tipo,P'],
            'tamanho.*.qtde_sabores' => ['required_if:tipo,P'],
            'massa.*.nome' => ['required_if:tipo,P', 'max:50'],
            'massa.*.preco' => ['required_if:tipo,P'],
            'borda.*.nome' => ['required_if:tipo,P', 'max:50'],
            'borda.*.preco' => ['required_if:tipo,P'],
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
            'tamanho' => 'tamanhos',
            'massa' => 'massas',
            'borda' => 'bordas',
            'tamanho.*.external_id' => 'código PDV do tamanho',
            'tamanho.*.nome' => 'nome do tamanho',
            'tamanho.*.qtde_pedacos' => 'quantidade de pedaços',
            'tamanho.*.qtde_sabores' => 'quantidade de sabores',
            'massa.*.nome' => 'nome da massa',
            'massa.*.preco' => 'preço da massa',
            'borda.*.nome' => 'nome da borda',
            'borda.*.preco' => 'preço da borda',
        ];
    }
}

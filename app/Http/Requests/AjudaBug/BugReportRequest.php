<?php

namespace App\Http\Requests\AjudaBug;

use Illuminate\Foundation\Http\FormRequest;

class BugReportRequest extends FormRequest
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
        return [
            'titulo' => ['required', 'string', 'max:255'],
            'descricao' => ['required', 'string', 'max:5000'],
            'passos' => ['nullable', 'string', 'max:5000'],
            'labels' => ['nullable', 'array'],
            'labels.*' => ['string'],
        ];
    }
}

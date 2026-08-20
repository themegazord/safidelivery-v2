<?php

namespace App\Http\Requests\QrCodeMesa;

use App\Models\Empresa;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MesaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'empresa_id' => Empresa::where('cnpj', $this->route('cnpj'))->value('id'),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'mesa' => [
                'required',
                'integer',
                'min:1',
                Rule::unique('mesas', 'mesa')
                    ->where(fn ($query) => $query->where('empresa_id', $this->input('empresa_id')))
                    ->ignore($this->route('mesa_id')),
            ],
        ];
    }
}

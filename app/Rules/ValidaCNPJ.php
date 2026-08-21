<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use App\Actions\ValidaCNPJ as ActionValidaCNPJ;

class ValidaCNPJ implements ValidationRule
{
  /**
   * Run the validation rule.
   *
   * @param \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString $fail
   */
  public function validate(string $attribute, mixed $value, Closure $fail): void
  {
    $validacao = new ActionValidaCNPJ();

    if (!$validacao->validaCNPJ($value)) $fail("O CNPJ e matematicamente invalido.");
  }
}

<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;

class LaverdadEmail implements Rule
{
    public function passes($attribute, $value)
    {
        return str_ends_with($value, '.laverdad.edu.ph');
    }

    public function message()
    {
        return 'Only La Verdad work emails allowed.';
    }
}

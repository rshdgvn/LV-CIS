<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;

class LaverdadEmail implements Rule
{
    public function passes($attribute, $value)
    {
        return preg_match('/^[^@]+@([a-zA-Z0-9-]+\.)*laverdad\.edu\.ph$/', $value);
    }

    public function message()
    {
        return 'Only La Verdad work emails allowed.';
    }
}

<?php

namespace App\Providers;

use Illuminate\Support\Facades\Validator;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Validator::extend('laverdad_email', function ($attribute, $value, $parameters, $validator) {
            return str_ends_with($value, '@student.laverdad.edu.ph');
        });

        Validator::replacer('laverdad_email', function ($message, $attribute, $rule, $parameters) {
            return "Only @student.laverdad.edu.ph emails are allowed.";
        });
    }
}

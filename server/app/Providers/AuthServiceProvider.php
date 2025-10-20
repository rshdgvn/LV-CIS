<?php

namespace App\Providers;

use App\Models\ClubMembership;
use App\Policies\ClubMembershipPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    protected $policies = [
        ClubMembership::class => ClubMembershipPolicy::class,
    ];

    public function register(): void
    {
        $this->registerPolicies();
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}

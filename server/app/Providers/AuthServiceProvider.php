<?php

namespace App\Providers;

use App\Models\ClubMembership;
use App\Models\Event;
use App\Models\EventTask;
use App\Policies\ClubMembershipPolicy;
use App\Policies\EventPolicy;
use App\Policies\EventTaskPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    protected $policies = [
        ClubMembership::class => ClubMembershipPolicy::class,
        Event::class => EventPolicy::class,
        EventTask::class => EventTaskPolicy::class,
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

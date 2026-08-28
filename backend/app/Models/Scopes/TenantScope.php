<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class TenantScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        // Jika aplikasi memiliki context 'tenant' yang aktif (dari Middleware),
        // otomatis filter semua query berdasarkan ID organisasi tersebut.
        if (app()->has('tenant')) {
            $builder->where('organization_id', app('tenant')->id);
        }
    }
}
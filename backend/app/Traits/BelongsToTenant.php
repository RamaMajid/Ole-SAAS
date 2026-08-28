<?php

namespace App\Traits;

use App\Models\Organization;
use App\Models\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait BelongsToTenant
{
    /**
     * Boot the trait to apply the global scope and creating events.
     */
    protected static function bootBelongsToTenant(): void
    {
        // Terapkan isolasi scope saat read/update/delete
        static::addGlobalScope(new TenantScope);

        // Terapkan pengisian organization_id otomatis saat insert (create)
        static::creating(function ($model) {
            if (app()->has('tenant') && empty($model->organization_id)) {
                $model->organization_id = app('tenant')->id;
            }
        });
    }

    /**
     * Relasi balik ke model Organization
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }
}
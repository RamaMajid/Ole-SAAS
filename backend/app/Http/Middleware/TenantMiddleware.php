<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class TenantMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $organizationId = $request->header('X-Organization-ID');

        // Jika tidak ada header, biarkan request berlanjut (untuk rute non-tenant seperti profil user)
        if (!$organizationId) {
            return $next($request);
        }

        $user = Auth::user();

        // Validasi keanggotaan: Cari organisasi berdasarkan ID yang dikirim
        // Hanya query dari relasi user untuk menjamin dia memang anggota di sana
        $organization = $user->organizations()->find($organizationId);

        if (!$organization) {
            return response()->json([
                'message' => 'Forbidden: You do not belong to this organization.'
            ], 403);
        }

        // Daftarkan instance organisasi yang valid ke dalam Laravel Service Container
        // Ini memungkinkan kita memanggil app('tenant') di controller mana pun nanti
        app()->instance('tenant', $organization);

        return $next($request);
    }
}
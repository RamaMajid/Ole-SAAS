<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Account;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    public function index(): JsonResponse
    {
        // Berkat Global Scope (BelongsToTenant), query ini HANYA akan 
        // mengembalikan akun milik organisasi yang aktif di X-Organization-ID.
        $accounts = Account::all();

        return response()->json([
            'accounts' => $accounts
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:cash,bank'],
            'balance' => ['nullable', 'numeric', 'min:0'],
        ]);

        // organization_id akan diisi secara otomatis oleh Trait BelongsToTenant
        $account = Account::create([
            'name' => $validated['name'],
            'type' => $validated['type'],
            'balance' => $validated['balance'] ?? 0,
        ]);

        return response()->json([
            'message' => 'Account created successfully',
            'account' => $account
        ], 201);
    }
}
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class OrganizationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // Hanya mengembalikan organisasi di mana user ini tergabung
        return response()->json([
            'organizations' => $request->user()->organizations
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        // Membuat slug unik (contoh: pt-maju-jaya-64a3f2)
        $slug = Str::slug($validated['name']) . '-' . substr(uniqid(), -6);

        $organization = Organization::create([
            'name' => $validated['name'],
            'slug' => $slug,
        ]);

        // Tempelkan user pembuat sebagai owner
        $request->user()->organizations()->attach($organization->id, ['role' => 'owner']);

        return response()->json([
            'message' => 'Organization created successfully',
            'organization' => $organization
        ], 201);
    }

    public function show(Request $request, Organization $organization): JsonResponse
    {
        // Pastikan user adalah anggota organisasi ini
        if (!$request->user()->organizations->contains($organization->id)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json([
            'organization' => $organization
        ]);
    }
}
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            // Setiap akun wajb terikat ke sebuah organisasi
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            
            $table->string('name'); // Contoh: "Kas Kecil", "Rekening BCA"
            $table->string('type'); // Contoh: "cash", "bank"
            $table->decimal('balance', 15, 2)->default(0); // Presisi 15 digit, 2 desimal
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('accounts');
    }
};
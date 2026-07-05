<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_active')->default(true);
        });

        Schema::create('tool_runs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('guest_id')->nullable()->index();
            $table->string('tool');
            $table->json('input')->nullable();
            $table->json('result');
            $table->timestamps();
        });

        Schema::create('known_malicious_hashes', function (Blueprint $table) {
            $table->id();
            $table->string('hash', 128)->unique();
            $table->string('algorithm', 32)->default('sha256');
            $table->string('label');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('incidents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('guest_id')->nullable()->index();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('category');
            $table->string('severity');
            $table->string('status')->default('ouvert');
            $table->date('incident_date');
            $table->json('attachments')->nullable();
            $table->timestamps();
        });

        Schema::create('incident_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('incident_id')->constrained()->cascadeOnDelete();
            $table->string('from_status')->nullable();
            $table->string('to_status');
            $table->string('note')->nullable();
            $table->timestamps();
        });

        Schema::create('security_audits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('guest_id')->nullable()->index();
            $table->string('title')->default('Audit de sécurité');
            $table->json('answers');
            $table->json('scores');
            $table->json('recommendations');
            $table->timestamps();
        });

        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('guest_id')->nullable()->index();
            $table->string('action');
            $table->json('context')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('security_audits');
        Schema::dropIfExists('incident_events');
        Schema::dropIfExists('incidents');
        Schema::dropIfExists('known_malicious_hashes');
        Schema::dropIfExists('tool_runs');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('is_active');
        });
    }
};

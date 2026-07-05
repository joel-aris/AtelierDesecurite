<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuditController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\IncidentController;
use App\Http\Controllers\Api\ToolController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->get('/auth/me', [AuthController::class, 'me']);
Route::middleware('auth:sanctum')->post('/auth/logout', [AuthController::class, 'logout']);

Route::post('/tools/password', [ToolController::class, 'password']);
Route::post('/tools/file', [ToolController::class, 'file']);
Route::post('/tools/https', [ToolController::class, 'https']);
Route::post('/tools/phishing', [ToolController::class, 'phishing']);
Route::get('/tools/totp', [ToolController::class, 'totpSecret']);
Route::post('/tools/totp/verify', [ToolController::class, 'totpVerify']);
Route::post('/tools/hash', [ToolController::class, 'hash']);
Route::post('/tools/breach', [ToolController::class, 'breach']);
Route::get('/tools/history', [ToolController::class, 'history']);

Route::apiResource('/incidents', IncidentController::class)->except(['show']);
Route::get('/audits', [AuditController::class, 'index']);
Route::post('/audits', [AuditController::class, 'store']);
Route::get('/dashboard', DashboardController::class);

Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/overview', [AdminController::class, 'overview']);
    Route::get('/users', [AdminController::class, 'users']);
    Route::patch('/users/{user}', [AdminController::class, 'updateUser']);
    Route::get('/hashes', [AdminController::class, 'hashes']);
    Route::post('/hashes', [AdminController::class, 'storeHash']);
});

Route::post('/exports/file/pdf', [\App\Http\Controllers\Api\ExportController::class, 'fileReport']);
Route::post('/exports/file/excel', [\App\Http\Controllers\Api\ExportController::class, 'fileReportExcel']);
Route::post('/exports/audit/pdf', [\App\Http\Controllers\Api\ExportController::class, 'auditReport']);
Route::post('/exports/incidents/pdf', [\App\Http\Controllers\Api\ExportController::class, 'incidentReport']);
Route::post('/exports/password/pdf', [\App\Http\Controllers\Api\ExportController::class, 'passwordReport']);

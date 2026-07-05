<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Incident;
use App\Models\KnownMaliciousHash;
use App\Models\SecurityAudit;
use App\Models\ToolRun;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function overview()
    {
        return response()->json([
            'users' => User::count(),
            'incidents' => Incident::count(),
            'audits' => SecurityAudit::count(),
            'tool_usage' => ToolRun::selectRaw('tool, count(*) as total')->groupBy('tool')->pluck('total', 'tool'),
            'logs' => ActivityLog::latest()->limit(30)->get(),
        ]);
    }

    public function users()
    {
        return response()->json(['data' => User::with('roles')->latest()->get()]);
    }

    public function updateUser(Request $request, User $user)
    {
        $data = $request->validate(['role' => ['nullable', 'in:user,admin'], 'is_active' => ['nullable', 'boolean']]);
        if (isset($data['is_active'])) {
            $user->update(['is_active' => $data['is_active']]);
        }
        if (isset($data['role'])) {
            $user->syncRoles([$data['role']]);
        }
        return response()->json($user->load('roles'));
    }

    public function hashes()
    {
        return response()->json(['data' => KnownMaliciousHash::latest()->get()]);
    }

    public function storeHash(Request $request)
    {
        $data = $request->validate(['hash' => ['required', 'string', 'max:128'], 'algorithm' => ['required', 'string'], 'label' => ['required', 'string'], 'description' => ['nullable', 'string']]);
        return response()->json(KnownMaliciousHash::create($data), 201);
    }
}

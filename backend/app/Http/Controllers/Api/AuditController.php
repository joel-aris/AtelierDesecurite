<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SecurityAudit;
use App\Services\AuditService;
use Illuminate\Http\Request;

class AuditController extends Controller
{
    public function index(Request $request)
    {
        $audits = SecurityAudit::query()
            ->when(! $request->user()?->hasRole('admin'), function ($query) use ($request) {
                $request->user()
                    ? $query->where('user_id', $request->user()->id)
                    : $query->where('guest_id', $request->header('X-Guest-Id'));
            })
            ->latest()
            ->get();

        return response()->json(['data' => $audits]);
    }

    public function store(Request $request, AuditService $service)
    {
        $data = $request->validate(['title' => ['nullable', 'string'], 'answers' => ['required', 'array']]);
        $scored = $service->score($data['answers']);
        $audit = SecurityAudit::create([
            'user_id' => $request->user()?->id,
            'guest_id' => $request->user() ? null : $request->header('X-Guest-Id'),
            'title' => $data['title'] ?? 'Audit de sécurité',
            'answers' => $data['answers'],
            'scores' => $scored['scores'],
            'recommendations' => $scored['recommendations'],
        ]);

        return response()->json($audit, 201);
    }
}

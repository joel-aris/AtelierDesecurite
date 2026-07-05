<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Incident;
use App\Models\SecurityAudit;
use App\Models\ToolRun;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $owner = function ($query) use ($request) {
            return $request->user()
                ? $query->where('user_id', $request->user()->id)
                : $query->where('guest_id', $request->header('X-Guest-Id'));
        };

        $lastAudit = $owner(SecurityAudit::query())->latest()->first();

        return response()->json([
            'file_analyses' => $owner(ToolRun::where('tool', 'file'))->count(),
            'open_incidents' => $owner(Incident::whereIn('status', ['ouvert', 'en cours']))->count(),
            'last_audit_score' => $lastAudit?->scores['global'] ?? null,
            'security_score' => $lastAudit?->scores['global'] ?? 70,
        ]);
    }
}

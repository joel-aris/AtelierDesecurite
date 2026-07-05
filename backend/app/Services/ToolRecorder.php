<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\ToolRun;
use Illuminate\Http\Request;

class ToolRecorder
{
    public function save(Request $request, string $tool, array $input, array $result): void
    {
        $user = $request->user();
        $guestId = $request->header('X-Guest-Id');

        ToolRun::create([
            'user_id' => $user?->id,
            'guest_id' => $user ? null : $guestId,
            'tool' => $tool,
            'input' => $input,
            'result' => $result,
        ]);

        ActivityLog::create([
            'user_id' => $user?->id,
            'guest_id' => $user ? null : $guestId,
            'action' => "tool.$tool",
            'context' => ['tool' => $tool],
        ]);
    }
}

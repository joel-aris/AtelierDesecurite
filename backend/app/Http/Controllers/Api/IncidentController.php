<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Incident;
use Illuminate\Http\Request;

class IncidentController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(['data' => $this->scope($request)->with('events')->latest()->get()]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'category' => ['required', 'string'],
            'severity' => ['required', 'string'],
            'status' => ['required', 'string'],
            'incident_date' => ['required', 'date'],
            'attachments' => ['nullable', 'array'],
        ]);

        $incident = Incident::create($data + [
            'user_id' => $request->user()?->id,
            'guest_id' => $request->user() ? null : $request->header('X-Guest-Id'),
        ]);
        $incident->events()->create(['to_status' => $incident->status, 'note' => 'Création']);

        return response()->json($incident->load('events'), 201);
    }

    public function update(Request $request, Incident $incident)
    {
        $this->authorizeOwner($request, $incident);
        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'category' => ['sometimes', 'string'],
            'severity' => ['sometimes', 'string'],
            'status' => ['sometimes', 'string'],
            'incident_date' => ['sometimes', 'date'],
        ]);
        $old = $incident->status;
        $incident->update($data);
        if (isset($data['status']) && $data['status'] !== $old) {
            $incident->events()->create(['from_status' => $old, 'to_status' => $data['status'], 'note' => 'Changement de statut']);
        }
        return response()->json($incident->load('events'));
    }

    public function destroy(Request $request, Incident $incident)
    {
        $this->authorizeOwner($request, $incident);
        $incident->delete();
        return response()->noContent();
    }

    private function scope(Request $request)
    {
        return Incident::query()
            ->when(! $request->user()?->hasRole('admin'), function ($query) use ($request) {
                $request->user()
                    ? $query->where('user_id', $request->user()->id)
                    : $query->where('guest_id', $request->header('X-Guest-Id'));
            });
    }

    private function authorizeOwner(Request $request, Incident $incident): void
    {
        abort_unless($request->user()?->hasRole('admin') || $incident->user_id === $request->user()?->id || $incident->guest_id === $request->header('X-Guest-Id'), 403);
    }
}

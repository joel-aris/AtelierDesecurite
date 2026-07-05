<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ToolRun;
use App\Services\FileAnalysisService;
use App\Services\HashIdentifierService;
use App\Services\HttpsAuditService;
use App\Services\PasswordService;
use App\Services\PhishingService;
use App\Services\ToolRecorder;
use App\Services\TotpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class ToolController extends Controller
{
    public function password(Request $request, PasswordService $service, ToolRecorder $recorder)
    {
        $data = $request->validate([
            'length' => ['nullable', 'integer', 'min:8', 'max:64'],
            'batch' => ['nullable', 'integer', 'min:1', 'max:24'],
            'upper' => ['boolean'],
            'lower' => ['boolean'],
            'digits' => ['boolean'],
            'symbols' => ['boolean'],
            'ambiguous' => ['boolean'],
            'passphrase' => ['boolean'],
        ]);
        $result = $service->generate($data);
        $recorder->save($request, 'password', $data, $result);
        return response()->json($result);
    }

    public function file(Request $request, FileAnalysisService $service, ToolRecorder $recorder)
    {
        $data = $request->validate(['file' => ['required', 'file', 'max:20480']]);
        $result = $service->analyze($data['file']);
        $recorder->save($request, 'file', ['name' => $data['file']->getClientOriginalName()], $result);
        return response()->json($result);
    }

    public function https(Request $request, HttpsAuditService $service, ToolRecorder $recorder)
    {
        $data = $request->validate(['target' => ['required', 'string', 'max:255']]);
        $result = $service->check($data['target']);
        $recorder->save($request, 'https', $data, $result);
        return response()->json($result);
    }

    public function phishing(Request $request, PhishingService $service, ToolRecorder $recorder)
    {
        $data = $request->validate(['url' => ['required', 'string', 'max:2048'], 'email_text' => ['nullable', 'string']]);
        $result = $service->analyze($data['url'], $data['email_text'] ?? null);
        $recorder->save($request, 'phishing', $data, $result);
        return response()->json($result);
    }

    public function totpSecret(TotpService $service)
    {
        return response()->json($service->secret());
    }

    public function totpVerify(Request $request, TotpService $service, ToolRecorder $recorder)
    {
        $data = $request->validate(['secret' => ['required', 'string'], 'code' => ['required', 'string']]);
        $result = $service->verify($data['secret'], $data['code']);
        $recorder->save($request, 'totp', ['secret' => 'redacted'], $result);
        return response()->json($result);
    }

    public function hash(Request $request, HashIdentifierService $service, ToolRecorder $recorder)
    {
        $data = $request->validate(['hash' => ['required', 'string', 'max:255']]);
        $result = $service->identify($data['hash']);
        $recorder->save($request, 'hash', $data, $result);
        return response()->json($result);
    }

    public function breach(Request $request, ToolRecorder $recorder)
    {
        $data = $request->validate(['value' => ['required', 'string', 'max:255']]);
        if (filter_var($data['value'], FILTER_VALIDATE_EMAIL)) {
            abort_unless(config('services.hibp.key'), 503, 'La vérification email nécessite la variable HIBP_API_KEY.');

            $response = Http::withHeaders([
                'hibp-api-key' => config('services.hibp.key'),
                'user-agent' => 'SECURE-OFFICE',
            ])->timeout(12)->get('https://haveibeenpwned.com/api/v3/breachedaccount/'.urlencode($data['value']), [
                'truncateResponse' => 'false',
            ]);

            if ($response->status() === 404) {
                $result = ['type' => 'email', 'breached' => false, 'breaches' => []];
            } else {
                $response->throw();
                $result = ['type' => 'email', 'breached' => true, 'breaches' => $response->json()];
            }
        } else {
            $sha1 = strtoupper(sha1($data['value']));
            $prefix = substr($sha1, 0, 5);
            $suffix = substr($sha1, 5);
            $body = Http::timeout(12)->get("https://api.pwnedpasswords.com/range/$prefix")->throw()->body();
            $count = 0;
            foreach (explode("\n", $body) as $line) {
                [$candidate, $seen] = array_pad(explode(':', trim($line)), 2, null);
                if ($candidate === $suffix) {
                    $count = (int) $seen;
                    break;
                }
            }
            $result = ['type' => 'password', 'pwned' => $count > 0, 'count' => $count, 'k_anonymity_prefix' => $prefix];
        }

        $recorder->save($request, 'breach', ['value' => Str::mask($data['value'], '*', 2, -2)], $result);
        return response()->json($result);
    }

    public function history(Request $request)
    {
        $runs = ToolRun::query()
            ->when($request->user(), fn ($q) => $q->where('user_id', $request->user()->id))
            ->when(! $request->user(), fn ($q) => $q->where('guest_id', $request->header('X-Guest-Id')))
            ->latest()
            ->limit(50)
            ->get();

        return response()->json(['data' => $runs]);
    }
}

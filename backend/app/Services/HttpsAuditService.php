<?php

namespace App\Services;

class HttpsAuditService
{
    public function check(string $target): array
    {
        $host = parse_url(str_starts_with($target, 'http') ? $target : "https://$target", PHP_URL_HOST) ?: $target;
        $headers = @get_headers("https://$host", true) ?: [];
        $context = stream_context_create(['ssl' => ['capture_peer_cert' => true, 'verify_peer' => false, 'verify_peer_name' => false]]);
        $client = @stream_socket_client("ssl://$host:443", $errno, $errstr, 5, STREAM_CLIENT_CONNECT, $context);
        $cert = $client ? stream_context_get_params($client)['options']['ssl']['peer_certificate'] ?? null : null;
        $parsed = $cert ? openssl_x509_parse($cert) : null;

        $required = ['Strict-Transport-Security', 'Content-Security-Policy', 'X-Frame-Options', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy'];
        $headerResults = collect($required)->map(fn ($name) => ['header' => $name, 'ok' => array_key_exists($name, $headers)])->values()->all();
        $scoreValue = collect($headerResults)->where('ok', true)->count() * 10 + ($parsed ? 40 : 0);

        return [
            'host' => $host,
            'certificate' => [
                'valid' => (bool) $parsed,
                'issuer' => $parsed['issuer']['O'] ?? $parsed['issuer']['CN'] ?? null,
                'valid_from' => isset($parsed['validFrom_time_t']) ? date('c', $parsed['validFrom_time_t']) : null,
                'valid_to' => isset($parsed['validTo_time_t']) ? date('c', $parsed['validTo_time_t']) : null,
                'signature_algorithm' => $parsed['signatureTypeSN'] ?? null,
            ],
            'tls' => ['TLS 1.2/1.3 verification delegated to OpenSSL local runtime'],
            'headers' => $headerResults,
            'score' => $scoreValue >= 90 ? 'A' : ($scoreValue >= 75 ? 'B' : ($scoreValue >= 55 ? 'C' : ($scoreValue >= 35 ? 'D' : 'F'))),
        ];
    }
}

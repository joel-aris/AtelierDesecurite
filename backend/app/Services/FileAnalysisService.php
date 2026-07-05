<?php

namespace App\Services;

use App\Models\KnownMaliciousHash;
use Illuminate\Http\UploadedFile;

class FileAnalysisService
{
    public function analyze(UploadedFile $file): array
    {
        $path = $file->getRealPath();
        $bytes = file_get_contents($path, false, null, 0, 8192) ?: '';
        $hex = bin2hex(substr($bytes, 0, 16));
        $extension = strtolower($file->getClientOriginalExtension());
        $realMime = $this->detectMime($hex, $file->getMimeType());
        $hashes = [
            'md5' => hash_file('md5', $path),
            'sha1' => hash_file('sha1', $path),
            'sha256' => hash_file('sha256', $path),
            'sha512' => hash_file('sha512', $path),
        ];

        $suspicious = array_values(array_filter([
            str_starts_with($hex, '4d5a') && $extension !== 'exe' ? 'Exécutable Windows déguisé' : null,
            str_contains(strtolower($bytes), '<script') ? 'Script embarqué détecté' : null,
            str_contains(strtolower($bytes), 'powershell') ? 'Commande PowerShell détectée' : null,
        ]));

        $malicious = KnownMaliciousHash::whereIn('hash', array_values($hashes))->first();

        return [
            'name' => $file->getClientOriginalName(),
            'size' => $file->getSize(),
            'declared_extension' => $extension,
            'client_mime' => $file->getClientMimeType(),
            'real_mime' => $realMime,
            'mismatch' => $this->mismatch($extension, $realMime),
            'hashes' => $hashes,
            'metadata' => [
                'last_modified' => now()->toIso8601String(),
                'exif' => str_starts_with($realMime, 'image/') && function_exists('exif_read_data') ? @exif_read_data($path) ?: [] : [],
            ],
            'suspicious_signatures' => $suspicious,
            'malicious_match' => $malicious,
        ];
    }

    private function detectMime(string $hex, ?string $fallback): string
    {
        return match (true) {
            str_starts_with($hex, 'ffd8ff') => 'image/jpeg',
            str_starts_with($hex, '89504e47') => 'image/png',
            str_starts_with($hex, '25504446') => 'application/pdf',
            str_starts_with($hex, '4d5a') => 'application/x-msdownload',
            default => $fallback ?: 'application/octet-stream',
        };
    }

    private function mismatch(string $extension, string $mime): bool
    {
        $map = ['jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png', 'pdf' => 'application/pdf', 'exe' => 'application/x-msdownload'];
        return isset($map[$extension]) && $map[$extension] !== $mime;
    }
}

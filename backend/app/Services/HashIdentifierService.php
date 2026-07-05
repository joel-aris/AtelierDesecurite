<?php

namespace App\Services;

class HashIdentifierService
{
    public function identify(string $hash): array
    {
        $patterns = [
            'MD5' => '/^[a-f0-9]{32}$/i',
            'SHA-1' => '/^[a-f0-9]{40}$/i',
            'SHA-256' => '/^[a-f0-9]{64}$/i',
            'SHA-512' => '/^[a-f0-9]{128}$/i',
            'bcrypt' => '/^\$2[aby]\$/',
            'Argon2' => '/^\$argon2/i',
        ];

        return ['candidates' => collect($patterns)->filter(fn ($regex) => preg_match($regex, $hash))->keys()->values()->all() ?: ['Format inconnu']];
    }
}

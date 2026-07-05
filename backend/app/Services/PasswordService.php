<?php

namespace App\Services;

class PasswordService
{
    public function generate(array $data): array
    {
        $length = max(8, min(64, (int) ($data['length'] ?? 18)));
        $batch = max(1, min(24, (int) ($data['batch'] ?? 4)));
        $passphrase = (bool) ($data['passphrase'] ?? false);
        $words = ['radar', 'saphir', 'nimbus', 'cobalt', 'prairie', 'atlas', 'signal', 'quartz', 'matrix', 'orbit', 'pixel', 'lumen'];

        $sets = [
            'upper' => 'ABCDEFGHJKLMNPQRSTUVWXYZ',
            'lower' => 'abcdefghijkmnopqrstuvwxyz',
            'digits' => '23456789',
            'symbols' => '!@#$%^&*_-+=?',
        ];

        $pool = '';
        foreach ($sets as $key => $chars) {
            if (($data[$key] ?? true) === true) {
                $pool .= $chars;
            }
        }
        $pool = $pool ?: $sets['lower'];

        $items = [];
        for ($i = 0; $i < $batch; $i++) {
            if ($passphrase) {
                $items[] = collect(range(1, 5))->map(fn () => $words[random_int(0, count($words) - 1)])->implode('-');
                continue;
            }
            $items[] = collect(range(1, $length))->map(fn () => $pool[random_int(0, strlen($pool) - 1)])->implode('');
        }

        $entropy = round(($passphrase ? 5 * log(7776, 2) : $length * log(strlen($pool), 2)), 1);
        $strength = $entropy > 120 ? 'excellent' : ($entropy > 80 ? 'fort' : ($entropy > 45 ? 'moyen' : 'faible'));

        return [
            'items' => $items,
            'entropy' => $entropy,
            'strength' => $strength,
            'crack_time' => $entropy > 100 ? 'plusieurs siècles' : ($entropy > 70 ? 'plusieurs années' : ($entropy > 45 ? 'quelques semaines' : 'quelques heures')),
        ];
    }
}

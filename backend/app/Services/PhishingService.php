<?php

namespace App\Services;

class PhishingService
{
    private array $brands = ['google.com', 'microsoft.com', 'apple.com', 'paypal.com', 'amazon.com', 'facebook.com', 'github.com'];
    private array $words = ['verify', 'login-secure', 'account-update', 'urgent', 'password', 'wallet', 'confirm', 'security-check'];

    public function analyze(string $url, ?string $email = null): array
    {
        $score = 0;
        $reasons = [];
        $lower = strtolower($url);

        foreach ($this->words as $word) {
            if (str_contains($lower, $word)) {
                $score += 12;
                $reasons[] = "Mot-clé suspect: $word";
            }
        }

        if (preg_match('/https?:\/\/\d+\.\d+\.\d+\.\d+/', $lower)) {
            $score += 25;
            $reasons[] = 'Adresse IP utilisée à la place d’un domaine';
        }

        if (preg_match('/[^\x00-\x7F]/', $url)) {
            $score += 25;
            $reasons[] = 'Caractères Unicode trompeurs possibles';
        }

        foreach ($this->brands as $domain) {
            $brand = explode('.', $domain)[0];
            if (str_contains($lower, $brand) && !str_contains($lower, $domain)) {
                $score += levenshtein($brand, parse_url($lower, PHP_URL_HOST) ?: $lower) <= 4 ? 24 : 16;
                $reasons[] = "Typosquatting potentiel autour de $domain";
            }
        }

        if ($email && preg_match('/urgent|immédiat|suspendu|confidentiel|mot de passe/i', $email)) {
            $score += 15;
            $reasons[] = 'Email avec urgence ou demande sensible';
        }

        $reasons = $reasons ?: ['Aucun facteur fort détecté'];
        $score = min(100, $score);

        return [
            'score' => $score,
            'label' => $score > 75 ? 'critique' : ($score > 50 ? 'élevé' : ($score > 25 ? 'moyen' : 'faible')),
            'reasons' => $reasons,
        ];
    }
}

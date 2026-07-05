<?php

namespace App\Services;

class TotpService
{
    public function secret(): array
    {
        $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $secret = collect(range(1, 20))->map(fn () => $alphabet[random_int(0, strlen($alphabet) - 1)])->implode('');

        return [
            'secret' => $secret,
            'otpauth_uri' => "otpauth://totp/SECURE-OFFICE:user?secret=$secret&issuer=SECURE-OFFICE&algorithm=SHA1&digits=6&period=30",
        ];
    }

    public function verify(string $secret, string $code): array
    {
        $timeStep = (int) floor(time() / 30);

        foreach ([$timeStep - 1, $timeStep, $timeStep + 1] as $step) {
            if (hash_equals($this->code($secret, $step), $code)) {
                return ['valid' => true];
            }
        }

        return ['valid' => false];
    }

    private function code(string $secret, int $timeStep): string
    {
        $key = $this->base32Decode($secret);
        $counter = pack('N*', 0) . pack('N*', $timeStep);
        $hash = hash_hmac('sha1', $counter, $key, true);
        $offset = ord(substr($hash, -1)) & 0x0F;
        $binary = ((ord($hash[$offset]) & 0x7F) << 24)
            | ((ord($hash[$offset + 1]) & 0xFF) << 16)
            | ((ord($hash[$offset + 2]) & 0xFF) << 8)
            | (ord($hash[$offset + 3]) & 0xFF);

        return str_pad((string) ($binary % 1000000), 6, '0', STR_PAD_LEFT);
    }

    private function base32Decode(string $secret): string
    {
        $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $secret = strtoupper(preg_replace('/[^A-Z2-7]/', '', $secret));
        $bits = '';

        foreach (str_split($secret) as $char) {
            $position = strpos($alphabet, $char);
            if ($position === false) {
                continue;
            }
            $bits .= str_pad(decbin($position), 5, '0', STR_PAD_LEFT);
        }

        $output = '';
        foreach (str_split($bits, 8) as $byte) {
            if (strlen($byte) === 8) {
                $output .= chr(bindec($byte));
            }
        }

        return $output;
    }
}

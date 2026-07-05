<?php

namespace App\Services;

class AuditService
{
    public function score(array $answers): array
    {
        $scores = [];
        $recommendations = [];
        foreach ($answers as $category => $items) {
            $total = max(1, count($items));
            $ok = 0;
            foreach ($items as $item => $value) {
                if (in_array($value['status'] ?? $value, ['conforme', 'na'], true)) {
                    $ok++;
                }
                if (($value['status'] ?? $value) === 'non conforme') {
                    $recommendations[] = "Corriger $item dans $category.";
                }
            }
            $scores[$category] = round(($ok / $total) * 100);
        }

        $scores['global'] = round(array_sum($scores) / max(1, count($scores)));

        return ['scores' => $scores, 'recommendations' => $recommendations];
    }
}

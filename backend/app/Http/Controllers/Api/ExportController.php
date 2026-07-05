<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Incident;
use App\Models\SecurityAudit;
use App\Models\ToolRun;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class ExportController extends Controller
{
    public function fileReport(Request $request)
    {
        $result = $request->validate(['report' => ['required', 'array']]);
        $report = $result['report'];

        $html = "
        <!DOCTYPE html>
        <html><head>
            <meta charset='utf-8'>
            <style>
                body { font-family: 'Inter', system-ui, sans-serif; margin: 40px; color: #050505; }
                h1 { font-size: 28px; font-weight: 760; margin-bottom: 20px; }
                h2 { font-size: 18px; font-weight: 700; margin: 16px 0 8px; color: #666; }
                dl { display: grid; grid-template-columns: 160px 1fr; gap: 8px; margin: 0; }
                dt { font-weight: 700; color: #666; }
                dd { margin: 0; }
                pre { background: #f5f5f7; padding: 16px; border-radius: 8px; overflow-x: auto; }
            </style>
        </head><body>
            <h1>Rapport d'analyse de fichier</h1>
            <dl>
                <dt>Nom</dt><dd>{$report['name']}</dd>
                <dt>Taille</dt><dd>" . number_format($report['size']) . " octets</dd>
                <dt>Extension</dt><dd>{$report['declared_extension']}</dd>
                <dt>MIME</dt><dd>{$report['real_mime']}</dd>
            </dl>
            <h2>Hashs</h2>
            <pre>" . json_encode($report['hashes'], JSON_PRETTY_PRINT) . "</pre>
            " . ($report['mismatch'] || $report['malicious_match'] ? "<p style='color:#d32f2f;'>⚠️ Incohérence ou signature suspecte détectée.</p>" : "") . "
            <p style='margin-top: 30px; color: #666; font-size: 12px;'>SECURE OFFICE - Document généré le " . now()->format('d/m/Y H:i') . "</p>
        </body></html>";

        return Response::make($html, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . ($report['name'] ?? 'rapport') . '.pdf"',
        ]);
    }

    public function fileReportExcel(Request $request)
    {
        $result = $request->validate(['report' => ['required', 'array']]);
        $report = $result['report'];

        $csv = "Champ,Valeur\n";
        $csv .= "Nom," . $report['name'] . "\n";
        $csv .= "Taille," . $report['size'] . " octets\n";
        $csv .= "Extension," . $report['declared_extension'] . "\n";
        $csv .= "MIME," . $report['real_mime'] . "\n";
        $csv .= "MD5," . $report['hashes']['md5'] . "\n";
        $csv .= "SHA1," . $report['hashes']['sha1'] . "\n";
        $csv .= "SHA256," . $report['hashes']['sha256'] . "\n";
        $csv .= "SHA512," . $report['hashes']['sha512'] . "\n";

        return Response::make($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . ($report['name'] ?? 'rapport') . '.csv"',
        ]);
    }

    public function auditReport(Request $request)
    {
        $result = $request->validate(['audit' => ['required', 'array']]);
        $audit = $result['audit'];

        $html = "
        <!DOCTYPE html>
        <html><head>
            <meta charset='utf-8'>
            <style>
                body { font-family: 'Inter', system-ui, sans-serif; margin: 40px; color: #050505; }
                h1 { font-size: 28px; font-weight: 760; margin-bottom: 20px; }
                h2 { font-size: 20px; font-weight: 700; margin: 20px 0 12px; padding-bottom: 8px; border-bottom: 1px solid #ddd; }
                table { width: 100%; border-collapse: collapse; margin: 12px 0; }
                th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background: #f5f5f7; font-weight: 700; }
                .score { background: #050505; color: white; padding: 4px 12px; border-radius: 20px; font-weight: 700; }
            </style>
        </head><body>
            <h1>Audit de sécurité</h1>
            <p><strong>Titre:</strong> {$audit['title']}</p>
            <p><strong>Date:</strong> " . ($audit['created_at'] ?? now()->format('d/m/Y')) . "</p>
            <div class='score'>Score global: {$audit['scores']['global']}%</div>
            <h2>Détails par catégorie</h2>
            <table>
                <tr><th>Catégorie</th><th>Score</th></tr>
                " . collect($audit['scores'])->filter(fn($v, $k) => $k !== 'global')->map(fn($v, $k) => "<tr><td>$k</td><td>$v%</td></tr>")->implode('') . "
            </table>
            " . (isset($audit['recommendations']) && count($audit['recommendations']) ? "<h2>Recommandations</h2><ul>" . collect($audit['recommendations'])->map(fn($r) => "<li>$r</li>")->implode('') . "</ul>" : "") . "
            <p style='margin-top: 30px; color: #666; font-size: 12px;'>SECURE OFFICE - Document généré le " . now()->format('d/m/Y H:i') . "</p>
        </body></html>";

        return Response::make($html, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="audit-securite.pdf"',
        ]);
    }

    public function incidentReport(Request $request)
    {
        $result = $request->validate(['incidents' => ['required', 'array']]);
        $incidents = $result['incidents'];

        $html = "
        <!DOCTYPE html>
        <html><head>
            <meta charset='utf-8'>
            <style>
                body { font-family: 'Inter', system-ui, sans-serif; margin: 40px; color: #050505; }
                h1 { font-size: 28px; font-weight: 760; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin: 12px 0; }
                th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background: #f5f5f7; font-weight: 700; }
            </style>
        </head><body>
            <h1>Journal des incidents</h1>
            <table>
                <tr><th>Titre</th><th>Catégorie</th><th>Sévérité</th><th>Statut</th></tr>
                " . collect($incidents)->map(fn($i) => "<tr><td>{$i['title']}</td><td>{$i['category']}</td><td>{$i['severity']}</td><td>{$i['status']}</td></tr>")->implode('') . "
            </table>
            <p style='margin-top: 30px; color: #666; font-size: 12px;'>SECURE OFFICE - Document généré le " . now()->format('d/m/Y H:i') . "</p>
        </body></html>";

        return Response::make($html, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="journal-incidents.pdf"',
        ]);
    }

    public function passwordReport(Request $request)
    {
        $result = $request->validate(['passwords' => ['required', 'array'], 'settings' => ['nullable', 'array']]);
        $passwords = $result['passwords'];
        $settings = $result['settings'] ?? [];

        $entropy = $settings['entropy'] ?? 'N/A';
        $str = $settings['strength'] ?? 'N/A';
        $html = "
        <!DOCTYPE html>
        <html><head>
            <meta charset='utf-8'>
            <style>
                body { font-family: 'Inter', system-ui, sans-serif; margin: 40px; color: #050505; }
                h1 { font-size: 28px; font-weight: 760; margin-bottom: 20px; }
                pre { background: #f5f5f7; padding: 20px; border-radius: 8px; font-size: 16px; }
                .meta { color: #666; margin: 16px 0; }
            </style>
        </head><body>
            <h1>Générateur de mots de passe - Rapport</h1>
            <p class='meta'>Entropie: {$entropy} bits | Force: {$str}</p>
            <pre>" . implode("\n", $passwords) . "</pre>
            <p style='margin-top: 30px; color: #666; font-size: 12px;'>SECURE OFFICE - Document généré le " . now()->format('d/m/Y H:i') . "</p>
        </body></html>";

        return Response::make($html, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="mots-de-passe.pdf"',
        ]);
    }
}
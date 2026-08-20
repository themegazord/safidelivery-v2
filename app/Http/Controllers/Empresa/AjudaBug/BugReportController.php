<?php

namespace App\Http\Controllers\Empresa\AjudaBug;

use App\Actions\AjudaBug\CriaBugReportAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\AjudaBug\BugReportRequest;
use App\Models\BugReport;
use App\Models\Empresa;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use RuntimeException;

class BugReportController extends Controller
{
    private const LABELS_STATUS = ['aguardando', 'em desenvolvimento', 'finalizado'];

    public Empresa $empresa;

    public function __construct()
    {
        $this->empresa = Empresa::where('cnpj', request('cnpj'))->firstOrFail();
    }

    public function index()
    {
        $issuesResposta = Http::withToken(config('services.github.token'))
            ->withHeaders(['Accept' => 'application/vnd.github+json'])
            ->get('https://api.github.com/repos/' . config('services.github.repo') . '/issues', [
                'state' => 'all',
                'per_page' => 100,
            ]);

        $labelsResposta = Http::withToken(config('services.github.token'))
            ->withHeaders(['Accept' => 'application/vnd.github+json'])
            ->get('https://api.github.com/repos/' . config('services.github.repo') . '/labels', [
                'per_page' => 100,
            ]);

        $meusIds = BugReport::query()
            ->where('empresa_id', $this->empresa->getAttribute('id'))
            ->pluck('gh_id_issue')
            ->all();

        $issues = collect($issuesResposta->successful() ? $issuesResposta->json() : [])
            ->filter(fn (array $issue) => in_array($issue['id'], $meusIds, true))
            ->filter(fn (array $issue) => ! isset($issue['pull_request']))
            ->map(fn (array $issue) => $this->formataIssue($issue))
            ->values();

        $grupos = $this->agrupaPorStatus($issues);

        return Inertia::render('Empresa/AjudaBug/AjudaBug', [
            'grupos' => $grupos,
            'stats' => $this->calculaStats($issues, $grupos),
            'labelsDisponiveis' => collect($labelsResposta->successful() ? $labelsResposta->json() : [])
                ->reject(fn (array $label) => in_array($label['name'], self::LABELS_STATUS, true))
                ->map(fn (array $label) => ['name' => $label['name'], 'color' => $label['color']])
                ->values(),
            'erroGithub' => ! $issuesResposta->successful(),
        ]);
    }

    private function agrupaPorStatus(Collection $issues): array
    {
        return [
            'aguardando' => $issues->filter(fn (array $i) => in_array('aguardando', $i['labels_nomes'], true))->values(),
            'em_desenvolvimento' => $issues->filter(fn (array $i) => in_array('em desenvolvimento', $i['labels_nomes'], true))->values(),
            'finalizado' => $issues->filter(fn (array $i) => in_array('finalizado', $i['labels_nomes'], true))->values(),
            'outros' => $issues->filter(fn (array $i) => count(array_intersect(self::LABELS_STATUS, $i['labels_nomes'])) === 0)->values(),
        ];
    }

    private function calculaStats(Collection $issues, array $grupos): array
    {
        return [
            'total' => $issues->count(),
            'abertas' => $issues->where('estado', 'open')->count(),
            'fechadas' => $issues->where('estado', 'closed')->count(),
            'aguardando' => $grupos['aguardando']->count(),
            'em_desenvolvimento' => $grupos['em_desenvolvimento']->count(),
            'finalizado' => $grupos['finalizado']->count(),
            'sem_label' => $issues->filter(fn (array $i) => empty($i['labels_nomes']))->count(),
        ];
    }

    private function formataIssue(array $issue): array
    {
        return [
            'id' => $issue['id'],
            'numero' => $issue['number'],
            'titulo' => $issue['title'],
            'estado' => $issue['state'],
            'estado_motivo' => $issue['state_reason'] ?? null,
            'link' => $issue['html_url'],
            'criado_em' => $issue['created_at'],
            'comentarios' => $issue['comments'],
            'labels' => collect($issue['labels'])->map(fn (array $l) => ['name' => $l['name'], 'color' => $l['color']])->values()->all(),
            'labels_nomes' => collect($issue['labels'])->pluck('name')->all(),
        ];
    }

    public function store(BugReportRequest $request, CriaBugReportAction $action): JsonResponse
    {
        try {
            $issue = $action->handle($this->empresa, $request->validated());
        } catch (RuntimeException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }

        return response()->json([
            'mensagem' => 'Problema reportado com sucesso',
            'issue' => $this->formataIssue($issue),
        ]);
    }
}

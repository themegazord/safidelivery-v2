<?php

namespace App\Actions\AjudaBug;

use App\Models\BugReport;
use App\Models\Empresa;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class CriaBugReportAction
{
    /**
     * @return array<string, mixed> issue crua retornada pela API do GitHub
     */
    public function handle(Empresa $empresa, array $dados): array
    {
        $labels = array_values(array_unique([...($dados['labels'] ?? []), 'aguardando']));

        $resposta = Http::withToken(config('services.github.token'))
            ->withHeaders(['Accept' => 'application/vnd.github+json'])
            ->post('https://api.github.com/repos/' . config('services.github.repo') . '/issues', [
                'title' => $dados['titulo'],
                'body' => $this->montaCorpo($empresa, $dados),
                'labels' => $labels,
            ]);

        if ($resposta->failed()) {
            throw new RuntimeException('Não foi possível registrar o chamado no GitHub. Tente novamente em instantes.');
        }

        $issue = $resposta->json();

        BugReport::query()->create([
            'empresa_id' => $empresa->getAttribute('id'),
            'titulo' => $dados['titulo'],
            'gh_numero_issue' => $issue['number'],
            'gh_id_issue' => $issue['id'],
        ]);

        return $issue;
    }

    private function montaCorpo(Empresa $empresa, array $dados): string
    {
        $linhas = [$dados['descricao']];

        if (! empty($dados['passos'])) {
            $linhas[] = '';
            $linhas[] = '**Passos para reproduzir:**';
            $linhas[] = $dados['passos'];
        }

        $linhas[] = '';
        $linhas[] = '---';
        $linhas[] = 'Empresa: ' . $empresa->getAttribute('nome_fantasia') . ' (' . $empresa->getAttribute('cnpj') . ')';

        return implode("\n", $linhas);
    }
}

<?php

namespace App\Http\Controllers\Empresa\Horarios;

use App\Actions\Horarios\AtualizaFuncionamentoEstabelecimentoAction;
use App\Actions\Horarios\CadastraIndisponibilidadeAction;
use App\Actions\Horarios\SalvaGradeHorariosAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Horarios\AtualizaFuncionamentoEstabelecimentoRequest;
use App\Http\Requests\Horarios\IndisponibilidadeRequest;
use App\Http\Requests\Horarios\SalvaGradeHorariosRequest;
use App\Models\Configuracao;
use App\Models\Empresa;
use App\Models\HorarioFuncionamento;
use App\Models\HorarioIndisponibilidade;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;

class HorariosController extends Controller
{
    public Empresa $empresa;

    public function __construct()
    {
        $this->empresa = Empresa::where('cnpj', request('cnpj'))->firstOrFail();
    }

    public function index()
    {
        $horarios = HorarioFuncionamento::query()
            ->where('empresa_id', $this->empresa->getAttribute('id'))
            ->orderBy('dia_semana')
            ->orderBy('hora_inicio')
            ->get(['id', 'tipo_funcionamento', 'dia_semana', 'status', 'hora_inicio', 'hora_fim']);

        $indisponibilidades = HorarioIndisponibilidade::query()
            ->where('empresa_id', $this->empresa->getAttribute('id'))
            ->orderBy('data_inicio')
            ->get(['id', 'titulo', 'descricao', 'data_inicio', 'data_fim']);

        $funcionamentoEstabelecimento = Configuracao::query()
            ->where('empresa_id', $this->empresa->getAttribute('id'))
            ->where('configuracao', 'funcionamentoEstabelecimento')
            ->value('valor');

        $fusoHorario = Configuracao::query()
            ->where('empresa_id', $this->empresa->getAttribute('id'))
            ->where('configuracao', 'fuso_horario')
            ->value('valor');

        return Inertia::render('Empresa/Horarios/Horarios', [
            'horariosPorTipo' => [
                'delivery' => $horarios->where('tipo_funcionamento', 'delivery')->values()->map(fn (HorarioFuncionamento $h) => $this->formataHorario($h)),
                'retirada' => $horarios->where('tipo_funcionamento', 'retirada')->values()->map(fn (HorarioFuncionamento $h) => $this->formataHorario($h)),
                'mesa' => $horarios->where('tipo_funcionamento', 'mesa')->values()->map(fn (HorarioFuncionamento $h) => $this->formataHorario($h)),
            ],
            'indisponibilidades' => $indisponibilidades->map(fn (HorarioIndisponibilidade $i) => [
                'id' => $i->getAttribute('id'),
                'titulo' => $i->getAttribute('titulo'),
                'descricao' => $i->getAttribute('descricao'),
                'data_inicio' => $i->getAttribute('data_inicio'),
                'data_fim' => $i->getAttribute('data_fim'),
            ]),
            'funcionamentoEstabelecimento' => $funcionamentoEstabelecimento ?? 'horarios',
            'fusosHorarios' => $this->empresa->fusosHorarios(),
            'fusoHorario' => $fusoHorario !== null ? (int) $fusoHorario : null,
        ]);
    }

    private function formataHorario(HorarioFuncionamento $horario): array
    {
        return [
            'id' => $horario->getAttribute('id'),
            'dia_semana' => (int) $horario->getAttribute('dia_semana'),
            'status' => (bool) $horario->getAttribute('status'),
            'hora_inicio' => substr((string) $horario->getAttribute('hora_inicio'), 0, 5),
            'hora_fim' => substr((string) $horario->getAttribute('hora_fim'), 0, 5),
        ];
    }

    public function atualizaFuncionamento(AtualizaFuncionamentoEstabelecimentoRequest $request, AtualizaFuncionamentoEstabelecimentoAction $action): JsonResponse
    {
        $dados = $request->validated();

        $action->handle($this->empresa, $dados['funcionamentoEstabelecimento'], $dados['fuso_horario']);

        return response()->json(['mensagem' => 'Configuração de funcionamento salva com sucesso']);
    }

    public function salvarGrade(SalvaGradeHorariosRequest $request, SalvaGradeHorariosAction $action, string $tipo_funcionamento): JsonResponse
    {
        $action->handle($this->empresa, $tipo_funcionamento, $request->validated()['horarios']);

        return response()->json(['mensagem' => 'Grade de horários salva com sucesso']);
    }

    public function cadastraIndisponibilidade(IndisponibilidadeRequest $request, CadastraIndisponibilidadeAction $action): JsonResponse
    {
        $indisponibilidade = $action->handle($this->empresa, $request->validated());

        return response()->json([
            'mensagem' => 'Bloqueio cadastrado com sucesso',
            'indisponibilidade' => [
                'id' => $indisponibilidade->getAttribute('id'),
                'titulo' => $indisponibilidade->getAttribute('titulo'),
                'descricao' => $indisponibilidade->getAttribute('descricao'),
                'data_inicio' => $indisponibilidade->getAttribute('data_inicio'),
                'data_fim' => $indisponibilidade->getAttribute('data_fim'),
            ],
        ]);
    }

    public function removeIndisponibilidade(string $cnpj, string $indisponibilidade_id): JsonResponse
    {
        $indisponibilidade = HorarioIndisponibilidade::query()
            ->where('empresa_id', $this->empresa->getAttribute('id'))
            ->findOrFail($indisponibilidade_id);

        $indisponibilidade->delete();

        return response()->json(['mensagem' => 'Bloqueio removido com sucesso']);
    }
}

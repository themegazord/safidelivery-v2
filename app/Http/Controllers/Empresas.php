<?php

namespace App\Http\Controllers;

use App\Http\Requests\Empresa\EmpresaRequest;
use App\Http\Requests\Empresa\FormaPagamentoRequest;
use App\Models\Empresa;
use App\Models\Endereco;
use App\Models\FormaPagamento;
use App\Models\Integracao;
use App\Models\User;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class Empresas extends Controller
{
	public function cadastroEmpresa(EmpresaRequest $request): JsonResponse
	{
		try {
			DB::transaction(function () use ($request) {
				$endereco = Endereco::query()->create([
					'logradouro' => $request['logradouro'],
					'bairro' => $request['bairro'],
					'cidade' => $request['cidade'],
					'uf' => $request['uf'],
					'cep' => $request['cep'],
					'numero' => $request['numero'],
					'complemento' => $request['complemento'],
				]);
				$empresa = Empresa::query()->create([
					'interacao_id' => uuid_create(),
					'endereco_id' => $endereco->getAttribute('id'),
					'razao_social' => $request['razao_social'],
					'nome_fantasia' => $request['nome_fantasia'],
					'telefone_contato' => $request['telefone_contato'],
					'telefone_comercial' => $request['telefone_comercial'],
					'telefone_whatsapp' => $request['telefone_whatsapp'],
					'cnpj' => $request['cnpj'],
					'email' => $request['email'],
				]);

				User::query()->create([
					'name' => $empresa->getAttribute('nome_fantasia'),
					'email' => $empresa->getAttribute('email'),
					'password' => $request['cnpj'],
				]);
			});
			return response()->json(['sucesso' => 'Empresa cadastrada com sucesso!'], Response::HTTP_CREATED);
		} catch (\Exception $e) {
			return response()->json(['erro' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
		}
	}

	public function upsertFormaPgto(FormaPagamentoRequest $request): JsonResponse
	{
		try {
			$companyToken = $request->headers->get('companyToken');
			if (!$companyToken) {
				return response()->json(['erro' => 'Company Token não existe'], 401);
			}
			$integracao = Integracao::where('companyToken', $companyToken)->firstOrFail();
			$empresa = $integracao->empresa;
			$dados = $request->validated()['formas'];

			DB::transaction(function () use ($empresa, $dados){
				foreach ($dados as $dado) {
					if (str_contains(strtolower($dado['descricao'] ?? ''), 'cashback')) {
						$dado['interno'] = true;
					}

					$formaPagamento = FormaPagamento::withTrashed()->updateOrCreate([
						'empresa_id' => $empresa->id,
						'codigo_pdv' => $dado['codigo_pdv'],
					], $dado);

					!$dado['ativo'] ? $formaPagamento->delete() : $formaPagamento->restore();
				 }
			});

			return response()->json(['mensagem' => 'Formas de pagamento cadastradas com sucesso'], 201);

		} catch (Exception $e) {
			return response()->json(['erro' => $e->getMessage()], $e->getCode());
		}
	}
}

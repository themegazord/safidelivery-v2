<?php

namespace App\Traits;

use Aws\S3\S3Client;
use Aws\Exception\AwsException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;
use Livewire\WithFileUploads;
use Mary\Traits\Toast;

trait TrataMGCObjectStore
{
  use Toast, WithFileUploads;

  protected function criarClienteS3(): S3Client
  {
    return new S3Client([
      'region' => env('MGC_REGION'),
      'version' => 'latest',
      'credentials' => [
        'key' => env('MGC_ID'),
        'secret' => env('MGC_SECRET_ACCESS_KEY')
      ],
      'endpoint' => env('MGC_ENDPOINT'),
      'use_path_style_endpoint' => env('MGC_USE_PATH_STYLE_ENDPOINT'),
    ]);
  }

  public function uploadImagem(string $nomeBucket, TemporaryUploadedFile $imagem): string|bool
  {
    try {
      $s3client = $this->criarClienteS3();

      $caminhoArquivo = $imagem->getRealPath();
      $nomeArquivo = $imagem->getClientOriginalName();

      if (!file_exists($caminhoArquivo)) {
        $this->warning("O arquivo {$caminhoArquivo} não foi encontrado.");
        return 0;
      }

      $resultado = $s3client->putObject([
        'Bucket' => $nomeBucket,
        'Key' => uuid_create(),
        'SourceFile' => $caminhoArquivo,
        'ContentType' => mime_content_type($caminhoArquivo),
      ]);

      $this->success('Imagem enviada com sucesso!');

      return $resultado->get('ObjectURL');

    } catch (AwsException $e) {
      $this->warning('Erro ao enviar a imagem para a nuvem: ' . $e->getMessage());
      return 0;
    }
  }

  /**
 * Baixa imagem de URL externa e faz upload para o bucket S3
 *
 * @param string $nomeBucket Nome do bucket S3
 * @param string $imageUrl URL da imagem externa (ex: Anota AI)
 * @param string|null $prefixo Prefixo opcional para organizar (ex: 'produtos/2024-11')
 * @return string|false URL da imagem no bucket ou false em caso de erro
 */
public function importarImagemUrl(string $nomeBucket, string $imageUrl, ?string $prefixo = null): string|false
{
    try {
        // 1. Valida a URL
        if (empty($imageUrl) || !filter_var($imageUrl, FILTER_VALIDATE_URL)) {
            $this->warning("URL de imagem inválida: {$imageUrl}");
            return false;
        }

        // 2. Baixa a imagem
        $response = Http::timeout(30)
            ->retry(3, 100)
            ->get($imageUrl);

        if (!$response->successful()) {
            $this->warning("Falha ao baixar imagem: {$imageUrl} (Status: {$response->status()})");
            return false;
        }

        $imageContent = $response->body();

        // 3. Valida se é uma imagem válida
        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->buffer($imageContent);

        if (!str_starts_with($mimeType, 'image/')) {
            return false;
        }

        // 4. Define extensão baseada no MIME type
        $extension = match($mimeType) {
            'image/jpeg', 'image/jpg' => 'jpg',
            'image/png' => 'png',
            'image/gif' => 'gif',
            'image/webp' => 'webp',
            default => 'jpg',
        };

        // 5. Gera nome único para o arquivo
        $uuid = uuid_create();
        $filename = $prefixo
            ? "{$prefixo}/{$uuid}.{$extension}"
            : "{$uuid}.{$extension}";

        // 6. Cria arquivo temporário
        $tempFile = tmpfile();
        $tempPath = stream_get_meta_data($tempFile)['uri'];
        fwrite($tempFile, $imageContent);

        // 7. Upload para S3
        $s3client = $this->criarClienteS3();

        $resultado = $s3client->putObject([
            'Bucket' => $nomeBucket,
            'Key' => $filename,
            'SourceFile' => $tempPath,
            'ContentType' => $mimeType,
            'ACL' => 'public-read', // Ajuste conforme necessário
        ]);

        // 8. Limpa arquivo temporário
        fclose($tempFile);

        $objectUrl = $resultado->get('ObjectURL');

        return $objectUrl;

    } catch (\Exception $e) {
        Log::error('Erro ao importar imagem', [
            'url' => $imageUrl,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        return false;
    }
}

  public function removeImagem(string $nomeBucket, string $link_imagem): void {
    try {
      $s3client = $this->criarClienteS3();

      $s3client->deleteObject([
        'Bucket' => $nomeBucket,
        'Key' => substr($link_imagem, -36)
      ]);
      $this->info('Imagem removida da nuvem');
    } catch (AwsException $e) {
      $this->warning('Erro ao remover a imagem da nuvem: ' . $e->getMessage());
    }
  }
}

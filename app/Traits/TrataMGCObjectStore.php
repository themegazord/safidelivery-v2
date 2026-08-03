<?php

namespace App\Traits;

use Aws\S3\S3Client;
use Aws\Exception\AwsException;
use Exception;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

trait TrataMGCObjectStore
{
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
      'use_path_style_endpoint' => filter_var(env('MGC_USE_PATH_STYLE_ENDPOINT'), FILTER_VALIDATE_BOOLEAN),
    ]);
  }

  public function uploadImagem(string $nomeBucket, UploadedFile $imagem): string|bool
  {
    try {
      $s3client = $this->criarClienteS3();

      $caminhoArquivo = $imagem->getRealPath();
      $nomeArquivo = $imagem->getClientOriginalName();
      $extensao = $imagem->getClientOriginalExtension();
      $key = uuid_create() . ($extensao ? ".{$extensao}" : '');

      if (!file_exists($caminhoArquivo)) {
        throw new Exception("O arquivo {$caminhoArquivo} não foi encontrado. Por favor, entrar em contato com o suporte.", Response::HTTP_INTERNAL_SERVER_ERROR);
      }

      $resultado = $s3client->putObject([
        'Bucket' => $nomeBucket,
        'Key' => $key,
        'SourceFile' => $caminhoArquivo,
        'ContentType' => mime_content_type($caminhoArquivo),
      ]);

      return $resultado->get('ObjectURL');

    } catch (AwsException $e) {
      throw new Exception('Erro ao enviar a imagem para a nuvem: ' . $e->getMessage(), $e->getCode(), $e);
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
            throw new Exception("URL de imagem inválida: {$imageUrl}", Response::HTTP_NOT_FOUND);
        }

        // 2. Baixa a imagem
        $response = Http::timeout(30)
            ->retry(3, 100)
            ->get($imageUrl);

        if (!$response->successful()) {
            throw new Exception("Falha ao baixar imagem: {$imageUrl} (Status: {$response->status()})", Response::HTTP_UNPROCESSABLE_ENTITY);
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

  public function removeImagem(string $nomeBucket, string $link_imagem): bool {
    try {
      $s3client = $this->criarClienteS3();

      $s3client->deleteObject([
        'Bucket' => $nomeBucket,
        'Key' => $this->extrairKeyDoLinkImagem($nomeBucket, $link_imagem)
      ]);
      return true;
    } catch (AwsException $e) {
      throw new Exception('Erro ao remover a imagem da nuvem: ' . $e->getMessage(), $e->getCode(), $e);
    }
  }

  /**
   * Extrai a key do objeto (incluindo eventuais prefixos/pastas) a partir da URL
   * pública retornada pelo upload. Antes disso, um `substr(-36)` assumia que a
   * key era sempre um UUID puro de 36 caracteres, o que quebrava sempre que o
   * arquivo tinha extensão (ex: "uuid.jpg") ou prefixo (ex: "produtos/uuid.jpg").
   */
  protected function extrairKeyDoLinkImagem(string $nomeBucket, string $link_imagem): string
  {
    $path = ltrim(parse_url($link_imagem, PHP_URL_PATH) ?? '', '/');
    $prefixoBucket = $nomeBucket . '/';

    return str_starts_with($path, $prefixoBucket)
      ? substr($path, strlen($prefixoBucket))
      : $path;
  }
}

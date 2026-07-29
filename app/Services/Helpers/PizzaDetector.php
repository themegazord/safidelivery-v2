<?php

namespace App\Services\Helpers;

class PizzaDetector
{
    /**
     * Palavras-chave que indicam pizza
     */
    private const PIZZA_KEYWORDS = [
        // Português
        'pizza',
        'pizzas',
        'pizzaria',

        // Tipos de massa
        'brotinho',
        'esfiha', // às vezes confundido
        'calzone',

        // Termos comuns em pizzarias
        'fatia',
        'fatias',
        'pedaço',
        'pedaços',
        'borda',
        'recheada',
        'tradicional',
        'especial',

        // Tamanhos típicos de pizza
        'broto',
        'média',
        'grande',
        'gigante',
        'família',
        'individual',
    ];

    /**
     * Sabores clássicos de pizza
     */
    private const PIZZA_FLAVORS = [
        'margherita',
        'marguerita',
        'mussarela',
        'muçarela',
        'calabresa',
        'portuguesa',
        'napolitana',
        'quatro queijos',
        '4 queijos',
        'frango catupiry',
        'catupiry',
        'atum',
        'lombo',
        'canadense',
        'pepperoni',
        'vegetariana',
        'caipira',
        'baiana',
        'paulista',
        'carioca',
        'mineira',
        'romana',
        'toscana',
        'siciliana',
        'americana',
        'mexicana',
        'chicken',
        'bacon',
        'champignon',
        'palmito',
        'escarola',
        'milho',
        'brigadeiro', // pizza doce
        'chocolate', // pizza doce
        'banana', // pizza doce (quando no contexto)
        'romeu e julieta',
    ];

    /**
     * Padrões regex para identificar pizza
     */
    private const PIZZA_PATTERNS = [
        '/pizza\s+de\s+/i',
        '/\d+\s*sabor(es)?/i', // "2 sabores", "3 sabores"
        '/meio\s+a\s+meio/i',
        '/\d+\/\d+/i', // "1/2", "1/3", "1/4"
        '/borda\s+(recheada|catupiry|cheddar)/i',
    ];

    /**
     * Palavras que excluem pizza (anti-patterns)
     */
    private const ANTI_PATTERNS = [
        'hamburguer',
        'burger',
        'sanduiche',
        'sandwich',
        'x-',
        'pastel',
        'coxinha',
        'risoto',
        'macarrão',
        'espaguete',
        'lasanha',
        'nhoque',
        'salada',
        'sopa',
        'suco',
        'refrigerante',
        'bebida',
        'cerveja',
        'sobremesa',
        'sorvete',
    ];

    /**
     * Detecta se o nome do produto é uma pizza
     */
    public function isPizza(string $name): bool
    {
        $name = $this->normalize($name);

        // 1. Verifica anti-patterns primeiro
        if ($this->hasAntiPattern($name)) {
            return false;
        }

        // 2. Verifica palavra-chave explícita de pizza
        if ($this->hasKeyword($name)) {
            return true;
        }

        // 3. Verifica padrões regex
        if ($this->matchesPattern($name)) {
            return true;
        }

        // 4. Verifica sabores clássicos
        if ($this->hasPizzaFlavor($name)) {
            return true;
        }

        return false;
    }

    /**
     * Retorna um score de confiança (0-100)
     */
    public function getPizzaScore(string $name): int
    {
        $name = $this->normalize($name);
        $score = 0;

        // Anti-pattern = 0 automático
        if ($this->hasAntiPattern($name)) {
            return 0;
        }

        // Palavra "pizza" = 100 pontos
        if (str_contains($name, 'pizza')) {
            $score += 100;
        }

        // Keywords = 40 pontos
        if ($this->hasKeyword($name)) {
            $score += 40;
        }

        // Patterns = 30 pontos
        if ($this->matchesPattern($name)) {
            $score += 30;
        }

        // Sabores = 25 pontos
        if ($this->hasPizzaFlavor($name)) {
            $score += 25;
        }

        // Tamanhos = 15 pontos
        if ($this->hasSizeIndicator($name)) {
            $score += 15;
        }

        return min(100, $score);
    }

    /**
     * Normaliza o texto para comparação
     */
    private function normalize(string $text): string
    {
        $text = mb_strtolower($text);
        $text = $this->removeAccents($text);
        $text = trim($text);

        return $text;
    }

    /**
     * Remove acentos
     */
    private function removeAccents(string $text): string
    {
        $unwanted = [
            'á' => 'a', 'à' => 'a', 'ã' => 'a', 'â' => 'a',
            'é' => 'e', 'ê' => 'e',
            'í' => 'i',
            'ó' => 'o', 'õ' => 'o', 'ô' => 'o',
            'ú' => 'u', 'ü' => 'u',
            'ç' => 'c',
        ];

        return strtr($text, $unwanted);
    }

    /**
     * Verifica se tem palavra-chave de pizza
     */
    private function hasKeyword(string $name): bool
    {
        foreach (self::PIZZA_KEYWORDS as $keyword) {
            if (str_contains($name, $keyword)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Verifica se tem sabor clássico de pizza
     */
    private function hasPizzaFlavor(string $name): bool
    {
        foreach (self::PIZZA_FLAVORS as $flavor) {
            if (str_contains($name, $flavor)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Verifica padrões regex
     */
    private function matchesPattern(string $name): bool
    {
        foreach (self::PIZZA_PATTERNS as $pattern) {
            if (preg_match($pattern, $name)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Verifica anti-patterns
     */
    private function hasAntiPattern(string $name): bool
    {
        foreach (self::ANTI_PATTERNS as $antiPattern) {
            if (str_contains($name, $antiPattern)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Verifica indicadores de tamanho
     */
    private function hasSizeIndicator(string $name): bool
    {
        $sizes = ['p', 'm', 'g', 'gg', 'broto', 'media', 'grande', 'gigante', 'pequena'];

        foreach ($sizes as $size) {
            if (str_contains($name, $size)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Analisa e retorna detalhes da detecção
     */
    public function analyze(string $name): array
    {
        $normalized = $this->normalize($name);

        return [
            'original' => $name,
            'normalized' => $normalized,
            'is_pizza' => $this->isPizza($name),
            'score' => $this->getPizzaScore($name),
            'reasons' => [
                'has_keyword' => $this->hasKeyword($normalized),
                'has_flavor' => $this->hasPizzaFlavor($normalized),
                'matches_pattern' => $this->matchesPattern($normalized),
                'has_size' => $this->hasSizeIndicator($normalized),
                'has_anti_pattern' => $this->hasAntiPattern($normalized),
            ]
        ];
    }
}

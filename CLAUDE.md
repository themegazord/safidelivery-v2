# SAFI Delivery v2 — Guia de Setup para Claude Code

## Stack

- **Backend:** Laravel 12 (PHP)
- **Frontend:** React 19 + TypeScript via Inertia.js
- **Build:** Vite 7
- **CSS:** Tailwind CSS v4
- **Componentes UI:** shadcn/ui (Radix UI) + Lucide React
- **Banco de dados:** MySQL 8

---

## Setup inicial (primeira vez no ambiente)

### 1. Dependências PHP
```bash
composer install
```

### 2. Dependências Node
```bash
npm install
```

### 3. Variáveis de ambiente
```bash
cp .env.example .env
php artisan key:generate
```

### 4. Configurar `.env`
Editar o `.env` e ajustar:
```
APP_URL=http://delivery.safi.local:8000   # ou o domínio local configurado

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=safidelivery
DB_USERNAME=root
DB_PASSWORD=sua_senha
```

### 5. Banco de dados
```bash
php artisan migrate
```

> Se houver um backup `.sql.gz` disponível, importe antes de migrar:
> ```bash
> gunzip -c backup_safidelivery_*.sql.gz | mysql -u root -p safidelivery
> php artisan migrate
> ```

### 6. Storage link
```bash
php artisan storage:link
```

---

## Servidores de desenvolvimento

Rodar os dois em terminais separados:

```bash
# Backend Laravel
php artisan serve

# Frontend Vite (hot reload)
npm run dev
```

---

## Estrutura relevante

```
app/
  Http/Controllers/Empresa/     # Controllers por domínio
  Services/Empresa/             # Lógica de negócio
  Models/                       # Eloquent models

resources/js/
  Pages/Empresa/                # Páginas Inertia (React/TSX)
  components/ui/                # shadcn/ui components
  components/utils/             # Componentes utilitários (Stats, Heading...)
  Layouts/                      # Layouts autenticados
```

---

## Convenções do projeto

- Rotas nomeadas no padrão: `aplicacao.empresa.<recurso>.<acao>`
- CSRF em requests AJAX: usar **axios** (já configurado), não `fetch` raw
- Ícones: **Lucide React**
- Formatação de moeda: prop `isMoney` no componente `Stats`
- Componente `Stats` aceita `color` como nome base: `"green"`, `"blue"`, `"red"`, etc.

---

## Pacotes PHP relevantes

- `inertiajs/inertia-laravel` — bridge backend/frontend
- `mariomka/mary` — componentes Blade adicionais (usados como referência)

---

## Observações importantes

- O projeto usa **Inertia.js**: não há API REST tradicional. As páginas são renderizadas via `Inertia::render()` nos controllers.
- Requests AJAX pontuais (ex: busca de dados no painel) usam `axios.post()` direto, com rota nomeada via `route()` helper do Ziggy.
- O `DesempenhoService` requer que `$service->empresa` seja atribuído manualmente pelo controller antes de chamar métodos que dependem da empresa.

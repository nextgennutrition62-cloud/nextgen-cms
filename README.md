# NEXT GEN Nutrition — CMS

Целосна веб страна со admin панел, поврзана со Supabase.

## Структура

- `app/page.js` + `components/HomeClient.js` — јавната страна, ги чита податоците од Supabase
- `app/admin/page.js` — login страница за админ
- `app/admin/dashboard/` — самиот admin панел (Преглед, Содржина, Производи, Нарачки, Поставки)
- `middleware.js` — го заштитува `/admin/dashboard` од неавторизиран пристап

## Поставување (по клонирање / прв deploy)

### 1. Storage bucket за слики

Во Supabase → SQL Editor, изврши го `storage-setup.sql` (креира bucket за слики на производи + безбедносни правила).

### 2. Environment variables

Во Vercel → Project Settings → Environment Variables, додади:

```
NEXT_PUBLIC_SUPABASE_URL=https://kchxlpykkvldzisooarp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_bYBOnYIRDr0D5B6NqmajaA_TDUQRrjm
```

### 3. Admin најава

Логирај се на `/admin` со email и лозинка кои си ги создал во Supabase → Authentication → Users.

## Локален развој (опционално)

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Отвори http://localhost:3000

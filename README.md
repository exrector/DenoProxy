# Deno Deploy Proxy

Минималистичный HTTPS-прокси на Deno Deploy с поддержкой Web Streams.

## Использование

1. Замените `FASTLY_TARGET` в `proxy.ts` на нужный exit-URL.
2. Деплой через GitHub (main branch) подключен к Deno Deploy.
3. Тестируйте через браузер, curl или sing-box.

## Безопасность

- Заголовки типа `Connection`, `Upgrade`, `TE` удаляются.
- Web Streams работают нативно через body-поток.

## Совместимость

- ✅ Fastly (CDN)
- ✅ GitHub Pages, Cloudflare Pages, Vercel (можно цепочкой)
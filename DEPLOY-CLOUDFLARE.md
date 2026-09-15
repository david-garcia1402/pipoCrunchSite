# Deploy do PipoCrunch na Cloudflare

Este projeto e um **site estatico exportado pelo Next.js** (`output: "export"`).
Por isso, **nao usa OpenNext** e nao precisa de `open-next.config.ts`.

## Configuracao no Cloudflare Workers Builds

Use exatamente:

- **Build command:** `npm run build`
- **Deploy command:** `npx wrangler@4.131.2 deploy`
- **Version command:** `npx wrangler@4.131.2 versions upload`
- **Root directory:** `/`

O `npm run build` gera a pasta `out/`.
O arquivo `wrangler.jsonc` publica essa pasta como Static Assets no Cloudflare Workers.

## Deploy manual opcional

No computador:

```bash
npm install
npm run deploy
```

Para testar usando o runtime local do Cloudflare:

```bash
npm run preview:cloudflare
```

## Importante

Nao configure `@opennextjs/cloudflare`, `open-next.config.ts` ou um bloco `build.command` no `wrangler.jsonc` para este projeto.
O projeto ja e totalmente estatico e o uso de OpenNext apenas adiciona uma etapa desnecessaria ao deploy.

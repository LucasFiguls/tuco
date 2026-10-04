This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Claude Code (config aislada)

Este proyecto usa una configuración de Claude Code propia, separada de la de usuario (`~/.claude`), para que no se carguen comandos, skills ni plugins de otros proyectos.

### Estructura

```
tuco/.claude/                  ← config del proyecto (se commitea)
├── settings.json              ← permisos compartidos (bloquea leer .env*)
├── settings.local.json        ← ajustes personales (gitignored)
├── agents/                    ← subagentes de tuco
├── commands/                  ← slash commands de tuco
└── skills/                    ← skills de tuco

~/.claude-tuco/                ← "usuario" aislado, reemplaza a ~/.claude (fuera del repo)
└── settings.json
```

### Setup en una máquina nueva

1. Crear el directorio de config aislado:

   ```sh
   mkdir -p ~/.claude-tuco
   echo '{ "$schema": "https://json.schemastore.org/claude-code-settings.json" }' > ~/.claude-tuco/settings.json
   ```

2. **Terminal:** agregar un alias a `~/.zshrc`:

   ```sh
   alias claude-tuco='CLAUDE_CONFIG_DIR=$HOME/.claude-tuco claude'
   ```

3. **VS Code:** `claudeCode.environmentVariables` tiene scope `machine`, así que no funciona en `.vscode/settings.json`. Usar un perfil dedicado:
   - Paleta → *Profiles: New Profile…* → "Tuco", y abrir esta carpeta con ese perfil.
   - En los User Settings **de ese perfil** (reemplazar `<usuario>` por el de la máquina):

     ```json
     "claudeCode.environmentVariables": [
       { "name": "CLAUDE_CONFIG_DIR", "value": "/Users/<usuario>/.claude-tuco" }
     ]
     ```

4. Abrir Claude y hacer `/login` (cada directorio de config tiene su propia sesión).

5. Verificar: en una sesión nueva no deberían aparecer comandos/skills de otros proyectos.

### Notas

- **Cambiar de cuenta:** `/logout` + `/login` dentro de la sesión de tuco. Settings, comandos, skills, historial y memoria de `~/.claude-tuco` se mantienen.
- **Qué depende de la cuenta** (no del directorio): políticas e instrucciones de la organización, conectores de claude.ai y límites del plan.
- **Dos cuentas en paralelo:** crear un segundo directorio (ej. `~/.claude-tuco-max`) con otro alias/perfil, y symlinkear `settings.json`, `commands/` y `skills/` al primero si se quieren compartir.
- `~/.claude-tuco` no se commitea; contiene sesión, historial y memoria. Lo que valga la pena compartir va en `tuco/.claude/`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

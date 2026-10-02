# CONEXÃO ELA — Fase 1 Fundação Multiusuária Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar a versão atual do BÁRBARA LIFE na fundação multiusuária do CONEXÃO ELA: marca nova, cadastro público por e-mail+senha, acesso lifetime por projeto, perfil individual e preservação integral dos dados privados existentes.

**Architecture:** O AUREON Base manterá o slug técnico `barbara-life` no MVP, mas receberá uma política de cadastro por projeto que preserva o comportamento legado dos demais produtos e configura somente este projeto como público + lifetime. O front-end deixará de restringir o e-mail da Bárbara, adicionará cadastro aberto e removerá toda identidade visível BÁRBARA LIFE; dados privados continuarão owner-scoped e as chaves locais antigas serão migradas sem perda.

**Tech Stack:** Node.js 20, Express, PostgreSQL, React 18, TypeScript, Vite, Vitest, PWA, GitHub Actions, Vercel.

**Spec:** `docs/superpowers/specs/2026-10-02-conexao-ela-platform-design.md`

## Global Constraints

- Nome público do produto: **CONEXÃO ELA**.
- O slug técnico `barbara-life` é preservado no MVP.
- Cadastro público por link com e-mail + senha, sem confirmação obrigatória de e-mail no MVP.
- Acesso padrão do CONEXÃO ELA: `lifetime`, gratuito e permanente.
- O cadastro público não pode alterar o comportamento dos demais projetos do AUREON Base.
- A conta e os dados atuais da Bárbara devem manter o mesmo `user_id` e `owner_user_id`.
- Dados de diário, metas, bem-estar, autocuidado, perfil privado e storage permanecem isolados por usuária.
- O cliente não escolhe nem confia em `owner_user_id`; o backend deriva o proprietário da sessão.
- Nenhuma migração destrutiva.
- PWA e experiência mobile devem continuar funcionando.
- A rota pública nova será `/conexao-ela/`; `/barbara-life/` permanecerá como redirecionamento de compatibilidade.
- A Fase 1 não implementa ainda feed, comunidades, Messenger ou eventos sociais; ela entrega a base segura para essas fases.

## Review Focus

1. **Projeto legado com cadastro atual:** projetos diferentes de `barbara-life` devem manter exatamente o comportamento anterior de `ALLOWED_EMAILS` e trial.
2. **E-mail já existente em outro produto AUREON:** a usuária deve autenticar com a senha existente e conseguir aderir ao projeto público CONEXÃO ELA sem duplicar o usuário, membership ou subscription.
3. **Duas usuárias no mesmo projeto:** cada uma deve listar/alterar apenas seus próprios registros owner-scoped.
4. **Bárbara em dispositivo antigo:** PIN e tema salvos em chaves `barbara_life_*` devem continuar carregando após a mudança de marca.
5. **Link antigo em produção:** `/barbara-life/` deve redirecionar para `/conexao-ela/` sem loop e sem apontar para a identidade antiga.

---

### Task 1: Política de cadastro por projeto no AUREON Base

**Files:**
- Create: `database/migrations/016_conexao_ela_registration.sql`
- Create: `src/registrationPolicy.js`
- Create: `test/registrationPolicy.test.js`
- Modify: `src/server.js`
- Modify: `package.json`

**Interfaces:**
- Produces: `registrationAllowed({ mode, email, allowedEmails }): boolean`
- Produces: `defaultAccessStatus(project, email, lifetimeEmails): 'trialing' | 'lifetime'`
- Produces project fields `registration_mode` and `default_access_status` from `projectBySlug(slug)`.
- Produces authenticated `POST /projects/:slug/join` for public projects only.
- Later tasks consume `POST /auth/register` for new users and `POST /projects/:slug/join` for an already-authenticated AUREON user joining CONEXÃO ELA.

- [ ] **Step 1: Write the failing policy tests**

Create `test/registrationPolicy.test.js` with assertions:
- mode `public` accepts an arbitrary valid e-mail even when `allowedEmails` is non-empty;
- mode `closed` rejects;
- mode `legacy` with empty `allowedEmails` preserves open behavior;
- mode `legacy` with a non-empty allowlist accepts only listed e-mails;
- project default `lifetime` returns `lifetime`;
- an e-mail listed in `LIFETIME_EMAILS` still returns `lifetime` for legacy/trial projects;
- otherwise returns `trialing`;
- public join policy refuses `closed` and `legacy` projects and permits only `registration_mode='public'`.

- [ ] **Step 2: Run the new test and verify RED**

Run: `node --test test/registrationPolicy.test.js`  
Expected: FAIL because `src/registrationPolicy.js` does not exist.

- [ ] **Step 3: Implement the pure registration policy module**

Create `src/registrationPolicy.js` exporting exactly:
- `registrationAllowed({ mode, email, allowedEmails })`
- `defaultAccessStatus(project, email, lifetimeEmails)`

Rules:
- `public` → true;
- `closed` → false;
- `legacy` → existing behavior: allow all when allowlist empty, otherwise require membership;
- project `default_access_status === 'lifetime'` or e-mail in lifetime list → `lifetime`, else `trialing`.

- [ ] **Step 4: Run the policy tests and verify GREEN**

Run: `node --test test/registrationPolicy.test.js`  
Expected: PASS.

- [ ] **Step 5: Add the non-destructive migration**

Create `database/migrations/016_conexao_ela_registration.sql` to:
- add `projects.registration_mode text not null default 'legacy'` with CHECK `legacy|public|closed`;
- add `projects.default_access_status text not null default 'trialing'` with CHECK `trialing|lifetime`;
- ensure project slug `barbara-life` exists without replacing its id;
- update only that project to `name='Conexão Ela'`, `registration_mode='public'`, `default_access_status='lifetime'`, `is_active=true`;
- never delete project_users, subscriptions, records or storage.

- [ ] **Step 6: Integrate policy into `src/server.js`**

Modify:
- `projectBySlug()` to select `registration_mode` and `default_access_status`;
- `/auth/register` to use `registrationAllowed(...)`;
- return `registration_closed` when a closed project is targeted and preserve `email_not_allowed` for legacy allowlist rejection;
- `enrollUser()` to use `defaultAccessStatus(...)`: insert/update lifetime for CONEXÃO ELA, otherwise preserve trial behavior;
- add authenticated `POST /projects/:slug/join`: require an existing valid session, require `registration_mode='public'`, call `enrollUser`, return project/subscription/access, and stay idempotent when membership already exists.

Do not change password hashing, refresh-token validation or session cryptography.

- [ ] **Step 7: Add regression assertions for legacy projects**

Extend `test/registrationPolicy.test.js` so a project object with no explicit override/legacy semantics resolves to trialing and legacy allowlist behavior remains unchanged.

- [ ] **Step 8: Run AUREON Base full suite**

Run: `npm test`  
Expected: all tests PASS, including existing auth/RLS/storage/password tests and new registration tests.

- [ ] **Step 9: Commit**

```bash
git add database/migrations/016_conexao_ela_registration.sql src/registrationPolicy.js src/server.js test/registrationPolicy.test.js package.json
git commit -m "feat: add project-scoped public registration policy"
```

---

### Task 2: Cliente de autenticação multiusuária no CONEXÃO ELA

**Files:**
- Modify: `src/lib/aureon.ts`
- Modify: `src/lib/aureon.test.ts`

**Interfaces:**
- Consumes: `POST /auth/register` from Task 1 with body `{ email, password, project_slug }`.
- Produces: `aureon.auth.register(email: string, password: string): Promise<AureonUser>`
- Produces: `assertProjectAccess(user: AureonUser, options?: { joinIfPublic?: boolean }): Promise<AureonUser>` internal helper.
- Produces: `joinPublicProject(): Promise<void>` internal request to `POST /projects/barbara-life/join`.
- Existing `aureon.auth.login`, `restore`, `logout`, data and storage interfaces remain callable.

- [ ] **Step 1: Replace the single-user tests with multiuser expectations**

In `src/lib/aureon.test.ts`:
- remove the test for `isBarbaraEmail`;
- add a test for normalized registration payload using project slug `barbara-life`;
- keep password-length and record-flattening tests.

- [ ] **Step 2: Run targeted Vitest and verify RED**

Run: `npm test -- --run src/lib/aureon.test.ts`  
Expected: FAIL because the registration helper/API does not exist yet.

- [ ] **Step 3: Implement multiuser auth client**

In `src/lib/aureon.ts`:
- delete `BARBARA_EMAIL` and `isBarbaraEmail`;
- rename/replace `assertBarbaraAccess` with `assertProjectAccess`;
- authorization check must depend only on authenticated project membership/access, never a hardcoded e-mail;
- add `register(email,password)` posting to `/auth/register` with `project_slug: PROJECT_SLUG`;
- normal `login(email,password)` persists tokens, then if this already-valid AUREON user lacks membership, call `POST /projects/barbara-life/join` once and re-check access;
- `restore()` must **not** silently join projects; it only restores an existing Conexão Ela membership;
- persist returned tokens and verify project access;
- keep `PROJECT_SLUG='barbara-life'`.

- [ ] **Step 4: Run targeted tests and verify GREEN**

Run: `npm test -- --run src/lib/aureon.test.ts`  
Expected: PASS.

- [ ] **Step 5: Run full front-end test suite**

Run: `npm test`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/aureon.ts src/lib/aureon.test.ts
git commit -m "feat: enable multiuser Conexão Ela authentication"
```

---

### Task 3: Cadastro aberto e nova tela de entrada

**Files:**
- Create: `src/lib/signup.ts`
- Create: `src/lib/signup.test.ts`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `aureon.auth.register(email,password)` from Task 2.
- Produces: `validateSignup({ name, email, password, confirmPassword, acceptedTerms }): SignupValidation`.
- On successful signup, creates/updates owner-scoped `profiles/profile_key='main'` with `display_name=name`.

- [ ] **Step 1: Write failing signup validation tests**

Create `src/lib/signup.test.ts` covering:
- valid name/e-mail/10+ character password/confirmation/terms → valid;
- short password → invalid;
- mismatched confirmation → invalid;
- missing terms → invalid;
- blank name → invalid;
- malformed e-mail → invalid.

- [ ] **Step 2: Run signup tests and verify RED**

Run: `npm test -- --run src/lib/signup.test.ts`  
Expected: FAIL because `src/lib/signup.ts` does not exist.

- [ ] **Step 3: Implement signup validation helper**

Create `validateSignup(...)` returning a typed result with one stable error code per failure. No network logic in this helper.

- [ ] **Step 4: Run signup tests and verify GREEN**

Run: `npm test -- --run src/lib/signup.test.ts`  
Expected: PASS.

- [ ] **Step 5: Replace the login-only screen with Entrar / Criar conta**

In `src/App.tsx`:
- brand mark/copy becomes CONEXÃO ELA;
- e-mail field starts empty;
- remove “BÁRBARA LIFE”, “Acesso privado. Não existe cadastro público.” and the current Google recovery copy from the primary auth experience;
- add mode `login|signup`;
- signup fields: Nome, E-mail, Senha, Confirmar senha, aceite de termos;
- submit signup via `aureon.auth.register`;
- after successful account creation, upsert owner-scoped `profiles` record `profile_key='main'`, `display_name=<nome>`;
- if profile upsert fails after account creation, keep the authenticated account and show a non-blocking prompt to finish the profile later;
- duplicate e-mail produces friendly “Este e-mail já possui uma conta. Entre com sua senha.”; after she switches to Entrar and supplies the correct existing password, the authenticated public-join flow enrolls her into CONEXÃO ELA.

- [ ] **Step 6: Update auth styling for mobile and desktop**

Modify only auth-related selectors needed for:
- tabs/toggle Entrar vs Criar conta;
- terms checkbox;
- success/error messages;
- responsive form.

- [ ] **Step 7: Build front-end**

Run: `npm run build`  
Expected: Vitest PASS, TypeScript PASS, Vite build PASS.

- [ ] **Step 8: Commit**

```bash
git add src/App.tsx src/styles.css src/lib/signup.ts src/lib/signup.test.ts
git commit -m "feat: add public Conexão Ela signup"
```

---

### Task 4: Remover hardcodes da Bárbara sem perder dados locais

**Files:**
- Modify: `src/lib/profile.ts`
- Modify: `src/lib/profile.test.ts`
- Modify: `src/ProfilePage.tsx`
- Modify: `src/pages.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces new local keys `conexao_ela_diary_pin_v1` and `conexao_ela_theme_v1`.
- Consumes legacy keys `barbara_life_diary_pin_v1` and `barbara_life_theme_v1` as one-way migration fallback.
- Existing owner-scoped collections remain unchanged.

- [ ] **Step 1: Write failing legacy migration tests**

Extend `src/lib/profile.test.ts` to assert:
- new key takes precedence when present;
- when only legacy theme exists, restore migrates the value to the new key;
- when only legacy diary PIN exists, load returns it and saves a copy under the new key;
- no record is deleted during read migration.

- [ ] **Step 2: Run profile tests and verify RED**

Run: `npm test -- --run src/lib/profile.test.ts`  
Expected: FAIL because new-key migration behavior is absent.

- [ ] **Step 3: Implement local-key migration**

In `src/lib/profile.ts`:
- set new exported keys with `conexao_ela_*`;
- keep legacy constants internal;
- on first read, copy legacy value to the new key if the new key is absent;
- future writes use new keys;
- do not alter PBKDF2 parameters or PIN format.

- [ ] **Step 4: Generalize profile defaults and copy**

In `src/ProfilePage.tsx`:
- default display name must not be “Bárbara” for new accounts;
- use saved display name or a neutral fallback such as “Meu perfil”;
- replace “Bárbara Life” with “Conexão Ela”;
- image alt text becomes generic;
- preserve the existing collection name `profiles` and storage path semantics.

In `src/pages.tsx`:
- remove “Bom dia, Bárbara”, “Você conseguiu, Bárbara!” and any other hardcoded personalized Bárbara copy;
- derive the display name from the signed-in owner-scoped profile when needed, or use neutral “você”.

In `src/App.tsx`:
- route `/perfil` becomes canonical;
- keep `/barbara` only as an internal redirect to `/perfil` for compatibility;
- topbar and loading mark become CONEXÃO ELA.

- [ ] **Step 5: Run full tests and build**

Run: `npm run build`  
Expected: all tests PASS, TypeScript PASS, build PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/profile.ts src/lib/profile.test.ts src/ProfilePage.tsx src/pages.tsx src/App.tsx
git commit -m "refactor: generalize private space for every Conexão Ela user"
```

---

### Task 5: Marca, PWA e metadados CONEXÃO ELA

**Files:**
- Modify: `package.json`
- Modify: `index.html`
- Modify: `public/manifest.webmanifest`
- Modify: `public/icon.svg`
- Modify: `scripts/generate-pwa-icons.mjs` only if it contains BÁRBARA-specific copy/path
- Modify: `src/styles.css`

**Interfaces:**
- PWA retains the repository/GitHub Pages base path at build time; production mirror rewriting is owned by Task 6.
- Visible brand string must be `Conexão Ela` / `CONEXÃO ELA`.

- [ ] **Step 1: Add a branding regression test**

Create or extend a Vitest test that reads the source metadata files and asserts:
- `index.html` title/description contain Conexão Ela;
- manifest `name` and `short_name` contain Conexão Ela;
- public metadata no longer contains “Diário da Bárbara” or “Bárbara Life”.

- [ ] **Step 2: Run branding test and verify RED**

Run targeted Vitest test.  
Expected: FAIL on current BÁRBARA LIFE metadata.

- [ ] **Step 3: Update product metadata and icon source**

- package name becomes `conexao-ela`;
- HTML title becomes `Conexão Ela`;
- description reflects connection, sharing and growth;
- manifest name/short_name/description become Conexão Ela;
- replace the “B” icon source with a neutral CONEXÃO ELA mark (e.g. `CE`) while preserving icon sizes generated by the existing script;
- do not rename the Git repository in this task.

- [ ] **Step 4: Regenerate icons and build**

Run: `npm run build`  
Expected: branding regression PASS, all tests PASS, TypeScript PASS, generated PWA icons succeed.

- [ ] **Step 5: Commit**

```bash
git add package.json index.html public/manifest.webmanifest public/icon.svg public/icon-192.png public/icon-512.png public/icon-maskable-512.png scripts/generate-pwa-icons.mjs src/styles.css
git commit -m "feat: rebrand PWA as Conexão Ela"
```

---

### Task 6: Publicar em /conexao-ela e manter compatibilidade do link antigo

**Files (AUREON Base repo):**
- Modify: `.github/workflows/sync-barbara-life.yml`
- Create/update generated mirror after workflow: `public/conexao-ela/**`
- Replace legacy mirror with redirect: `public/barbara-life/index.html`

**Interfaces:**
- Consumes successful front-end build from Tasks 2–5.
- Produces production path `https://aureonbase.vercel.app/conexao-ela/index.html`.
- Old path `https://aureonbase.vercel.app/barbara-life/index.html` redirects to the new path.

- [ ] **Step 1: Update mirror workflow source and destination**

Change workflow display name to `Sync Conexão Ela`.

Checkout source:
`AUREON-TECH/B-RBARA-LIFE-di-rio-da-vida-dela`

Build as today, then rewrite static base:
`/B-RBARA-LIFE-di-rio-da-vida-dela/` → `/conexao-ela/`

Publish into:
`public/conexao-ela`

- [ ] **Step 2: Add deterministic legacy redirect**

The workflow must replace `public/barbara-life` with a minimal static redirect page targeting `/conexao-ela/index.html` and a clickable fallback link.

- [ ] **Step 3: Verify workflow syntax/source expectations**

Run AUREON Base `npm test` after the workflow edit.  
Expected: PASS.

Additionally inspect the workflow text and assert it references:
- `AUREON-TECH/B-RBARA-LIFE-di-rio-da-vida-dela`;
- `public/conexao-ela`;
- redirect target `/conexao-ela/index.html`.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/sync-barbara-life.yml public/barbara-life/index.html
git commit -m "deploy: publish Conexão Ela mirror"
```

---

### Task 7: Verificação multiusuária, preservação e produção

**Files:**
- Modify tests only if verification exposes a regression.
- No speculative feature work.

**Interfaces:**
- Consumes all previous tasks.
- Produces release evidence for auth, isolation, PWA route and compatibility redirect.

- [ ] **Step 1: Run complete AUREON Base verification**

Run: `npm test`  
Expected: 0 failures.

- [ ] **Step 2: Run complete CONEXÃO ELA verification**

Run: `npm run build`  
Expected: tests 0 failures, TypeScript 0 errors, Vite build exits 0.

- [ ] **Step 3: Verify two-user isolation in test coverage**

Run the owner-scope/RLS regression tests including:
`node --test test/projectRecordsRlsRoutes.test.js`

Expected: PASS and all project record operations remain tenant-scoped.

- [ ] **Step 4: Verify signup behavior after deployment**

Against production:
- create one disposable test account through CONEXÃO ELA;
- confirm register returns project access `lifetime`;
- login/logout/login succeeds;
- duplicate registration is rejected;
- an existing AUREON account that is not yet a member can log in with its existing password and is enrolled into CONEXÃO ELA exactly once;
- delete/deactivate the disposable test user afterward using an authorized administrative workflow if available.

Do not use Bárbara's credentials for this test.

- [ ] **Step 5: Verify existing Bárbara account non-destructively**

Read-only verification:
- existing account still logs in;
- existing owner-scoped profile/diary/metas remain present;
- do not modify or delete her historical data as part of verification.

- [ ] **Step 6: Verify public routes**

Check:
- `/conexao-ela/index.html` → HTTP 200 and rendered copy contains CONEXÃO ELA;
- `/barbara-life/index.html` → redirects/falls through to the new path without exposing the old app;
- manifest and icons load from `/conexao-ela/`;
- no production UI copy contains “Bárbara Life” or “Não existe cadastro público”.

- [ ] **Step 7: Browser mobile smoke**

At a mobile viewport verify:
- Entrar;
- Criar conta;
- account creation;
- first authenticated screen;
- profile;
- logout;
- PWA metadata available;
- no console errors in primary flow.

- [ ] **Step 8: Final commit only if verification required fixes**

Any fix must follow RED → GREEN before commit. Otherwise no extra commit.

---

## Phase 1 Completion Contract

Phase 1 is complete only when all are true:

- A new woman with only the public link can create an account using name, e-mail and password.
- An existing AUREON user can use the same account and join CONEXÃO ELA after successful password authentication.
- Her subscription/access in project `barbara-life` is `lifetime`.
- Existing projects keep legacy registration/trial behavior.
- Hardcoded Bárbara e-mail restriction is gone.
- Existing Bárbara user and owner-scoped records are preserved.
- Two users cannot read/write each other's private records.
- Visible product name is CONEXÃO ELA.
- Old local PIN/theme migrate transparently.
- New production route `/conexao-ela/` works.
- Old `/barbara-life/` route remains a compatibility redirect.
- Full backend tests and frontend build pass.
- Feed, comunidades, Messenger e eventos remain for later phase plans and are not faked with insecure placeholders.

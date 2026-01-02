# Working in this repo

## Repo overview

This repo is a **SolidStart** app using:

- **Park UI** conventions for the component layer (see `app/components.json`)
- **Ark UI (Solid)** primitives under the hood (`@ark-ui/solid`)
- **Panda CSS** for styling + design tokens, generating `app/styled-system/`

The prebuilt component library lives in `app/src/components/ui/*`.

---

## Getting started

- **Node**: `>= 22` (see `app/package.json`)
- **Package manager**: `pnpm`

Common commands (run from `app/`):

- **Install**: `pnpm install`
- **Generate Panda artifacts**: `pnpm prepare` (runs `panda codegen`)
- **Dev server**: `pnpm dev` (runs `pnpm prepare && vinxi dev`)
- **Build**: `pnpm build`
- **Start**: `pnpm start`

Notes:

- `pnpm dev` always runs Panda codegen first, so UI/theme changes stay in sync.
- `app/styled-system/` is generated output—**do not edit by hand**.

---

## Key paths & conventions

- **App entry**: `app/src/app.tsx`
- **UI components (Park UI-style wrappers)**: `app/src/components/ui/`
- **Theme (tokens/recipes/global css)**: `app/src/theme/`
- **Panda config**: `app/panda.config.ts` (outputs to `app/styled-system/`)
- **Global CSS layers**: `app/src/index.css` (declares Panda layers)

Path aliases (see `app/tsconfig.json`):

- `~/*` → `app/src/*`
- `styled-system/*` → `app/styled-system/*`

Recommended imports:

- **UI components**: `~/components/ui/<component>`
- **Panda helpers**:
  - `import { css } from "styled-system/css"`
  - `import { VStack } from "styled-system/jsx"`
  - `import { button } from "styled-system/recipes"`

---

## Working on UI

- **Component approach**: `app/src/components/ui/*` are reusable building blocks built on Ark UI primitives (`ark.*`, contexts, etc.) and styled via Panda (`styled-system/*`).
- **Styling approach**:
  - Prefer Panda `css()` / `styled-system/jsx` primitives over ad-hoc CSS.
  - Prefer recipes (`styled-system/recipes`) for variants/sizes and consistent styling.
- **When changing theme/tokens/recipes**:
  - Edit `app/src/theme/*` and/or `app/panda.config.ts`
  - Run `pnpm prepare` (or just `pnpm dev`, which does it for you)

---

## Client ↔ server communication (SolidStart)

Use **SolidStart server actions** for writes/mutations and **Solid Router queries** for reads. This gives you SSR-friendly data loading, deduplication, and avoids ad-hoc networking.

- **Do**
  - Use **server actions** for mutations (create/update/delete).
  - Use **`query()`** for reads, typically consumed via `createAsync()` in components/routes.
  - Keep networking and server-only logic on the server side; keep components mostly declarative.
- **Avoid**
  - Raw `fetch(...)` calls inside UI components for app data.
  - Adding other client data frameworks (React Query, SWR, etc.).

Reference: Solid Router `query` docs: `https://docs.solidjs.com/solid-router/reference/data-apis/query#query`.

Example shape (read via query):

```ts
import { query } from "@solidjs/router";
import { createAsync } from "@solidjs/router";

// server-side fetcher; args must be JSON-serializable
export const getThing = query(async (id: string) => {
  // ... load data (db/service/etc) ...
  return { id };
}, "thing");

// client usage (route/component)
const thing = createAsync(() => getThing("123"));
```

---

## Agent tooling: Ark UI MCP server

Agents working in this repo can use the **Ark UI MCP server** for quick, authoritative UI reference:

- **List components** available in Ark UI for a framework (use `solid` here)
- **Inspect props** for a given Ark UI component
- **Pull examples** and **styling/data-attribute guides** to implement features consistently

Prefer this over guessing component APIs when wiring new UI.

## Available UI components (inventory)

All of these exist today under `app/src/components/ui/`. Import them via:

```ts
import { Button } from "~/components/ui/button";
```

Component modules:

- `~/components/ui/absolute-center`
- `~/components/ui/accordion`
- `~/components/ui/alert`
- `~/components/ui/avatar`
- `~/components/ui/badge`
- `~/components/ui/breadcrumb`
- `~/components/ui/button`
- `~/components/ui/card`
- `~/components/ui/carousel`
- `~/components/ui/checkbox`
- `~/components/ui/clipboard`
- `~/components/ui/close-button`
- `~/components/ui/code`
- `~/components/ui/collapsible`
- `~/components/ui/color-picker`
- `~/components/ui/combobox`
- `~/components/ui/date-picker`
- `~/components/ui/dialog`
- `~/components/ui/drawer`
- `~/components/ui/editable`
- `~/components/ui/field`
- `~/components/ui/fieldset`
- `~/components/ui/file-upload`
- `~/components/ui/group`
- `~/components/ui/heading`
- `~/components/ui/hover-card`
- `~/components/ui/icon`
- `~/components/ui/icon-button`
- `~/components/ui/image`
- `~/components/ui/input`
- `~/components/ui/input-addon`
- `~/components/ui/input-group`
- `~/components/ui/kbd`
- `~/components/ui/link`
- `~/components/ui/loader`
- `~/components/ui/menu`
- `~/components/ui/number-input`
- `~/components/ui/pagination`
- `~/components/ui/pin-input`
- `~/components/ui/popover`
- `~/components/ui/progress`
- `~/components/ui/radio-card-group`
- `~/components/ui/radio-group`
- `~/components/ui/rating-group`
- `~/components/ui/scroll-area`
- `~/components/ui/segment-group`
- `~/components/ui/select`
- `~/components/ui/skeleton`
- `~/components/ui/slider`
- `~/components/ui/span`
- `~/components/ui/spinner`
- `~/components/ui/splitter`
- `~/components/ui/switch`
- `~/components/ui/table`
- `~/components/ui/tabs`
- `~/components/ui/tags-input`
- `~/components/ui/text`
- `~/components/ui/textarea`
- `~/components/ui/toast`
- `~/components/ui/toggle-group`
- `~/components/ui/tooltip`

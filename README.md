# Clients dashboard

A stacked bar chart and an expandable tree table over the Nevis client data
(Company → Branches → Employees → Channels, Feb 2024 – Jan 2025).

- **Web:** React 18 + TypeScript + Vite, Recharts, CSS Modules
- **API:** Node.js + Express + TypeScript (`GET /api/clients`)
- **Tests:** Vitest, Testing Library, supertest

## Run it

Requires Node 20+.

```bash
npm install
npm run dev        # API on :3001, web on :5173 (Vite proxies /api)
```

Open http://localhost:5173.

Try the loading and error states by hand: `http://localhost:5173/?delay=2000` (slow response)
or `http://localhost:5173/?fail=1` (500). The query string is forwarded to the API.

## Test it

```bash
npm test           # server + web
npm run typecheck
npm run build
```

## Structure

```
server/src      app.ts (routes), data.ts (the payload + month axis)
web/src
  api/          fetchClients, useClients (loading / error / success + retry)
  domain/       pure logic: toTree, flattenVisible, getChartFocus, toChartModel
  components/
    Dashboard/  ClientsPage (fetching states) → ClientsDashboard (shared expansion state)
    Table/      TreeGrid (generic, accessible treegrid) ← ClientsTable (clients-specific)
    Chart/      ClientsChart
    common/     ChevronIcon, Avatar
```

`TreeGrid` knows nothing about clients: it takes rows with level/expanded metadata and render
callbacks, and owns the ARIA and keyboard behaviour. `ClientsTable` composes it. The chart and the
table are driven by one piece of state held in `ClientsDashboard`.

## Accessibility

- The table is a WAI-ARIA `treegrid`: rows carry `aria-level`, `aria-posinset`, `aria-setsize` and
  `aria-expanded` (omitted on rows that cannot expand).
- Roving tabindex: one tab stop in the grid. Up/Down/Home/End move; Right expands (or steps into the
  first child); Left collapses (or steps to the parent); Enter/Space toggle.
- The chart is exposed as an image with a summary label, plus a visually hidden table with every number.
- Loading uses `role="status"`, errors use `role="alert"` with a retry button.

## Assumptions and decisions

- **The month axis comes from the API** (`months`, ISO dates) rather than being hard-coded in the UI;
  `values[i]` maps to `months[i]`.

## Data inconsistencies

The numbers in the payload don't always reconcile: a parent's value is sometimes not the sum of its
children (for example, the company total versus its branches in some months), and a few figures look
like typos. The UI shows the data exactly as served, so a stacked bar can differ in height from the
parent's number in the table.

## What I would do next

- Tooltips that show the whole stack and the parent value, to surface the mismatches above.
- Link table rows and chart series (highlight the stack for the hovered row); legend toggles.
- Persist expansion state in the URL.
- A Playwright pass (visual regression) and an axe run in CI.
- Server: validate the payload shape, add caching headers, load from a real source.

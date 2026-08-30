# Testing

## Coverage Matrix

| Layer | Required test | Parallel-safe |
| --- | --- | --- |
| Shared TypeScript types and static fixtures | Build | Yes |
| Zustand store and selectors | Unit | Yes |
| HTTP gateway and flow hook | Unit | Yes |
| React leaf components | Component (RTL) | Yes |
| GameOverlay and LabPage | Integration (RTL) | Yes |
| CSS tokens and Figma pass | Build + browser UAT | No |

## Gate Commands

- **Quick:** `npm run test:run -- <test-file>`
- **Full:** `npm run test:run`
- **Build:** `npm run lint && npm run test:run && npm run build`

## Integrity

- Baseline test count: 0.
- Target: at least 38 passing tests, no skipped tests, and no silent deletions.
- Verified result: 50 passing tests across 15 files; 0 failures and 0 skipped tests.

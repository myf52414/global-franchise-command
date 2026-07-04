# Boss Panel — Playwright E2E

Run against the local dev server (already on :8080):

```bash
python tests/e2e/boss-panel.spec.py
```

Covers:
- Navigation across all 22 walls (no console errors).
- Export empty-state toast on Revenue / License / Commission (CSV path).
- RBAC-gated exports across `owner`, `viewer`, `finance`, `support` roles
  via the `?asRole=<role>` dev override on `SessionProvider`.
- Top Bar buttons (Notifications, Import, Export, Account) and the
  ⌘K / Ctrl+K command palette in owner and viewer roles.

Success + failure toast paths for exports require seeded rows and are
exercised at the unit level in `ExportMenu`'s try/catch; the empty-state
path is verified end-to-end here.

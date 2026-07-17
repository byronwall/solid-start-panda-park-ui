# Manual browser verification

Use this checklist selectively with the Browser plugin or Playwright MCP after a change affects a user workflow. Reuse the server advertised by `live-server-details.json`; do not start a second server for the same checkout.

## Core checks

- Open the affected route directly, then reload it after any persisted write.
- Perform the real interaction—click, pointer drag, keyboard input, form submission, or another user action—instead of calling the underlying function.
- Confirm both accepted and rejected states when the change has validity rules.
- Check reachable error, loading, empty, disabled, and success states.
- Inspect accessible labels, focus behavior, keyboard operation, and cancellation for changed interactive controls.
- Use DOM geometry or computed styles when exact overflow, position, or spacing matters; screenshots are supporting evidence.
- Inspect browser-console errors after the workflow completes.

## Responsive checks

When the workflow is mobile-sensitive, use a phone-sized viewport and confirm:

- primary content and actions appear in a sensible order;
- the page and overlays do not overflow horizontally;
- dialogs, popovers, menus, tooltips, and sticky controls remain reachable;
- pointer interactions have an accessible click or keyboard fallback where appropriate.

Physical touch hardware is optional. When unavailable, state that physical touch was not exercised.

## Persistence and navigation

- Direct-load the affected route rather than relying only on in-app navigation.
- Reload after a mutation and confirm the intended state persists.
- Verify back/forward navigation when the change affects URL or selection state.
- Confirm unsaved work is either preserved or clearly warned about when leaving the page.

Run only the sections relevant to the change and record what was and was not checked in the changelog or final handoff.

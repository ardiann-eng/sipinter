# Redesign Akun dan Profil SIPINTER

Written against: unavailable (workspace is not a Git repository)

## Evidence chain

- Surface: `/profil`, account menu in `AppShell`, desktop screenshot supplied 2026-07-25.
- Problem: Profile is one split card with an oversized empty identity rail and a sparse data grid. Raw `skpdId` is exposed as a user-facing value. Logout is visually mixed into identity data. The page borrows notification styles, so profile has no owner or visual role of its own.
- Design evidence: Screenshot shows large whitespace in navy identity column, only four fields, and one destructive button. Runtime page confirms this composition in `src/app/profil/page.tsx:14-17`. The profile imports `src/app/notifikasi/shared.module.css` at line 5. Account menu already exposes identity, role, profile action, settings for admins, and logout in `src/components/app-shell.tsx:190-235`.
- Owner: `src/app/profil/page.tsx`, `src/app/profil/logout-button.tsx`, and profile selectors currently inside `src/app/notifikasi/shared.module.css:21-30`. Compact account menu owner is `src/components/app-shell.tsx` plus global account-menu CSS.
- Scope and affected surfaces: `/profil` for BORROWER, ADMIN, and APPROVER; account-menu popover in desktop and mobile headers.
- Uncertainty: Session type shown on profile currently exposes only name, email, role, and `skpdId`. Unit name, SKPD display name, NIP, rank, phone, and last login require proof from session/database query before displaying. Do not invent or render placeholder personnel values.

## Design language

- Audited surface: authenticated account identity and session controls.
- Design sources: existing `--identity-gradient`, blue/maroon role tokens, Public Sans, app shell, supplied screenshot.
- Documented decisions: blue handles operations, maroon handles civic identity and attention, white handles content surfaces; gradients are reserved for high-level identity fields.
- Governing owners and consumers: global tokens in `src/app/globals.css`; account menu in `src/components/app-shell.tsx`; profile route in `src/app/profil/page.tsx`.
- Explicit exceptions: None documented.

## Findings

| # | Problem | Evidence | Proposed change | Scope | Confidence |
| --- | --- | --- | --- | --- | --- |
| 1 | Profile identity rail consumes large space without giving account context or a next task. | Screenshot; `shared.module.css:21-25` makes a fixed 220px navy column with avatar, name, and duplicate email. | Replace split card with compact identity masthead and separate content sections: verified identity, access scope, session controls. | `/profil` all roles. | High |
| 2 | Raw database key `ID SKPD` is presented as profile information. | `src/app/profil/page.tsx:16` renders `user.skpdId`. Screenshot confirms opaque CUID. | Remove raw `skpdId` from user-facing profile. Render SKPD display name only after querying relation; otherwise omit field. | `/profil` all roles. | High |
| 3 | Logout competes with identity details and destructive action lacks a dedicated zone. | `src/app/profil/page.tsx:16`; `shared.module.css:30`. | Move logout into a clearly titled “Sesi & keamanan” section with red outlined control and short consequence copy. | `/profil` and account-menu parity. | High |

## Improve first

Replace raw-ID split card with purpose-built profile architecture. Highest leverage: fixes empty space, removes technical leakage, establishes clear account hierarchy, and gives safe home for session action.

## Design decision

Use a **service record** profile shape, not a generic user card.

1. Compact top masthead: maroon-blue identity gradient band, avatar initials, name, role badge, and email. No duplicated oversized rail.
2. Main content: two unequal columns on desktop, single column on mobile.
3. Left: “Identitas kedinasan” as border-separated key/value rows.
4. Right: “Akses aktif” explaining current role and authorized workspace, using only real role/session fields.
5. Bottom: “Sesi & keamanan” as distinct calm surface, with logout isolated as destructive action.
6. Account popover remains short. It becomes a gateway: identity summary, profile link, role-appropriate settings, logout. Do not duplicate full profile fields inside it.

Theme: preserve existing maroon-blue-white system. Use `var(--identity-gradient)` only for masthead, white and soft-blue surfaces for records, maroon only for civic/account marker and attention. No yellow, orange, fabricated metrics, avatar photo, or security claims beyond existing copy.

## Reuse

- `AppShell` account-menu behavior and logout request in `src/components/app-shell.tsx`.
- `LogoutButton` API behavior in `src/app/profil/logout-button.tsx`.
- `roleLabels` and `roleHome` in `src/lib/navigation`.
- Tokens: `--identity-gradient`, `--identity-gradient-soft`, `--primary`, `--primary-deep`, `--maroon`, `--surface`, `--line`, `--danger`.
- Existing `user-menu__avatar` and `account-menu__summary` are compact identity exemplars, not a profile layout to duplicate.

Create profile-local style owner: `src/app/profil/profile.module.css`. Profile must stop importing notification CSS. No new global primitive needed because compositions are route-specific.

## Changes

1. `src/app/profil/page.tsx`
   - Change: Query session user with needed display-safe relation data before render. Replace `skpdId` output with related SKPD name; omit SKPD row when unavailable.
   - Change: Build masthead containing initials, full name, role label, email, and return link. Keep title concise; do not repeat same email in multiple blocks.
   - Change: Add “Identitas kedinasan” key/value rows. Always show name, email, access role. Include SKPD, unit, NIP, rank, and phone only if returned from trusted session/database data.
   - Change: Add “Akses aktif” section with role label and existing role-home destination. Copy must state actual role/workspace only, not invented permissions.
   - Change: Add “Sesi & keamanan” section with current session explanation and `LogoutButton`.
   - Preserve: session guard redirect to `/sesi-berakhir`, role-based return link, logout endpoint, Indonesian copy, and no editable fields until update APIs exist.
   - Verify: profile never exposes CUID/database IDs; all three roles render only fields legitimately available.

2. `src/app/profil/profile.module.css` (new)
   - Change: Build profile masthead using `var(--identity-gradient)`, shallow civic grid/line texture only if inherited system supports it, and readable white text.
   - Change: Build desktop `minmax(0, 1.45fr) minmax(260px, .75fr)` record layout. Identity data uses rows with dividers, not nested white cards.
   - Change: Style role badge as soft white/maroon-blue token treatment. Style session section with restrained border and destructive action zone separated by top divider.
   - Change: At 768px and below, collapse record layout to one column. At 414/375/320px, masthead action wraps below identity, full-width buttons remain one line, no horizontal scroll.
   - Preserve: Public Sans, existing radius scale, token-only color system, reduced-motion behavior.
   - Verify: no hard-coded palette/font values; masthead works with long name and long email.

3. `src/app/profil/logout-button.tsx`
   - Change: Add `LogOut` icon and `aria-busy` while request is pending. Keep one clearly named destructive action.
   - Change: Use profile-local destructive button class rather than notification CSS class.
   - Preserve: POST `/api/auth/logout`, redirect behavior, disabled state.
   - Verify: double click cannot send repeat logout request; pending label remains clear.

4. `src/components/app-shell.tsx` and account-menu styles in `src/app/globals.css`
   - Change: Keep menu compact. Add current role as a concise badge/label within summary. Profile link remains primary non-destructive item; admin settings remains role-gated; logout stays last after divider.
   - Change: On mobile, preserve utility-header account trigger and account menu placement. Do not restore hamburger navigation.
   - Preserve: click-outside close, Escape close, existing menu roles, profile route, settings condition, logout endpoint.
   - Verify: popover does not overflow 320px viewport; focus remains keyboard-visible; menu contents do not duplicate profile page sections.

5. `src/app/notifikasi/shared.module.css`
   - Change: Remove profile-specific selectors after `/profil` imports `profile.module.css`.
   - Preserve: notification list and session/access-denied screens that still consume this shared stylesheet.
   - Verify: `/notifikasi`, `/akses-ditolak`, and `/sesi-berakhir` retain existing styling.

## Scope

- Inherit: `/profil` accessed by any authenticated role and account menu across all authenticated routes.
- Verify: BORROWER, ADMIN, APPROVER profile pages; desktop 1440/1024; mobile 768/414/375/320; long name/email; missing optional identity fields; logout loading/failure redirect.
- Exclude: editing profile data, changing password, MFA, avatar uploads, notification preferences, API/session schema changes beyond safe relation query needed for current display.

## Validation

- Product: Open profile from account menu, inspect identity/access scope, return to role home, sign out, reopen after expired session.
- Interface: Confirm no raw IDs; no duplicate email/name; destructive logout visually distinct; masthead has sufficient text contrast; keyboard focus works in account menu and logout.
- Responsive: Verify at 320, 375, 414, 768, 1024, 1440px. No horizontal scroll; action labels remain one line; long email wraps without overlap.
- System: Search for profile selectors in `src/app/notifikasi/shared.module.css`; expected no profile ownership remains after migration.
- Repository: `npm run lint` → exits 0.
- Repository: `npm run test` → exits 0.
- Repository: `npm run build` → exits 0.

## Stop conditions

- Stop if session/API cannot provide SKPD display name. Omit it rather than exposing raw ID or inventing a name.
- Stop if profile editing requires an unimplemented authorization/update API. Keep presentation-only scope.
- Stop if existing account-menu accessibility behavior regresses during visual changes.

## Design documentation

- After acceptance and validation: add account-profile ownership and identity-display rules to `DESIGN.md`, including ban on raw persistence IDs in user-facing pages.

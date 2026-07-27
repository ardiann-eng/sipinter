# Sistem Visual Pemerintah Maroon-Biru-Putih

Written against: unavailable (workspace is not a Git repository)

## Evidence chain

- Surface: `/`, `/login`, `/daftar`, `/peminjam/*`, `/admin/*`, and `/sekda/*`.
- Problem: Root route redirects directly to `/login`; no public homepage exists. Login, registration, borrower dashboard, and app shell use separate visual treatments. Yellow is hard-coded in public/auth and borrower surfaces.
- Design evidence: Existing global tokens already define blue and maroon families in `src/app/globals.css:16-25`; shell and role pages consume global primitives through `src/components/app-shell.tsx` and `src/app/globals.css`; route-specific modules override them in `src/app/login/login.module.css`, `src/app/daftar/registration.module.css`, and `src/components/borrower/borrower.module.css`.
- Owner: `src/app/globals.css` owns global tokens and primitives. `src/components/app-shell.tsx` owns dashboard frame. Auth modules own login and registration composition.
- Scope and affected surfaces: all current authenticated dashboard routes inherit shell and primitives; login, daftar, borrower welcome, warning badges/notices, admin workspace, and approver workspace require direct review.
- Uncertainty: No rendered screenshots or running browser evidence inspected. Validate visual contrast and hierarchy at 320, 375, 414, 768, and desktop widths after implementation.

## Audit

| Severity | Tell / problem | Where | Evidence | Fix |
| --- | --- | --- | --- | --- |
| Major | Yellow breaks stated government palette and appears as a disconnected accent. | `src/app/login/login.module.css:12`; `src/app/daftar/registration.module.css:3-5`; `src/components/borrower/borrower.module.css:14-24` | `#ffcf3c` and `rgb(255 207 60 / 28%)` bypass existing maroon/blue tokens. | Remove every yellow declaration; use maroon for identity emphasis and blue/white for action emphasis. |
| Major | Warning state uses orange-yellow, so “no yellow” would remain incomplete after only replacing hard-coded accents. | `src/app/globals.css:28-29`; `src/components/ui/badge.tsx:4,16-21`; `src/components/borrower/borrower.module.css:35,48`; `src/app/sekda/sekda.css:68-70` | Shared warning token resolves to `#fff6e6` / `#b36a00`, then reaches badges, notices, stock condition, request flow, and audit dialog. | Rebase warning token on muted maroon surface/text; keep danger red and success green for semantic distinction. |
| Major | Primary visual identity changes by route: login is photo-led navy, daftar is navy plus yellow pattern, borrower welcome is navy plus yellow, while shell is white with small blue/maroon accents. | `src/app/login/login.module.css:1-18`; `src/app/daftar/registration.module.css:1-6`; `src/components/borrower/borrower.module.css:10-24`; `src/app/globals.css:211-229` | Shared palette exists, but no documented role allocation for blue versus maroon. | Assign blue to operational navigation, primary action, and focus; assign maroon to civic identity, priority, and attention; reserve white for content surfaces. |
| Minor | Auth prose uses editorial italics, conflicting with modern utilitarian government interface and mobile hierarchy. | `src/app/login/login.module.css:14-15`; `src/app/daftar/registration.module.css:5`; `src/app/layout.tsx:11-16` | `Source_Serif_4` loads only italic and is used in prominent identity copy. | Retain Public Sans as interface family; remove editorial italic treatment from auth hero/support copy. |

3 major · 1 minor

## Design decision

Build one modern-minimal government system using existing Public Sans and three role colors only: maroon for civic identity and attention, blue for navigation and actions, white for readable working surfaces. Keep green for confirmed/success state and red for error/destructive state. Replace yellow and orange warning color with maroon-tinted attention state.

Visual allocation:

| Role | Color use |
| --- | --- |
| Maroon | Civic brand marker, route eyebrow, priority counts, alert/attention state, selected dashboard context. |
| Blue | Sidebar active state, primary button, links, keyboard focus, informational status, onboarding progression. |
| White | Page surfaces, forms, tables, elevated cards, logo field. |
| Blue-maroon fields | Large auth and borrower welcome backgrounds: deep blue base with restrained blue-to-maroon gradient and low-opacity civic grid/line texture. No yellow dots, gold marks, or orange warning panels. |

## Reuse

- `--blue-50`, `--blue-500`, `--blue-700`, `--maroon-50`, `--maroon-500`, `--maroon-700`, `--surface`, `--error`, and `--success` from `src/app/globals.css`.
- Global primitives: `.button`, `.input`, `.badge`, `.panel`, `.page-header`, and shell classes in `src/app/globals.css`.
- Dashboard frame: `AppShell` in `src/components/app-shell.tsx`.
- Exemplar: existing `.shell-nav__link--active` blue navigation and `.shell-nav__badge` maroon priority marker in `src/app/globals.css:225-229`.

New shared primitives are not required. Semantic token aliases in `:root` can express final system without duplicating components.

## Changes

1. `src/app/globals.css`
   - Change: Define explicit semantic aliases for civic identity, operational primary, attention, and their soft surfaces. Add named gradient tokens for deep blue-to-maroon identity fields and pale blue-white navigation surfaces. Change `--warning-surface` and `--warning` from orange-yellow to maroon-tinted values derived from existing maroon family. Remove generic compatibility aliases only after all consumers use semantic aliases; otherwise retain aliases during this scoped migration.
   - Change: Make blue primary action/navigation token and maroon civic/attention token consistent across buttons, badges, focus treatments, active navigation, page eyebrows, timeline current marker, and notification counters.
   - Preserve: Success green, error red, current radius scale, layout spacing, routes, and component behavior.
   - Verify: No yellow, gold, amber, or orange value remains in source CSS; visible warning state reads as attention without looking like an error.

2. `src/app/login/login.module.css` and `src/app/daftar/registration.module.css`
   - Change: Rebuild auth identity panels around named deep blue-to-maroon gradient, with one restrained low-opacity civic line/grid texture. Replace yellow kicker, yellow brand mark, and yellow dot pattern with white/maroon token references. Use blue primary submit/progression controls, maroon for identity labels and non-primary emphasis, white form canvas.
   - Change: Remove italic display/support copy. Keep text hierarchy through Public Sans weight, size, tracking, and contrast.
   - Preserve: Existing two-column desktop composition, compact mobile composition, logos, form labels, validation, consent, and registration flow.
   - Verify: Login and daftar look like one entry journey at desktop and mobile; no decorative yellow remains.

3. `src/components/borrower/borrower.module.css` and borrower pages under `src/app/peminjam/`
   - Change: Restyle welcome panel as named deep blue-to-maroon gradient with restrained civic line/grid texture. Replace every yellow welcome kicker, headline emphasis, hover state, and status dot with tokenized maroon or white treatment. Keep primary CTA blue/white according to contrast against its panel.
   - Change: Route notices and warning status through shared maroon attention tokens rather than local yellow/orange styles.
   - Preserve: Existing borrower actions, dashboard layout, loan flow, counts, and role-specific copy.
   - Verify: Borrower home keeps strongest dashboard welcome hierarchy while matching login/daftar and app shell.

4. `src/components/ui/badge.tsx`, `src/components/admin/admin.module.css`, `src/app/sekda/sekda.css`, `src/app/notifikasi/shared.module.css`, and all warning-token consumers found from repository search
   - Change: Apply shared attention token to `warning` badge, stock/request statuses, audit warning dialog, notices, and admin summary treatment. Do not map warning to danger red.
   - Preserve: Current status-to-tone mapping in `src/components/ui/badge.tsx`; only palette resolution changes.
   - Verify: Warning, success, info, and error remain visually distinct in tables, cards, dialogs, and notifications.

5. `src/components/app-shell.tsx` and shell styles in `src/app/globals.css`
   - Change: Strengthen government identity without changing navigation structure: give active navigation a subtle blue-to-maroon gradient, use a pale blue-white gradient only for header or sidebar accent zones, retain white sidebar/content surfaces, and use maroon as small identity/priority accent. Normalize high-value visual markers to semantic aliases.
   - Preserve: Role navigation, desktop sidebar, mobile drawer, bottom navigation, search, account menu, keyboard behavior, and logo assets.
   - Verify: Admin, borrower, and approver routes read as same product with role-specific data, not separate themes.

6. `src/app/page.tsx`
   - Change: Keep redirect unless product owner explicitly requests public landing content. Current route is no homepage, so visual homepage redesign has no implementation target.
   - Preserve: Existing entry behavior.
   - Verify: `/` still reaches login without loop or layout flash.

## Scope

- Inherit: All dashboard routes wrapped by `AppShell`, including `src/app/admin/*`, `src/app/peminjam/*`, and `src/app/sekda/*`, inherit global primitive and shell updates.
- Verify: Login, daftar, borrower home, admin ringkasan, approver menunggu, notification, profile, denied-access, and session-ended states.
- Exclude: New public marketing homepage, copy rewrite, functional workflow changes, data/API changes, navigation restructuring, and logo replacement.

## Validation

- Product: Sign in, register, navigate dashboards by each role, open notification/account menu, inspect warning and error states.
- Interface: Test `/login`, `/daftar`, `/peminjam/beranda`, `/admin/ringkasan`, `/sekda/menunggu`, `/notifikasi`, `/profil`, `/akses-ditolak`, and `/sesi-berakhir` at 320, 375, 414, 768, 1024, and 1440 px.
- Interface: Confirm gradients remain low-contrast background treatment, never sit behind small operational text, and do not reduce white-text contrast in auth/welcome panels.
- System: Search `src/` for `#ffcf3c`, `255 207 60`, `#fff6e6`, `#b36a00`, `yellow`, `amber`, `gold`, and `orange`; expected result is no palette/decorative use. Status semantics may retain `warning` identifier while resolving to maroon token.
- Repository: `npm run lint` → exits 0.
- Repository: `npm run test` → exits 0.
- Repository: `npm run build` → exits 0.

## Stop conditions

- Stop if yellow/orange has mandated external government brand meaning that must remain.
- Stop if a route-local palette is intentionally approved for a role and cannot inherit global semantic tokens.
- Stop if contrast validation fails for maroon attention text on its proposed soft surface; adjust token lightness, not individual consumer overrides.

## Design documentation

- After acceptance and validation: create or update `DESIGN.md` with color roles, typography rule, auth composition rule, dashboard shell ownership, and prohibition on yellow/orange decorative accents.

---

# Redesign Alur Peminjaman Peminjam

Written against: unavailable (workspace is not a Git repository)

## Evidence chain

- Surface: `/peminjam/ajukan`, `/peminjam/peminjaman`, `/peminjam/peminjaman/[id]`, `/peminjam/pengembalian`, `/peminjam/pengembalian/[id]`, `/peminjam/riwayat`, and `/peminjam/beranda`.
- Problem: Existing flow works but presents a long utility-form experience. Item selection is a list with bare quantity fields, progress state has no persistent submission summary, and post-submission detail presents workflow status and required action as peer panels rather than one obvious next action.
- Design evidence: Five workflow steps and validation live in `src/components/borrower/loan-form.tsx:9-77`; request list lives in `src/components/borrower/borrower-ui.tsx:12-18`; return evidence lives in `src/components/borrower/return-form.tsx:12-66`; request lifecycle labels live in `src/components/borrower/borrower-data.ts:26-32`; current style owner is `src/components/borrower/borrower.module.css`.
- Owner: `LoanForm`, `ReturnForm`, and `borrower-ui.tsx` own borrower workflow presentation. `borrower.module.css` owns borrower-local layout. Global primitives in `src/app/globals.css` own shared buttons, panels, inputs, badges, and timeline.
- Scope and affected surfaces: borrower home, new request, active request list/detail, return list/detail, and history.
- Uncertainty: No browser render inspected. Preserve current client-side local draft behavior and mock submission semantics unless backend persistence has been added before execution.

## Audit

| Severity | Tell / problem | Where | Evidence | Fix |
| --- | --- | --- | --- | --- |
| Major | Catalog selection looks like data entry, not facility selection. Quantity input gives weak stock and selection feedback. | `src/components/borrower/loan-form.tsx:73`; `src/components/borrower/borrower.module.css:99-105` | Every item uses same row plus number field. Selected count, selected item summary, and selection state are absent until review. | Make each facility a selectable card/row with quantity controls, stock state, selected treatment, and persistent compact summary. |
| Major | Five-step form gives orientation only at top. Current request details, items, document requirements, and selected total are hidden while the user completes each step. | `src/components/borrower/loan-form.tsx:69-77`; `src/components/borrower/borrower.module.css:71-98` | Stepper only marks index; mobile reduces labels to `font-size: 0` at line 146. | Use numbered progress rail on desktop and compact “Langkah X dari 5” progress bar on mobile; show a sticky desktop summary card after meaningful draft data exists. |
| Major | Lifecycle page shows process chronology but no single task-first decision area. Revision notice and return action compete with panels. | `src/app/peminjam/peminjaman/[id]/page.tsx:14-18`; `src/app/peminjam/pengembalian/[id]/page.tsx:12-13` | Revision task is separate alert, status is small label, timeline is adjacent. | Add status hero with lifecycle stage, plain-language next action, due date when available, and one primary CTA. Keep timeline as supporting audit trail. |
| Minor | Return evidence capture is valid but visually flat. Required versus optional photo priority appears only as text. | `src/components/borrower/return-form.tsx:52-64`; `src/components/borrower/borrower.module.css:113-117` | All four upload fields have equal treatment even though first two are required. | Group required evidence first, add completion count/progress, render selected file state and optional evidence separately. |

3 major · 1 minor

## Design decision

Redesign borrowing as task-oriented service journey, not generic form sequence:

1. Start request with identity already confirmed.
2. Capture activity details and dates.
3. Select facilities with visible availability and selected basket.
4. Add required documents with completion feedback.
5. Review, affirm, submit.
6. After submission, show status, owner, next action, and timeline in that priority.
7. Return flow uses same evidence-first structure and ends in clear verification-pending confirmation.

Use existing blue operational primary, maroon attention/identity, white content surface, and named gradients from visual-system plan. No yellow or orange. Do not change request statuses, business validation, URLs, local draft key, or server/API behavior.

## Reuse

- `LoanForm` draft, validation, `saveDraft`, and `submit` behavior from `src/components/borrower/loan-form.tsx`.
- `ReturnForm` validation and file rules from `src/components/borrower/return-form.tsx`.
- `StatusBadge`, `RequestList`, `Timeline`, `Panel`, `Badge`, `Button`, `Input`, `Select`, `DetailGrid`, and `DetailItem`.
- Existing `RequestStatus` and `statusLabels` from `src/components/borrower/borrower-data.ts`.
- Exemplar: `.formFooter` and responsive `.formFooterRight` in `src/components/borrower/borrower.module.css:97-98,141-143`.

New borrower-local compositions are justified because global primitives cannot express workflow-specific selection basket, compact mobile progress, or lifecycle task hero. Keep them in `src/components/borrower/` until another role has proven reuse need.

## Changes

1. `src/components/borrower/loan-form.tsx`
   - Change: Keep five existing data/validation stages. Replace static step list with semantic progress component showing completed, current, and remaining states. On mobile show current step label, ordinal, and progress fill without hiding all context.
   - Change: Convert item rows into selectable inventory controls. Each control shows item name, inventory code, location, available stock, unit, decrement/increment quantity controls, and selected state. Keep quantity bounded by `availableStock`.
   - Change: Add a live draft summary composition: selected item count and quantity, date range, plus contextual missing-data signal. Desktop can place it beside form; mobile places it before bottom actions or as collapsed summary.
   - Change: Make review page an auditable confirmation sheet with explicit completion markers for identity, activity, facilities, documents, and declaration.
   - Preserve: `initialDraft`, localStorage key `sipinter-borrower-draft`, validation messages, mandatory documents, dates, button behavior, and field data.
   - Verify: Keyboard user can change item quantity, errors remain tied to fields, saved draft restores all serializable data, and no selected item disappears on step change.

2. `src/components/borrower/return-form.tsx`
   - Change: Turn return into two labeled stages inside one route: “Kondisi & catatan” then “Bukti foto”. Show required photo slots first with stronger border/label; optional slots separated below. Include live `2 dari 2 bukti wajib` and total file feedback.
   - Change: Give selected image files a completed state with filename, replace action, and maroon/blue progress cue. Preserve native file input access.
   - Change: After submit, replace action focus with confirmation card stating verification is next and keep request context visible.
   - Preserve: 2–4 photo rule, JPG/PNG and 5 MB validation, condition options, date rule, and message text intent.
   - Verify: Required/optional distinction is apparent without color alone; validation works for no photo, one photo, unsupported format, oversize file, and successful submit.

3. `src/app/peminjam/peminjaman/[id]/page.tsx` and new borrower-local status composition if needed
   - Change: Add lifecycle status hero above details. It includes status label, one plain-language instruction, request period, relevant deadline, and exactly one primary action when user action is possible. Example: revision gives “Perbaiki dokumen”; borrowed gives “Ajukan pengembalian”; waiting stages provide no false CTA.
   - Change: Keep detailed identity/items/documents as below-the-fold supporting records. Keep timeline in visual secondary position as audit/history reference.
   - Preserve: Existing not-found behavior, request data, links, status labels, and admin note.
   - Verify: Revision, waiting verification, approved/ready, borrowed, return verification, completed, rejected, and overdue states each show correct wording and do not expose invalid action.

4. `src/app/peminjam/pengembalian/[id]/page.tsx`, `src/app/peminjam/peminjaman/page.tsx`, `src/app/peminjam/pengembalian/page.tsx`, and `src/app/peminjam/riwayat/page.tsx`
   - Change: Use shared request-list context: title, result count, compact filter/ordering control, and status summary. Give return list deadline/urgency metadata before generic status.
   - Change: Add return status hero above return form, carrying item count, deadline, and selected request identity; do not duplicate full request details before form on small screens.
   - Preserve: Existing routes, request filtering, empty states, and filter option labels until real filter behavior is wired.
   - Verify: List-to-detail-to-action journey is clear on both table and mobile record variants.

5. `src/app/peminjam/beranda/page.tsx` and `src/components/borrower/borrower.module.css`
   - Change: Make home action-first: prioritize unresolved revision or return deadline before informational history. Keep one active request card with next action, then compact lifecycle progress, then available facilities/history.
   - Change: Add borrower-local styles for workflow rail, mobile progress, task hero, selected inventory card, quantity control, selection basket, upload completion state, and lifecycle summary. Use white surfaces, blue operational action, maroon attention, and approved blue-maroon gradient only for high-level hero fields.
   - Preserve: Current dashboard content sources, role navigation, all links, responsive grid, and accessibility roles/aria-live behavior.
   - Verify: At 320/375/414 px, no horizontal scrolling; step content and bottom actions remain visible; clickable labels do not wrap to two lines; no hidden status detail due to `font-size: 0`.

## Scope

- Inherit: Borrower-only presentation routes and components listed above.
- Verify: `/peminjam/beranda`, `/peminjam/ajukan`, `/peminjam/peminjaman`, every visible request state at `/peminjam/peminjaman/[id]`, `/peminjam/pengembalian`, `/peminjam/pengembalian/[id]`, and `/peminjam/riwayat`.
- Exclude: Admin and approver review workflows, request database model, inventory API, approval rules, request status names, document storage, and public/auth redesign beyond shared tokens.

## Validation

- Product: Start request, save draft, reload, complete every stage, submit, open request status, submit return with mandatory evidence, and inspect history.
- Interface: Test first/last item, zero/max quantity, long facility name, no available facilities, all form validation errors, selected and unselected upload states, each status family, and both empty lists.
- Responsive: Test at 320, 375, 414, 768, 1024, and 1440 px. Confirm no horizontal page scroll, visible workflow context, 44 px minimum input/button touch targets, and working native file/date controls.
- System: Search borrower styles for yellow/orange values after visual-system migration; expected no decorative yellow/orange use.
- Repository: `npm run lint` → exits 0.
- Repository: `npm run test` → exits 0.
- Repository: `npm run build` → exits 0.

## Stop conditions

- Stop if a proposed next action does not map to a valid current request status.
- Stop if adding client interaction requires new backend persistence or changes approval behavior; scope that as separate functional work.
- Stop if the existing status data cannot provide required deadline/owner detail; show only data already available rather than inventing it.

## Design documentation

- After acceptance and validation: add borrower workflow rules to `DESIGN.md`: task-first lifecycle hero, five-stage request structure, inventory selection feedback, return evidence priority, blue/maroon role allocation, and mobile progress behavior.

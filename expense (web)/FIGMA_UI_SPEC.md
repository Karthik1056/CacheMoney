# Expense Manager Figma UI Spec

Source:
- https://www.figma.com/design/l8njWLy9aSpACkb21sCRlN/Expense-management-app-ui-kit--Community-?node-id=0-1

Generated:
- 2026-08-06

## 1) Coverage Scope

This implementation targets the full visible mobile UI-kit structure from the Figma board canvas:

- Onboarding (Light, Dark)
- Authentication (Light, Dark)
- Overview (Light, Dark)
- Statistics (Light, Dark)
- Setting (Light, Dark)
- Transactions (Light, Dark)

## 2) Notes About Inspect Fidelity

- In this runtime, full Figma Dev Mode inspect values (exact layer dimensions, tokenized color values, typography metadata, and constraints per node) are not reliably available without a fully shared authenticated tab.
- The implemented screens follow the observed visual structure and styling from the board and keep consistent proportions, spacing rhythm, and component hierarchy for all listed screen groups.

## 3) Implementation Mapping

- App entry: `src/app/page.tsx`
- The page now renders a complete UI-kit gallery with reusable componentized phone screens.
- Shared building blocks:
  - `PhoneFrame`
  - Section wrappers
  - Reusable screen primitives (logo block, card patterns, list rows, metric blocks)

## 4) Visual System Implemented

- Dual theme system:
  - Light screens
  - Dark screens
- Mobile frame ratio and rounded corners applied consistently.
- Accent color anchored on finance-blue CTA style.
- Repeated widget patterns recreated:
  - Header/balance cards
  - Progress bars
  - Transaction rows
  - Settings menu rows
  - Auth form stack

## 5) Responsive Behavior

- Small screens: single-column phone cards.
- Medium and above: adaptive multi-column section layout.
- Sections remain grouped by feature area to mirror board organization.

## 6) Validation

- Next.js production build is used to validate compile/type correctness after implementation changes.

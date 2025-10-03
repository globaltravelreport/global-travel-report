# Header Social Icon Duplication Audit

## Summary
- The Facebook, X/Twitter, and LinkedIn icons are rendered multiple times because each header implementation embeds its own inline social link block instead of reusing a shared component.
- The production header (`src/components/layout/Header.tsx`) shows the icons in the desktop utility bar and duplicates the same set inside the mobile contact panel, so mobile visitors see the block twice once the menu is opened.
- A legacy header (`components/layout/Header.tsx`) also inlines the same icons inside the main navigation bar and again in the mobile menu, which explains screenshots where both desktop rows display social links.

## Evidence
| Context | File & Lines | Details |
| --- | --- | --- |
| Desktop utility bar | `src/components/layout/Header.tsx` L29-L68 | Email/location strip displays the full social icon set in the right-aligned cluster.【F:src/components/layout/Header.tsx†L29-L68】 |
| Mobile contact panel | `src/components/layout/Header.tsx` L294-L333 | The same icons repeat in the mobile-only contact section, so the menu renders a second copy on small screens.【F:src/components/layout/Header.tsx†L294-L333】 |
| Main navigation row (legacy header) | `components/layout/Header.tsx` L189-L245 | The deprecated header component mounts the social icons beside the desktop nav links, creating a second row of icons when this variant ships.【F:components/layout/Header.tsx†L189-L245】 |
| Mobile menu (legacy header) | `components/layout/Header.tsx` L383-L438 | The legacy header repeats the block inside its mobile drawer just like the production component.【F:components/layout/Header.tsx†L383-L438】 |

A repository-wide search confirms there is no shared `SocialIcons` component; every occurrence is hand-written inline.【F:components/layout/Header.tsx†L189-L245】【F:src/components/layout/Header.tsx†L29-L68】

## Root Cause
Two separate header implementations coexist, both copying the social icon markup. The live header renders the icons in both the utility strip and the mobile menu, while the older header variant also injects them into the main navigation row. Because the markup is duplicated instead of abstracted, any screen that renders both rows shows the icons twice.

## Recommendation
1. Extract a single `SocialLinks` component (with `aria-label` props preserved) and consume it only once per breakpoint:
   - Keep the icons in the utility bar for desktop/laptop widths (clear separation from navigation).
   - Render the same component inside the mobile drawer *only* when the utility bar is hidden, ensuring the block never appears twice simultaneously.
2. Remove or archive the unused `components/layout/Header.tsx` to prevent regressions where both header variants are bundled.
3. When refactoring, verify responsiveness (icons collapse into the drawer on ≤1024px) and retain existing accessible labels on each `<a>` element.
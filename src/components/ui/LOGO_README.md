# Zivara Logo Component

## Overview
The Zivara logo features a modern shopping bag icon with a stylized "Z" inside, representing the brand's e-commerce focus.

## Design Elements
- **Shopping Bag**: Symbolizes e-commerce and shopping
- **Letter Z**: Represents the Zivara brand
- **Teal Color**: Brand color (#14b8a6) for trust and modernity
- **Tagline**: "SHOP SMART" emphasizes value and intelligence

## Usage

### Full Logo with Text
```tsx
import { Logo } from '@/components/ui/logo';

<Logo variant="light" size="md" />
```

### Icon Only
```tsx
import { LogoIcon } from '@/components/ui/logo';

<LogoIcon variant="dark" size="sm" />
```

## Props

### Logo Component
- `variant`: 'light' | 'dark' - Color scheme (default: 'light')
- `showText`: boolean - Show/hide brand text (default: true)
- `size`: 'sm' | 'md' | 'lg' - Logo size (default: 'md')
- `className`: string - Additional CSS classes

### LogoIcon Component
Same as Logo but without `showText` prop (always false)

## Variants

### Light Variant
- Use on dark backgrounds (header, footer)
- White text and icon details
- Teal shopping bag

### Dark Variant
- Use on light backgrounds (pages, cards)
- Dark text and icon details
- Teal shopping bag

## Sizes
- `sm`: 32px height (h-8)
- `md`: 40px height (h-10) - Default
- `lg`: 48px height (h-12)

## Examples

```tsx
// Header usage (light on dark)
<Logo variant="light" size="md" />

// Footer usage
<Logo variant="light" size="sm" />

// Page content (dark on light)
<Logo variant="dark" size="lg" />

// Mobile menu icon
<LogoIcon variant="light" size="sm" />
```

## Files
- Component: `src/components/ui/logo.tsx`
- SVG Asset: `public/logo.svg`
- Favicon: Configured in `src/app/layout.tsx`

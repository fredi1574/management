# Design System - Finance Management App

## Overview

This document outlines the modern, premium design system implemented across the Finance Management application. The design prioritizes visual hierarchy, readability, and professional aesthetics with smooth interactions and intuitive navigation.

---

## Color Palette

### Light Mode

- **Background**: `#fafbfc` - Clean, neutral light background
- **Background Secondary**: `#f3f4f6` - Subtle secondary background for grouped elements
- **Foreground**: `#0f172a` - Primary text color (dark navy)
- **Card Background**: `#ffffff` - Pure white for card containers
- **Border**: `#e5e7eb` - Subtle border color for definitions

### Dark Mode

- **Background**: `#0f172a` - Deep dark navy background
- **Background Secondary**: `#1e293b` - Slightly lighter for secondary elements
- **Foreground**: `#f8fafc` - Light text color
- **Card Background**: `#1e293b` - Dark cards with good contrast
- **Border**: `#334155` - Visible but subtle borders

### Accent Colors

- **Primary**: `#6366f1` (Indigo) - Main brand color, used for primary actions and highlights
- **Success**: `#10b981` (Emerald) - Income, positive indicators
- **Danger**: `#ef4444` (Red) - Expenses, negative indicators
- **Warning**: `#f59e0b` (Amber) - Warnings and alerts

---

## Typography

- **Font Family**: Geist (sans-serif) for all text
- **Font Mono**: Geist Mono for code and tabular data
- **Heading Sizes**:
  - H1: 2rem (32px) - Page titles
  - H2: 1.875rem (30px) - Section headers
  - H3: 1.5rem (24px) - Subsection headers
- **Body Text**: 1rem (16px) with leading-relaxed (1.625) for optimal readability
- **Small Text**: 0.875rem (14px) for secondary information

---

## Components

### Cards

Cards are the primary content containers with consistent styling:

```css
.card-elevated {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 1rem;
  box-shadow: var(--shadow-md);
  transition: box-shadow 0.2s, transform 0.2s;
}

.card-elevated:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

- **Padding**: 1.5rem (24px) inside cards
- **Spacing**: 1.5rem (24px) between cards
- **Border Radius**: 1rem (16px) for all cards
- **Hover Effect**: Slight elevation with shadow increase and subtle upward movement

### Buttons

Buttons follow a clear visual hierarchy:

#### Primary Button (Action Buttons)
- Background: Solid primary color (`#6366f1`)
- Text: White
- Hover: Brightness increase + shadow elevation
- Example: "Add Expense", "Add Income"

#### Secondary Button (Toggle/View)
- Background: Background secondary color
- Text: Text secondary/primary on hover
- Hover: Text color brightens, background lightens
- Example: "Group", "List", "Cancel"

#### Icon Buttons
- Background: Transparent
- Hover: Background secondary + text primary
- Example: Theme toggle, edit/delete actions

### Forms

Form inputs maintain consistency:

```css
input, select, textarea {
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 0.625rem 0.75rem;
  background: var(--card-bg);
  color: var(--text-primary);
  transition: border-color 0.2s, box-shadow 0.2s;
}

input:focus, select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
```

- **Border Radius**: 0.5rem (8px)
- **Padding**: 0.625rem vertical, 0.75rem horizontal
- **Focus State**: Ring effect with primary color at 10% opacity
- **Transitions**: 200ms for all interactive elements

### Navigation Bar

- **Position**: Fixed, sticky top
- **Background**: Glass morphism effect - white with 80% opacity + backdrop blur
- **Dark Mode**: Dark navy with translucent effect
- **Active Links**: Highlighted with primary color background in white container
- **Icon Size**: 20px for main icons, 16px for secondary

### Summary Cards

Three distinct card types in the monthly overview:

1. **Income Card** (Emerald theme)
   - Icon: ArrowDownCircle
   - Color: Emerald green with light background
   - Position: Top left of overview grid

2. **Expense Card** (Red theme)
   - Icon: ArrowUpCircle
   - Color: Red with light background
   - Position: Middle left of overview grid

3. **Balance Card** (Primary/Indigo theme)
   - Icon: Wallet
   - Color: Primary indigo with light background
   - Position: Bottom left of overview grid

### List Items

Transaction list items with subtle interactions:

```css
.list-item {
  background: var(--background-secondary) / 50%;
  border: 1px solid var(--border);
  border-radius: 0.875rem;
  padding: 0.75rem 1rem;
  transition: background-color 0.2s, box-shadow 0.2s;
}

.list-item:hover {
  background: var(--background-secondary);
  box-shadow: 0 0 0 1px var(--primary) / 20%;
}
```

- **Hover Effect**: Brightens background and adds subtle primary color ring
- **Category Badge**: Inline with text, colored background + text color
- **Amount**: Tabular nums for alignment
- **Date**: Secondary gray text, smaller font

---

## Spacing System

Following Tailwind's spacing scale:

- **xs**: 0.25rem (4px)
- **sm**: 0.5rem (8px)
- **md**: 1rem (16px)
- **lg**: 1.5rem (24px)
- **xl**: 2rem (32px)
- **2xl**: 3rem (48px)

All spacing uses `gap` classes for flexbox layouts, never mixed with margins/padding.

---

## Shadow System

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
```

- **Small shadows** on hover states and subtle elevation
- **Medium shadows** on cards and elevated containers
- **Large shadows** on modals and primary focus elements

---

## Transitions & Animations

All interactive elements use consistent transitions:

```css
transition: all 0.2s ease-in-out;
```

Specific cases:
- **Hover states**: 200ms duration
- **Background changes**: 200ms
- **Transform**: 200ms (for elevation effects)
- **Color changes**: 200ms

### Fade In Animation

Used for contextual elements appearing:
```
animation: fadeIn 200ms ease-in;
```

---

## Accessibility Features

- **Color Contrast**: All text meets WCAG AA standards (4.5:1 for normal text)
- **Focus States**: Visible ring effect on all interactive elements
- **Icons + Text**: Icons paired with descriptive text for clarity
- **Semantic HTML**: Proper heading hierarchy maintained
- **ARIA Labels**: Buttons with icons include aria-label attributes
- **Screen Reader**: sr-only class for screen reader-only content

---

## Dark Mode

Complete dark mode support with:

- Automatic system preference detection
- Manual toggle via theme provider
- Persistence in localStorage
- All colors inverted while maintaining contrast
- Smooth transitions between themes (200ms)

---

## Responsive Design

Mobile-first approach with breakpoints:

- **sm**: 640px - Small tablets
- **md**: 768px - Standard tablets
- **lg**: 1024px - Desktops
- **xl**: 1280px - Large screens

### Key Responsive Changes

1. **Navigation**: Icon-only on mobile, full labels on desktop
2. **Cards**: Single column on mobile, 2 columns on lg, 3+ on xl
3. **Charts**: Stack vertically on mobile, side-by-side on larger screens
4. **Forms**: Full width on mobile, constrained on desktop

---

## Usage Guidelines

### Creating New Components

1. Use CSS variables from globals.css (`var(--primary)`, `var(--text-primary)`, etc.)
2. Apply `card-elevated` class for card containers
3. Use Tailwind spacing scale (gap, p-, m-)
4. Maintain 200ms transition durations
5. Ensure focus states with ring effect
6. Test in both light and dark modes

### Color Usage

- **Primary Actions**: Use `--primary` (Indigo)
- **Income/Positive**: Use Emerald (`#10b981`)
- **Expense/Negative**: Use Red (`#ef4444`)
- **Text**: Use `--text-primary`, `--text-secondary`, `--text-tertiary`
- **Backgrounds**: Use `--background`, `--background-secondary`
- **Borders**: Use `--border`

### Button States

```html
<!-- Primary Button -->
<button class="bg-[var(--primary)] text-white hover:brightness-110 transition">
  Action
</button>

<!-- Secondary Button -->
<button class="bg-[var(--background-secondary)] hover:bg-[var(--border)]">
  Secondary
</button>

<!-- Icon Button -->
<button class="text-[var(--text-tertiary)] hover:bg-[var(--background-secondary)]">
  <Icon />
</button>
```

---

## Performance Optimizations

- **CSS Variables**: Reduced file size with dynamic theming
- **Transitions**: 200ms duration balances responsiveness and smoothness
- **Shadows**: Cached in CSS for better rendering
- **Mobile**: Optimized touch targets (minimum 44px)

---

## Future Enhancements

- Animated loading skeletons
- Micro-interactions on transaction creation
- Advanced theme customization
- Gradient overlays for special sections
- Animation prefers-reduced-motion support


# Frontend Refactoring Guide - Style to ClassName Migration

## Overview
Converting all `style={{...}}` inline styles to `className` using Tailwind CSS utilities and custom CSS classes defined in `globals.css`.

## ✅ Completed Files
- `globals.css` - Added 150+ CSS classes for common patterns
- `Cart.jsx` - Partial (loading, empty, header done)
- `Login.jsx` - Completed  
- `Register.jsx` - Completed

## 📋 Pattern & Best Practices

### 1. Replacing Common Inline Styles

#### Before (Inline Styles)
```jsx
<div style={{ 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '16px',
  minHeight: '100vh',
  background: 'var(--paper)'
}}>
```

#### After (className)
```jsx
<div className="flex-col gap-4 min-h-screen bg-[var(--background)]">
```

### 2. Text & Typography

#### Font Family & Size
```jsx
// Before
<h1 style={{
  fontFamily: 'Playfair Display, serif',
  fontSize: '32px',
  fontWeight: 700,
}}>Title</h1>

// After
<h1 className="text-display text-2xl font-bold">Title</h1>
```

#### Text Colors & Muted Text
```jsx
// Before
<p style={{ color: 'var(--ink-muted)', fontSize: '15px' }}>Text</p>

// After
<p className="text-muted">Text</p>
```

### 3. Layout Containers

```jsx
// Before
<div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px clamp(20px, 6vw, 80px)' }}>

// After  
<div className="container-md py-10">
```

**Available container classes:**
- `container-full` - max-width: 100%
- `container-lg` - max-width: 1200px
- `container-md` - max-width: 1100px

### 4. Flex Layout Shortcuts

```jsx
// Before
<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

// After
<div className="flex-center">
```

**Available flex classes:**
- `flex-center` - center items both ways
- `flex-between` - space-between with center align
- `flex-col` - column direction
- `flex-col-center` - column + center both ways
- `gap-4, gap-3, gap-2` - gap 16px, 12px, 8px

### 5. Links

```jsx
// Before
<Link to="/page" style={{
  color: 'var(--accent-dark)',
  fontWeight: 600,
  textDecoration: 'none',
  transition: 'color 0.2s',
}}
onMouseEnter={e => { e.currentTarget.style.color = 'var(--ink)' }}
onMouseLeave={e => { e.currentTarget.style.color = 'var(--ink-muted)' }}>
  Click me
</Link>

// After
<Link to="/page" className="link-accent">
  Click me
</Link>
```

### 6. Buttons

```jsx
// Before
<button style={{
  background: 'var(--accent)',
  color: 'white',
  border: 'none',
  padding: '12px 24px',
  borderRadius: '8px',
  fontWeight: 600,
  cursor: 'pointer',
}}>
  Click
</button>

// After
<button className="btn-primary">
  Click
</button>
```

### 7. Cart-Specific Classes

```jsx
// Shipping progress bar
<div className="shipping-bar">
  <div className="shipping-bar-label">
    <div className="shipping-bar-label-text">
      <p>Free delivery</p>
    </div>
    <span className={`shipping-bar-percent ${isFree ? 'complete' : ''}`}>85%</span>
  </div>
</div>

// Cart price display
<span className="cart-price">₹999</span>
<span className="cart-price-large">₹5000</span>

// Stock badge
<span className="badge-stock">In Stock</span>

// Quantity stepper
<div className="stepper">
  <button>-</button>
  <span className="stepper-value">3</span>
  <button>+</button>
</div>
```

### 8. Badges & Status

```jsx
// Before
<span style={{
  fontSize: '11px',
  fontWeight: 600,
  background: '#D6F0E4',
  color: '#1A6B43',
  padding: '2px 8px',
  borderRadius: '99px',
}}>In Stock</span>

// After
<span className="badge-stock">In Stock</span>
```

### 9. Empty States

```jsx
// Before
<div style={{ textAlign: 'center', animation: 'fadeUp 0.5s ease both' }}>
  <div style={{
    width: '100px', height: '100px', borderRadius: '50%',
    background: 'var(--accent-soft)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 28px',
  }}>
    <ShoppingBag size={44} />
  </div>
  <h2 style={{
    fontFamily: 'Playfair Display, serif',
    fontSize: '34px', fontWeight: 700,
  }}>Empty</h2>
</div>

// After
<div className="empty-state">
  <div className="empty-state-icon">
    <ShoppingBag size={44} />
  </div>
  <h2 className="empty-state-title">Empty</h2>
</div>
```

## 🎯 Remaining Files to Refactor

### High Priority (Many inline styles)
1. **Cart.jsx** - Continue from items list section
2. **ProductList.jsx** - Filter sidebar, product grid
3. **ProductDetail.jsx** - Image gallery, specs, reviews
4. **Home.jsx** - Hero sections, carousels

### Medium Priority
5. **Checkout.jsx** - Form sections, summaries
6. **Profile.jsx** - Account details, settings
7. **OrderDetail.jsx** - Order info display
8. **SearchResults.jsx** - Results grid

### Lower Priority
9. Wishlist.jsx
10. Addresses.jsx
11. ForgotPassword.jsx
12. NotFound.jsx
13. Other utility pages

## 🔧 Refactoring Process

### Step 1: Identify Style Pattern
Look for repeating `style={{...}}` patterns

### Step 2: Check globals.css
See if a class already exists. If not, add it.

### Step 3: Replace
Replace `style={{...}}` with `className="..."`

### Step 4: Test
- Visual appearance matches
- Hover/focus states work
- Responsive design intact

### Step 5: Commit Changes
Group related changes together

## 💡 Tips

### Keep Dynamic Styles
Only keep `style={{}}` for truly dynamic values:
```jsx
<div style={{
  width: `${percentage}%`,
  opacity: isHidden ? 0 : 1,
  animationDelay: `${index * 0.07}s`,
}}>
```

### Use Tailwind Arbitrary Values
For custom values not in Tailwind:
```jsx
<div className="text-[var(--accent)] bg-[var(--muted)]">
```

### Hover States
For hover effects, prefer CSS over onMouse events:
```jsx
// Old
onMouseEnter={e => e.currentTarget.style.color = 'red'}

// New - CSS handles it
className="hover:text-red-500"
```

## 📱 Responsive Design

Use Tailwind breakpoints:
```jsx
<div className="
  px-4 sm:px-6 md:px-8
  text-sm md:text-base lg:text-lg
  block md:hidden
  hidden md:block
">
```

## 🎨 Color System

Always use CSS variables:
```jsx
className="text-[var(--ink)] bg-[var(--background)]"
```

**Available variables in globals.css:**
- Colors: `--primary`, `--secondary`, `--accent`, `--danger`, etc.
- Backgrounds: `--background`, `--paper`, `--paper-card`
- Text: `--ink`, `--ink-muted`
- Spacing: Use Tailwind (p, m, gap, etc.)
- Radius: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`

## ✨ New CSS Classes Added to globals.css

```css
/* Layout */
.page-animate
.page-full-height
.container-*
.flex-center
.flex-between
.flex-col
.flex-col-center
.gap-*

/* Typography */
.text-muted
.text-display
.text-header

/* Cart & Products */
.page-header-dark
.cart-grid
.cart-item-*
.cart-price-*
.shipping-bar
.badge-stock
.badge-free-shipping
.stepper
.empty-state
.empty-state-icon
.empty-state-title

/* Forms */
.form-group
.form-divider
.form-divider-line
.form-divider-text

/* Links & Buttons */
.link-accent
.link-primary
.btn-primary
.btn-outline
.btn-icon

/* Grid */
.product-grid
.product-card
.product-image

/* Loading */
.skeleton
.skeleton-text
.skeleton-title

/* Utilities */
.hide-on-mobile
```

## 🚀 Performance Benefits

1. **Smaller Bundle** - CSS is reusable, not repeated in each component
2. **Better Maintainability** - Single source of truth for styles
3. **Easier Theme Changes** - Update one CSS variable, affects everything
4. **Faster Re-renders** - No style object recreation on each render
5. **Better Mobile Experience** - CSS is optimized and cached

---

**Next Step:** Pick one file from the "Remaining Files" section and follow this guide to refactor it. Start with ProductList.jsx as it's a good practice for learning the pattern.

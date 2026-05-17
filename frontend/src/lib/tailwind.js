// Tailwind configuration constants for consistent spacing
// Use these in components instead of hardcoded values

export const tailwindSpacing = {
  // Page container padding
  pagePaddingX: 'px-4 sm:px-6 lg:px-8',
  pagePaddingY: 'py-8 sm:py-12 lg:py-16',
  pagePadding: 'px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16',

  // Section spacing
  sectionSpacingY: 'space-y-8 sm:space-y-12 lg:space-y-16',
  sectionGap: 'gap-6 sm:gap-8 lg:gap-10',

  // Common widths
  containerWidth: 'max-w-7xl',
  cardWidth: 'max-w-md',

  // Grid gaps
  gridGap: 'gap-4 sm:gap-6 lg:gap-8',
  gridGapSmall: 'gap-3 sm:gap-4 lg:gap-6',

  // Responsive text sizes
  headingH1: 'text-3xl sm:text-4xl lg:text-5xl',
  headingH2: 'text-2xl sm:text-3xl lg:text-4xl',
  headingH3: 'text-xl sm:text-2xl lg:text-3xl',

  // Button sizes
  buttonSmall: 'px-3 py-1.5 text-sm',
  buttonMedium: 'px-4 py-2 text-base',
  buttonLarge: 'px-6 py-3 text-lg',
}

// Responsive breakpoints for media queries
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

// Color palette (from index.css)
export const colors = {
  primary: '#C8A96E',
  primaryLight: '#F2E8D5',
  primaryDark: '#A68B52',
  secondary: '#0D0D0D',
  secondaryLight: '#1E1E1E',
  bg: '#FAFAF8',
  bgAlt: '#F5F2EE',
  surface: '#FFFFFF',
  surfaceDark: '#0D0D0D',
  text: '#0D0D0D',
  textInverse: '#FFFFFF',
  muted: '#8A8A8A',
  mutedLight: '#D0CAC0',
  border: '#E2E8F0',
  borderLight: '#D0CAC0',
  success: '#22C55E',
  successBg: '#DCFCE7',
  danger: '#EF4444',
  dangerBg: '#FEE2E2',
  warning: '#EAB308',
  warningBg: '#FEF9C3',
  info: '#3B82F6',
  infoBg: '#DBEAFE',
}

// CSS class utilities
export const utilities = {
  // Flex utilities
  flexCenter: 'flex items-center justify-center',
  flexBetween: 'flex items-center justify-between',
  flexCol: 'flex flex-col',
  flexColCenter: 'flex flex-col items-center justify-center',

  // Grid utilities
  gridAuto: 'grid auto-cols-fr',
  gridAutoFit: 'grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))]',

  // Text utilities
  textTruncate: 'truncate',
  textClamp: 'line-clamp-2',
  textClamp3: 'line-clamp-3',

  // Border radius
  rounded: 'rounded-lg',
  roundedFull: 'rounded-full',
  roundedXl: 'rounded-xl',

  // Shadows
  shadowSm: 'shadow-sm',
  shadowMd: 'shadow-md',
  shadowLg: 'shadow-lg',
  shadowXl: 'shadow-xl',

  // Transitions
  transitionAll: 'transition-all duration-300',
  transitionColors: 'transition-colors duration-200',

  // Overlay
  overlay: 'absolute inset-0 bg-black/50',
  overlayLight: 'absolute inset-0 bg-black/20',
}

// Common responsive classes
export const responsive = {
  // Hide/Show utilities
  hideOnMobile: 'hidden sm:block',
  hideOnTablet: 'hidden md:block',
  showOnMobile: 'sm:hidden',
  showOnTablet: 'md:hidden',

  // Padding utilities
  paddingResponsive: 'p-4 sm:p-6 lg:p-8',
  marginResponsive: 'm-4 sm:m-6 lg:m-8',

  // Grid utilities
  gridCols: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  gridColsAuto: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
}

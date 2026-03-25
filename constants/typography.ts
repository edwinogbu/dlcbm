// Typography constants with proper typing
export interface Typography {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
}

const typography: Typography = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export default typography;

// Named export
export const TYPOGRAPHY = typography;
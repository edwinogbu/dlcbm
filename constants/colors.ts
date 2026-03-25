// Color constants with proper typing
export interface ColorScheme {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  background: string;
  white: string;
  black: string;
  gray: string;
  lightGray: string;
  error: string;
  success: string;
  warning: string;
  border: string;
  purple: string;
  info: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    hint: string;
  };
}

const colors: ColorScheme = {
  primary: '#1E3A8A',        // Deep Blue - Primary theme color
  primaryLight: '#3B5BA5',   // Lighter blue
  primaryDark: '#0F2B5C',    // Darker blue
  secondary: '#FFC107',      // Amber accent
  background: '#F5F5F5',     // Light gray background
  white: '#FFFFFF',
  black: '#212121',
  gray: '#757575',
  lightGray: '#E0E0E0',
  error: '#D32F2F',
  success: '#388E3C',
  warning: '#FFA000',
  border: '#BDBDBD',
  purple: '#6B4EFF',
  info: '#00B8D9',
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#9E9E9E',
    hint: '#9E9E9E',
  }
};

export default colors;

// Named export for convenience
export const COLORS = colors;
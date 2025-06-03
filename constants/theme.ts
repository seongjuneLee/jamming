import { colors } from './colors';

export const theme = {
  colors,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    pill: 999,
  },
  typography: {
    h1: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    h3: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    body: {
      fontSize: 16,
      color: colors.text,
    },
    bodySmall: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    caption: {
      fontSize: 12,
      color: colors.textSecondary,
    },
  },
};
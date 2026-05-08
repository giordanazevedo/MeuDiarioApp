import React from 'react';

export type AppTheme = 'light' | 'dark';

export interface ThemeContextValue {
  theme: AppTheme;
  setTheme: React.Dispatch<React.SetStateAction<AppTheme>>;
}

export const ThemeContext = React.createContext<ThemeContextValue>({
  theme: 'light',
  setTheme: () => {},
});

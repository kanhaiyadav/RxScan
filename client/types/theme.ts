export type ThemeMode = "light" | "dark" | "system";

export interface ThemeContextType {
    isDark: boolean;
    themeMode: ThemeMode;
    toggleTheme: (mode?: ThemeMode) => Promise<void>;
    isLoading?: boolean; // Add loading state
}

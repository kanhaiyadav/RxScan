import { useTheme } from "@/context/ThemeContext";

interface ThemeStyles {
    container: string;
    text: string;
    textSecondary: string;
    card: string;
    border: string;
    input: string;
    button: string;
}

export const useThemeStyles = (): ThemeStyles => {
    const { isDark } = useTheme();

    return {
        container: isDark ? "bg-gray-900" : "bg-background-0",
        text: isDark ? "text-white" : "text-typography-950",
        textSecondary: isDark ? "text-typography-300" : "text-typography-700",
        card: isDark
            ? "bg-gray-800 border-gray-700"
            : "bg-background-0 border-gray-200",
        border: isDark ? "border-gray-700" : "border-gray-200",
        input: isDark
            ? "bg-gray-800 text-white border-gray-600"
            : "bg-background-0 text-typography-950 border-gray-300",
        button: isDark
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-blue-500 hover:bg-blue-600",
    };
};

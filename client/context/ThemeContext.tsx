import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode
} from 'react';
import { useColorScheme, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContextType, ThemeMode } from '../types/theme';

const THEME_STORAGE_KEY = 'themeMode';
const FIRST_LAUNCH_KEY = 'isFirstLaunch';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const systemColorScheme: ColorSchemeName = useColorScheme();
    const [isDark, setIsDark] = useState<boolean>(systemColorScheme === 'dark');
    const [themeMode, setThemeMode] = useState<ThemeMode>('system');
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        initializeTheme();
    }, []);

    // Only listen to system changes if theme mode is 'system'
    useEffect(() => {
        if (themeMode === 'system') {
            setIsDark(systemColorScheme === 'dark');
        }
    }, [systemColorScheme, themeMode]);

    const initializeTheme = async (): Promise<void> => {
        try {
            const [savedTheme, isFirstLaunch] = await Promise.all([
                AsyncStorage.getItem(THEME_STORAGE_KEY),
                AsyncStorage.getItem(FIRST_LAUNCH_KEY)
            ]);

            // Check if this is the first app launch
            if (isFirstLaunch === null) {
                // First time opening the app - use system theme
                await AsyncStorage.setItem(FIRST_LAUNCH_KEY, 'false');
                setThemeMode('system');
                setIsDark(systemColorScheme === 'dark');
            } else if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
                // Not first launch - use saved preference
                const theme = savedTheme as ThemeMode;
                setThemeMode(theme);

                if (theme === 'system') {
                    setIsDark(systemColorScheme === 'dark');
                } else {
                    setIsDark(theme === 'dark');
                }
            } else {
                // Fallback to system if no valid saved theme
                setThemeMode('system');
                setIsDark(systemColorScheme === 'dark');
            }
        } catch (error) {
            console.error('Error initializing theme:', error);
            // Fallback to system theme on error
            setThemeMode('system');
            setIsDark(systemColorScheme === 'dark');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTheme = async (mode?: ThemeMode): Promise<void> => {
        try {
            let newMode: ThemeMode;

            if (mode) {
                newMode = mode;
            } else {
                // When toggling without specifying mode, cycle through light -> dark -> light
                newMode = isDark ? 'light' : 'dark';
            }

            setThemeMode(newMode);

            if (newMode === 'system') {
                setIsDark(systemColorScheme === 'dark');
            } else {
                setIsDark(newMode === 'dark');
            }

            // Save the user's preference
            await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
        } catch (error) {
            console.error('Error saving theme preference:', error);
        }
    };

    const value: ThemeContextType = {
        isDark,
        themeMode,
        toggleTheme,
        isLoading, // Add loading state to context type
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
import React from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import type { ThemeMode } from '@/types/theme';

const HomeScreen: React.FC = () => {
    const { isDark, themeMode, toggleTheme } = useTheme();
    const styles = useThemeStyles();

    const handleThemeChange = (mode: ThemeMode): void => {
        toggleTheme(mode);
    };

    const themeButtons: { mode: ThemeMode; label: string }[] = [
        { mode: 'light', label: 'Light' },
        { mode: 'dark', label: 'Dark' },
        { mode: 'system', label: 'System' },
    ];

    const getThemeDescription = (): string => {
        switch (themeMode) {
            case 'system':
                return `Following system preference (currently ${isDark ? 'dark' : 'light'})`;
            case 'light':
                return 'Manual light mode selected';
            case 'dark':
                return 'Manual dark mode selected';
            default:
                return 'Unknown theme mode';
        }
    };

    return (
        <ScrollView className={`flex-1 ${styles.container}`}>
            <View className="flex-1 gap-6 p-4">
                {/* Header */}
                <View className="gap-2">
                    <Text className={`text-3xl font-bold ${styles.text}`}>
                        Dark Mode Demo
                    </Text>

                    <View className="flex-row gap-2 items-center">
                        {/* Theme Mode Badge */}
                        <View className={`px-3 py-1 rounded-full ${themeMode === 'system'
                            ? isDark ? 'bg-blue-600' : 'bg-blue-500'
                            : isDark ? 'bg-green-600' : 'bg-green-500'
                            }`}>
                            <Text className="text-white text-xs font-semibold">
                                {themeMode.toUpperCase()}
                            </Text>
                        </View>

                        {/* Current Theme Badge */}
                        <View className={`px-3 py-1 rounded-full border ${isDark
                            ? 'border-gray-400 bg-transparent'
                            : 'border-orange-400 bg-transparent'
                            }`}>
                            <Text className={`text-xs font-semibold ${isDark ? 'text-typography-300' : 'text-orange-600'
                                }`}>
                                {isDark ? 'DARK' : 'LIGHT'}
                            </Text>
                        </View>
                    </View>

                    <Text className={`text-sm ${styles.textSecondary}`}>
                        {getThemeDescription()}
                    </Text>
                </View>

                {/* Theme Information Card */}
                <View className={`p-4 rounded-xl border ${styles.card}`}>
                    <Text className={`text-xl font-semibold mb-3 ${styles.text}`}>
                        Theme Behavior
                    </Text>

                    <View className="gap-2">
                        <Text className={`text-sm ${styles.textSecondary}`}>
                            • First app launch: Uses system theme automatically
                        </Text>
                        <Text className={`text-sm ${styles.textSecondary}`}>
                            • After manual selection: Always uses your preference
                        </Text>
                        <Text className={`text-sm ${styles.textSecondary}`}>
                            • System mode: Follows device settings changes
                        </Text>
                    </View>
                </View>

                {/* Theme Toggle Buttons */}
                <View className={`p-4 rounded-xl border ${styles.card}`}>
                    <Text className={`text-xl font-semibold mb-3 ${styles.text}`}>
                        Theme Selection
                    </Text>

                    <View className="gap-3">
                        <Text className={`text-sm ${styles.textSecondary}`}>
                            Choose your preferred theme mode:
                        </Text>

                        <View className="flex-row gap-3">
                            {themeButtons.map(({ mode, label }) => (
                                <Pressable
                                    key={mode}
                                    onPress={() => handleThemeChange(mode)}
                                    className={`flex-1 py-3 px-4 rounded-lg border-2 ${themeMode === mode
                                        ? isDark
                                            ? 'bg-blue-600 border-blue-500'
                                            : 'bg-blue-500 border-blue-400'
                                        : isDark
                                            ? 'bg-transparent border-gray-600'
                                            : 'bg-transparent border-gray-300'
                                        } active:scale-95`}
                                >
                                    <Text className={`text-center font-medium ${themeMode === mode
                                        ? 'text-white'
                                        : styles.text
                                        }`}>
                                        {label}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Quick Toggle Button */}
                <View className={`p-4 rounded-xl border ${styles.card}`}>
                    <Text className={`text-xl font-semibold mb-3 ${styles.text}`}>
                        Quick Toggle
                    </Text>

                    <Pressable
                        onPress={() => toggleTheme()}
                        className={`py-4 px-6 rounded-lg border-2 ${isDark
                            ? 'border-gray-600 bg-transparent active:bg-gray-700'
                            : 'border-gray-300 bg-transparent active:bg-gray-50'
                            } active:scale-98`}
                    >
                        <Text className={`text-center font-semibold text-lg ${styles.text}`}>
                            Switch to {isDark ? 'Light' : 'Dark'} Mode
                        </Text>
                    </Pressable>

                    <Text className={`text-xs mt-2 text-center ${styles.textSecondary}`}>
                        This will set manual preference and override system theme
                    </Text>
                </View>

                {/* NativeWind Examples */}
                <View className={`p-4 rounded-xl border ${styles.card}`}>
                    <Text className={`text-xl font-semibold mb-3 ${styles.text}`}>
                        NativeWind Styling Examples
                    </Text>

                    <View className="gap-3">
                        <View className={`p-4 rounded-lg border ${isDark ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'
                            }`}>
                            <Text className={`font-semibold ${isDark ? 'text-blue-200' : 'text-blue-800'
                                }`}>
                                Info Card
                            </Text>
                            <Text className={`mt-1 text-sm ${isDark ? 'text-blue-300' : 'text-blue-600'
                                }`}>
                                This card adapts to the current theme using NativeWind classes.
                            </Text>
                        </View>

                        <View className={`p-4 rounded-lg border ${isDark ? 'bg-green-900 border-green-700' : 'bg-green-50 border-green-200'
                            }`}>
                            <Text className={`font-semibold ${isDark ? 'text-green-200' : 'text-green-800'
                                }`}>
                                Success Card
                            </Text>
                            <Text className={`mt-1 text-sm ${isDark ? 'text-green-300' : 'text-green-600'
                                }`}>
                                Another themed card with different colors.
                            </Text>
                        </View>

                        <View className={`p-4 rounded-lg border ${isDark ? 'bg-purple-900 border-purple-700' : 'bg-purple-50 border-purple-200'
                            }`}>
                            <Text className={`font-semibold ${isDark ? 'text-purple-200' : 'text-purple-800'
                                }`}>
                                Custom Card
                            </Text>
                            <Text className={`mt-1 text-sm ${isDark ? 'text-purple-300' : 'text-purple-600'
                                }`}>
                                All using native React Native components with NativeWind styling.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Native Components Examples */}
                <View className={`p-4 rounded-xl border ${styles.card}`}>
                    <Text className={`text-xl font-semibold mb-3 ${styles.text}`}>
                        Native Components
                    </Text>

                    <View className="gap-4">
                        {/* Custom styled box */}
                        <View className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'
                            }`}>
                            <Text className={styles.text}>
                                This is a native View component with theme-aware styling
                            </Text>
                        </View>

                        {/* Text Input */}
                        <TextInput
                            placeholder="Type something here..."
                            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                            className={`p-4 rounded-lg border text-base ${styles.input}`}
                        />

                        {/* Custom Button */}
                        <Pressable
                            className={`py-4 px-6 rounded-lg ${styles.button} active:scale-95`}
                        >
                            <Text className="text-white text-center font-semibold text-lg">
                                Native Button
                            </Text>
                        </Pressable>

                        {/* Interactive Card */}
                        <Pressable
                            className={`p-4 rounded-lg border-2 ${isDark
                                ? 'border-gray-600 bg-gray-800 active:bg-gray-700'
                                : 'border-gray-200 bg-background-0 active:bg-gray-50'
                                } active:scale-98`}
                        >
                            <Text className={`font-medium ${styles.text}`}>
                                Pressable Card
                            </Text>
                            <Text className={`mt-1 text-sm ${styles.textSecondary}`}>
                                Tap this card to see the press effect
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* Theme Statistics */}
                <View className={`p-4 rounded-xl border ${styles.card}`}>
                    <Text className={`text-xl font-semibold mb-3 ${styles.text}`}>
                        Current Theme Info
                    </Text>

                    <View className="gap-2">
                        <View className="flex-row justify-between">
                            <Text className={`font-medium ${styles.textSecondary}`}>Mode:</Text>
                            <Text className={styles.text}>{themeMode}</Text>
                        </View>

                        <View className="flex-row justify-between">
                            <Text className={`font-medium ${styles.textSecondary}`}>Appearance:</Text>
                            <Text className={styles.text}>{isDark ? 'Dark' : 'Light'}</Text>
                        </View>

                        <View className="flex-row justify-between">
                            <Text className={`font-medium ${styles.textSecondary}`}>Auto-following system:</Text>
                            <Text className={styles.text}>{themeMode === 'system' ? 'Yes' : 'No'}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

export default HomeScreen;
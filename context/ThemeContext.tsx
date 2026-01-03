import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { THEMES, ThemeColors } from "@/constants/themeDefinitions";
import { useColorScheme } from "react-native";

interface ThemeContextType {
    themeName: string;
    colors: ThemeColors;
    setTheme: (name: string) => Promise<void>;
    availableThemes: string[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const systemScheme = useColorScheme();
    const [themeName, setThemeName] = useState<string>("default");

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const storedTheme = await AsyncStorage.getItem("theme");
            if (storedTheme && THEMES[storedTheme]) {
                setThemeName(storedTheme);
            } else {
                // Fallback to system preference if available in our map, otherwise light.
                // If "default", we can dynamically choose based on system.
                setThemeName("default");
            }
        } catch (error) {
            console.error("Failed to load theme", error);
        }
    };

    const setTheme = async (name: string) => {
        try {
            if (name === "default" || THEMES[name]) {
                setThemeName(name);
                await AsyncStorage.setItem("theme", name);
            }
        } catch (error) {
            console.error("Failed to save theme", error);
        }
    };

    // Resolve actual colors
    const getEffectiveThemeName = (): string => {
        if (themeName === "default") {
            return systemScheme === "dark" ? "dark" : "light";
        }
        return themeName;
    };

    const effectiveThemeName = getEffectiveThemeName();
    // Fallback to light if somehow the theme is invalid
    const colors = THEMES[effectiveThemeName] || THEMES["light"];

    return (
        <ThemeContext.Provider
            value={{
                themeName,
                colors,
                setTheme,
                availableThemes: Object.keys(THEMES),
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};

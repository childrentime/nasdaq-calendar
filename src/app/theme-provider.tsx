"use client";

import { useDarkMode } from "@reactuses/core";
import { ConfigProvider, theme } from "antd";
import { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext<{
  dark: boolean | null,
  setDark: () => void;
}>({
  dark: null,
  setDark: () => {}
});

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dark, setDark] = useDarkMode({
    classNameDark: "dark",
    classNameLight: "light",
    defaultValue: false,
  });

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <ThemeContext.Provider value={{ dark, setDark }}>
        {children}
      </ThemeContext.Provider>
    </ConfigProvider>
  );
}

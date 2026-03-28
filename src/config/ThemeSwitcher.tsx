import { ActionIcon, useMantineColorScheme } from "@mantine/core";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { STORAGE_KEYS } from "../data/storageKeys";

export default function ThemeSwitcher() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME) as "light" | "dark";
    if (saved) {
      setColorScheme(saved);
      document.documentElement.classList.toggle("dark", saved === "dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    setColorScheme(next);
    localStorage.setItem(STORAGE_KEYS.THEME, next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <ActionIcon
        onClick={toggleTheme}
        variant="filled"
        radius="xl"
        size="lg"
        style={{
          backdropFilter: "blur(10px)",
        }}
        className="
          bg-white/80 dark:bg-stone-800/80
          text-yellow-500 dark:text-blue-400
          shadow-md
        "
      >
        <motion.div
          key={isDark ? "moon" : "sun"}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {isDark ? <Moon size={18} /> : <Sun size={18} />}
        </motion.div>
      </ActionIcon>
    </motion.div>
  );
}
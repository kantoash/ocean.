"use client";
import { useTheme } from "next-themes";
import React from "react";
import { Button } from "@/src/components/ui/button";
import { Moon, Sun } from "lucide-react";

export const ModeToggle = () => {
  const { setTheme, theme } = useTheme();
  return (
    <Button
      variant={"outline"}
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-8"
    >
      <Sun
        className="h-[1rem] 
      w-[1rem]
       rotate-0 
       scale-100 
       transition-all 
       dark:-rotate-90 
       dark:scale-0"
      />
      <Moon
        className="absolute
       h-[1rem] 
       w-[1rem] 
       rotate-90 
       scale-0 
       transition-all
       dark:rotate-0 
       dark:scale-100"
      />
    </Button>
  );
};

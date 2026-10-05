"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type Locale = "lt" | "en" | "pl";

interface Messages {
  [key: string]: string | Messages;
}

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  messages: Messages;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("lt");
  const [messages, setMessages] = useState<Messages>({});

  // Load locale from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("preferredLanguage");
    if (savedLang && ["lt", "en", "pl"].includes(savedLang.toLowerCase())) {
      const normalizedLang = savedLang.toLowerCase() as Locale;
      setLocaleState(normalizedLang);
      loadMessages(normalizedLang);
    } else {
      loadMessages("lt");
    }
  }, []);

  const loadMessages = async (loc: Locale) => {
    try {
      const msgs = await import(`../../messages/${loc}.json`);
      setMessages(msgs.default);
    } catch (error) {
      console.error(`Failed to load messages for locale: ${loc}`, error);
    }
  };

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("preferredLanguage", newLocale.toUpperCase());
    loadMessages(newLocale);
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, messages }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

// Helper hook for translations
export function useTranslations(namespace?: string) {
  const { messages } = useLanguage();

  return (key: string) => {
    const keys = namespace ? `${namespace}.${key}` : key;
    const keyPath = keys.split(".");

    let value: string | Messages = messages;
    for (const k of keyPath) {
      if (typeof value === "object" && value !== null) {
        value = value[k];
      }
      if (value === undefined) break;
    }

    return typeof value === "string" ? value : key;
  };
}

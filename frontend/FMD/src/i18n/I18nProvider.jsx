import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import {
  SUPPORTED_LANGUAGES,
  getCachedTranslation,
  translateTexts
} from "../services/runtimeTranslation";

const I18nContext = createContext({
  language: "en",
  setLanguage: () => {},
  ready: true,
  t: (key, fallback) => fallback || key,
  supportedLanguages: SUPPORTED_LANGUAGES
});

function sanitizeLanguage(lang) {
  return SUPPORTED_LANGUAGES.includes(lang) ? lang : "en";
}

function isTranslatableText(text) {
  if (!text) return false;
  const normalized = String(text).replace(/\s+/g, " ").trim();
  if (!normalized) return false;
  return /[A-Za-z]/.test(normalized);
}

function shouldIgnoreTextNode(parentElement) {
  if (!parentElement) return true;

  const tagName = parentElement.tagName;
  if (!tagName) return false;

  return [
    "SCRIPT",
    "STYLE",
    "NOSCRIPT",
    "TEXTAREA",
    "CODE",
    "PRE"
  ].includes(tagName);
}

function getNodeSourceText(node) {
  if (!node.__runtimeI18nSource) {
    node.__runtimeI18nSource = node.textContent;
  }

  return node.__runtimeI18nSource;
}

function getAttributeSource(element, attributeName) {
  const sourceKey = `runtimeI18n${attributeName}`;
  if (!element.dataset[sourceKey]) {
    element.dataset[sourceKey] = element.getAttribute(attributeName) || "";
  }
  return element.dataset[sourceKey];
}

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(
    sanitizeLanguage(localStorage.getItem("language") || "en")
  );
  const [version, setVersion] = useState(0);
  const pendingRef = useRef(new Set());
  const flushTimerRef = useRef(null);

  const setLanguage = useCallback((next) => {
    const safe = sanitizeLanguage(next);
    setLanguageState(safe);
    localStorage.setItem("language", safe);
  }, []);

  const translateAndStore = useCallback(async (texts, targetLanguage) => {
    const normalizedTexts = [...new Set((texts || []).filter(isTranslatableText))];
    if (normalizedTexts.length === 0) return {};

    const translations = await translateTexts(targetLanguage, normalizedTexts);
    setVersion((current) => current + 1);
    return translations;
  }, []);

  const queueTranslations = useCallback((texts) => {
    const normalizedTexts = (texts || []).filter(isTranslatableText);
    if (language === "en" || normalizedTexts.length === 0) return;

    normalizedTexts.forEach((text) => pendingRef.current.add(text));
    if (flushTimerRef.current) return;

    flushTimerRef.current = window.setTimeout(async () => {
      const queuedTexts = [...pendingRef.current];
      pendingRef.current.clear();
      flushTimerRef.current = null;

      try {
        await translateAndStore(queuedTexts, language);
      } catch {
        // Keep the UI usable and retry naturally on later renders/mutations.
      }
    }, 60);
  }, [language, translateAndStore]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => () => {
    if (flushTimerRef.current) {
      window.clearTimeout(flushTimerRef.current);
    }
  }, []);

  useEffect(() => {
    const root = document.body;
    if (!root) return undefined;

    const translateDom = async () => {
      if (language === "en") {
        const elements = root.querySelectorAll("[data-runtime-i18n-placeholder],[data-runtime-i18n-title],[data-runtime-i18n-aria-label]");
        elements.forEach((element) => {
          if (element.dataset.runtimeI18nPlaceholder !== undefined) {
            element.setAttribute("placeholder", element.dataset.runtimeI18nPlaceholder);
          }
          if (element.dataset.runtimeI18nTitle !== undefined) {
            element.setAttribute("title", element.dataset.runtimeI18nTitle);
          }
          if (element.dataset.runtimeI18nAriaLabel !== undefined) {
            element.setAttribute("aria-label", element.dataset.runtimeI18nAriaLabel);
          }
        });

        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        let currentNode = walker.nextNode();
        while (currentNode) {
          if (currentNode.__runtimeI18nSource) {
            currentNode.textContent = currentNode.__runtimeI18nSource;
          }
          currentNode = walker.nextNode();
        }
        return;
      }

      const textNodes = [];
      const attributeTargets = [];
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let currentNode = walker.nextNode();

      while (currentNode) {
        const parentElement = currentNode.parentElement;
        const sourceText = getNodeSourceText(currentNode);

        if (!shouldIgnoreTextNode(parentElement) && isTranslatableText(sourceText)) {
          textNodes.push([currentNode, sourceText]);
        }
        currentNode = walker.nextNode();
      }

      root.querySelectorAll("input[placeholder], textarea[placeholder], [title], [aria-label]").forEach((element) => {
        if (element.hasAttribute("placeholder")) {
          const source = getAttributeSource(element, "placeholder");
          if (isTranslatableText(source)) {
            attributeTargets.push([element, "placeholder", source]);
          }
        }

        if (element.hasAttribute("title")) {
          const source = getAttributeSource(element, "title");
          if (isTranslatableText(source)) {
            attributeTargets.push([element, "title", source]);
          }
        }

        if (element.hasAttribute("aria-label")) {
          const source = getAttributeSource(element, "aria-label");
          if (isTranslatableText(source)) {
            attributeTargets.push([element, "aria-label", source]);
          }
        }
      });

      const sourceTexts = [
        ...textNodes.map(([, text]) => text),
        ...attributeTargets.map(([, , text]) => text)
      ];

      if (sourceTexts.length === 0) return;

      let translations = {};
      try {
        translations = await translateAndStore(sourceTexts, language);
      } catch {
        return;
      }

      textNodes.forEach(([node, sourceText]) => {
        node.textContent = translations[sourceText] || sourceText;
      });

      attributeTargets.forEach(([element, attributeName, sourceText]) => {
        element.setAttribute(attributeName, translations[sourceText] || sourceText);
      });
    };

    const observer = new MutationObserver(() => {
      translateDom();
    });

    translateDom();
    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["placeholder", "title", "aria-label"]
    });

    return () => observer.disconnect();
  }, [language, translateAndStore, version]);

  const value = useMemo(() => {
    return {
      language,
      setLanguage,
      ready: true,
      supportedLanguages: SUPPORTED_LANGUAGES,
      t: (key, fallback) => {
        const sourceText = fallback || key;
        if (!isTranslatableText(sourceText)) {
          return sourceText;
        }

        if (language === "en") {
          return sourceText;
        }

        const cached = getCachedTranslation(language, sourceText);
        if (cached) {
          return cached;
        }

        queueTranslations([sourceText]);
        return sourceText;
      }
    };
  }, [language, queueTranslations, setLanguage]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n() {
  return useContext(I18nContext);
}


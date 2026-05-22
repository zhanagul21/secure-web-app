import { useEffect } from "react";
import { useLanguage } from "./LanguageContext";
import { LANGUAGES, translateText } from "./translations";

const textSources = new WeakMap();
const attrSources = new WeakMap();
const TRANSLATABLE_ATTRS = ["placeholder", "title", "aria-label"];
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE"]);

function shouldSkipNode(node) {
  const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  if (!element) return true;
  if (SKIP_TAGS.has(element.tagName)) return true;
  return Boolean(element.closest("[data-i18n-ignore]"));
}

function isKnownTranslation(source, current) {
  return LANGUAGES.some((item) => translateText(source, item.code) === current);
}

function translateTextNode(node, language) {
  if (shouldSkipNode(node) || !node.nodeValue?.trim()) return;

  let source = textSources.get(node);
  const current = node.nodeValue;
  const expected = source ? translateText(source, language) : null;

  if (!source || (current !== expected && current !== source && !isKnownTranslation(source, current))) {
    source = current;
    textSources.set(node, source);
  }

  const translated = translateText(source, language);
  if (current !== translated) {
    node.nodeValue = translated;
  }
}

function translateElementAttributes(element, language) {
  if (shouldSkipNode(element)) return;

  TRANSLATABLE_ATTRS.forEach((attr) => {
    if (!element.hasAttribute(attr)) return;

    const current = element.getAttribute(attr);
    if (!current?.trim()) return;

    let sources = attrSources.get(element);
    if (!sources) {
      sources = {};
      attrSources.set(element, sources);
    }

    const expected = sources[attr] ? translateText(sources[attr], language) : null;
    if (!sources[attr] || (current !== expected && current !== sources[attr] && !isKnownTranslation(sources[attr], current))) {
      sources[attr] = current;
    }

    const translated = translateText(sources[attr], language);
    if (current !== translated) {
      element.setAttribute(attr, translated);
    }
  });
}

function walkAndTranslate(root, language) {
  if (!root) return;

  if (root.nodeType === Node.TEXT_NODE) {
    translateTextNode(root, language);
    return;
  }

  if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
    return;
  }

  if (root.nodeType === Node.ELEMENT_NODE) {
    translateElementAttributes(root, language);
  }

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT
  );

  let current = walker.nextNode();
  while (current) {
    if (current.nodeType === Node.TEXT_NODE) {
      translateTextNode(current, language);
    } else if (current.nodeType === Node.ELEMENT_NODE) {
      translateElementAttributes(current, language);
    }
    current = walker.nextNode();
  }
}

function GlobalTranslator() {
  const { language } = useLanguage();

  useEffect(() => {
    const root = document.getElementById("root");
    if (!root) return undefined;

    let frame = 0;
    const run = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        walkAndTranslate(root, language);
      });
    };

    run();

    const observer = new MutationObserver(run);
    observer.observe(root, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: TRANSLATABLE_ATTRS,
    });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [language]);

  return null;
}

export default GlobalTranslator;

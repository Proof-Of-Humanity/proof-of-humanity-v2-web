import { isAllowedIpfsGatewayUrl } from "utils/ipfs";

const ALLOWED_TAGS = new Set([
  "a",
  "blockquote",
  "br",
  "code",
  "dd",
  "div",
  "dl",
  "dt",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "img",
  "li",
  "ol",
  "p",
  "pre",
  "span",
  "strong",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "ul",
]);

const ALLOWED_ATTRIBUTES = new Set([
  "alt",
  "colspan",
  "href",
  "rowspan",
  "src",
  "title",
]);

const isAllowedLink = (url: string) => {
  try {
    const parsed = new URL(url);

    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
};

const sanitizeUrlAttribute = (element: Element, attribute: string) => {
  const value = element.getAttribute(attribute);

  if (!value) return;

  if (attribute === "href") {
    if (!isAllowedLink(value)) element.removeAttribute(attribute);
    return;
  }

  if (!isAllowedIpfsGatewayUrl(value)) element.removeAttribute(attribute);
};

const unwrap = (element: Element) => {
  element.replaceWith(...Array.from(element.childNodes));
};

export const sanitizeHtml = (html: string) => {
  const doc = new DOMParser().parseFromString(html, "text/html");

  doc
    .querySelectorAll("script, style, iframe, object, embed, form, input, meta")
    .forEach((element) => element.remove());

  Array.from(doc.body.querySelectorAll("*")).forEach((element) => {
    if (!ALLOWED_TAGS.has(element.tagName.toLowerCase())) {
      unwrap(element);
      return;
    }

    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();

      if (
        name.startsWith("on") ||
        name === "style" ||
        !ALLOWED_ATTRIBUTES.has(name)
      ) {
        element.removeAttribute(attribute.name);
      }
    });

    sanitizeUrlAttribute(element, "href");
    sanitizeUrlAttribute(element, "src");

    if (element.tagName.toLowerCase() === "a") {
      element.setAttribute("rel", "noopener noreferrer");
      element.setAttribute("target", "_blank");
    }
  });

  return doc.body.innerHTML;
};

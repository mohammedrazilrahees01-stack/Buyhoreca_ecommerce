/** Serialize JSON-LD safely inside an HTML script element.
 * Escaping HTML-sensitive characters prevents stored text such as `</script>`
 * in Shopify product/article fields from terminating the JSON-LD script early.
 */
const HTML_SCRIPT_ESCAPES: Record<string, string> = {
  "<": "\\u003c",
  ">": "\\u003e",
  "&": "\\u0026",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029",
};

export function serializeJsonLd(value: unknown): string {
  const serialized = JSON.stringify(value);
  if (serialized === undefined) return "null";
  return serialized.replace(/[<>&\u2028\u2029]/g, (character) => HTML_SCRIPT_ESCAPES[character] || character);
}

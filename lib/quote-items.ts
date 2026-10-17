/** Idempotently add a directly requested product variant to an existing quote basket. */
export type QuoteItemLike<P extends { id: string }> = {
  id: string;
  product: P;
  variantId: string;
  quantity: number;
};

export function mergeQuoteProduct<P extends { id: string }, T extends QuoteItemLike<P>>(
  items: T[],
  product: P,
  variantId: string,
  makeItem: (product: P, variantId: string) => T,
): T[] {
  if (!variantId) return items;
  const alreadyPresent = items.some(
    (item) => item.product.id === product.id && item.variantId === variantId,
  );
  if (alreadyPresent) return items;
  return [...items, makeItem(product, variantId)];
}

export type ShopifyConnectionPage<T> = {
  nodes?: T[];
  pageInfo?: { hasNextPage?: boolean; endCursor?: string | null };
};

/** Resolve a Shopify connection at a dotted path or from a root response object.
 * Article connections are nested at data.blog.articles, unlike products/collections.
 */
export function connectionPageFrom<T>(data: unknown, path?: string): ShopifyConnectionPage<T> | null {
  let candidate: any = data;
  if (path) {
    for (const key of path.split(".")) candidate = candidate?.[key];
  } else if (candidate && typeof candidate === "object") {
    candidate = Object.values(candidate).find((value: any) =>
      value && typeof value === "object" && Array.isArray(value.nodes) && value.pageInfo,
    );
  }
  if (!candidate || typeof candidate !== "object" || !candidate.pageInfo) return null;
  return {
    nodes: Array.isArray(candidate.nodes) ? candidate.nodes as T[] : [],
    pageInfo: candidate.pageInfo,
  };
}

/** Collect a paginated Shopify connection, stopping on missing/repeated cursors.
 * A finite page budget prevents a malformed or repeated cursor from creating an
 * unbounded request loop. With Shopify's 250-item page maximum, 100 pages can
 * collect up to 25,000 items from a single connection.
 */
export async function collectPages<T>(
  fetchPage: (after: string | null) => Promise<ShopifyConnectionPage<T>>,
  maxPages = 100,
): Promise<T[]> {
  const items: T[] = [];
  const seenCursors = new Set<string>();
  let after: string | null = null;

  for (let page = 0; page < maxPages; page += 1) {
    const connection = await fetchPage(after);
    const nextCursor = connection.pageInfo?.endCursor || null;
    const hasMore = Boolean(connection.pageInfo?.hasNextPage);

    // Do not append a repeated page: Shopify (or a proxy) may return an
    // unchanged cursor during a transient failure, which would duplicate items.
    if (hasMore && nextCursor && (nextCursor === after || seenCursors.has(nextCursor))) break;
    if (Array.isArray(connection.nodes)) items.push(...connection.nodes);
    if (!hasMore || !nextCursor) break;

    seenCursors.add(nextCursor);
    after = nextCursor;
  }

  return items;
}

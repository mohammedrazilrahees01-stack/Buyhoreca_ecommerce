import type { MetadataRoute } from "next";

const base="https://buyhoreca.com";
const domain=process.env.SHOPIFY_STORE_DOMAIN||process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN||"buyhoreca.myshopify.com";
const token=process.env.SHOPIFY_STOREFRONT_TOKEN||process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN||"";
const version=process.env.SHOPIFY_API_VERSION||process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION||"2026-07";
const endpoint=`https://${domain}/api/${version}/graphql.json`;

async function gql<T>(query:string,variables:Record<string,unknown>):Promise<T|null>{if(!token)return null;try{const r=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json","X-Shopify-Storefront-Access-Token":token},body:JSON.stringify({query,variables}),next:{revalidate:900}});if(!r.ok)return null;const j=await r.json();return j.data??null}catch{return null}}

const PRODUCTS_QUERY=`query Products($first:Int!,$after:String){products(first:$first,after:$after,sortKey:UPDATED_AT,reverse:true){pageInfo{hasNextPage endCursor}nodes{handle updatedAt}}}`;
const COLLECTIONS_QUERY=`query Collections($first:Int!,$after:String){collections(first:$first,after:$after,sortKey:UPDATED_AT,reverse:true){pageInfo{hasNextPage endCursor}nodes{handle updatedAt}}}`;
const BLOGS_QUERY=`query Blogs($first:Int!,$after:String){blogs(first:$first,after:$after,sortKey:TITLE){pageInfo{hasNextPage endCursor}nodes{id handle title}}}`;
const ARTICLES_QUERY=`query Articles($blog:String!,$first:Int!,$after:String){blog(handle:$blog){articles(first:$first,after:$after,sortKey:PUBLISHED_AT,reverse:true){pageInfo{hasNextPage endCursor}nodes{handle publishedAt blog{handle}}}}}`;

async function collectPaged<T extends {pageInfo:{hasNextPage:boolean;endCursor:string|null};nodes:any[]}>(query:string,baseVars:Record<string,unknown>,first=250){let after:string|null=null;const nodes:any[]=[];do{const data:any=await gql<any>(query,{...baseVars,first,after});if(!data)break;const connection=Object.values(data)[0] as T|undefined;if(!connection)break;nodes.push(...(connection.nodes||[]));after=connection.pageInfo?.hasNextPage?connection.pageInfo.endCursor:null;}while(after);return nodes;}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
 const staticPaths=["/","/shop","/categories","/brands","/business","/collections","/blog","/about","/contact","/faq","/shipping","/quote"];
 const [products,collections,blogs]=await Promise.all([collectPaged(PRODUCTS_QUERY,{}),collectPaged(COLLECTIONS_QUERY,{}),collectPaged(BLOGS_QUERY,{},50)]);
 const productEntries=products.map((x:any)=>({url:`${base}/products/${x.handle}`,lastModified:x.updatedAt?new Date(x.updatedAt):undefined}));
 const collectionEntries=collections.map((x:any)=>({url:`${base}/categories/${x.handle}`,lastModified:x.updatedAt?new Date(x.updatedAt):undefined}));
 const articleEntries:any[]=[];
 for(const b of blogs){const articles=await collectPaged(ARTICLES_QUERY,{blog:b.handle},250);for(const a of articles){const bh=a.blog?.handle||b.handle;articleEntries.push({url:`${base}/blog/${bh}/${a.handle}`,lastModified:a.publishedAt?new Date(a.publishedAt):undefined});}}
 const seen=new Set<string>();
 return [...staticPaths.map(url=>({url:`${base}${url}`})),...productEntries,...collectionEntries,...articleEntries].filter((x:any)=>{if(seen.has(x.url))return false;seen.add(x.url);return true;});
}

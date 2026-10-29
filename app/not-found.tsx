import { T } from "../lib/i18n";
import Link from "next/link";
export default function NotFound(){return <main className="grid min-h-screen place-items-center p-8"><div className="text-center"><h1 className="text-4xl font-semibold"><T text={"404"} /></h1><p className="mt-3 text-slate-600"><T text={"Page not found."} /></p><Link href="/" className="mt-6 inline-block rounded bg-[#008f68] px-6 py-3 font-bold text-white"><T text={"Back home"} /></Link></div></main>}

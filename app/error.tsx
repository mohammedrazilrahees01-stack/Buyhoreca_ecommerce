"use client";
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="grid min-h-screen place-items-center p-8"><div className="max-w-xl text-center"><h1 className="text-3xl font-black">Something went wrong</h1><p className="mt-3 text-slate-600">Please try again.</p><button type="button" onClick={reset} className="mt-6 rounded bg-[#008f68] px-6 py-3 font-bold text-white">Try again</button></div></main>;
}

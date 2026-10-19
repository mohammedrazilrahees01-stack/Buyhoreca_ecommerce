"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bot, ChevronDown, LoaderCircle, MessageCircle, Send, Sparkles, Truck, X } from "lucide-react";

type ProductSuggestion = { title: string; handle: string; vendor: string; productType: string; availableForSale: boolean; imageUrl: string; price: string; currencyCode: string };
type ChatMessage = { id: string; role: "user" | "assistant"; content: string; products?: ProductSuggestion[]; actionUrl?: string; actionLabel?: string; supportUrl?: string; supportLabel?: string };

const starter = "Hi! I’m BuyHoreca AI. Ask me about HoReCa products, prices, categories, brands or bulk quotes. I can search the live Shopify catalogue to help you choose.";
const suggestions = ["Find stainless-steel GN pans", "Recommend kitchen equipment", "How do I request a bulk quote?"];

function isSimpleGreeting(message: string) {
  const normalized = message.toLowerCase().replace(/[.,!?👋😊🙏]+/g, " ").trim().replace(/\s+/g, " ");
  return /^(hi|hello|hey|hiya|good morning|good afternoon|good evening|salaam|salam|assalamu alaikum|assalamualaikum|مرحبا|السلام عليكم)( there)?$/.test(normalized);
}

const SUPPORT_URL = "https://wa.me/971565334464";
const SUPPORT_FALLBACK = "I’m sorry, I couldn’t complete that request just now. Please try again, browse our products, or message our team on WhatsApp and we’ll be happy to help.";

function money(amount: string, currency: string) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "Price on product page";
  try { return new Intl.NumberFormat("en-AE", { style: "currency", currency: currency || "AED", maximumFractionDigits: 2 }).format(value); }
  catch { return `${currency || "AED"} ${value.toFixed(2)}`; }
}

export default function BuyHorecaAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: "welcome", role: "assistant", content: starter }]);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (open) { logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" }); inputRef.current?.focus(); } }, [open, messages, busy]);
  useEffect(() => { const onKey = (event: globalThis.KeyboardEvent) => { if (event.key === "Escape") setOpen(false); }; window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, []);

  async function sendMessage(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    const userMessage: ChatMessage = { id: `${Date.now()}-user`, role: "user", content: message };
    const previous = messages.filter(m => m.id !== "welcome").slice(-6).map(m => ({ role: m.role, content: m.content }));
    setMessages(current => [...current, userMessage]);
    setInput("");

    // Greetings are a normal part of customer support. Answer them instantly without
    // requiring the AI provider to be configured or spending an inference request.
    if (isSimpleGreeting(message)) {
      setMessages(current => [...current, {
        id: `${Date.now()}-greeting`,
        role: "assistant",
        content: "Hi! Welcome to BuyHoreca 👋 What can I help you find today? You can ask about products, categories, or bulk orders.",
      }]);
      return;
    }

    setBusy(true);
    try {
      const response = await fetch("/api/ai-assistant", {
        method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store",
        body: JSON.stringify({ message, history: previous }),
      });
      const data = await response.json() as { answer?: string; error?: string; code?: string; products?: ProductSuggestion[]; actionUrl?: string; actionLabel?: string; supportUrl?: string; supportLabel?: string };
      if (data.code === "AI_NOT_CONFIGURED") {
        setMessages(current => [...current, {
          id: `${Date.now()}-unavailable`, role: "assistant", content: SUPPORT_FALLBACK,
          supportUrl: SUPPORT_URL, supportLabel: "Chat with BuyHoreca support",
        }]);
        return;
      }
      if (!response.ok || !data.answer) {
        const reply = response.status === 429
          ? "We’re receiving too many requests right now. Please wait a moment, or contact our team on WhatsApp for help."
          : SUPPORT_FALLBACK;
        setMessages(current => [...current, {
          id: `${Date.now()}-unavailable`, role: "assistant", content: reply,
          supportUrl: SUPPORT_URL, supportLabel: "Chat with BuyHoreca support",
        }]);
        return;
      }
      setMessages(current => [...current, { id: `${Date.now()}-assistant`, role: "assistant", content: data.answer!, products: data.products || [], actionUrl: data.actionUrl, actionLabel: data.actionLabel, supportUrl: data.supportUrl, supportLabel: data.supportLabel }]);
    } catch {
      setMessages(current => [...current, {
        id: `${Date.now()}-error`, role: "assistant", content: SUPPORT_FALLBACK,
        supportUrl: SUPPORT_URL, supportLabel: "Chat with BuyHoreca support",
      }]);
    } finally { setBusy(false); }
  }

  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void sendMessage(input); }
  function onInputKey(event: KeyboardEvent<HTMLInputElement>) { if (event.key === "Escape") setOpen(false); }

  return <>
    {open && <section style={{ position: "fixed", right: "12px", bottom: "156px", zIndex: 110, maxHeight: "min(620px, calc(100dvh - 180px))", width: "min(392px, calc(100vw - 24px))" }} className="bh-ai-panel flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:right-5" role="dialog" aria-modal="false" aria-label="BuyHoreca AI assistant">
      <header className="flex items-center gap-3 bg-[#0b2b22] px-4 py-3.5 text-white">
        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10"><Bot size={21}/></div>
        <div className="min-w-0 flex-1"><p className="text-sm font-semibold">BuyHoreca AI</p><p className="mt-0.5 text-[11px] text-white/75">Product and HoReCa assistant</p></div>
        <button type="button" onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-lg hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white" aria-label="Close BuyHoreca AI"><X size={18}/></button>
      </header>
      <div ref={logRef} className="bh-ai-messages flex min-h-[180px] flex-1 flex-col gap-3 overflow-y-auto overscroll-contain bg-[#f8faf9] p-3.5" aria-live="polite" aria-relevant="additions text">
        {messages.map(m => <div key={m.id} className={`max-w-[94%] rounded-xl px-3.5 py-3 text-sm leading-6 ${m.role === "user" ? "ml-auto bg-[#008f68] text-white" : "mr-auto border border-slate-200 bg-white text-slate-800"}`}>
          <p className="whitespace-pre-wrap break-words">{m.content}</p>
          {m.actionUrl && m.actionLabel && <Link href={m.actionUrl} onClick={() => setOpen(false)} className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-lg bg-[#008f68] px-3 py-2 text-xs font-semibold text-white hover:bg-[#007b5a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#008f68]">{m.actionLabel}<ChevronDown size={14} className="-rotate-90"/></Link>}
          {m.supportUrl && <a href={m.supportUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-lg bg-[#008f68] px-3 py-2 text-xs font-semibold text-white hover:bg-[#007b5a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#008f68]">{m.supportLabel || "Contact support"}<MessageCircle size={14}/></a>}
          {m.products?.length ? <div className="mt-3 grid gap-2">{m.products.map(p => <Link key={p.handle} href={`/products/${p.handle}`} onClick={() => setOpen(false)} className="flex min-w-0 items-center gap-3 rounded-lg border border-slate-200 bg-white p-2.5 text-slate-800 transition hover:border-[#008f68] hover:bg-[#f7fbf8]">
            <div className="size-14 shrink-0 overflow-hidden rounded-md bg-slate-100">{p.imageUrl ? <img src={p.imageUrl} alt={p.title} loading="lazy" className="h-full w-full object-contain"/> : <div className="grid h-full place-items-center text-slate-400"><Bot size={22}/></div>}</div>
            <div className="min-w-0 flex-1"><p className="line-clamp-2 text-xs font-semibold leading-4">{p.title}</p><p className="mt-1 text-[11px] text-[#008f68]">{p.price ? money(p.price, p.currencyCode) : "View product details"}</p><p className="mt-0.5 text-[10px] text-slate-500">{p.availableForSale ? "Listed as available" : "Check availability / request a quote"}</p></div><Truck size={15} className="shrink-0 text-slate-400"/>
          </Link>)}</div> : null}
        </div>)}
        {busy && <div className="mr-auto flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-xs text-slate-500"><LoaderCircle size={15} className="animate-spin"/>Checking BuyHoreca information…</div>}
        {messages.length === 1 && <div className="mt-1 grid gap-2">{suggestions.map(s => <button key={s} type="button" onClick={() => void sendMessage(s)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-700 hover:border-[#008f68] hover:text-[#007b5a]">{s}</button>)}</div>}
      </div>
      <div className="border-t border-slate-200 bg-white p-3">
        <form onSubmit={submit} className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white p-1.5 focus-within:border-[#008f68] focus-within:ring-2 focus-within:ring-[#008f68]/10">
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={onInputKey} maxLength={1000} disabled={busy} placeholder="Ask about products or quotes…" aria-label="Message BuyHoreca AI" className="h-10 min-w-0 flex-1 bg-transparent px-2 text-sm outline-none disabled:opacity-60"/>
          <button type="submit" disabled={busy || !input.trim()} className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#008f68] text-white disabled:cursor-not-allowed disabled:opacity-50" aria-label="Send message"><Send size={16}/></button>
        </form>
        <p className="mt-2 text-[10px] leading-4 text-slate-500">Uses live catalogue matches. Please don’t enter passwords, sign-in codes or payment details.</p>
        <Link href="/track-order" onClick={() => setOpen(false)} className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-[#007b5a] hover:underline"><Truck size={13}/> Track shipment <ChevronDown size={13} className="-rotate-90"/></Link>
      </div>
    </section>}
    <button type="button" onClick={() => setOpen(o => !o)} style={{ position: "fixed", right: "20px", bottom: "88px", zIndex: 111 }} className="bh-ai-launcher grid size-14 place-items-center rounded-full border-2 border-white bg-[#0b2b22] text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-[#008f68] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#008f68]" aria-label={open ? "Close BuyHoreca AI assistant" : "Open BuyHoreca AI assistant"} aria-expanded={open} title="Ask BuyHoreca AI">
      {open ? <X size={23}/> : <Sparkles size={24}/>}
      {!open && <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full border-2 border-white bg-[#19b96a] text-[10px] font-bold text-white">AI</span>}
    </button>
  </>;
}

"use client";

import Link from "next/link";
import { CSSProperties, useMemo } from "react";

export function HorizonHeroSection() {
  const stars = useMemo(() => Array.from({ length: 100 }, (_, i) => ({ left: `${(i * 37.7) % 100}%`, top: `${(i * 71.3) % 100}%`, delay: `${-(i % 6)}s`, size: 1 + (i % 3) })), []);
  return <main className="horizon">
    <div className="stars" aria-hidden>{stars.map((s, i) => <i key={i} style={{ left: s.left, top: s.top, width: s.size, height: s.size, animationDelay: s.delay } as CSSProperties} />)}</div><div className="nebula one" /><div className="nebula two" />
    <nav><Link className="brand" href="/">✦ StudySathi<span>AI</span></Link><div><Link href="/login">Log in</Link><Link className="pill" href="/signup">Start free ↗</Link></div></nav>
    <section className="hero"><aside>☰<small>STUDY SPACE</small></aside><div className="copy"><p className="kicker">— YOUR PERSONAL LEARNING UNIVERSE</p><h1>TURN NOTES<br /><em>INTO CLARITY.</em></h1><p className="lead">Upload your class notes. Ask in Hinglish. Get summaries, revision tools and answers grounded in what you actually need to study.</p><div className="actions"><Link className="cta" href="/signup">Create your study space <b>→</b></Link><a href="#how">See how it works ↓</a></div><p className="proof">● ● ● &nbsp; <strong>Built for students.</strong> Made for the night before exams.</p></div><div className="orbit" aria-hidden><div className="ring r1" /><div className="ring r2" /><div className="planet">AI</div><label className="l1">PDF NOTES</label><label className="l2">HINGLISH</label><label className="l3">REVISION</label></div><p className="scroll">SCROLL TO EXPLORE —</p></section>
    <section id="how" className="intro"><p className="kicker">— A SIMPLE ORBIT</p><h2>Your notes.<br /><em>Smarter momentum.</em></h2><p>StudySathi stays close to the material you upload—so revision feels focused, not scattered.</p></section>
    <section className="cards"><Card n="01" t="Bring your notes" d="Upload a class PDF and create a private study room in seconds." /><Card n="02" t="Ask naturally" d="Ask doubts in English, Hindi, or Hinglish with source-page answers." /><Card n="03" t="Revise with intent" d="Generate summaries, important questions, MCQs and flashcards." /></section>
    <section className="close"><p className="kicker">— YOUR NEXT SESSION STARTS HERE</p><h2>Make your syllabus<br /><em>feel possible.</em></h2><Link className="cta" href="/signup">Enter StudySathi <b>→</b></Link></section><footer>© 2026 STUDYSATHI AI <span>PRIVATE BY DESIGN · BUILT FOR LEARNING</span></footer>
  </main>;
}
function Card({ n, t, d }: { n: string; t: string; d: string }) { return <article><span>{n}</span><i>✦</i><h3>{t}</h3><p>{d}</p></article>; }

/* oxlint-disable next/no-html-link-for-pages */
import type { ReactNode } from "react";

export function ArchivePage({ kicker, title, intro, children }: { kicker: string; title: string; intro: string; children: ReactNode }) {
  return <main className="dossier archive-page"><header className="topbar"><a className="wordmark" href="/">ARQUIVO INACABADO<span>_</span></a><a className="back-link" href="/">← VOLTAR AO ÍNDICE</a></header><article className="dossier-inner"><div className="eyebrow">{kicker}</div><h1>{title}</h1><p className="dossier-lede">{intro}</p>{children}<div className="dossier-footer"><a className="button button-primary" href="/">Voltar ao arquivo ↗</a><span>Arquivo local · canon congelado em 069</span></div></article></main>;
}

export function ArchiveSection({ label, title, children }: { label: string; title: string; children: ReactNode }) { return <section className="dossier-section"><div className="eyebrow">{label}</div><h2>{title}</h2>{children}</section>; }

import { useState } from 'react';

/** Image that shows a labelled placeholder (never a broken icon) when the committed file is missing. */
export function Img({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  const [bad, setBad] = useState(false);
  if (bad || !src) return <Pending path={src} className={className} />;
  return <img src={src} alt={alt} className={className} onError={() => setBad(true)} />;
}

export function Pending({ path, className = '' }: { path: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center bg-ink-800 border border-dashed border-ink-600 text-ink-400 text-[11px] text-center p-2 ${className}`}>
      Asset pending<br />{path}
    </div>
  );
}

export const Button = ({ children, onClick, primary, disabled, className = '', title }: {
  children: React.ReactNode; onClick?: () => void; primary?: boolean; disabled?: boolean; className?: string; title?: string;
}) => (
  <button
    onClick={onClick} disabled={disabled} title={title}
    className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
      primary ? 'bg-gold-400 text-ink-950 hover:bg-gold-300' : 'bg-ink-700 text-ink-50 hover:bg-ink-600 border border-ink-600'
    } ${className}`}
  >{children}</button>
);

export const Panel = ({ title, children, className = '' }: { title?: string; children: React.ReactNode; className?: string }) => (
  <section className={`rounded-xl border border-ink-700 bg-ink-900 p-5 ${className}`}>
    {title && <h2 className="font-display text-lg text-gold-400 mb-3">{title}</h2>}
    {children}
  </section>
);

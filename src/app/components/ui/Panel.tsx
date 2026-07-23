import { ReactNode } from 'react';

interface PanelProps {
  children: ReactNode;
  title?: string;
  icon?: ReactNode;
  right?: ReactNode;
  className?: string;
  bodyClassName?: string;
  flush?: boolean;
}

/**
 * Industrial panel — hard 2px border, no radius, hard shadow, optional
 * mono header label. Base building block of the KOS UI.
 */
export function Panel({ children, title, icon, right, className = '', bodyClassName = '', flush }: PanelProps) {
  return (
    <section className={`bg-card border-2 border-border shadow-[var(--shadow-hard)] ${className}`}>
      {title && (
        <header className="flex items-center justify-between gap-2 px-4 py-2.5 border-b-2 border-border bg-primary/5">
          <div className="flex items-center gap-2 text-primary">
            {icon}
            <span className="text-xs font-bold uppercase tracking-[0.14em] mono">{title}</span>
          </div>
          {right}
        </header>
      )}
      <div className={flush ? '' : `p-4 ${bodyClassName}`}>{children}</div>
    </section>
  );
}

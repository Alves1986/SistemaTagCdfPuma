interface TechLabelProps {
  children: React.ReactNode;
  className?: string;
}

/** Mono uppercase technical label, e.g. TAG // COMPLETO, SYS // CALDEIRA */
export function TechLabel({ children, className = '' }: TechLabelProps) {
  return <span className={`font-mono text-[0.7rem] tracking-[0.14em] uppercase text-muted-foreground ${className}`}>{children}</span>;
}

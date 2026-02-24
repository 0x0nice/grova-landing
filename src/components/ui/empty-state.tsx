interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface EmptyStateProps {
  icon?: string;
  heading: string;
  description?: string;
  action?: EmptyStateAction;
}

export function EmptyState({ icon, heading, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      {icon && <span className="text-[2.5rem] mb-4">{icon}</span>}
      <h3 className="font-serif text-title text-text2 mb-2">{heading}</h3>
      {description && (
        <p className="font-mono text-callout text-text3 max-w-[360px]">
          {description}
        </p>
      )}
      {action && (
        action.href ? (
          <a
            href={action.href}
            className="mt-5 font-mono text-footnote text-accent hover:text-accent/80 transition-colors uppercase tracking-[0.04em]"
          >
            {action.label} →
          </a>
        ) : action.onClick ? (
          <button
            onClick={action.onClick}
            className="mt-5 font-mono text-footnote text-accent hover:text-accent/80 transition-colors cursor-pointer uppercase tracking-[0.04em]"
          >
            {action.label} →
          </button>
        ) : null
      )}
    </div>
  );
}

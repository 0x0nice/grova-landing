interface EmptyStateProps {
  icon?: string;
  heading: string;
  description?: string;
}

export function EmptyState({ icon, heading, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      {icon && <span className="text-[2rem] mb-4">{icon}</span>}
      <h3 className="font-serif text-title text-text mb-2">{heading}</h3>
      {description && (
        <p className="font-mono text-callout text-text3 max-w-[360px]">
          {description}
        </p>
      )}
    </div>
  );
}

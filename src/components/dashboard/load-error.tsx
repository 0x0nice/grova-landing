interface LoadErrorProps {
  message: string;
  onRetry: () => void;
}

export function LoadError({ message, onRetry }: LoadErrorProps) {
  return (
    <div className="border-y border-border py-10 my-4">
      <p className="font-serif text-title text-text mb-2">Feedback could not be loaded.</p>
      <p className="text-callout text-text2 max-w-xl mb-5">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="border border-border bg-surface px-4 py-2 rounded text-footnote text-text hover:border-text3 transition-colors cursor-pointer"
      >
        Try again
      </button>
    </div>
  );
}

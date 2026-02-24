import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  href?: string;
  muted?: boolean;
}

const sizes = {
  sm: { dot: 8, text: "text-[1.2rem]", gap: "gap-1.5" },
  md: { dot: 10, text: "text-[1.6rem]", gap: "gap-2" },
  lg: { dot: 13, text: "text-[2.8rem]", gap: "gap-2" },
};

export function Logo({ size = "md", href = "/", muted = false }: LogoProps) {
  const s = sizes[size];
  const color = muted ? "text-text3" : "text-text";

  const content = (
    <span className={`inline-flex items-center ${s.gap}`}>
      <span
        className="inline-block rounded-full bg-accent shrink-0"
        style={{ width: s.dot, height: s.dot }}
      />
      <span className={`font-serif ${s.text} ${color} leading-none`}>
        grova
      </span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="no-underline hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}

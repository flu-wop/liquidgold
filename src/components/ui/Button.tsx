import Link from "next/link";
import { clsx } from "clsx";

type ButtonProps = {
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
};

const variants = {
  primary: "bg-guava text-cream hover:bg-hibiscus",
  secondary: "bg-lagoon text-cream hover:bg-lagoon-deep",
  ghost: "bg-transparent text-cocoa border border-cocoa/30 hover:border-cocoa",
};

export default function Button({
  href,
  variant = "primary",
  children,
  className,
  onClick,
  type = "button",
}: ButtonProps) {
  const classes = clsx(
    "inline-flex items-center justify-center rounded-full px-7 py-3 font-body font-semibold text-sm tracking-wide transition-colors duration-200",
    variants[variant],
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}

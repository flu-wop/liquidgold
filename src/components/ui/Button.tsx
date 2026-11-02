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
  primary: "bg-guava-deep text-cream hover:bg-guava-ink",
  secondary: "bg-lagoon-deep text-cream hover:bg-cocoa",
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
    // Subtle lift on hover, press-in on tap. Transform + colour only;
    // motion-reduce keeps the colour change and drops the movement.
    "inline-flex min-h-[44px] items-center justify-center rounded-full px-7 py-3 font-body font-semibold text-sm tracking-wide transition-[background-color,border-color,color,transform,box-shadow] duration-200 ease-out hover:-translate-y-px hover:shadow-[0_10px_24px_-14px_rgba(58,35,24,0.6)] active:translate-y-0 active:scale-[0.98] motion-reduce:transform-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100",
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

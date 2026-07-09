import Link, { LinkProps } from "next/link";
import { twMerge } from "tailwind-merge";

const ExternalLink: React.FC<
  LinkProps &
    React.AnchorHTMLAttributes<HTMLAnchorElement> & {
      className?: string;
      children: React.ReactNode;
    }
> = ({ children, className, ...props }) => (
  <Link
    className={twMerge(
      // Kill browser default blue link/hover unless caller overrides.
      "text-primaryText hover:text-orange transition-colors duration-200",
      className,
    )}
    rel="noopener noreferrer"
    target="_blank"
    {...props}
  >
    {children}
  </Link>
);

export default ExternalLink;

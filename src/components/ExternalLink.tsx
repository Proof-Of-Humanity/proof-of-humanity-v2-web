import Link, { LinkProps } from 'next/link';

const ExternalLink: React.FC<LinkProps & { className?: string; children: React.ReactNode }> = ({
  children,
  className,
  ...props
}) => (
  <Link className={className} rel="noopener noreferrer" target="_blank" {...props}>
    {children}
  </Link>
);

export default ExternalLink;

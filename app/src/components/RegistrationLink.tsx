import { Link, type LinkProps } from 'react-router-dom';
import { useRegistrationEntryPath } from '@/hooks/useRegistrationEntryPath';

type RegistrationLinkProps = Omit<LinkProps, 'to'>;

/** Nav/home CTA that lands on the right event when only one registration is open. */
export default function RegistrationLink({ children, ...props }: RegistrationLinkProps) {
  const { href } = useRegistrationEntryPath();
  return (
    <Link to={href} {...props}>
      {children}
    </Link>
  );
}

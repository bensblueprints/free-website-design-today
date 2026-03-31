import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Client Portal | FreeWebsiteDesign.today',
  description: 'Sign in to manage your website project.',
  robots: 'noindex, nofollow',
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

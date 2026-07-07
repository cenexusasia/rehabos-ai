import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RehabOS AI — Developer Documentation',
  description:
    'Architecture, API references, and implementation guides for the RehabOS AI platform.',
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

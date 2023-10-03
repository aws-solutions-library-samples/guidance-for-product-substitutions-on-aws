import '@cloudscape-design/global-styles/index.css';
import type { Metadata } from 'next';
import { Layout } from './components/Layout';

export const metadata: Metadata = {
  title: 'Substitutions',
  description: 'Guidance for Product Substitutions on AWS',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}

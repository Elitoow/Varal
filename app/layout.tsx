import type { Metadata } from 'next';
import './globals.css';
import './dossier.css';

export const metadata: Metadata = {
  title: 'Arquivo Inacabado_ — The Unfinished Archive',
  description: 'Um arquivo de coisas que decidimos tentar. A historical collection of unfinished projects and experiments.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}

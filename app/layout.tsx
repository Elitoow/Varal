import type { Metadata } from 'next';
import './globals.css';
import './dossier.css';
import './varal.css';

export const metadata: Metadata = {
  title: 'VARAL_do_arquivo — pendure qualquer coisa',
  description: 'Um varal de projetos inacabados. Uma rede social para mostrar projetos como no itch.io e Instagram.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}

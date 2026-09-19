import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'One Peaxel Fighting Game',
    description:
        'Jeu de combat 2D en ligne jouable dans le navigateur, inspiré de One Piece: Gigant Battle! 2.',
    applicationName: 'One Peaxel Fighting Game',
    icons: { icon: '/icon.svg' }
};

export const viewport: Viewport = {
    themeColor: '#05060a',
    width: 'device-width',
    initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }): React.ReactElement {
    return (
        <html lang="fr">
            <body className="min-h-dvh antialiased">{children}</body>
        </html>
    );
}

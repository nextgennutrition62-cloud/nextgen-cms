import './globals.css';

export const metadata = {
  metadataBase: new URL('https://nutritionnextgen.com'),
  title: {
    default: 'NEXT GEN Nutrition | CLEANPRO Протеин — Без шеќер, без глутен',
    template: '%s | NEXT GEN Nutrition',
  },
  description: 'CLEANPRO е 100% Milk Protein без шеќер, без глутен, без лактоза. 30g протеин по оброк, 33 оброци. Нарачај онлајн — достава низ цела Македонија.',
  keywords: ['протеин Македонија', 'CLEANPRO', 'whey protein', 'протеин без шеќер', 'NextGen Nutrition', 'суплементи Македонија', 'milk protein'],
  authors: [{ name: 'NEXT GEN Nutrition' }],
  creator: 'NEXT GEN Nutrition',
  openGraph: {
    type: 'website',
    locale: 'mk_MK',
    url: 'https://nutritionnextgen.com',
    siteName: 'NEXT GEN Nutrition',
    title: 'NEXT GEN Nutrition | CLEANPRO Протеин — Без шеќер, без глутен',
    description: 'CLEANPRO е 100% Milk Protein без шеќер, без глутен, без лактоза. 30g протеин по оброк. Нарачај онлајн — достава низ цела Македонија.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'NEXT GEN Nutrition CLEANPRO Protein',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NEXT GEN Nutrition | CLEANPRO Протеин',
    description: '100% Milk Protein без шеќер. 30g протеин по оброк.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="mk">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

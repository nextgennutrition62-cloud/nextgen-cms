import './globals.css';

export const metadata = {
  title: 'NEXT GEN Nutrition | Протеини и суплементи за подобри навики',
  description: 'NEXT GEN Nutrition создава производи што помагаат во градење подобри навики, внес на протеин и активен животен стил.',
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

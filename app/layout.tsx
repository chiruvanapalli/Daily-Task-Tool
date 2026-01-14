
import './globals.css';
import { Plus_Jakarta_Sans } from 'next/font/google';

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'Work Space - Enterprise Portal',
  description: 'Centralized task tracking and reporting tool.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body className={`${jakarta.className} bg-[#f8fafc] text-slate-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}

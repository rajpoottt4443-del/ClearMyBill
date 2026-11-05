import React from 'react';
import { Analytics } from '@vercel/analytics/react';

export const metadata = {
  title: 'ClearMyBill - Global Peer-to-Peer Bill Relief Platform',
  description: 'Upload your utility, medical, or grocery bills and get them paid within 48 hours by worldwide donors.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}

import React from 'react';
import { Analytics } from '@vercel/analytics/react';

export const metadata = {
  title: 'ClearMyBill – Online Bill Relief Platform | Utility & Medical Bill Payment Assistance',
  description: 'ClearMyBill is a transparent peer-to-peer bill payment assistance platform connecting families needing utility, electricity, gas, water, and medical bill relief with direct donors across Pakistan and worldwide.',
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

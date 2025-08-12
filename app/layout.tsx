import '@mantine/core/styles.css';

import React from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';
import { ColorSchemeScript, mantineHtmlProps, MantineProvider } from '@mantine/core';
import { theme } from '../theme';

export const metadata = {
  title: 'UFO 50 Bingo',
  description: 'Organize games or practice goals!',
};

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.png" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <MantineProvider theme={theme}>{children}</MantineProvider>
      </body>
      <GoogleAnalytics gaId="G-FP1JEFSLS3" />
    </html>
  );
}

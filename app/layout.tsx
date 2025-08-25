import '@mantine/core/styles.css';

import React from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';
import { AppShell, ColorSchemeScript, mantineHtmlProps, MantineProvider } from '@mantine/core';
import { theme } from '../theme';
import { AppContextProvider } from './AppContextProvider';
import Nav from './Nav';
import Shell from './Shell';

export const metadata = {
  title: 'UFO 50 Bingo',
  description: 'Organize games or practice goals!',
};

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
        <link rel="shortcut icon" href="/favicon.png" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <MantineProvider defaultColorScheme="dark" theme={theme}>
          <AppContextProvider>
            <Shell>
              <Nav />
              {children}
            </Shell>
          </AppContextProvider>
        </MantineProvider>
      </body>
      <GoogleAnalytics gaId="G-FP1JEFSLS3" />
    </html>
  );
}

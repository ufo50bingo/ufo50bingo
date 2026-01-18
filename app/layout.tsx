import "@mantine/core/styles.css";
import "@mantine/tiptap/styles.css";

import React, { ReactNode, Suspense } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";
import {
  ColorSchemeScript,
  mantineHtmlProps,
  MantineProvider,
} from "@mantine/core";
import { theme } from "../theme";
import { AppContextProvider } from "./AppContextProvider";
import Shell from "./Shell";
import { Metadata } from "next";
import {
  PracticeVariantInit,
  PracticeVariantProvider,
} from "./PracticeVariantContext";

export const metadata: Metadata = {
  title: "UFO 50 Bingo",
  description: "Your home for UFO 50 Bingo. Create a match, watch streams, view results, practice goals, or try the daily bingo!",
};

export default function RootLayout({ children }: { children: ReactNode }) {
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
          <PracticeVariantProvider>
            <AppContextProvider>
              <Shell>{children}</Shell>
            </AppContextProvider>
            <Suspense>
              <PracticeVariantInit />
            </Suspense>
          </PracticeVariantProvider>
        </MantineProvider>
      </body>
      <GoogleAnalytics gaId="G-FP1JEFSLS3" />
    </html>
  );
}

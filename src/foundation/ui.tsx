import "./foundation/styles/app.css"
import "./foundation/styles/content.css"
import "./foundation/styles/preflight.css"
import "./foundation/styles/fix-jank/mantine.css"
import "./foundation/styles/fix-jank/mobile.css"

import {
  ColorSchemeScript,
  MantineProvider,
  useComputedColorScheme,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useEffect } from "react";

function oppositeColor(color: "light" | "dark"): "light" | "dark" {
  return color === "dark" ? "light" : "dark";
}

function WithMetaColor() {
  const colorScheme = useComputedColorScheme();

  useEffect(() => {
    const html = document.querySelector("html");
    if (!html) {
      return;
    }
    html.classList.remove(oppositeColor(colorScheme));
    html.classList.add(colorScheme);
  }, [colorScheme]);

  return (
    <Helmet>
      <meta
        name="theme-color"
        content={colorScheme === "dark" ? "#18181b" : "#e5e7eb"}
      />
    </Helmet>
  );
}

/**
 * This provides default styling and theme handling for the UI.
 */
export function UIProvider(props: { children: React.ReactNode }) {
  return (
    <>
      <ColorSchemeScript defaultColorScheme="auto" />
      <MantineProvider
        theme={{
          primaryColor: "gray",
          fontFamily: "inherit",
          headings: {
            fontFamily: "inherit",
            sizes: {
              h4: { fontWeight: "600" },
              h5: { fontWeight: "600" },
              h6: { fontWeight: "600" },
            },
          },
          defaultRadius: "md",
        }}
      >
        <HelmetProvider>
          <WithMetaColor />
          {props.children}
        </HelmetProvider>
        <Notifications />
      </MantineProvider>
    </>
  );
}



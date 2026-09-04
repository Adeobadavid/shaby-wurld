"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";

import { apiVersion, dataset, projectId } from "./sanity/env";
import { schemaTypes } from "./sanity/schemas";

/**
 * Studio runs inside the Next.js app at /studio, so there is one repo and one
 * deploy rather than a separate Studio project to keep in sync.
 */
export default defineConfig({
  basePath: "/studio",
  name: "shaby_wurld_studio",
  title: "Shaby Wurld",
  projectId,
  dataset,

  schema: { types: schemaTypes },

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            // Site Settings is a singleton: one fixed document id, opened
            // directly. Without this you get a list you can add a second
            // settings document to, and queries silently pick the wrong one.
            S.listItem()
              .title("Site Settings")
              .id("siteSettings")
              .child(
                S.document().schemaType("siteSettings").documentId("siteSettings")
              ),

            S.divider(),

            S.documentTypeListItem("product").title("Products"),
            S.documentTypeListItem("review").title("Reviews"),

            S.divider(),

            S.documentTypeListItem("order").title("Orders"),
          ]),
    }),

    // Vision lets you run GROQ queries against the dataset from inside the
    // Studio — useful for checking what the site will actually receive.
    visionTool({ defaultApiVersion: apiVersion }),
  ],

  document: {
    // Stop "Create new" from offering the singleton or manual orders.
    newDocumentOptions: (prev) =>
      prev.filter(
        (item) =>
          item.templateId !== "siteSettings" && item.templateId !== "order"
      ),
  },
});

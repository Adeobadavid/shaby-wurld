import { defineField, defineType } from "sanity";

/**
 * Product.
 *
 * `shades` is an array of objects rather than plain strings specifically so a
 * shade can be switched off without being deleted — deleting a shade would
 * orphan it in any order that already referenced it, and you'd lose the hex
 * value when you want it back next season.
 */
export const product = defineType({
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required().max(120),
    }),

    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "Used in the URL. Click Generate after typing the name.",
      options: { source: "name", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          // These must match the filter labels in BestSellers.tsx, or a
          // product saves fine in the Studio and then never appears under
          // any filter on the site.
          { title: "Lip Gloss", value: "Lip Gloss" },
          { title: "Lip Balm", value: "Lip Balm" },
          { title: "Lip Liner", value: "Lip Liner" },
          { title: "Lipstick", value: "Lipstick" },
          { title: "Lip Oil", value: "Lip Oil" },
          { title: "Gift Set", value: "Gift Set" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "price",
      title: "Price (₦)",
      type: "number",
      description: "In naira, whole numbers only. No commas or symbols.",
      validation: (Rule) => Rule.required().positive().integer(),
    }),

    defineField({
      name: "compareAtPrice",
      title: "Compare-at price (₦)",
      type: "number",
      description:
        "Optional. The old price, shown struck through. Leave empty if not on sale.",
      validation: (Rule) => Rule.positive().integer(),
    }),

    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
      description: "Shown in Quick View, under the product name.",
      validation: (Rule) => Rule.required().max(500),
    }),

    defineField({
      name: "images",
      title: "Images",
      type: "array",
      description:
        "First image is the one shown on the product card. Add more and they cycle on hover.",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            {
              name: "alt",
              title: "Alt text",
              type: "string",
              description: "Describe the image for screen readers and SEO.",
            },
          ],
        },
      ],
      validation: (Rule) => Rule.required().min(1).max(6),
    }),

    defineField({
      name: "shades",
      title: "Shades",
      type: "array",
      description:
        "Turn a shade off with its Available toggle to hide it from the site while keeping it here.",
      of: [
        {
          type: "object",
          name: "shade",
          fields: [
            defineField({
              name: "name",
              title: "Shade name",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "color",
              title: "Colour",
              type: "string",
              description: "Hex code, e.g. #5c3a2e",
              validation: (Rule) =>
                Rule.required()
                  .regex(/^#[0-9a-fA-F]{6}$/, { name: "hex colour" })
                  .error("Must be a 6-digit hex code like #5c3a2e"),
            }),
            defineField({
              name: "enabled",
              title: "Available",
              type: "boolean",
              description: "Off = hidden from the site, but kept here for later.",
              initialValue: true,
            }),
          ],
          preview: {
            select: { title: "name", subtitle: "color", enabled: "enabled" },
            prepare({ title, subtitle, enabled }) {
              return {
                title: enabled === false ? `${title} — off` : title,
                subtitle,
              };
            },
          },
        },
      ],
    }),

    defineField({
      name: "inStock",
      title: "In stock",
      type: "boolean",
      description: "Off = shown but cannot be added to bag.",
      initialValue: true,
    }),

    defineField({
      name: "featured",
      title: "Show in Best Sellers",
      type: "boolean",
      initialValue: false,
    }),

    defineField({
      name: "order",
      title: "Sort order",
      type: "number",
      description: "Lower numbers appear first. Ties fall back to newest.",
      initialValue: 0,
    }),
  ],

  orderings: [
    {
      title: "Sort order",
      name: "orderAsc",
      by: [
        { field: "order", direction: "asc" },
        { field: "_createdAt", direction: "desc" },
      ],
    },
  ],

  preview: {
    select: { title: "name", subtitle: "category", media: "images.0" },
  },
});

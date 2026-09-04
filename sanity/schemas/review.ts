import { defineField, defineType } from "sanity";

export const review = defineType({
  name: "review",
  title: "Review",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Customer name",
      type: "string",
      validation: (Rule) => Rule.required().max(80),
    }),

    defineField({
      name: "text",
      title: "Review",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required().max(600),
    }),

    defineField({
      name: "rating",
      title: "Rating",
      type: "number",
      description: "1 to 5 stars.",
      options: {
        list: [1, 2, 3, 4, 5].map((n) => ({ title: "★".repeat(n), value: n })),
        layout: "radio",
        direction: "horizontal",
      },
      validation: (Rule) => Rule.required().min(1).max(5).integer(),
    }),

    defineField({
      name: "photo",
      title: "Photo",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", title: "Alt text", type: "string" }],
    }),

    defineField({
      name: "product",
      title: "Product",
      type: "reference",
      to: [{ type: "product" }],
      description: "Optional — which product this review is about.",
    }),

    defineField({
      name: "published",
      title: "Published",
      type: "boolean",
      description: "Off = hidden from the site.",
      initialValue: true,
    }),

    defineField({
      name: "order",
      title: "Sort order",
      type: "number",
      description: "Lower numbers appear first.",
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
    select: { title: "name", rating: "rating", media: "photo", published: "published" },
    prepare({ title, rating, media, published }) {
      return {
        title: published === false ? `${title} — hidden` : title,
        subtitle: "★".repeat(rating ?? 0),
        media,
      };
    },
  },
});

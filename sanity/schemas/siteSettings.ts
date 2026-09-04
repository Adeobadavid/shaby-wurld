import { defineField, defineType } from "sanity";

/**
 * Site Settings — a singleton.
 *
 * Everything on the page that is currently a hardcoded string lives here, so
 * copy changes never need a developer or a redeploy. The Studio is configured
 * (see sanity.config.ts) to expose exactly one of these and open it directly,
 * rather than showing a list you can accidentally add a second document to.
 */
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",

  groups: [
    { name: "hero", title: "Hero" },
    { name: "benefits", title: "Benefits" },
    { name: "story", title: "Brand Story" },
    { name: "footer", title: "Footer & Contact" },
    { name: "shipping", title: "Shipping" },
  ],

  fields: [
    /* ---------------- Hero ---------------- */
    defineField({
      name: "heroEyebrow",
      title: "Small line (left side)",
      type: "string",
      group: "hero",
      description: 'Currently "Beauty that feels like you." Line breaks are kept.',
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: "heroHeadline",
      title: "Headline",
      type: "string",
      group: "hero",
      description: 'Currently "Naturally You." Each line animates in separately.',
      validation: (Rule) => Rule.required().max(60),
    }),
    defineField({
      name: "heroSubtext",
      title: "Subtext",
      type: "string",
      group: "hero",
      description: 'Currently "Made for every skin tone."',
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: "heroImage",
      title: "Hero photo",
      type: "image",
      group: "hero",
      options: { hotspot: true },
    }),

    /* ---------------- Benefits ---------------- */
    defineField({
      name: "benefits",
      title: "Benefits",
      type: "array",
      group: "benefits",
      of: [
        {
          type: "object",
          name: "benefit",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
            defineField({ name: "icon", title: "Icon", type: "image" }),
          ],
          preview: { select: { title: "title", subtitle: "description", media: "icon" } },
        },
      ],
      validation: (Rule) => Rule.max(6),
    }),

    /* ---------------- Brand story ---------------- */
    defineField({
      name: "storyHeading",
      title: "Heading",
      type: "string",
      group: "story",
    }),
    defineField({
      name: "storyBody",
      title: "Paragraph",
      type: "text",
      rows: 6,
      group: "story",
    }),
    defineField({
      name: "storyImages",
      title: "Photos",
      type: "array",
      group: "story",
      of: [{ type: "image", options: { hotspot: true } }],
      validation: (Rule) => Rule.max(4),
    }),

    /* ---------------- Footer & contact ---------------- */
    defineField({
      name: "contactPhone",
      title: "Phone number",
      type: "string",
      group: "footer",
      description: "Shown in the footer. Include the country code, e.g. +234 800 000 0000",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "contactEmail",
      title: "Email",
      type: "string",
      group: "footer",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "contactAddress",
      title: "Address",
      type: "text",
      rows: 2,
      group: "footer",
    }),
    defineField({
      name: "footerNote",
      title: "Footer note",
      type: "string",
      group: "footer",
      description: "Small print under the footer, e.g. the copyright line.",
    }),
    defineField({
      name: "socialLinks",
      title: "Social links",
      type: "array",
      group: "footer",
      of: [
        {
          type: "object",
          name: "socialLink",
          fields: [
            defineField({
              name: "platform",
              title: "Platform",
              type: "string",
              options: {
                list: [
                  { title: "Instagram", value: "instagram" },
                  { title: "TikTok", value: "tiktok" },
                  { title: "X / Twitter", value: "twitter" },
                  { title: "Facebook", value: "facebook" },
                  { title: "YouTube", value: "youtube" },
                  { title: "WhatsApp", value: "whatsapp" },
                ],
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "url",
              title: "URL",
              type: "url",
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: { select: { title: "platform", subtitle: "url" } },
        },
      ],
    }),

    /* ---------------- Shipping / orders ---------------- */
    defineField({
      name: "orderWhatsappNumber",
      title: "Order notifications WhatsApp number",
      type: "string",
      group: "shipping",
      description:
        "Digits only, with country code, no + or spaces — e.g. 2348000000000. New orders are sent here.",
      validation: (Rule) =>
        Rule.required()
          .regex(/^[0-9]{10,15}$/, { name: "digits only" })
          .error("Digits only, including country code. No +, spaces or dashes."),
    }),
    defineField({
      name: "freeShippingThreshold",
      title: "Free shipping over (₦)",
      type: "number",
      group: "shipping",
      description: "Orders at or above this total ship free. Set 0 to disable.",
      initialValue: 50000,
      validation: (Rule) => Rule.min(0).integer(),
    }),
    defineField({
      name: "shippingNote",
      title: "Shipping note",
      type: "string",
      group: "shipping",
      description: "Shown under the subtotal in the bag.",
    }),
  ],

  preview: {
    prepare: () => ({ title: "Site Settings" }),
  },
});

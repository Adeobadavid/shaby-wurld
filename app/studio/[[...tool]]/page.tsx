/**
 * Sanity Studio, served at /studio.
 *
 * Access is controlled by Sanity's own auth — only members of project
 * l1gq8pzc can log in and edit. The route being public is fine; the
 * dataset is what's protected.
 */
import { NextStudio } from "next-sanity/studio";
import config from "../../../sanity.config";

export const dynamic = "force-static";
export const metadata = {
  title: "Shaby Wurld Studio",
  robots: { index: false, follow: false },
};

export default function StudioPage() {
  return <NextStudio config={config} />;
}

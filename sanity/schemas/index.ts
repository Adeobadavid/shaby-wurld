import type { SchemaTypeDefinition } from "sanity";

import { product } from "./product";
import { siteSettings } from "./siteSettings";
import { review } from "./review";
import { order } from "./order";

export const schemaTypes: SchemaTypeDefinition[] = [product, siteSettings, review, order];

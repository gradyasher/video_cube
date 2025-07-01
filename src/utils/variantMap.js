import { BASE_URL } from "./base.js";

const withBase = (path) =>
  `${BASE_URL.replace(/\/?$/, "/")}${path.replace(/^\//, "")}`;

export const FREE_STICKER_VARIANT_ID = "gid://shopify/ProductVariant/43280346513547";

export const variantMap = {
  [withBase("models/feet.glb")]: {
    image: withBase("assets/thumbnails/feet.png"),
    mockups: [
      withBase("assets/mockups/feet/front.webp"),
      withBase("assets/mockups/feet/back.webp"),
      withBase("assets/mockups/feet/folded.webp"),
    ],
    variants: {
      S:  "gid://shopify/ProductVariant/43594410000523",
      M:  "gid://shopify/ProductVariant/43594410033291",
      L:  "gid://shopify/ProductVariant/43594410066059",
      XL: "gid://shopify/ProductVariant/43594410098827",
    },
  },
  [withBase("models/2troofz.glb")]: {
    image: withBase("assets/thumbnails/2troofz.png"),
    mockups: [
      withBase("assets/mockups/2troofz/Back.webp"),
      withBase("assets/mockups/2troofz/Folded.webp"),
      withBase("assets/mockups/2troofz/Front.webp"),
    ],
    variants: {
      S:  "gid://shopify/ProductVariant/43223548821643",
      M:  "gid://shopify/ProductVariant/43223548854411",
      L:  "gid://shopify/ProductVariant/43223548887179",
      XL: "gid://shopify/ProductVariant/43223548919947",
    },
  },
  [withBase("models/bienvenidoes.glb")]: {
    image: withBase("assets/thumbnails/bienvenidoes.png"),
    mockups: [
      withBase("assets/mockups/bienvenidoes/front.webp"),
      withBase("assets/mockups/bienvenidoes/back.webp"),
      withBase("assets/mockups/bienvenidoes/folded.webp"),
    ],
    variants: {
      S:  "gid://shopify/ProductVariant/43599911878795",
      M:  "gid://shopify/ProductVariant/43599912042635",
      L:  "gid://shopify/ProductVariant/43599912206475",
      XL: "gid://shopify/ProductVariant/43599912370315",
    },
  },
  [withBase("models/allover2.glb")]: {
    image: withBase("assets/thumbnails/allover2.png"),
    mockups: [
      withBase("assets/mockups/vortex_tee/closeup.webp"),
      withBase("assets/mockups/vortex_tee/flat-front.webp"),
    ],
    variants: {
      S:  "gid://shopify/ProductVariant/43223745527947",
      M:  "gid://shopify/ProductVariant/43223745593483",
      L:  "gid://shopify/ProductVariant/43223745659019",
      XL: "gid://shopify/ProductVariant/43223745724555",
    },
  },
  [withBase("models/hoodie1.glb")]: {
    image: withBase("assets/thumbnails/hoodie1.png"),
    mockups: [
      withBase("assets/mockups/vortex_hoodie/front.webp"),
      withBase("assets/mockups/vortex_hoodie/person-front.webp"),
    ],
    variants: {
      L: "gid://shopify/ProductVariant/43223983325323",
    },
  },
};

import { BASE_URL } from "./base";

const withBase = (path) =>
  `${BASE_URL.replace(/\/?$/, "/")}${path.replace(/^\//, "")}`;

export const FREE_STICKER_VARIANT_ID = "gid://shopify/ProductVariant/43280346513547";

export const variantMap = {
  [withBase("models/2troofz.glb")]: {
    image: withBase("assets/thumbnails/2troofz.png"),
    mockups: [
      withBase("assets/mockups/2troofz/Back.jpeg"),
      withBase("assets/mockups/2troofz/Folded.jpeg"),
      withBase("assets/mockups/2troofz/Front.jpeg"),
    ],
    variants: {
      S:  "gid://shopify/ProductVariant/43223548821643",
      M:  "gid://shopify/ProductVariant/43223548854411",
      L:  "gid://shopify/ProductVariant/43223548887179",
      XL: "gid://shopify/ProductVariant/43223548919947",
    },
  },
  [withBase("models/allover2.glb")]: {
    image: withBase("assets/thumbnails/allover2.png"),
    mockups: [
      withBase("assets/mockups/vortex_tee/closeup.jpeg"),
      withBase("assets/mockups/vortex_tee/flat-front.jpeg"),
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
      withBase("assets/mockups/vortex_hoodie/front.jpeg"),
      withBase("assets/mockups/vortex_hoodie/person-front.jpeg"),
    ],
    variants: {
      L: "gid://shopify/ProductVariant/43223983325323",
    },
  },
};

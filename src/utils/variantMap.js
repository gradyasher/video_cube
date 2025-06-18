const base = import.meta.env.BASE_URL;

export const FREE_STICKER_VARIANT_ID = "gid://shopify/ProductVariant/43280346513547";
// 43239305937035 <<< the one i just copy/pasted

export const variantMap = {
  [`${base}models/2troofz.glb`]: {
    image: `${base}assets/thumbnails/2troofz.png`,
    mockups: [
      `${base}assets/mockups/2troofz/Back.jpeg`,
      `${base}assets/mockups/2troofz/Folded.jpeg`,
      `${base}assets/mockups/2troofz/Front.jpeg`,
    ],
    variants: {
      S:  "gid://shopify/ProductVariant/43223548821643",
      M:  "gid://shopify/ProductVariant/43223548854411",
      L:  "gid://shopify/ProductVariant/43223548887179",
      XL: "gid://shopify/ProductVariant/43223548919947",
    }
  },
  [`${base}models/allover2.glb`]: {
    image: `${base}assets/thumbnails/allover2.png`,
    mockups: [
      `${base}assets/mockups/vortex_tee/closeup.jpeg`,
      `${base}assets/mockups/vortex_tee/flat-front.jpeg`,
    ],
    variants: {
      S:  "gid://shopify/ProductVariant/43223745527947",
      M:  "gid://shopify/ProductVariant/43223745593483",
      L:  "gid://shopify/ProductVariant/43223745659019",
      XL: "gid://shopify/ProductVariant/43223745724555",
    }
  },
  [`${base}models/hoodie1.glb`]: {
    image: `${base}assets/thumbnails/hoodie1.png`,
    mockups: [
      `${base}assets/mockups/vortex_hoodie/front.jpeg`,
      `${base}assets/mockups/vortex_hoodie/person-front.jpeg`,
    ],
    variants: {
      L: "gid://shopify/ProductVariant/43223983325323",
    }
  },
};

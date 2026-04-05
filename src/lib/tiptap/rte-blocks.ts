import { Node, mergeAttributes } from "@tiptap/core";

export type RteGalleryItem = { src: string; caption?: string };

function safeParseItems(raw: string | null): RteGalleryItem[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    return v
      .filter((x): x is RteGalleryItem => x && typeof x === "object" && typeof (x as RteGalleryItem).src === "string")
      .map((x) => ({ src: x.src, caption: typeof x.caption === "string" ? x.caption : "" }));
  } catch {
    return [];
  }
}

function galleryFigures(items: RteGalleryItem[], figureClass: string, imgClass: string, capClass: string) {
  return items.map(
    (item) =>
      [
        "figure",
        { class: figureClass },
        ["img", { src: item.src, alt: "", class: imgClass, loading: "lazy" }],
        ["figcaption", { class: capClass }, item.caption || ""],
      ] as const
  );
}

/** Responsive image grid — works in saved HTML without React */
export const RteGallery = Node.create({
  name: "rteGallery",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      items: {
        default: [] as RteGalleryItem[],
        parseHTML: (el) => safeParseItems(el.getAttribute("data-items")),
        renderHTML: (attrs) => ({
          "data-items": JSON.stringify(attrs.items || []),
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-rte-gallery="true"]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const items = (node.attrs.items || []) as RteGalleryItem[];
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        class: "rte-gallery",
        "data-rte-gallery": "true",
      }),
      ...galleryFigures(items, "rte-gallery__figure", "rte-gallery__img", "rte-gallery__caption"),
    ];
  },
});

/** Horizontal scroll slides + captions (CSS scroll-snap) */
export const RteCarousel = Node.create({
  name: "rteCarousel",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      items: {
        default: [] as RteGalleryItem[],
        parseHTML: (el) => safeParseItems(el.getAttribute("data-items")),
        renderHTML: (attrs) => ({
          "data-items": JSON.stringify(attrs.items || []),
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-rte-carousel="true"]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const items = (node.attrs.items || []) as RteGalleryItem[];
    const slides = galleryFigures(
      items,
      "rte-carousel__slide",
      "rte-carousel__img",
      "rte-carousel__caption"
    );
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        class: "rte-carousel",
        "data-rte-carousel": "true",
      }),
      ["div", { class: "rte-carousel__track" }, ...slides],
    ];
  },
});

/** Info / tip / warning callout with editable paragraphs inside */
export const RteCallout = Node.create({
  name: "rteCallout",
  group: "block",
  content: "paragraph+",
  defining: true,
  draggable: true,

  addAttributes() {
    return {
      variant: {
        default: "info",
        parseHTML: (el) => el.getAttribute("data-variant") || "info",
        renderHTML: (attrs) => ({ "data-variant": attrs.variant }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-rte-callout="true"]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const v = (node.attrs.variant as string) || "info";
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-rte-callout": "true",
        "data-variant": v,
        class: `rte-callout rte-callout--${v}`,
      }),
      0,
    ];
  },
});

/** Vimeo, maps, or any HTTPS embed URL */
export const RteIframe = Node.create({
  name: "rteIframe",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null as string | null },
      title: { default: "Embedded content" },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-rte-iframe-wrap="true"]',
        getAttrs: (el) => {
          const iframe = el.querySelector("iframe");
          return {
            src: iframe?.getAttribute("src") || null,
            title: iframe?.getAttribute("title") || "Embedded content",
          };
        },
      },
    ];
  },

  renderHTML({ node }) {
    if (!node.attrs.src) return ["div", { class: "rte-iframe-wrap rte-iframe-wrap--empty" }];
    return [
      "div",
      {
        class: "rte-iframe-wrap",
        "data-rte-iframe-wrap": "true",
      },
      [
        "iframe",
        {
          src: node.attrs.src as string,
          title: String(node.attrs.title || "Embedded content"),
          class: "rte-iframe",
          allowfullscreen: "true",
          allow:
            "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
        },
      ],
    ];
  },
});

/** Direct video file (.mp4, etc.) */
export const RteVideoFile = Node.create({
  name: "rteVideoFile",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null as string | null },
      poster: { default: null as string | null },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-rte-video-wrap="true"]',
        getAttrs: (el) => {
          const video = el.querySelector("video");
          return {
            src: video?.getAttribute("src") || null,
            poster: video?.getAttribute("poster") || null,
          };
        },
      },
    ];
  },

  renderHTML({ node }) {
    if (!node.attrs.src) return ["div", { class: "rte-video-wrap rte-video-wrap--empty" }];
    const attrs: Record<string, string> = {
      src: node.attrs.src as string,
      controls: "true",
      playsinline: "true",
      class: "rte-video",
    };
    if (node.attrs.poster) attrs.poster = node.attrs.poster as string;
    return [
      "div",
      { class: "rte-video-wrap", "data-rte-video-wrap": "true" },
      ["video", attrs],
    ];
  },
});

export function vimeoPlayerUrl(pageUrl: string): string | null {
  const m = pageUrl.trim().match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  return m ? `https://player.vimeo.com/video/${m[1]}` : null;
}

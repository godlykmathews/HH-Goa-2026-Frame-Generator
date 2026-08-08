/** A normalized crop transform shared by the editor and canvas renderer. */
export interface ImageTransform {
  /** Horizontal image translation from -1 (left) to 1 (right). */
  offsetX: number;
  /** Vertical image translation from -1 (up) to 1 (down). */
  offsetY: number;
  /** Multiplier applied after the image has been cover-fitted. Must be >= 1. */
  zoom: number;
}

/** A browser-decoded image that is safe to draw to a canvas. */
export interface DecodedImage {
  source: CanvasImageSource;
  width: number;
  height: number;
  /** Dedicated object URL for the editor preview. The caller owns its lifecycle. */
  objectUrl: string;
  mimeType: string;
  wasConvertedFromHeic: boolean;
}

export interface BrandAssetPaths {
  sunrise: string;
  hackerHouse: string;
  goaHindi: string;
}

export interface BuilderCardRenderInput {
  image: Pick<DecodedImage, "source" | "width" | "height">;
  name: string;
  role: string;
  builderTitle: string;
  transform: ImageTransform;
  /** Primarily useful for white-labeling and renderer tests. */
  assets?: Partial<BrandAssetPaths>;
}

export type BuilderTitleSet = readonly [string, string, string];

export type FrameFormatId = "builder-card" | "pfp-frame";

export interface FrameFormatConfig {
  id: FrameFormatId;
  label: string;
  width: number;
  height: number;
  mimeType: "image/png";
  fileExtension: "png";
  photoViewport: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  minZoom: number;
  maxZoom: number;
}

import type {
  BrandAssetPaths,
  BuilderCardRenderInput,
  FrameFormatConfig,
  ImageTransform,
} from "@/types";

const COLORS = {
  emerald: "#064d34",
  emeraldLight: "#0b6b46",
  emeraldDark: "#022f24",
  yellow: "#ffe11a",
  pink: "#ff1684",
  cream: "#f7f1df",
  ink: "#072c22",
} as const;

const DISPLAY_FONT = '"Arial Black", "Helvetica Neue", Arial, sans-serif';
const BODY_FONT = '"Helvetica Neue", Arial, sans-serif';
const MONO_FONT = '"Courier New", ui-monospace, monospace';

export const DEFAULT_BRAND_ASSETS: BrandAssetPaths = {
  sunrise: "/brand/sunrise.png",
  hackerHouse: "/brand/hacker-house.png",
  goaHindi: "/brand/goa-hindi.svg",
};

/**
 * Central format registry. A future square renderer can be added by registering
 * its dimensions and render function without changing upload/editor state.
 */
export const FRAME_FORMATS = {
  "builder-card": {
    id: "builder-card",
    label: "Builder ID Card",
    width: 1080,
    height: 1350,
    mimeType: "image/png",
    fileExtension: "png",
    photoViewport: {
      x: 72,
      y: 250,
      width: 936,
      height: 702,
    },
    minZoom: 1,
    maxZoom: 4,
  },
} as const satisfies Record<"builder-card", FrameFormatConfig>;

export const BUILDER_CARD_FORMAT = FRAME_FORMATS["builder-card"];

type ImplementedFrameFormatId = keyof typeof FRAME_FORMATS;

interface FrameRenderInputMap {
  "builder-card": BuilderCardRenderInput;
}

interface LoadedBrandAssets {
  sunrise: HTMLImageElement | null;
  hackerHouse: HTMLImageElement | null;
  goaHindi: HTMLImageElement | null;
}

interface DrawPlacement {
  x: number;
  y: number;
  width: number;
  height: number;
}

type FormatPainter<FormatId extends ImplementedFrameFormatId> = (
  context: CanvasRenderingContext2D,
  input: FrameRenderInputMap[FormatId],
  assets: LoadedBrandAssets,
) => void;

function clamp(value: number, minimum: number, maximum: number): number {
  if (!Number.isFinite(value)) {
    return minimum;
  }

  return Math.min(maximum, Math.max(minimum, value));
}

export function normalizeImageTransform(transform: ImageTransform): ImageTransform {
  return {
    offsetX: clamp(transform.offsetX, -1, 1),
    offsetY: clamp(transform.offsetY, -1, 1),
    zoom: clamp(transform.zoom, BUILDER_CARD_FORMAT.minZoom, BUILDER_CARD_FORMAT.maxZoom),
  };
}

/**
 * Calculates a cover-fit placement. Normalized offsets select a point within
 * the available overflow, so the destination can never expose a blank edge.
 */
export function calculateCoverPlacement(
  imageWidth: number,
  imageHeight: number,
  viewport: { x: number; y: number; width: number; height: number },
  transform: ImageTransform,
): DrawPlacement {
  if (
    !Number.isFinite(imageWidth) ||
    !Number.isFinite(imageHeight) ||
    imageWidth <= 0 ||
    imageHeight <= 0
  ) {
    throw new Error("The selected photo has invalid dimensions.");
  }

  const safeTransform = normalizeImageTransform(transform);
  const coverScale = Math.max(viewport.width / imageWidth, viewport.height / imageHeight);
  const scale = coverScale * safeTransform.zoom;
  const width = imageWidth * scale;
  const height = imageHeight * scale;
  const overflowX = Math.max(0, width - viewport.width);
  const overflowY = Math.max(0, height - viewport.height);
  const positionX = (1 - safeTransform.offsetX) / 2;
  const positionY = (1 - safeTransform.offsetY) / 2;

  return {
    x: viewport.x - overflowX * positionX,
    y: viewport.y - overflowY * positionY,
    width,
    height,
  };
}

function roundedRectanglePath(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const safeRadius = Math.min(Math.max(0, radius), width / 2, height / 2);

  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  context.lineTo(x + safeRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  context.lineTo(x, y + safeRadius);
  context.quadraticCurveTo(x, y, x + safeRadius, y);
  context.closePath();
}

function setFont(
  context: CanvasRenderingContext2D,
  size: number,
  weight: number,
  family: string,
): void {
  context.font = `${weight} ${size}px ${family}`;
}

function cleanText(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
}

export function truncateCanvasText(
  context: CanvasRenderingContext2D,
  value: string,
  maxWidth: number,
): string {
  const text = cleanText(value);

  if (context.measureText(text).width <= maxWidth) {
    return text;
  }

  const characters = Array.from(text);
  const ellipsis = "…";
  let low = 0;
  let high = characters.length;

  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    const candidate = `${characters.slice(0, middle).join("").trimEnd()}${ellipsis}`;

    if (context.measureText(candidate).width <= maxWidth) {
      low = middle;
    } else {
      high = middle - 1;
    }
  }

  return `${characters.slice(0, low).join("").trimEnd()}${ellipsis}`;
}

export function wrapCanvasText(
  context: CanvasRenderingContext2D,
  value: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const text = cleanText(value);

  if (!text || maxLines < 1) {
    return [];
  }

  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (let wordIndex = 0; wordIndex < words.length; wordIndex += 1) {
    let word = words[wordIndex];
    const candidate = currentLine ? `${currentLine} ${word}` : word;

    if (context.measureText(candidate).width <= maxWidth) {
      currentLine = candidate;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
      currentLine = "";

      if (lines.length === maxLines) {
        const remainder = [lines[maxLines - 1], ...words.slice(wordIndex)].join(" ");
        lines[maxLines - 1] = truncateCanvasText(context, remainder, maxWidth);
        return lines;
      }
    }

    while (context.measureText(word).width > maxWidth) {
      const characters = Array.from(word);
      let splitAt = 1;

      while (
        splitAt < characters.length &&
        context.measureText(characters.slice(0, splitAt + 1).join("")).width <= maxWidth
      ) {
        splitAt += 1;
      }

      lines.push(characters.slice(0, splitAt).join(""));
      word = characters.slice(splitAt).join("");

      if (lines.length === maxLines) {
        lines[maxLines - 1] = truncateCanvasText(
          context,
          `${lines[maxLines - 1]}${word} ${words.slice(wordIndex + 1).join(" ")}`,
          maxWidth,
        );
        return lines;
      }
    }

    currentLine = word;
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  return lines;
}

function fitSingleLineText(
  context: CanvasRenderingContext2D,
  value: string,
  maxWidth: number,
  maximumSize: number,
  minimumSize: number,
  weight: number,
  family: string,
): { text: string; fontSize: number } {
  let fontSize = maximumSize;

  while (fontSize > minimumSize) {
    setFont(context, fontSize, weight, family);

    if (context.measureText(cleanText(value)).width <= maxWidth) {
      break;
    }

    fontSize -= 2;
  }

  setFont(context, fontSize, weight, family);
  return {
    text: truncateCanvasText(context, value, maxWidth),
    fontSize,
  };
}

function drawCoverImage(
  context: CanvasRenderingContext2D,
  image: CanvasImageSource,
  imageWidth: number,
  imageHeight: number,
  viewport: { x: number; y: number; width: number; height: number },
  transform: ImageTransform,
): void {
  const placement = calculateCoverPlacement(imageWidth, imageHeight, viewport, transform);

  context.save();
  roundedRectanglePath(
    context,
    viewport.x,
    viewport.y,
    viewport.width,
    viewport.height,
    30,
  );
  context.clip();
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, placement.x, placement.y, placement.width, placement.height);
  context.restore();
}

function drawImageContained(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;

  context.drawImage(
    image,
    x + (width - drawWidth) / 2,
    y + (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
}

function drawCheckerStrip(
  context: CanvasRenderingContext2D,
  y: number,
  height: number,
): void {
  const cellWidth = 24;

  for (let x = 0, index = 0; x < BUILDER_CARD_FORMAT.width; x += cellWidth, index += 1) {
    context.fillStyle = index % 2 === 0 ? COLORS.yellow : COLORS.pink;
    context.fillRect(x, y, cellWidth, height);

    context.fillStyle = index % 2 === 0 ? COLORS.pink : COLORS.yellow;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + cellWidth, y + height);
    context.lineTo(x, y + height);
    context.closePath();
    context.fill();
  }
}

function drawTechnicalGrid(context: CanvasRenderingContext2D): void {
  context.save();
  context.globalAlpha = 0.09;
  context.strokeStyle = COLORS.cream;
  context.lineWidth = 1;

  for (let x = 18; x < BUILDER_CARD_FORMAT.width; x += 54) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, BUILDER_CARD_FORMAT.height);
    context.stroke();
  }

  for (let y = 18; y < BUILDER_CARD_FORMAT.height; y += 54) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(BUILDER_CARD_FORMAT.width, y);
    context.stroke();
  }

  context.fillStyle = COLORS.yellow;
  for (let x = 45; x < BUILDER_CARD_FORMAT.width; x += 162) {
    for (let y = 45; y < BUILDER_CARD_FORMAT.height; y += 162) {
      context.beginPath();
      context.arc(x, y, 3, 0, Math.PI * 2);
      context.fill();
    }
  }

  context.restore();
}

function drawFallbackTropicalArt(context: CanvasRenderingContext2D): void {
  context.save();
  context.globalAlpha = 0.22;
  context.fillStyle = COLORS.yellow;
  context.beginPath();
  context.arc(540, 1120, 155, Math.PI, Math.PI * 2);
  context.fill();

  context.strokeStyle = COLORS.cream;
  context.lineWidth = 8;
  for (let index = 0; index < 4; index += 1) {
    context.beginPath();
    context.moveTo(240 + index * 34, 1230 + index * 26);
    context.bezierCurveTo(370, 1180, 470, 1280, 610, 1228 + index * 26);
    context.bezierCurveTo(740, 1180, 830, 1280, 930, 1230 + index * 26);
    context.stroke();
  }
  context.restore();
}

function drawBackground(
  context: CanvasRenderingContext2D,
  assets: LoadedBrandAssets,
): void {
  const background = context.createLinearGradient(0, 0, 1080, 1350);
  background.addColorStop(0, COLORS.emeraldDark);
  background.addColorStop(0.45, COLORS.emerald);
  background.addColorStop(1, "#07573b");
  context.fillStyle = background;
  context.fillRect(0, 0, BUILDER_CARD_FORMAT.width, BUILDER_CARD_FORMAT.height);

  drawTechnicalGrid(context);

  if (assets.sunrise) {
    context.save();
    context.globalAlpha = 0.24;
    context.drawImage(assets.sunrise, 0, 390, 1080, 1078.5);
    context.restore();
  } else {
    drawFallbackTropicalArt(context);
  }

  const lowerFade = context.createLinearGradient(0, 840, 0, 1350);
  lowerFade.addColorStop(0, "rgba(2, 47, 36, 0)");
  lowerFade.addColorStop(0.28, "rgba(2, 47, 36, 0.72)");
  lowerFade.addColorStop(1, "rgba(2, 47, 36, 0.92)");
  context.fillStyle = lowerFade;
  context.fillRect(0, 820, 1080, 530);

  context.fillStyle = COLORS.pink;
  context.beginPath();
  context.moveTo(760, 0);
  context.lineTo(1080, 0);
  context.lineTo(1080, 58);
  context.lineTo(810, 58);
  context.closePath();
  context.fill();

  drawCheckerStrip(context, 0, 16);
  drawCheckerStrip(context, 1334, 16);
}

function drawHeader(context: CanvasRenderingContext2D, assets: LoadedBrandAssets): void {
  context.fillStyle = COLORS.pink;
  roundedRectanglePath(context, 72, 42, 258, 37, 18.5);
  context.fill();

  setFont(context, 19, 700, MONO_FONT);
  context.fillStyle = COLORS.cream;
  context.textBaseline = "middle";
  context.fillText("HH GOA 2026 // ID", 92, 61);

  if (assets.hackerHouse) {
    drawImageContained(context, assets.hackerHouse, 72, 91, 570, 118);
  } else {
    setFont(context, 72, 900, DISPLAY_FONT);
    context.textBaseline = "alphabetic";
    context.fillStyle = COLORS.yellow;
    context.fillText("HACKER HOUSE", 72, 174);
  }

  context.textAlign = "right";
  context.textBaseline = "alphabetic";
  setFont(context, 20, 700, MONO_FONT);
  context.fillStyle = COLORS.cream;
  context.fillText("GOA, INDIA", 826, 73);
  context.fillStyle = COLORS.yellow;
  context.fillText("28—31 OCT", 826, 104);
  context.fillStyle = COLORS.cream;
  context.fillText("BUILD. SHIP. REPEAT.", 826, 135);

  if (assets.goaHindi) {
    drawImageContained(context, assets.goaHindi, 850, 67, 158, 152);
  } else {
    context.fillStyle = COLORS.yellow;
    context.beginPath();
    context.arc(931, 143, 63, 0, Math.PI * 2);
    context.fill();
    setFont(context, 30, 900, DISPLAY_FONT);
    context.fillStyle = COLORS.pink;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("GOA", 931, 143);
  }

  context.textAlign = "left";
}

function drawPhoto(
  context: CanvasRenderingContext2D,
  input: BuilderCardRenderInput,
): void {
  const viewport = BUILDER_CARD_FORMAT.photoViewport;

  context.save();
  context.shadowColor = "rgba(0, 0, 0, 0.35)";
  context.shadowBlur = 30;
  context.shadowOffsetY = 16;
  context.fillStyle = COLORS.ink;
  roundedRectanglePath(context, viewport.x, viewport.y, viewport.width, viewport.height, 30);
  context.fill();
  context.restore();

  drawCoverImage(
    context,
    input.image.source,
    input.image.width,
    input.image.height,
    viewport,
    input.transform,
  );

  context.save();
  roundedRectanglePath(context, viewport.x, viewport.y, viewport.width, viewport.height, 30);
  context.clip();
  const photoFade = context.createLinearGradient(0, viewport.y + 440, 0, viewport.y + viewport.height);
  photoFade.addColorStop(0, "rgba(2, 47, 36, 0)");
  photoFade.addColorStop(1, "rgba(2, 47, 36, 0.72)");
  context.fillStyle = photoFade;
  context.fillRect(viewport.x, viewport.y + 400, viewport.width, viewport.height - 400);
  context.restore();

  context.save();
  roundedRectanglePath(context, viewport.x, viewport.y, viewport.width, viewport.height, 30);
  context.strokeStyle = COLORS.pink;
  context.lineWidth = 16;
  context.stroke();
  context.strokeStyle = COLORS.yellow;
  context.lineWidth = 5;
  context.stroke();
  context.restore();

  context.fillStyle = COLORS.yellow;
  roundedRectanglePath(context, 103, 871, 222, 47, 23.5);
  context.fill();
  setFont(context, 20, 800, MONO_FONT);
  context.fillStyle = COLORS.ink;
  context.textBaseline = "middle";
  context.fillText("BUILD MODE: ON", 126, 895);

  context.textAlign = "right";
  context.fillStyle = COLORS.cream;
  setFont(context, 18, 700, MONO_FONT);
  context.fillText("FORMAT B // 4:5", 973, 895);
  context.textAlign = "left";

  const bracketSize = 28;
  context.strokeStyle = COLORS.cream;
  context.lineWidth = 5;
  context.beginPath();
  context.moveTo(94, 288 + bracketSize);
  context.lineTo(94, 288);
  context.lineTo(94 + bracketSize, 288);
  context.moveTo(986 - bracketSize, 288);
  context.lineTo(986, 288);
  context.lineTo(986, 288 + bracketSize);
  context.stroke();
}

function drawDetails(context: CanvasRenderingContext2D, input: BuilderCardRenderInput): void {
  const name = cleanText(input.name) || "GOA BUILDER";
  const displayName = name.toLocaleUpperCase("en-US");
  const builderTitle = cleanText(input.builderTitle) || "Systems Builder";
  const role = cleanText(input.role) || "Product Builder";

  context.textBaseline = "alphabetic";
  setFont(context, 21, 700, MONO_FONT);
  context.fillStyle = COLORS.pink;
  context.fillText("BUILDER // IDENTIFIED", 72, 1008);

  context.textAlign = "right";
  context.fillStyle = COLORS.yellow;
  context.fillText("#FrameInGoa", 1008, 1008);
  context.fillStyle = "rgba(247, 241, 223, 0.7)";
  setFont(context, 16, 700, MONO_FONT);
  context.fillText("HH26 / ONE OF ONE", 1008, 1040);
  context.textAlign = "left";

  const fittedName = fitSingleLineText(
    context,
    displayName,
    936,
    82,
    46,
    900,
    DISPLAY_FONT,
  );
  setFont(context, fittedName.fontSize, 900, DISPLAY_FONT);
  context.fillStyle = COLORS.cream;
  context.fillText(fittedName.text, 72, 1092);

  const fittedTitle = fitSingleLineText(
    context,
    builderTitle,
    648,
    38,
    27,
    900,
    DISPLAY_FONT,
  );
  setFont(context, fittedTitle.fontSize, 900, DISPLAY_FONT);
  const titleTextWidth = context.measureText(fittedTitle.text).width;
  const pillWidth = Math.min(710, Math.max(285, titleTextWidth + 64));

  context.fillStyle = COLORS.pink;
  roundedRectanglePath(context, 72, 1118, pillWidth, 81, 15);
  context.fill();
  context.strokeStyle = COLORS.yellow;
  context.lineWidth = 3;
  roundedRectanglePath(context, 78, 1124, pillWidth - 12, 69, 11);
  context.stroke();
  context.fillStyle = COLORS.cream;
  context.textBaseline = "middle";
  context.fillText(fittedTitle.text, 103, 1159.5);

  context.textBaseline = "alphabetic";
  setFont(context, 17, 700, MONO_FONT);
  context.fillStyle = COLORS.pink;
  context.fillText("STACK / ROLE", 72, 1239);

  setFont(context, 33, 800, BODY_FONT);
  context.fillStyle = COLORS.yellow;
  const roleLines = wrapCanvasText(context, role, 936, 2);
  roleLines.forEach((line, index) => {
    context.fillText(line, 72, 1280 + index * 38);
  });

  context.strokeStyle = "rgba(247, 241, 223, 0.22)";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(72, 1213);
  context.lineTo(1008, 1213);
  context.stroke();
}

function paintBuilderCard(
  context: CanvasRenderingContext2D,
  input: BuilderCardRenderInput,
  assets: LoadedBrandAssets,
): void {
  drawBackground(context, assets);
  drawHeader(context, assets);
  drawPhoto(context, input);
  drawDetails(context, input);
}

const FORMAT_RENDERERS: {
  [FormatId in ImplementedFrameFormatId]: FormatPainter<FormatId>;
} = {
  "builder-card": paintBuilderCard,
};

function loadOptionalImage(source: string): Promise<HTMLImageElement | null> {
  if (typeof Image === "undefined" || !source) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const image = new Image();
    let settled = false;
    const timeoutId = window.setTimeout(() => finish(null), 3500);

    function finish(result: HTMLImageElement | null): void {
      if (settled) {
        return;
      }

      settled = true;
      window.clearTimeout(timeoutId);
      image.onload = null;
      image.onerror = null;
      resolve(result);
    }

    image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.onload = () => {
      finish(image.naturalWidth > 0 && image.naturalHeight > 0 ? image : null);
    };
    image.onerror = () => finish(null);
    image.src = source;
  });
}

async function waitForCanvasFonts(): Promise<void> {
  if (typeof document === "undefined" || !("fonts" in document)) {
    return;
  }

  const timeout = new Promise<void>((resolve) => {
    window.setTimeout(resolve, 1200);
  });
  const fontsReady = (async () => {
    try {
      await Promise.all([
        document.fonts.load(`900 82px ${DISPLAY_FONT}`),
        document.fonts.load(`800 33px ${BODY_FONT}`),
        document.fonts.load(`700 21px ${MONO_FONT}`),
      ]);
      await document.fonts.ready;
    } catch {
      // System font fallbacks remain available when a custom font cannot load.
    }
  })();

  await Promise.race([fontsReady, timeout]);
}

async function loadBrandAssets(paths: BrandAssetPaths): Promise<LoadedBrandAssets> {
  const [sunrise, hackerHouse, goaHindi] = await Promise.all([
    loadOptionalImage(paths.sunrise),
    loadOptionalImage(paths.hackerHouse),
    loadOptionalImage(paths.goaHindi),
  ]);

  return { sunrise, hackerHouse, goaHindi };
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("The browser could not encode the generated card."));
          return;
        }

        resolve(blob);
      }, "image/png");
    } catch {
      reject(
        new Error(
          "The generated card could not be exported. Check that all image assets allow canvas use.",
        ),
      );
    }
  });
}

function validateRenderInput(input: BuilderCardRenderInput): void {
  if (!input.image?.source || input.image.width <= 0 || input.image.height <= 0) {
    throw new Error("Add a valid photo before generating your card.");
  }

  if (!cleanText(input.name)) {
    throw new Error("Enter your name before generating your card.");
  }

  if (!cleanText(input.role)) {
    throw new Error("Enter your stack or role before generating your card.");
  }

  if (!cleanText(input.builderTitle)) {
    throw new Error("Choose a builder title before generating your card.");
  }
}

export async function renderFrame<FormatId extends ImplementedFrameFormatId>(
  formatId: FormatId,
  input: FrameRenderInputMap[FormatId],
): Promise<Blob> {
  if (typeof document === "undefined") {
    throw new Error("Cards can only be generated in your browser.");
  }

  if (formatId !== "builder-card") {
    throw new Error(`The ${String(formatId)} format is not available yet.`);
  }

  const builderInput = input as FrameRenderInputMap["builder-card"];
  validateRenderInput(builderInput);

  const format = FRAME_FORMATS[formatId];
  const canvas = document.createElement("canvas");
  canvas.width = format.width;
  canvas.height = format.height;
  const context = canvas.getContext("2d", { alpha: false });

  if (!context) {
    throw new Error("Your browser could not start the image renderer.");
  }

  const assetPaths: BrandAssetPaths = {
    ...DEFAULT_BRAND_ASSETS,
    ...builderInput.assets,
  };
  const [, assets] = await Promise.all([waitForCanvasFonts(), loadBrandAssets(assetPaths)]);

  try {
    const painter = FORMAT_RENDERERS[formatId] as FormatPainter<"builder-card">;
    painter(context, builderInput, assets);
    return await canvasToPngBlob(canvas);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("The ")) {
      throw error;
    }

    throw new Error("We couldn't generate this card. Try the photo again or choose another image.");
  } finally {
    canvas.width = 1;
    canvas.height = 1;
  }
}

export function renderBuilderCard(input: BuilderCardRenderInput): Promise<Blob> {
  return renderFrame("builder-card", input);
}

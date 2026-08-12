"use client";

import { AlertCircle, ArrowRight, Check, LockKeyhole, Palmtree, Zap } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { BuilderDetailsForm } from "@/components/generator/BuilderDetailsForm";
import { BuilderTitlePicker } from "@/components/generator/BuilderTitlePicker";
import { CardPreview } from "@/components/generator/CardPreview";
import { GeneratorControls } from "@/components/generator/GeneratorControls";
import { Hero } from "@/components/generator/Hero";
import { PhotoEditor } from "@/components/generator/PhotoEditor";
import { PhotoUploader } from "@/components/generator/PhotoUploader";
import {
  ResultPanel,
  type PublicShareTarget,
} from "@/components/generator/ResultPanel";
import { generateBuilderTitles } from "@/lib/builderTitles";
import { renderBuilderCard } from "@/lib/canvas/renderBuilderCard";
import { decodeImage } from "@/lib/image/decodeImage";
import { shareNative } from "@/lib/sharing/shareNative";
import { openShareToX } from "@/lib/sharing/shareToX";
import {
  uploadGeneratedFrame,
  type GeneratedFrameShare,
} from "@/lib/sharing/uploadGeneratedFrame";
import type { DecodedImage, ImageTransform } from "@/types";

const INITIAL_TRANSFORM: ImageTransform = { offsetX: 0, offsetY: 0, zoom: 1 };

interface StepSectionProps {
  children: ReactNode;
  description: string;
  number: string;
  title: string;
}

interface ManualShareLink {
  href: string;
  label: string;
}

function StepSection({ children, description, number, title }: StepSectionProps) {
  return (
    <section className="border-b border-[#006b3c]/12 p-5 last:border-b-0 sm:p-7" aria-labelledby={`step-${number}`}>
      <div className="mb-6 flex items-start gap-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#006b3c] font-mono-hh text-xs font-black text-[#fee101] shadow-[3px_3px_0_#ff1684]">
          {number}
        </span>
        <div>
          <h3 id={`step-${number}`} className="font-display text-xl tracking-[-0.025em] text-[#003c24]">
            {title}
          </h3>
          <p className="mt-1 text-sm leading-6 text-[#003c24]/58">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function cleanFilenamePart(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("en-US")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function closeDecodedImage(image: DecodedImage | null) {
  if (image && typeof ImageBitmap !== "undefined" && image.source instanceof ImageBitmap) {
    image.source.close();
  }
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function GeneratorExperience() {
  const generatorRef = useRef<HTMLElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const photoUrlsRef = useRef(new Set<string>());
  const decodedRef = useRef<DecodedImage | null>(null);
  const generatedUrlRef = useRef<string | null>(null);
  const decodeRequestRef = useRef(0);
  const contentRevisionRef = useRef(0);
  const shareRequestRef = useRef(0);
  const publicShareRef = useRef<GeneratedFrameShare | null>(null);
  const publicSharePromiseRef = useRef<Promise<GeneratedFrameShare> | null>(null);

  const [decodedImage, setDecodedImage] = useState<DecodedImage | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [transform, setTransform] = useState<ImageTransform>(INITIAL_TRANSFORM);

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [titles, setTitles] = useState(() => generateBuilderTitles(""));
  const [selectedTitle, setSelectedTitle] = useState("");
  const [formAttempted, setFormAttempted] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [publicShare, setPublicShare] = useState<GeneratedFrameShare | null>(null);
  const [publicSharePreparing, setPublicSharePreparing] = useState(false);
  const [publicConsent, setPublicConsent] = useState(false);
  const [sharingTarget, setSharingTarget] = useState<"native" | PublicShareTarget | null>(null);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const [manualShareLink, setManualShareLink] = useState<ManualShareLink | null>(null);

  const filename = useMemo(() => {
    const cleanName = cleanFilenamePart(name.trim()) || "builder";
    return `hh-goa-2026-${cleanName}-builder-card.png`;
  }, [name]);

  const nameError = formAttempted && !name.trim() ? "Add the name you want on the card." : null;
  const roleError = formAttempted && !role.trim() ? "Add your stack or role to generate a builder title." : null;

  const revokeGeneratedUrl = useCallback(() => {
    if (generatedUrlRef.current) {
      URL.revokeObjectURL(generatedUrlRef.current);
      generatedUrlRef.current = null;
    }
  }, []);

  const clearShareState = useCallback(() => {
    shareRequestRef.current += 1;
    publicShareRef.current = null;
    publicSharePromiseRef.current = null;
    setPublicShare(null);
    setPublicSharePreparing(false);
    setPublicConsent(false);
    setSharingTarget(null);
    setShareStatus(null);
    setShareError(null);
    setManualShareLink(null);
  }, []);

  const invalidateResult = useCallback(() => {
    contentRevisionRef.current += 1;
    revokeGeneratedUrl();
    setGeneratedBlob(null);
    setGeneratedUrl(null);
    setRenderError(null);
    clearShareState();
  }, [clearShareState, revokeGeneratedUrl]);

  const releasePhotoResources = useCallback(() => {
    closeDecodedImage(decodedRef.current);
    decodedRef.current = null;
    for (const url of photoUrlsRef.current) URL.revokeObjectURL(url);
    photoUrlsRef.current.clear();
  }, []);

  useEffect(() => {
    return () => {
      decodeRequestRef.current += 1;
      contentRevisionRef.current += 1;
      shareRequestRef.current += 1;
      publicShareRef.current = null;
      publicSharePromiseRef.current = null;
      releasePhotoResources();
      revokeGeneratedUrl();
    };
  }, [releasePhotoResources, revokeGeneratedUrl]);

  const scrollToGenerator = () => {
    generatorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => document.getElementById("builder-photo")?.focus(), 450);
  };

  const handlePhoto = async (file: File) => {
    const requestId = decodeRequestRef.current + 1;
    decodeRequestRef.current = requestId;
    releasePhotoResources();
    invalidateResult();
    setDecodedImage(null);
    setPhotoError(null);
    setPhotoBusy(true);
    setPhotoFileName(file.name);
    setTransform(INITIAL_TRANSFORM);

    const immediateUrl = URL.createObjectURL(file);
    photoUrlsRef.current.add(immediateUrl);
    setPhotoPreviewUrl(immediateUrl);

    try {
      const image = await decodeImage(file);
      if (requestId !== decodeRequestRef.current) {
        URL.revokeObjectURL(image.objectUrl);
        closeDecodedImage(image);
        return;
      }

      photoUrlsRef.current.add(image.objectUrl);
      if (image.objectUrl !== immediateUrl) {
        URL.revokeObjectURL(immediateUrl);
        photoUrlsRef.current.delete(immediateUrl);
      }
      decodedRef.current = image;
      setDecodedImage(image);
      setPhotoPreviewUrl(image.objectUrl);
    } catch (error) {
      if (requestId !== decodeRequestRef.current) return;
      releasePhotoResources();
      setPhotoPreviewUrl(null);
      setPhotoError(errorMessage(error, "We couldn't open that photo. Choose a different image."));
    } finally {
      if (requestId === decodeRequestRef.current) setPhotoBusy(false);
    }
  };

  const handleNameChange = (value: string) => {
    setName(value);
    invalidateResult();
  };

  const handleRoleChange = (value: string) => {
    const nextTitles = generateBuilderTitles(value);
    setRole(value);
    setTitles(nextTitles);
    setSelectedTitle(value.trim() ? nextTitles[0] : "");
    invalidateResult();
  };

  const handleTransformChange = (value: ImageTransform) => {
    setTransform(value);
    invalidateResult();
  };

  const handleTitleChange = (value: string) => {
    setSelectedTitle(value);
    invalidateResult();
  };

  const handleGenerate = async () => {
    setFormAttempted(true);
    setRenderError(null);

    if (!decodedImage) {
      setPhotoError("Choose a photo before generating your card.");
      document.getElementById("builder-photo")?.focus();
      return;
    }
    if (!name.trim()) {
      document.getElementById("builder-name")?.focus();
      return;
    }
    if (!role.trim()) {
      document.getElementById("builder-role")?.focus();
      return;
    }
    if (!selectedTitle) {
      setRenderError("Select one of your three builder titles.");
      return;
    }

    invalidateResult();
    const revision = contentRevisionRef.current;
    setRendering(true);

    try {
      const blob = await renderBuilderCard({
        image: decodedImage,
        name: name.trim(),
        role: role.trim(),
        builderTitle: selectedTitle,
        transform,
      });

      if (revision !== contentRevisionRef.current) return;
      if (!blob.size) throw new Error("The generated image was empty. Please try again.");

      const url = URL.createObjectURL(blob);
      generatedUrlRef.current = url;
      setGeneratedBlob(blob);
      setGeneratedUrl(url);
      window.requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (error) {
      if (revision === contentRevisionRef.current) {
        setRenderError(errorMessage(error, "The card could not be rendered. Please try again."));
      }
    } finally {
      setRendering(false);
    }
  };

  const downloadGenerated = useCallback(() => {
    if (!generatedUrl) return;
    const anchor = document.createElement("a");
    anchor.href = generatedUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setShareError(null);
    setShareStatus("Downloaded. Your original photo and finished card stayed on this device.");
  }, [filename, generatedUrl]);

  const handleNativeShare = async () => {
    if (!generatedBlob) return;
    setSharingTarget("native");
    setShareError(null);
    setShareStatus(null);

    const result = await shareNative({
      blob: generatedBlob,
      builderTitle: selectedTitle,
      filename,
      fallbackUrl: publicShare?.shareUrl,
    });

    if (result.status === "shared") {
      setShareStatus(result.mode === "file" ? "Share sheet opened with your image attached." : "Share sheet opened with your public card link.");
    } else if (result.status === "unsupported") {
      downloadGenerated();
      setShareStatus(`${result.message} We downloaded it for you instead.`);
    } else if (result.status === "failed") {
      setShareError(result.message);
    }
    setSharingTarget(null);
  };

  const preparePublicShare = useCallback((): Promise<GeneratedFrameShare> => {
    if (publicShareRef.current) {
      return Promise.resolve(publicShareRef.current);
    }
    if (publicSharePromiseRef.current) {
      return publicSharePromiseRef.current;
    }
    if (!generatedBlob) {
      return Promise.reject(new Error("Generate your card again before sharing."));
    }

    const revision = contentRevisionRef.current;
    setPublicSharePreparing(true);

    const request = uploadGeneratedFrame(generatedBlob, { origin: window.location.origin })
      .then((share) => {
        if (revision === contentRevisionRef.current) {
          publicShareRef.current = share;
          setPublicShare(share);
        }
        return share;
      })
      .finally(() => {
        if (publicSharePromiseRef.current === request) {
          publicSharePromiseRef.current = null;
          if (revision === contentRevisionRef.current) {
            setPublicSharePreparing(false);
          }
        }
      });

    publicSharePromiseRef.current = request;
    return request;
  }, [generatedBlob]);

  const handlePublicConsentChange = (consent: boolean) => {
    const requestId = shareRequestRef.current + 1;
    shareRequestRef.current = requestId;
    setPublicConsent(consent);
    setShareError(null);
    setManualShareLink(null);

    if (!consent) {
      setShareStatus(null);
      return;
    }

    if (publicShareRef.current) {
      setShareStatus("Public preview ready. Choose where to share it.");
      return;
    }

    setShareStatus("Uploading only the finished card and preparing its public preview…");
    void preparePublicShare()
      .then((share) => {
        if (
          requestId === shareRequestRef.current &&
          share === publicShareRef.current
        ) {
          setShareStatus("Public preview ready. Choose where to share it.");
        }
      })
      .catch((error) => {
        if (requestId === shareRequestRef.current) {
          setPublicConsent(false);
          setShareStatus(null);
          setShareError(errorMessage(error, "Public sharing failed. Your local download still works."));
        }
      });
  };

  const handlePublicShare = (target: PublicShareTarget) => {
    if (!publicConsent) {
      setShareStatus(null);
      setShareError("Confirm the public upload notice before sharing to a social network.");
      document.getElementById("public-share-consent")?.focus();
      return;
    }
    if (!generatedBlob) return;

    const share = publicShareRef.current;
    if (!share) {
      setShareStatus(publicSharePreparing ? "Preparing your public preview…" : null);
      return;
    }

    const requestId = shareRequestRef.current + 1;
    shareRequestRef.current = requestId;
    setSharingTarget(target);
    setShareError(null);
    setShareStatus("Opening your share…");
    setManualShareLink(null);

    try {
      if (target === "x") {
        const options = { builderTitle: selectedTitle, shareUrl: share.shareUrl };
        const result = openShareToX(options);
        if (result.status === "blocked") {
          setManualShareLink({ href: result.intentUrl, label: "Open the X composer" });
          setShareError("Your browser blocked the X popup. Use the link below to continue.");
          setShareStatus(null);
        } else {
          setShareStatus("X opened with your caption and public card link ready to post.");
        }
      } else {
        const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(share.shareUrl)}`;
        const popup = window.open(linkedInUrl, "_blank");
        if (popup) {
          popup.opener = null;
          setShareStatus("LinkedIn opened with your public card preview ready to share.");
        } else {
          setManualShareLink({ href: linkedInUrl, label: "Open LinkedIn sharing" });
          setShareError("Your browser blocked the LinkedIn popup. Use the link below to continue.");
          setShareStatus(null);
        }
      }
    } catch (error) {
      if (requestId === shareRequestRef.current) {
        setShareStatus(null);
        setShareError(errorMessage(error, "Public sharing failed. Your local download still works."));
      }
    } finally {
      if (requestId === shareRequestRef.current) setSharingTarget(null);
    }
  };

  const handleStartOver = () => {
    decodeRequestRef.current += 1;
    releasePhotoResources();
    invalidateResult();
    revokeGeneratedUrl();
    setDecodedImage(null);
    setPhotoFileName(null);
    setPhotoPreviewUrl(null);
    setPhotoBusy(false);
    setPhotoError(null);
    setTransform(INITIAL_TRANSFORM);
    setName("");
    setRole("");
    setTitles(generateBuilderTitles(""));
    setSelectedTitle("");
    setFormAttempted(false);
    setRendering(false);
    setRenderError(null);
    window.requestAnimationFrame(scrollToGenerator);
  };

  return (
    <div id="top" className="min-h-screen">
      <Hero onStart={scrollToGenerator} />

      <main>
        <section ref={generatorRef} id="generator" aria-labelledby="generator-title" className="scroll-mt-0 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <span className="font-mono-hh text-xs font-black uppercase tracking-[0.18em] text-[#fee101]">Credential 01 · Builder ID</span>
                <h2 id="generator-title" className="mt-3 max-w-3xl font-display text-4xl leading-[0.92] tracking-[-0.045em] text-white sm:text-6xl">
                  One pass. Fully yours.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-white/68">Upload, frame, add your builder identity, and render a slim event credential.</p>
              </div>
              <div className="flex items-center gap-3 rounded-full border border-white/12 bg-white/[0.06] px-4 py-3 text-xs font-semibold text-white/65">
                <LockKeyhole className="size-4 text-[#b7f43b]" aria-hidden="true" />
                Local by default
              </div>
            </div>

            <ol className="mb-8 grid grid-cols-4 overflow-hidden rounded-xl border border-[#fee101]/25 bg-[#003c24]" aria-label="Creation steps">
              {["Photo", "Details", "Identity", "Export"].map((label, index) => (
                <li key={label} className="flex min-h-12 items-center justify-center gap-2 border-r border-[#fee101]/15 px-2 text-center font-mono-hh text-[9px] font-bold uppercase tracking-[0.11em] text-white/65 last:border-r-0 sm:text-xs">
                  <span className="text-[#fee101]">0{index + 1}</span>
                  <span className="hidden xs:inline sm:inline">{label}</span>
                </li>
              ))}
            </ol>

            <div className="grid items-start gap-8 lg:grid-cols-[minmax(18rem,23rem)_minmax(0,1fr)] lg:gap-12">
              <aside className="sticky top-6 hidden lg:block">
                <CardPreview
                  builderTitle={selectedTitle}
                  imageHeight={decodedImage?.height ?? null}
                  imageWidth={decodedImage?.width ?? null}
                  name={name}
                  previewUrl={photoPreviewUrl}
                  role={role}
                  transform={transform}
                />
              </aside>

              <div className="overflow-hidden rounded-[1.5rem] bg-[#fff9dc] shadow-[0_26px_80px_rgba(0,36,22,.28)] sm:rounded-[2rem]">
                <StepSection number="01" title="Choose your photo" description="Portrait, landscape, screenshot—bring whatever you have. We’ll cover-fit it automatically.">
                  <PhotoUploader
                    busy={photoBusy}
                    error={photoError}
                    fileName={photoFileName}
                    previewUrl={photoPreviewUrl}
                    onFile={handlePhoto}
                  />
                  {decodedImage && photoPreviewUrl ? (
                    <div className="mt-6">
                      <PhotoEditor
                        imageHeight={decodedImage.height}
                        imageWidth={decodedImage.width}
                        previewUrl={photoPreviewUrl}
                        transform={transform}
                        onChange={handleTransformChange}
                      />
                      {decodedImage.wasConvertedFromHeic ? (
                        <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#006b3c]">
                          <Check className="size-4" aria-hidden="true" />
                          HEIC converted privately in your browser.
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </StepSection>

                <StepSection number="02" title="Add your coordinates" description="Just the details that belong on the graphic—nothing is saved.">
                  <BuilderDetailsForm
                    name={name}
                    nameError={nameError}
                    role={role}
                    roleError={roleError}
                    onNameChange={handleNameChange}
                    onRoleChange={handleRoleChange}
                  />
                </StepSection>

                <StepSection number="03" title="Claim your builder identity" description="Pick one of three deterministic titles made from your role.">
                  <BuilderTitlePicker
                    roleReady={Boolean(role.trim())}
                    selectedTitle={selectedTitle}
                    titles={titles}
                    onSelect={handleTitleChange}
                  />
                </StepSection>

                <div className="border-b border-[#006b3c]/12 p-5 lg:hidden sm:p-7">
                  <p className="mb-5 text-center font-mono-hh text-[10px] font-black uppercase tracking-[0.16em] text-[#003c24]/55">Your live layout</p>
                  <div className="mx-auto max-w-64">
                    <CardPreview
                      builderTitle={selectedTitle}
                      imageHeight={decodedImage?.height ?? null}
                      imageWidth={decodedImage?.width ?? null}
                      name={name}
                      previewUrl={photoPreviewUrl}
                      role={role}
                      transform={transform}
                    />
                  </div>
                </div>

                <div className="p-5 sm:p-7">
                  <GeneratorControls disabled={photoBusy || rendering} loading={rendering} onGenerate={handleGenerate} />
                  {renderError ? (
                    <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                      {renderError}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div ref={resultRef}>
          {generatedUrl && generatedBlob ? (
            <ResultPanel
              consent={publicConsent}
              error={shareError}
              fileName={filename}
              imageUrl={generatedUrl}
              manualShareLink={manualShareLink}
              publicShareUrl={publicShare?.shareUrl ?? null}
              publicSharePreparing={publicSharePreparing}
              sharingTarget={sharingTarget}
              status={shareStatus}
              onConsentChange={handlePublicConsentChange}
              onDownload={downloadGenerated}
              onNativeShare={handleNativeShare}
              onPublicShare={handlePublicShare}
              onStartOver={handleStartOver}
            />
          ) : null}
        </div>
      </main>

      <footer className="border-t border-white/10 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 font-black text-[#fee101]">
            <Palmtree className="size-5" aria-hidden="true" />
            HH GOA 2026
            <Zap className="size-4 text-[#ff1684]" aria-hidden="true" />
          </div>
          <a href="#generator" className="inline-flex min-h-11 items-center gap-2 rounded-lg font-semibold hover:text-white">
            Make your builder card
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </div>
      </footer>
    </div>
  );
}

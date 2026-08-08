"use client";

/* eslint-disable @next/next/no-img-element */

import { Minus, Move, Plus, RotateCcw } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import type { ImageTransform } from "@/types";

interface PhotoEditorProps {
  imageHeight: number;
  imageWidth: number;
  previewUrl: string;
  transform: ImageTransform;
  onChange: (transform: ImageTransform) => void;
}

interface Point {
  x: number;
  y: number;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 3.5;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function PhotoEditor({ imageHeight, imageWidth, previewUrl, transform, onChange }: PhotoEditorProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const pointersRef = useRef(new Map<number, Point>());
  const lastPointRef = useRef<Point | null>(null);
  const pinchRef = useRef<{ distance: number; zoom: number } | null>(null);
  const transformRef = useRef(transform);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;

    const updateSize = () => {
      const rect = element.getBoundingClientRect();
      setViewport({ width: rect.width, height: rect.height });
    };
    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const geometry = useCallback(
    (zoom: number) => {
      if (!viewport.width || !viewport.height || !imageWidth || !imageHeight) {
        return { width: 0, height: 0, maxShiftX: 0, maxShiftY: 0 };
      }
      const coverScale = Math.max(viewport.width / imageWidth, viewport.height / imageHeight);
      const width = imageWidth * coverScale * zoom;
      const height = imageHeight * coverScale * zoom;
      return {
        width,
        height,
        maxShiftX: Math.max(0, (width - viewport.width) / 2),
        maxShiftY: Math.max(0, (height - viewport.height) / 2),
      };
    },
    [imageHeight, imageWidth, viewport.height, viewport.width],
  );

  const setZoom = (nextZoom: number) => {
    const zoom = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
    onChange({
      zoom,
      offsetX: clamp(transformRef.current.offsetX, -1, 1),
      offsetY: clamp(transformRef.current.offsetY, -1, 1),
    });
  };

  const moveByPixels = (deltaX: number, deltaY: number) => {
    const current = transformRef.current;
    const { maxShiftX, maxShiftY } = geometry(current.zoom);
    onChange({
      ...current,
      offsetX: maxShiftX > 0 ? clamp(current.offsetX + deltaX / maxShiftX, -1, 1) : 0,
      offsetY: maxShiftY > 0 ? clamp(current.offsetY + deltaY / maxShiftY, -1, 1) : 0,
    });
  };

  const distanceBetween = (points: Point[]) => Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = { x: event.clientX, y: event.clientY };
    pointersRef.current.set(event.pointerId, point);
    lastPointRef.current = point;

    if (pointersRef.current.size === 2) {
      const points = Array.from(pointersRef.current.values());
      pinchRef.current = { distance: distanceBetween(points), zoom: transformRef.current.zoom };
      lastPointRef.current = null;
    }
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(event.pointerId)) return;
    event.preventDefault();
    const point = { x: event.clientX, y: event.clientY };
    pointersRef.current.set(event.pointerId, point);

    if (pointersRef.current.size >= 2 && pinchRef.current) {
      const points = Array.from(pointersRef.current.values()).slice(0, 2);
      const distance = distanceBetween(points);
      if (pinchRef.current.distance > 0) setZoom(pinchRef.current.zoom * (distance / pinchRef.current.distance));
      return;
    }

    if (lastPointRef.current) {
      moveByPixels(point.x - lastPointRef.current.x, point.y - lastPointRef.current.y);
    }
    lastPointRef.current = point;
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(event.pointerId);
    pinchRef.current = null;
    const remaining = Array.from(pointersRef.current.values());
    lastPointRef.current = remaining[0] ?? null;
  };

  const rendered = geometry(transform.zoom);
  const shiftX = rendered.maxShiftX * transform.offsetX;
  const shiftY = rendered.maxShiftY * transform.offsetY;

  const nudge = (x: number, y: number) => moveByPixels(x * 18, y * 18);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-bold text-[#003c24]">
          <Move className="size-4 text-[#ff1684]" aria-hidden="true" />
          Drag to frame · pinch or scroll to zoom
        </p>
        <button
          type="button"
          onClick={() => onChange({ offsetX: 0, offsetY: 0, zoom: 1 })}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-xs font-bold text-[#006b3c] hover:bg-[#006b3c]/8"
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Reset crop
        </button>
      </div>

      <div
        ref={viewportRef}
        role="img"
        aria-label="Photo crop editor. Drag the photo to reposition it."
        tabIndex={0}
        onKeyDown={(event) => {
          const amount = event.shiftKey ? 3 : 1;
          const movement: Record<string, [number, number]> = {
            ArrowLeft: [-amount, 0],
            ArrowRight: [amount, 0],
            ArrowUp: [0, -amount],
            ArrowDown: [0, amount],
          };
          if (movement[event.key]) {
            event.preventDefault();
            nudge(...movement[event.key]);
          }
        }}
        onWheel={(event: ReactWheelEvent<HTMLDivElement>) => {
          event.preventDefault();
          setZoom(transformRef.current.zoom * Math.exp(-event.deltaY * 0.0015));
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        className="relative aspect-[4/3] w-full touch-none cursor-grab overflow-hidden rounded-2xl bg-[#003c24] shadow-[inset_0_0_0_2px_rgba(254,225,1,.4)] active:cursor-grabbing"
      >
        <img
          src={previewUrl}
          alt=""
          draggable={false}
          className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
          style={{
            width: rendered.width || "auto",
            height: rendered.height || "auto",
            transform: `translate(calc(-50% + ${shiftX}px), calc(-50% + ${shiftY}px))`,
          }}
        />
        <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-[#fee101]/55 shadow-[inset_0_0_60px_rgba(0,44,28,.22)]" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 opacity-55">
          <span className="absolute left-0 top-1/2 h-px w-full bg-white" />
          <span className="absolute left-1/2 top-0 h-full w-px bg-white" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => setZoom(transform.zoom - 0.1)}
          disabled={transform.zoom <= MIN_ZOOM}
          className="grid size-11 shrink-0 place-items-center rounded-xl border border-[#006b3c]/20 text-[#006b3c] hover:bg-[#006b3c]/8 disabled:opacity-35"
        >
          <Minus className="size-5" aria-hidden="true" />
        </button>
        <label htmlFor="photo-zoom" className="sr-only">
          Photo zoom
        </label>
        <input
          id="photo-zoom"
          type="range"
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step="0.01"
          value={transform.zoom}
          onChange={(event) => setZoom(Number(event.currentTarget.value))}
          className="h-2 w-full accent-[#ff1684]"
        />
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => setZoom(transform.zoom + 0.1)}
          disabled={transform.zoom >= MAX_ZOOM}
          className="grid size-11 shrink-0 place-items-center rounded-xl border border-[#006b3c]/20 text-[#006b3c] hover:bg-[#006b3c]/8 disabled:opacity-35"
        >
          <Plus className="size-5" aria-hidden="true" />
        </button>
        <output htmlFor="photo-zoom" className="w-12 text-right font-mono-hh text-xs font-bold text-[#003c24]/65">
          {Math.round(transform.zoom * 100)}%
        </output>
      </div>
    </div>
  );
}

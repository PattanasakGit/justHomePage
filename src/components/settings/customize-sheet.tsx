"use client";

import { ChangeEvent, useRef, useState, type ReactNode } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { fontOptions } from "@/lib/fonts";
import { prepareWallpaperImage } from "@/lib/image-file";
import type { Appearance, ChromeVisibility, ContrastStrength, Density, FontId } from "@/lib/types";
import { DEFAULT_ACCENT_DARK, DEFAULT_ACCENT_LIGHT } from "@/lib/types";
import { useHomeStore } from "@/stores/home-store";

const ACCENTS = [
  { color: "#007AFF", label: "Blue" },
  { color: "#34C759", label: "Green" },
  { color: "#FF9500", label: "Orange" },
  { color: "#FF2D55", label: "Pink" },
  { color: "#AF52DE", label: "Purple" },
  { color: "#5856D6", label: "Indigo" },
];

type CustomizeSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CustomizeSheet({ open, onOpenChange }: CustomizeSheetProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState(false);
  const preferences = useHomeStore((state) => state.preferences);
  const setAppearance = useHomeStore((state) => state.setAppearance);
  const setFont = useHomeStore((state) => state.setFont);
  const setThemeControls = useHomeStore((state) => state.setThemeControls);
  const setContrastStrength = useHomeStore((state) => state.setContrastStrength);
  const setDensity = useHomeStore((state) => state.setDensity);
  const setChrome = useHomeStore((state) => state.setChrome);
  const setWallpaperImage = useHomeStore((state) => state.setWallpaperImage);

  async function onUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError(false);
    try {
      const { dataUrl, luminance } = await prepareWallpaperImage(file);
      setWallpaperImage(dataUrl, luminance);
    } catch {
      setUploadError(true);
    } finally {
      event.target.value = "";
    }
  }

  function pickAccent(color: string) {
    setThemeControls({ accentColor: color });
  }

  function pickAppearance(appearance: Appearance) {
    setAppearance(appearance);
    const isDefault =
      preferences.accentColor.toLowerCase() === DEFAULT_ACCENT_LIGHT.toLowerCase() ||
      preferences.accentColor.toLowerCase() === DEFAULT_ACCENT_DARK.toLowerCase();
    if (isDefault) {
      setThemeControls({
        accentColor: appearance === "dark" ? DEFAULT_ACCENT_DARK : DEFAULT_ACCENT_LIGHT,
      });
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="glass-heavy mx-auto max-h-[90vh] w-full gap-0 overflow-y-auto rounded-t-[28px] border-[color:var(--separator)] bg-[color:var(--panel)] p-0 sm:top-1/2 sm:bottom-auto sm:max-h-[86vh] sm:max-w-[420px] sm:-translate-y-1/2 sm:rounded-[28px] sm:border"
      >
        <div className="mx-auto mt-2 h-1.5 w-9 rounded-full bg-black/20 sm:hidden dark:bg-white/30" aria-hidden />
        <SheetHeader className="flex flex-row items-center justify-between px-4 pb-2 pt-3">
          <SheetTitle className="text-xl font-bold tracking-tight text-[color:var(--ink)]">Customize</SheetTitle>
          <Button
            type="button"
            variant="ghost"
            className="h-11 min-w-11 px-3 text-[17px] font-normal text-[color:var(--accent-text)]"
            onClick={() => onOpenChange(false)}
          >
            Done
          </Button>
        </SheetHeader>

        <div className="space-y-5 px-4 pb-[max(28px,env(safe-area-inset-bottom))] pt-1">
          <Group>
            <Row label="Appearance">
              <Seg>
                <SegBtn active={preferences.appearance === "light"} onClick={() => pickAppearance("light")}>
                  Light
                </SegBtn>
                <SegBtn active={preferences.appearance === "dark"} onClick={() => pickAppearance("dark")}>
                  Dark
                </SegBtn>
              </Seg>
            </Row>
            <Row label="Accent">
              <div className="flex flex-wrap justify-end gap-2" role="radiogroup" aria-label="Accent">
                {ACCENTS.map((accent) => {
                  const checked = preferences.accentColor.toLowerCase() === accent.color.toLowerCase();
                  return (
                    <button
                      key={accent.color}
                      type="button"
                      aria-label={accent.label}
                      aria-checked={checked}
                      role="radio"
                      onClick={() => pickAccent(accent.color)}
                      className={`h-11 w-11 min-h-11 min-w-11 rounded-full border-2 ${
                        checked ? "border-white shadow-[0_0_0_2px_var(--accent)]" : "border-transparent"
                      }`}
                      style={{ backgroundColor: accent.color }}
                    />
                  );
                })}
              </div>
            </Row>
          </Group>

          <Group>
            <Row label="Font">
              <Seg>
                {fontOptions.map((font) => (
                  <SegBtn
                    key={font.id}
                    active={preferences.font === font.id}
                    onClick={() => setFont(font.id as FontId)}
                  >
                    {font.id === "system"
                      ? "SF"
                      : font.id === "rounded"
                        ? "Rounded"
                        : font.id === "editorial"
                          ? "Serif"
                          : font.id === "thaiSoft"
                            ? "Thai"
                            : "Mono"}
                  </SegBtn>
                ))}
              </Seg>
            </Row>
            <Row label="Contrast">
              <Seg>
                {(["soft", "normal", "strong"] as ContrastStrength[]).map((value) => (
                  <SegBtn
                    key={value}
                    active={preferences.contrastStrength === value}
                    onClick={() => setContrastStrength(value)}
                  >
                    {value === "soft" ? "Soft" : value === "strong" ? "Bold" : "Default"}
                  </SegBtn>
                ))}
              </Seg>
            </Row>
            <Row label="Density">
              <Seg>
                {(["comfort", "cozy", "compact"] as Density[]).map((value) => (
                  <SegBtn key={value} active={preferences.density === value} onClick={() => setDensity(value)}>
                    {value === "comfort" ? "Roomy" : value === "compact" ? "Compact" : "Default"}
                  </SegBtn>
                ))}
              </Seg>
            </Row>
            <Row label="Toolbar">
              <Seg>
                {(["shown", "hidden"] as ChromeVisibility[]).map((value) => (
                  <SegBtn key={value} active={preferences.chrome === value} onClick={() => setChrome(value)}>
                    {value === "shown" ? "Show" : "Hide"}
                  </SegBtn>
                ))}
              </Seg>
            </Row>
          </Group>

          <div>
            <p className="mb-2 px-1 text-[13px] text-[color:var(--muted)]">Transparency</p>
            <Group>
              <div className="flex min-h-12 items-center gap-3 px-3.5 py-2.5">
                <Slider
                  aria-label="UI transparency"
                  min={35}
                  max={85}
                  step={1}
                  value={[preferences.uiOpacity]}
                  onValueChange={(value) => setThemeControls({ uiOpacity: value[0] ?? preferences.uiOpacity })}
                  className="flex-1"
                />
                <span className="min-w-10 text-right text-[15px] tabular-nums text-[color:var(--muted)]">
                  {preferences.uiOpacity}%
                </span>
              </div>
              <div className="flex min-h-12 items-center gap-3 px-3.5 py-2.5">
                <span className="min-w-10 text-[16px]">Blur</span>
                <Slider
                  aria-label="Backdrop blur"
                  min={16}
                  max={60}
                  step={1}
                  value={[preferences.blur]}
                  onValueChange={(value) => setThemeControls({ blur: value[0] ?? preferences.blur })}
                  className="flex-1"
                />
                <span className="min-w-10 text-right text-[15px] tabular-nums text-[color:var(--muted)]">
                  {preferences.blur}
                </span>
              </div>
            </Group>
          </div>

          <div>
            <p className="mb-2 px-1 text-[13px] text-[color:var(--muted)]">Wallpaper</p>
            <Group>
              <div className="flex flex-wrap gap-2 px-3.5 py-3">
                <Chip onClick={() => fileRef.current?.click()}>Photos…</Chip>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onUpload} />
                {preferences.wallpaperImage ? (
                  <Chip ghost onClick={() => setWallpaperImage(null)}>
                    Reset
                  </Chip>
                ) : null}
              </div>
              {preferences.wallpaperImage ? (
                <div
                  className="mx-3 mb-3 h-28 rounded-2xl bg-cover bg-center"
                  style={{ backgroundImage: `url("${preferences.wallpaperImage}")` }}
                  aria-label="Current wallpaper preview"
                />
              ) : null}
              {uploadError ? (
                <p className="px-3.5 pb-3 text-sm text-[#b42318]">Cannot read that image. Try a smaller JPG or PNG.</p>
              ) : null}
            </Group>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Group({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[color:var(--separator)] bg-[color:var(--surface)] backdrop-blur-[30px]">
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-3 border-b border-[color:var(--separator)] px-3.5 py-2.5 last:border-b-0">
      <span className="shrink-0 text-[16px] tracking-tight text-[color:var(--ink)]">{label}</span>
      {children}
    </div>
  );
}

function Seg({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap justify-end gap-1.5">{children}</div>;
}

function SegBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-11 rounded-full px-3.5 text-[15px] font-medium tracking-tight transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] ${
        active
          ? "bg-[color:var(--accent)] text-white"
          : "bg-[color:var(--fill-tertiary,rgba(120,120,128,0.12))] text-[color:var(--accent-text)]"
      }`}
    >
      {children}
    </button>
  );
}

function Chip({
  children,
  onClick,
  ghost,
}: {
  children: ReactNode;
  onClick: () => void;
  ghost?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-11 items-center rounded-full px-3.5 text-[15px] font-medium text-[color:var(--accent-text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] ${
        ghost ? "border border-[color:var(--separator)] bg-transparent" : "bg-[color:var(--fill-tertiary,rgba(120,120,128,0.12))]"
      }`}
    >
      {children}
    </button>
  );
}

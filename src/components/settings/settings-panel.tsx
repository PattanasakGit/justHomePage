"use client";

import { ChangeEvent, ReactNode, useCallback, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiDroplet,
  FiGrid,
  FiImage,
  FiLayers,
  FiSearch,
  FiSun,
  FiType,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";
import { getBrandIcon } from "@/components/icons/brand-icon";
import { prepareWallpaperImage } from "@/lib/image-file";
import { fontOptions } from "@/lib/fonts";
import { searchProviders } from "@/lib/search";
import { buildThemeVariables, resolveContrast } from "@/lib/theme";
import type { BackgroundId, ContrastMode, Preferences, UIScale } from "@/lib/types";
import { useHomeStore } from "@/stores/home-store";

type ThemeDraft = Pick<Preferences, "accentColor" | "uiOpacity" | "blur">;

type SettingsSection = "home" | "theme" | "wallpaper" | "search" | "font" | "layout";

const backgrounds: Array<{ id: BackgroundId; label: string; preview: string }> = [
  { id: "linen", label: "Linen", preview: "from-[#d8eee7] via-[#f8f2e9] to-[#efd9cf]" },
  { id: "aurora", label: "Aurora", preview: "from-[#b9ded4] via-[#eef5ef] to-[#e8b4a8]" },
  { id: "sky", label: "Sky", preview: "from-[#d9edf4] via-[#f7f3e8] to-[#cfe4dd]" },
  { id: "sunset", label: "Sunset", preview: "from-[#ffe2cc] via-[#ffd1d6] to-[#f3c5d8]" },
  { id: "rose", label: "Rose", preview: "from-[#fdf0ee] via-[#fbe1e8] to-[#f7d4e0]" },
  { id: "honey", label: "Honey", preview: "from-[#fff3d6] via-[#ffe1ad] to-[#f7c98a]" },
  { id: "sand", label: "Sand", preview: "from-[#f3ead8] via-[#ece1cc] to-[#e2d5bb]" },
  { id: "mint", label: "Mint", preview: "from-[#e6f7ee] via-[#d3f0e0] to-[#c4e9d6]" },
  { id: "lavender", label: "Lavender", preview: "from-[#ece4f7] via-[#ddd0ef] to-[#c9b9e5]" },
  { id: "slate", label: "Slate", preview: "from-[#e6ebf0] via-[#dee5ec] to-[#ccd6e0]" },
  { id: "graphite", label: "Graphite", preview: "from-[#202620] via-[#43534d] to-[#242a27]" },
  { id: "ocean", label: "Ocean", preview: "from-[#0f3a55] via-[#144a6a] to-[#0d2c44]" },
  { id: "forest", label: "Forest", preview: "from-[#1f3027] via-[#2c4636] to-[#1a2620]" },
  { id: "midnight", label: "Midnight", preview: "from-[#131634] via-[#1f2350] to-[#0e1024]" },
  { id: "nebula", label: "Nebula", preview: "from-[#1c1238] via-[#2b1c4f] to-[#150e29]" },
  { id: "plum", label: "Plum", preview: "from-[#2a1430] via-[#3e1d44] to-[#1c0e22]" },
];

const accentSwatches = ["#339b8e", "#4f8cff", "#8b5cf6", "#ef6f53", "#f59e0b", "#111827"];
const contrastModes: Array<{ id: ContrastMode; label: string }> = [
  { id: "auto", label: "Auto" },
  { id: "dark", label: "Dark text" },
  { id: "light", label: "Light text" },
];
const scaleOptions: Array<{ id: UIScale; label: string }> = [
  { id: "compact", label: "Compact" },
  { id: "cozy", label: "Cozy" },
  { id: "large", label: "Large" },
];

export function SettingsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [section, setSection] = useState<SettingsSection>("home");
  const [uploadStatus, setUploadStatus] = useState<"idle" | "loading" | "error">("idle");
  const preferences = useHomeStore((state) => state.preferences);
  const setTheme = useHomeStore((state) => state.setTheme);
  const setWallpaperImage = useHomeStore((state) => state.setWallpaperImage);
  const setFont = useHomeStore((state) => state.setFont);
  const setSearchProvider = useHomeStore((state) => state.setSearchProvider);
  const setThemeControls = useHomeStore((state) => state.setThemeControls);

  const previewTheme = useCallback(
    (override: Partial<ThemeDraft>) => {
      if (typeof document === "undefined") return;
      const contrast = resolveContrast(
        preferences.contrast,
        Boolean(preferences.wallpaperImage),
        preferences.theme,
        preferences.wallpaperLuminance,
      );
      const vars = buildThemeVariables({
        accentColor: override.accentColor ?? preferences.accentColor,
        uiOpacity: override.uiOpacity ?? preferences.uiOpacity,
        blur: override.blur ?? preferences.blur,
        contrast,
      });
      Object.entries(vars).forEach(([key, value]) => document.body.style.setProperty(key, value));
    },
    [preferences],
  );

  if (!open) return null;

  async function onUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadStatus("loading");
    try {
      const { dataUrl, luminance } = await prepareWallpaperImage(file);
      setWallpaperImage(dataUrl, luminance);
      setUploadStatus("idle");
    } catch {
      setUploadStatus("error");
    } finally {
      event.target.value = "";
    }
  }

  const title = section === "home" ? "Settings" : sectionTitle[section];

  return (
    <div className="fixed inset-0 z-50 bg-black/20 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Settings">
      <div className="ml-auto flex h-full w-full max-w-[420px] flex-col overflow-y-auto rounded-[28px] border border-[color:var(--border)] bg-[color:var(--panel)] p-6 shadow-panel ui-glass">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {section !== "home" ? (
              <button
                type="button"
                aria-label="Back to settings"
                onClick={() => setSection("home")}
                className="grid h-10 w-10 place-items-center rounded-full hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
              >
                <FiChevronLeft />
              </button>
            ) : null}
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
          <button
            type="button"
            aria-label="Close settings"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
          >
            <FiX />
          </button>
        </header>

        {section === "home" ? (
          <div className="mt-7 grid gap-3">
            <SectionButton icon={<FiSun />} title="Theme" detail="Color, contrast, glass" onClick={() => setSection("theme")} />
            <SectionButton icon={<FiImage />} title="Wallpaper" detail="Upload, preview, remove" onClick={() => setSection("wallpaper")} />
            <SectionButton icon={<FiSearch />} title="Search" detail="Default engine" onClick={() => setSection("search")} />
            <SectionButton icon={<FiType />} title="Font" detail="Five visual styles" onClick={() => setSection("font")} />
            <SectionButton icon={<FiGrid />} title="Layout" detail="Favorites and widget density" onClick={() => setSection("layout")} />
          </div>
        ) : null}

        {section === "theme" ? (
          <div className="mt-7">
            <section>
              <h3 className="text-sm font-semibold text-[color:var(--muted)]">Theme base</h3>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {backgrounds.map((background) => (
                  <button
                    key={background.id}
                    type="button"
                    aria-label={`${background.label} background`}
                    onClick={() => setTheme(background.id)}
                    className={`h-24 overflow-hidden rounded-[18px] border p-2 text-left text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] ${
                      preferences.theme === background.id ? "border-[color:var(--accent)]" : "border-[color:var(--border)]"
                    }`}
                  >
                    <span className={`block h-full rounded-[14px] bg-gradient-to-br ${background.preview}`} />
                    <span className="sr-only">{background.label}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="mt-7">
              <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--muted)]">
                <FiDroplet />
                Primary color
              </div>
              <div className="mt-3 flex items-center gap-3">
                <input
                  type="color"
                  aria-label="Primary theme color"
                  value={preferences.accentColor}
                  onChange={(event) => setThemeControls({ accentColor: event.target.value })}
                  onInput={(event) => previewTheme({ accentColor: event.currentTarget.value })}
                  className="h-11 w-14 cursor-pointer rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-1"
                />
                <div className="flex flex-wrap gap-2">
                  {accentSwatches.map((color) => (
                    <button
                      key={color}
                      type="button"
                      aria-label={`Use ${color} as primary color`}
                      onClick={() => setThemeControls({ accentColor: color })}
                      className={`h-9 w-9 rounded-full border-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] ${
                        preferences.accentColor.toLowerCase() === color ? "border-[color:var(--ink)]" : "border-white/80"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-7">
              <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--muted)]">
                <FiLayers />
                System glass
              </div>
              <RangeField
                label="Transparency"
                min={42}
                max={96}
                value={preferences.uiOpacity}
                suffix="% solid"
                onPreview={(value) => previewTheme({ uiOpacity: value })}
                onCommit={(value) => setThemeControls({ uiOpacity: value })}
              />
              <RangeField
                label="Blur"
                min={0}
                max={28}
                value={preferences.blur}
                suffix="px"
                onPreview={(value) => previewTheme({ blur: value })}
                onCommit={(value) => setThemeControls({ blur: value })}
              />
            </section>

            <section className="mt-7">
              <h3 className="text-sm font-semibold text-[color:var(--muted)]">Text contrast</h3>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {contrastModes.map((mode) => (
                  <SegmentButton
                    key={mode.id}
                    active={preferences.contrast === mode.id}
                    onClick={() => setThemeControls({ contrast: mode.id })}
                  >
                    {mode.label}
                  </SegmentButton>
                ))}
              </div>
            </section>
          </div>
        ) : null}

        {section === "wallpaper" ? (
          <section className="mt-7">
            <h3 className="text-sm font-semibold text-[color:var(--muted)]">Wallpaper image</h3>
            <div className="mt-3 grid gap-3">
              <label className="grid min-h-28 cursor-pointer place-items-center rounded-[22px] border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] p-4 text-sm font-semibold text-[color:var(--muted)] transition hover:bg-[color:var(--surface-strong)]">
                <input type="file" accept="image/*" onChange={onUpload} className="sr-only" />
                <span className="grid place-items-center gap-2 text-center">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[color:var(--surface-strong)] text-2xl text-[color:var(--accent)] shadow-tile">
                    <FiUploadCloud />
                  </span>
                  {uploadStatus === "loading" ? "Preparing image..." : "Upload wallpaper"}
                </span>
              </label>
              {preferences.wallpaperImage ? (
                <div
                  className="h-40 rounded-[22px] border border-[color:var(--border)] bg-cover bg-center shadow-inner"
                  style={{ backgroundImage: `url("${preferences.wallpaperImage}")` }}
                  aria-label="Current wallpaper preview"
                />
              ) : null}
            </div>
            {uploadStatus === "error" ? (
              <p className="mt-2 text-sm font-medium text-[#b42318]">Cannot read that image. Try a smaller JPG or PNG.</p>
            ) : null}
            {preferences.wallpaperImage ? (
              <button
                type="button"
                onClick={() => setWallpaperImage(null)}
                className="mt-3 rounded-full bg-[color:var(--surface)] px-3 py-2 text-sm font-semibold text-[color:var(--muted)] hover:bg-[color:var(--surface-strong)]"
              >
                Remove wallpaper
              </button>
            ) : null}
          </section>
        ) : null}

        {section === "search" ? (
          <section className="mt-7">
            <h3 className="text-sm font-semibold text-[color:var(--muted)]">Default search</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {searchProviders.map((provider) => {
                const brand = getBrandIcon(provider.id);
                const Icon = brand.icon;
                return (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => setSearchProvider(provider.id)}
                    className={`inline-flex min-h-12 items-center gap-2 rounded-2xl border px-3 text-left text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] ${
                      preferences.searchProvider === provider.id
                        ? "border-[color:var(--ink)] bg-[color:var(--ink)] text-[color:var(--ink-inverse)]"
                        : "border-[color:var(--border)] bg-[color:var(--surface)]"
                    }`}
                  >
                    <Icon style={{ color: preferences.searchProvider === provider.id ? "currentColor" : brand.color }} />
                    {provider.label}
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}

        {section === "font" ? (
          <section className="mt-7">
            <h3 className="text-sm font-semibold text-[color:var(--muted)]">Font style</h3>
            <div className="mt-3 grid gap-2">
              {fontOptions.map((font) => (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => setFont(font.id)}
                  className={`flex min-h-12 items-center justify-between rounded-2xl border px-3 text-left transition focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] ${
                    preferences.font === font.id
                      ? "border-[color:var(--ink)] bg-[color:var(--ink)] text-[color:var(--ink-inverse)]"
                      : "border-[color:var(--border)] bg-[color:var(--surface)]"
                  }`}
                >
                  <span className="text-sm font-semibold">{font.label}</span>
                  <span className={`font-${font.id} text-lg font-semibold`}>{font.sample}</span>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {section === "layout" ? (
          <section className="mt-7">
            <h3 className="text-sm font-semibold text-[color:var(--muted)]">Element size</h3>
            <div className="mt-3">
              <div className="text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--muted)]">Favorites</div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {scaleOptions.map((option) => (
                  <SegmentButton
                    key={option.id}
                    active={preferences.favoriteScale === option.id}
                    onClick={() => setThemeControls({ favoriteScale: option.id })}
                  >
                    {option.label}
                  </SegmentButton>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--muted)]">Widgets</div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {scaleOptions.map((option) => (
                  <SegmentButton
                    key={option.id}
                    active={preferences.widgetScale === option.id}
                    onClick={() => setThemeControls({ widgetScale: option.id })}
                  >
                    {option.label}
                  </SegmentButton>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

const sectionTitle: Record<Exclude<SettingsSection, "home">, string> = {
  theme: "Theme",
  wallpaper: "Wallpaper",
  search: "Search",
  font: "Font",
  layout: "Layout",
};

function SectionButton({ icon, title, detail, onClick }: { icon: ReactNode; title: string; detail: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-16 items-center gap-3 rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 text-left transition hover:bg-[color:var(--surface-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
    >
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[color:var(--accent-soft)] text-[color:var(--accent)]">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block truncate text-xs text-[color:var(--muted)]">{detail}</span>
      </span>
      <FiChevronRight className="text-[color:var(--muted)]" />
    </button>
  );
}

function SegmentButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-10 rounded-2xl border px-2 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] ${
        active ? "border-[color:var(--ink)] bg-[color:var(--ink)] text-[color:var(--ink-inverse)]" : "border-[color:var(--border)] bg-[color:var(--surface)]"
      }`}
    >
      {children}
    </button>
  );
}

function RangeField({
  label,
  min,
  max,
  value,
  suffix,
  onPreview,
  onCommit,
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  suffix: string;
  onPreview: (value: number) => void;
  onCommit: (value: number) => void;
}) {
  const [draft, setDraft] = useState(value);

  if (draft !== value && document.activeElement?.getAttribute("aria-label") !== label) {
    setDraft(value);
  }

  return (
    <label className="mt-3 block text-sm font-semibold text-[color:var(--muted)]">
      {label}
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        value={draft}
        onInput={(event) => {
          const next = Number(event.currentTarget.value);
          setDraft(next);
          onPreview(next);
        }}
        onChange={(event) => onCommit(Number(event.target.value))}
        onPointerUp={() => onCommit(draft)}
        onKeyUp={() => onCommit(draft)}
        className="mt-2 w-full accent-[color:var(--accent)]"
      />
      <span className="text-xs">
        {draft}
        {suffix}
      </span>
    </label>
  );
}

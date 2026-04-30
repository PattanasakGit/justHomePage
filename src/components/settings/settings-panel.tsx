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
import { themeCatalog, getThemeDefinition, getDefaultAccent } from "@/data/themes";
import { prepareWallpaperImage } from "@/lib/image-file";
import { fontOptions } from "@/lib/fonts";
import { searchProviders } from "@/lib/search";
import { buildThemeVariables, resolveContrast } from "@/lib/theme";
import type { BackgroundId, ContrastMode, Preferences, ThemeCategory, UIScale } from "@/lib/types";
import { useHomeStore } from "@/stores/home-store";

type ThemeDraft = Pick<Preferences, "accentColor" | "uiOpacity" | "blur">;

type SettingsSection = "home" | "theme" | "wallpaper" | "search" | "font" | "layout";

const themeCategoryTabs: Array<{ id: ThemeCategory; label: string }> = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];

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
  const resetZones = useHomeStore((state) => state.resetZones);

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
      <div className="ml-auto flex h-full w-full max-w-[420px] flex-col overflow-y-auto rounded-[28px] border border-[color:var(--border)] bg-[color:var(--popup)] p-6 shadow-panel">
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
          <ThemeSection
            preferences={preferences}
            setTheme={setTheme}
            setThemeControls={setThemeControls}
            previewTheme={previewTheme}
          />
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
            <div className="mt-6 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-3">
              <div className="text-sm font-semibold">Zone layout</div>
              <p className="mt-1 text-xs text-[color:var(--muted)]">
                Restore Search, Favorites, and Workspace to their default order and visibility.
              </p>
              <button
                type="button"
                onClick={resetZones}
                className="mt-3 inline-flex min-h-10 items-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 text-sm font-semibold transition hover:bg-[color:var(--accent-soft)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
              >
                Reset zone layout
              </button>
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

  const fillPercent = ((draft - min) / Math.max(1, max - min)) * 100;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">{label}</span>
        <span className="rounded-full bg-[color:var(--surface)] px-2 py-0.5 text-[11px] font-bold text-[color:var(--ink)]">
          {draft}
          {suffix}
        </span>
      </div>
      <div className="relative mt-3 h-7">
        <span className="pointer-events-none absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-[color:var(--surface)]" aria-hidden />
        <span
          className="pointer-events-none absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-[color:var(--accent)]"
          style={{ width: `${fillPercent}%` }}
          aria-hidden
        />
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
          className="theme-range absolute inset-0 w-full appearance-none bg-transparent focus:outline-none"
        />
      </div>
    </div>
  );
}

function ThemeSection({
  preferences,
  setTheme,
  setThemeControls,
  previewTheme,
}: {
  preferences: Preferences;
  setTheme: (theme: BackgroundId) => void;
  setThemeControls: (controls: Partial<Pick<Preferences, "accentColor" | "uiOpacity" | "blur" | "contrast" | "favoriteScale" | "widgetScale">>) => void;
  previewTheme: (override: Partial<ThemeDraft>) => void;
}) {
  const currentDef = getThemeDefinition(preferences.theme);
  const initialCategory: ThemeCategory = currentDef.category;
  const [tab, setTab] = useState<ThemeCategory>(initialCategory);

  const themesForTab = themeCatalog.filter((theme) => theme.category === tab);
  const accents = currentDef.accents;

  function pickTheme(id: BackgroundId) {
    setTheme(id);
    const next = getThemeDefinition(id);
    if (!next.accents.includes(preferences.accentColor)) {
      setThemeControls({ accentColor: getDefaultAccent(id) });
    }
  }

  return (
    <div className="mt-6">
      <section>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[color:var(--muted)]">Theme base</h3>
          <div className="inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] p-1 text-xs font-semibold">
            {themeCategoryTabs.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => setTab(entry.id)}
                className={`min-w-[58px] rounded-full px-3 py-1 transition focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] ${
                  tab === entry.id ? "bg-[color:var(--ink)] text-[color:var(--ink-inverse)]" : "text-[color:var(--muted)]"
                }`}
              >
                {entry.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {themesForTab.map((theme) => (
            <button
              key={theme.id}
              type="button"
              aria-label={`${theme.label} theme`}
              onClick={() => pickTheme(theme.id)}
              className={`relative h-24 overflow-hidden rounded-[18px] border p-2 text-left text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] ${
                preferences.theme === theme.id ? "border-[color:var(--accent)]" : "border-[color:var(--border)]"
              }`}
            >
              <span className={`block h-full rounded-[14px] bg-gradient-to-br ${theme.preview}`} />
              <span className="absolute inset-x-2 bottom-2 flex items-center justify-between rounded-full bg-black/35 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur">
                {theme.label}
                <span className="text-[9px] uppercase tracking-[0.18em] opacity-80">{theme.style}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-7">
        <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--muted)]">
          <FiDroplet />
          Primary color
        </div>
        <p className="mt-1 text-xs text-[color:var(--muted)]">Hand-picked accents for {currentDef.label}.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {accents.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`Use ${color} as primary color`}
              onClick={() => setThemeControls({ accentColor: color })}
              className={`relative h-11 w-11 rounded-2xl border-2 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] ${
                preferences.accentColor.toLowerCase() === color.toLowerCase()
                  ? "scale-105 border-[color:var(--ink)]"
                  : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
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
  );
}

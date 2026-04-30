# justHomePage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the MVP homepage with a scalable project foundation.

**Architecture:** Next.js App Router with client components for the homepage, Zustand for local interaction state, and API/SQLite boundaries for later persistence.

**Tech Stack:** Next.js, TypeScript, Tailwind, Zustand, React Icons, dnd-kit, libSQL/SQLite, Vitest, Playwright.

---

## Tasks

- [x] Scaffold Next.js project files.
- [x] Add failing tests for search and home store behavior.
- [x] Implement search provider utility.
- [x] Implement Zustand home store.
- [x] Implement homepage UI, favorites, widgets, settings, and themes.
- [x] Add API and SQLite schema boundary.
- [x] Add requirements, system design, UX, UI, testing, and agent knowledge docs.
- [x] Add editable favorites, better brand icons, image upload background, and closer design fidelity.
- [x] Add real location/timezone/Celsius weather sync, metadata-based favorite logos, compressed wallpaper upload, and separate theme/wallpaper state.
- [x] Move search engines into the search dropdown, add AI providers, fix wallpaper/theme layering, remove duplicate widget top button, and add five font styles.
- [x] Add primary theme color, text contrast, UI opacity, UI blur, favorite/widget size controls, and DnD performance improvements.
- [x] Run `bun install`, tests, build, and visual verification.

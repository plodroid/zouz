# Zouz

A functional GCSE study website built as a complete first vertical slice for **AQA-style GCSE Maths: Algebra / Linear Equations**.

## What works

- Learn: three structured lessons with reasoning, worked examples, common mistakes, mini-checks, bookmarks, review-later, and completion.
- Practice: adaptive Easy → Medium → Hard training with generated questions, explanations, mastery, and mistake tracking.
- Quiz: regenerated 20/30/40/50-question tests, Foundation/Higher settings, typed + multiple-choice questions, normal mode, and Perfect Run reset mode.
- Progress: real lesson completion, quiz accuracy, mastery, streak, quiz-history chart, weak areas, activity log, and mistake retries.
- Search: Ctrl/Cmd+K command-style search across lessons and modes.
- Persistence: browser `localStorage`; no account or backend required for this version.
- Appearance: Light / Dark / Auto.
- Responsive: desktop island navigation + mobile floating tab bar.

## Architecture

This repo intentionally uses plain HTML, CSS, and JavaScript so it can run directly on GitHub Pages with no build step and no GitHub Actions.

- `index.html` — semantic app shell and accessible UI structure.
- `styles.css` — shared Plexium design tokens/components, responsive rules, motion, Liquid Glass controls, theme, and accessibility fallbacks.
- `data.js` — lesson data, search index, and reusable random equation/question generators.
- `app.js` — state persistence, lesson/practice/quiz/progress logic, search, theme, navigation, and interaction systems.

## Run locally

Open `index.html`, or serve the folder with any static server.

Example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Scope

This version deliberately ships one **complete, usable learning track** instead of dozens of fake or unfinished subject pages. The data and UI systems are structured so more GCSE subjects, topics, lessons, question banks, and flashcards can be added without rewriting the core app.

# task-tracker# Ledger — a task tracker

A small, dependency-free task tracker built with plain HTML, CSS, and JavaScript. No frameworks, no build step — open `index.html` and it runs.


## Why I built this

I wanted a project that shows the fundamentals clearly: DOM manipulation, state management, persistence, and basic data visualization, without a framework hiding how any of it works.

## Features

- Add, complete, and delete tasks
- Organize by category (Work / School / Personal) and priority (Low / Medium / High)
- Filter by status (All / Open / Completed) and category
- Sort by date added, due date, or priority
- Data persists between visits using `localStorage`
- A weekly activity chart (drawn on `<canvas>`, no chart library) showing how many tasks you completed each of the last 7 days
- Responsive layout — usable on mobile

## Tech

- HTML5 / CSS3 (CSS Grid, custom properties)
- Vanilla JavaScript (ES6+) — no frameworks or libraries
- `localStorage` for persistence
- `<canvas>` 2D API for the chart

## Running it locally

No build step needed. Either:

1. Open `index.html` directly in your browser, **or**
2. Serve it locally (avoids some browser restrictions):
   ```bash
   python3 -m http.server 8000
   # then visit http://localhost:8000
   ```

## Project structure

```
task-tracker/
├── index.html   # page structure
├── style.css    # design system + layout
├── app.js       # state, rendering, events, chart
└── README.md
```



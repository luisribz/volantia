# Volantia

**Your travels and flights, in one place.** A personal travel tracker that merges what
[Been](https://apps.apple.com/app/been/id382909059) does (countries, regions, trips) with what
myFlightradar24 / MyFlightPath do (flight logbook, routes, airports) — because nothing connects the two.

Live at **https://luisribz.github.io/volantia/**

## What it does

- **World map** — countries visited, lived in, and on the wishlist. Tap any country for its trips and flights; switch to route mode to see every flight path you've flown and tap one for its history.
- **Flights** — full logbook with stats: top routes, airlines, airports, cabin classes, aircraft, distance flown, flights per year. Everything is tappable.
- **Trips** — Been-style timeline by year, with transport used, cities and notes. Add or edit trips as you travel.
- **Home** — headline stats, continent progress, upcoming flights.

Installable as a home-screen app (PWA) and works offline after the first load.

## Your data stays yours

There is no server and no account. Everything lives in your own browser's storage on each device.
This repo contains only the app itself — no personal travel data is published here.

- **Import**: Data tab → import a Volantia JSON (built from Been / MyFlightPath / myFlightradar24 exports).
- **Export**: Data tab → download a full JSON backup. Do this regularly, and to move data between devices.

## Files

| File | Purpose |
|---|---|
| `index.html` | The entire app — HTML, CSS and JS in one file, no build step |
| `sw.js` | Service worker: offline shell, caches map and flag data |
| `manifest.webmanifest` | PWA config (name, colors, icons) |
| `icon-*.png`, `apple-touch-icon.png`, `logo-64.png` | App icons |

## Shipping an update

Replace `index.html` in this repo (drag onto the repo page → "Commit directly to the main branch" → Commit).
Live in about a minute. The file must always end with `<!--VOLANTIA-EOF-->` — that marker is how a
complete deploy is verified. Icons only refresh on a device when the icon *filenames* change.

## Credits

Built with Claude. Flag images by [flagcdn.com](https://flagcdn.com), world geometry from
[world-atlas](https://github.com/topojson/world-atlas), airport coordinates from
[airportsdata](https://pypi.org/project/airportsdata/).

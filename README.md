# Citation Globe

A Wii-Weather-style spinning globe where every glowing dot is somebody else's research or invention that inspired you.
Drag to spin, scroll/pinch to zoom, click a glowing dot (or a highlighted country) to open its info panel, or use **Fly to…** to jump straight to an entry.

Plain static site: no build step, no npm install, no server code.

## Run it locally

Browsers block textures loaded from `file://`, so use any tiny local server:

```bash
cd citation-globe
python3 -m http.server 8000      # then open http://localhost:8000
```

(Node alternative: `npx serve .`)

## Add an entry

Open **`data/citations.js`**, copy one of the objects in the `CITATIONS` list, paste it below, and edit:

```js
{
  id: "turing-morphogenesis",          // unique slug (also the deep link: index.html#turing-morphogenesis)
  title: "The Chemical Basis of Morphogenesis",
  creator: "Alan Turing",
  year: 1952,                           // number, or text like "c. 550 BC"
  country: "United Kingdom",            // see "Country names" below
  lat: 53.4808, lon: -2.2426,           // where the glowing dot sits (west/south are negative)
  place: "Manchester",                  // label next to the dot
  description: "One friendly sentence about why it matters.",
  links: [ { label: "Wikipedia", url: "https://en.wikipedia.org/wiki/..." } ],
  tags: ["math", "biology"],
  example: false                        // true shows an "Example entry" badge; delete the starter examples when you're ready
}
```

Save and refresh. Several entries in the same country share one panel; several at the same place share one dot.
The top-of-page text (banner, subtitle, intro line, page title) is in `CITATION_GLOBE_CONFIG` at the top of the same file.

### Country names
`country` has to match the map's country names (Natural Earth names), e.g. `Austria`, `Russia`, `India`, `France`,
`United States of America`, `United Kingdom`, `Czechia`, `Dem. Rep. Congo`, `Bosnia and Herz.`.
Common aliases like `USA`, `UK`, `Czech Republic`, `Turkey` also work. If a name isn't recognised the browser console prints a warning
(the dot still appears, but the country won't be clickable). The full list is in `data/countries.js` (search for `"name":`).

## Host it (free)

**GitHub Pages:** push this folder to a repo → *Settings → Pages → Deploy from a branch → `main` / root*. Done: `https://<you>.github.io/<repo>/`.
(A `.nojekyll` file is included.) Netlify / Cloudflare Pages / any static host works the same: just upload the folder.

## What's inside

```
index.html            page shell
css/style.css         Wii-style UI (fonts, panel, banner, markers)
js/app.js             globe, interaction, panel, search, sound controls
js/audio.js           generated night music, swoosh and chimes (Web Audio, no files)
data/citations.js     <-- YOUR DATA (and page text)
data/countries.js     country borders (generated; rarely edited)
assets/earth-wii.jpg  stylised earth texture (derived from NASA Blue Marble)
assets/ocean-mask.png ocean-only specular map for the glossy sea
assets/fonts/         Nunito (rounded sans, SIL OFL)
vendor/               globe.gl 2.46.2 (bundles three.js r187), licences
tools/                scripts used to generate the texture + borders (optional)
```

### Night music & sound effects

Everything you hear is **generated live in the browser with the Web Audio API**: no audio files, no samples, nothing copied from any game.

- **Night music**: a slow, warm pad in D major (detuned sine/triangle voices through a low-pass filter and a long generated reverb), occasional soft pentatonic bell chimes, and a faint filtered-noise "night air".
- **Swoosh**: filtered noise that follows how fast you spin the globe. Faster spins are a little louder and brighter, and it fades out with the globe's inertia. It is smoothed and capped so it stays gentle.
- **Chimes**: soft bell sounds when a panel opens/closes or you fly to a place.
- **Controls**: the speaker button (bottom-right) turns music + effects on/off. When on, the small sliders button next to it opens a panel with separate **Night music** and **Swoosh & chimes** switches and a **Volume** slider (default is low).
- **Off by default.** Browsers block autoplay, so audio only starts after you click the speaker. Your choices are remembered in `localStorage` (`citationGlobe.audio.v1`); if you left it on, it resumes at your first tap or key press on the next visit.
- To change the mood, edit `CHORDS`, `PENTA` and the levels at the top of `js/audio.js`.
Auto-rotation pauses while you interact or a panel is open and respects `prefers-reduced-motion`.

## Credits & licences

- Imagery: NASA Blue Marble (public domain), via the three-globe example texture, re-coloured here for a Wii-like look.
- Country borders: Natural Earth (public domain) via world-atlas 2.0.2 (ISC).
- globe.gl & three-globe by Vasco Asturiano (MIT); three.js (MIT) — licences in `vendor/`.
- Font: Nunito (SIL Open Font License 1.1).
- **Inspired by Nintendo's Wii Forecast Channel** (Kyoto, Japan, December 2006). Thank you, Nintendo & Japan. It is credited on the globe (Japan → "Forecast Channel (Wii) globe") and in the footer. This is an independent fan tribute: no Nintendo assets or audio are used, and it is not affiliated with Nintendo.

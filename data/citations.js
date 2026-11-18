/* ============================================================
   CITATION GLOBE — your data lives here.
   Edit this file, save, refresh the page. That's it!

   Each entry in CITATIONS is one inspiration.
   Fields:
     id          unique short slug, e.g. "schrodinger-wave-equation"
     title       name of the work / invention
     creator     who made it
     year        number (1926) or text ("c. 550 BC")
     country     must match a country name on the map (see README: "Country names")
     lat, lon    where the marker sits (decimal degrees; west/south are negative)
     place       the label shown next to the glowing dot (e.g. "Vienna")
     description one friendly sentence
     links       [{ label, url }, ...]  one or more links
     tags        ["math", "music", ...]  (searchable)
     example     true = placeholder/sample entry (shows an "Example" badge). Delete the
                 field or set false for the real ones.
   ============================================================ */

window.CITATION_GLOBE_CONFIG = {
  pageTitle: "Citation Globe — inspirations from around the world",
  bannerText: "CURRENT INSPIRATIONS",
  bannerSubtitle: "Trevor's citation catalog",
  intro: "Spin the globe, find a glowing dot, and meet someone who inspired me.",
  // Set to false to hide the little "Example" badge system entirely:
  showExampleBadges: true
};

window.CITATIONS = [
  /* ---------- Real seed entries ---------- */
  {
    id: "schrodinger-wave-equation",
    title: "The Schrödinger wave equation",
    creator: "Erwin Schrödinger",
    year: 1926,
    country: "Austria",
    lat: 48.2082, lon: 16.3738,
    place: "Vienna",
    description:
      "A wave equation for matter that turned atoms into standing waves and became the foundation of quantum mechanics. Schrödinger was born in Vienna; he published the 1926 papers while working at the University of Zurich.",
    links: [
      { label: "Wikipedia: Schrödinger equation", url: "https://en.wikipedia.org/wiki/Schr%C3%B6dinger_equation" },
      { label: "Wikipedia: Erwin Schrödinger", url: "https://en.wikipedia.org/wiki/Erwin_Schr%C3%B6dinger" }
    ],
    tags: ["physics", "math", "waves", "quantum"],
    example: false
  },
  {
    id: "ans-synthesizer",
    title: "ANS synthesizer",
    creator: "Evgeny Murzin",
    year: 1957,
    country: "Russia",
    lat: 55.7558, lon: 37.6173,
    place: "Moscow",
    description:
      "A photoelectronic instrument you compose for by scratching a spectrogram onto glass — 720 pure sine tones drawn as light. Murzin built it between 1937 and 1957 and named it after the composer Alexander Scriabin.",
    links: [
      { label: "Wikipedia: ANS synthesizer", url: "https://en.wikipedia.org/wiki/ANS_synthesizer" },
      { label: "Wikipedia: Evgeny Murzin", url: "https://en.wikipedia.org/wiki/Evgeny_Murzin" }
    ],
    tags: ["music", "sound design", "synthesis", "invention"],
    example: false
  },

  /* ---------- Starter examples (swap these for your own!) ---------- */
  {
    id: "ramanujan-partitions",
    title: "Partition asymptotics & congruences",
    creator: "Srinivasa Ramanujan (with G. H. Hardy)",
    year: 1918,
    country: "India",
    lat: 10.9617, lon: 79.3881,
    place: "Kumbakonam",
    description:
      "How many ways can a number be written as a sum? Ramanujan, who grew up in Kumbakonam, found startling patterns in partitions; with Hardy he gave the 1918 asymptotic formula for p(n).",
    links: [
      { label: "Wikipedia: Partition function", url: "https://en.wikipedia.org/wiki/Partition_function_(number_theory)" },
      { label: "Wikipedia: Srinivasa Ramanujan", url: "https://en.wikipedia.org/wiki/Srinivasa_Ramanujan" }
    ],
    tags: ["math", "number theory"],
    example: true
  },
  {
    id: "fourier-heat-analysis",
    title: "Fourier series & analysis",
    creator: "Joseph Fourier",
    year: 1822,
    country: "France",
    lat: 48.8566, lon: 2.3522,
    place: "Paris",
    description:
      "Any wiggle can be built from sine waves. Fourier's Analytical Theory of Heat (1822) is where the idea that powers every spectrum analyzer and EQ was set down.",
    links: [
      { label: "Wikipedia: Fourier analysis", url: "https://en.wikipedia.org/wiki/Fourier_analysis" },
      { label: "Wikipedia: Joseph Fourier", url: "https://en.wikipedia.org/wiki/Joseph_Fourier" }
    ],
    tags: ["math", "waves", "sound design"],
    example: true
  },
  {
    id: "theremin",
    title: "The theremin",
    creator: "Leon Theremin (Lev Termen)",
    year: 1920,
    country: "Russia",
    lat: 59.9311, lon: 30.3609,
    place: "St. Petersburg",
    description:
      "An instrument played without touching it: your hands shape pitch and volume in the air. Invented in Petrograd (now St. Petersburg) in 1920, patented in 1928.",
    links: [
      { label: "Wikipedia: Theremin", url: "https://en.wikipedia.org/wiki/Theremin" },
      { label: "Wikipedia: Leon Theremin", url: "https://en.wikipedia.org/wiki/Leon_Theremin" }
    ],
    tags: ["music", "sound design", "invention"],
    example: true
  },
  {
    id: "chowning-fm-synthesis",
    title: "FM synthesis",
    creator: "John Chowning",
    year: 1967,
    country: "United States of America",
    lat: 37.4275, lon: -122.1697,
    place: "Stanford",
    description:
      "Chowning discovered at Stanford that one oscillator bending another's frequency makes rich, bell-like spectra from almost no math — a shortcut that later powered a generation of digital synths.",
    links: [
      { label: "Wikipedia: FM synthesis", url: "https://en.wikipedia.org/wiki/Frequency_modulation_synthesis" },
      { label: "Wikipedia: John Chowning", url: "https://en.wikipedia.org/wiki/John_Chowning" }
    ],
    tags: ["music", "sound design", "synthesis", "math"],
    example: true
  }
];

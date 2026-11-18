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

  /* ---------- The binary thread: Egypt → China → Germany → England ---------- */
  {
    id: "egyptian-doubling-halving",
    title: "Duplation & mediation: Egyptian doubling arithmetic",
    creator: "Ancient Egyptian scribes (e.g. Ahmes, who copied the Rhind Papyrus)",
    year: "c. 1550 BC",
    country: "Egypt",
    lat: 25.6872, lon: 32.6396,
    place: "Thebes (Luxor)",
    description:
      "Egyptian scribes multiplied by doubling one number again and again (and halving the other) and then adding up just the right doublings. They had no idea of base 2, yet it is essentially binary multiplication, found in the Rhind Mathematical Papyrus. This is the first stop on a binary thread that runs to the I Ching and on to Leibniz.",
    links: [
      { label: "Wikipedia: Ancient Egyptian multiplication", url: "https://en.wikipedia.org/wiki/Ancient_Egyptian_multiplication" },
      { label: "Wikipedia: Rhind Mathematical Papyrus", url: "https://en.wikipedia.org/wiki/Rhind_Mathematical_Papyrus" }
    ],
    tags: ["math", "binary-thread", "ancient", "arithmetic"],
    example: false
  },
  {
    id: "iching-fuxi-hexagram-order",
    title: "I Ching hexagrams & the Fu Xi (Shao Yong) ordering",
    creator: "Traditionally attributed to Fu Xi; ordered by Shao Yong",
    year: "11th century AD",
    country: "China",
    lat: 34.6197, lon: 112.4540,
    place: "Luoyang",
    description:
      "The 64 hexagrams of the I Ching are stacks of solid and broken lines, and the scholar Shao Yong, working in Luoyang, arranged them in an order that reads just like counting in binary, though he never meant it as math. Missionary Joachim Bouvet sent that diagram to Leibniz in 1701, closing a loop that began with Egyptian doubling.",
    links: [
      { label: "Wikipedia: Shao Yong", url: "https://en.wikipedia.org/wiki/Shao_Yong" },
      { label: "Wikipedia: Hexagram (I Ching)", url: "https://en.wikipedia.org/wiki/Hexagram_(I_Ching)" },
      { label: "Wikipedia: Binary number (history)", url: "https://en.wikipedia.org/wiki/Binary_number" }
    ],
    tags: ["math", "binary-thread", "binary", "philosophy"],
    example: false
  },
  {
    id: "leibniz-binary-arithmetic",
    title: "Binary arithmetic (Explication de l'Arithmétique Binaire)",
    creator: "Gottfried Wilhelm Leibniz",
    year: 1703,
    country: "Germany",
    lat: 52.3759, lon: 9.7320,
    place: "Hanover",
    description:
      "Leibniz, who worked in Hanover from 1676 until his death, laid out arithmetic using only 0 and 1 and in his 1703 essay recognised the same pattern in the I Ching hexagrams after Joachim Bouvet's letters from China. The next stop on the binary thread after Egypt and China.",
    links: [
      { label: "Wikipedia: Gottfried Wilhelm Leibniz", url: "https://en.wikipedia.org/wiki/Gottfried_Wilhelm_Leibniz" },
      { label: "Wikipedia: Binary number (history)", url: "https://en.wikipedia.org/wiki/Binary_number" },
      { label: "The 1703 essay (French text, Wikisource)", url: "https://fr.wikisource.org/wiki/Leibniz-en.francais-Gerhardt.Math.1a7.djvu/Num%C3%A9ration.binaire" }
    ],
    tags: ["math", "binary-thread", "binary", "computing", "philosophy"],
    example: false
  },
  {
    id: "lovelace-analytical-engine-notes",
    title: "Notes on the Analytical Engine (the first published program)",
    creator: "Ada Lovelace",
    year: 1843,
    country: "United Kingdom",
    lat: 51.5074, lon: -0.1278,
    place: "London",
    description:
      "Ada Lovelace, born in London, added seven long notes to a paper on Babbage's Analytical Engine, including a step-by-step method for computing Bernoulli numbers (often called the first published computer program). She also guessed that such a machine could even compose music. The engine itself counted in decimal, not binary.",
    links: [
      { label: "Wikipedia: Ada Lovelace", url: "https://en.wikipedia.org/wiki/Ada_Lovelace" },
      { label: "Wikipedia: Analytical Engine", url: "https://en.wikipedia.org/wiki/Analytical_Engine" },
      { label: "Her 1843 Notes (full text)", url: "https://www.fourmilab.ch/babbage/sketch.html" }
    ],
    tags: ["computing", "math", "music", "programming"],
    example: false
  },

  /* ---------- Pi, from China to Ramanujan ---------- */
  {
    id: "zu-chongzhi-milu",
    title: "Zu's ratio: Milü, 355/113 for pi",
    creator: "Zu Chongzhi",
    year: "5th century AD",
    country: "China",
    lat: 32.0603, lon: 118.7969,
    place: "Nanjing",
    description:
      "Zu Chongzhi, born in Jiankang (today's Nanjing), pinned pi between 3.1415926 and 3.1415927 and gave the famous fraction 355/113, a record that stood for nearly 900 years. Ramanujan used 355/113 in his 1914 pi paper, the same paper that gave his famous infinite series for 1/π.",
    links: [
      { label: "Wikipedia: Zu Chongzhi", url: "https://en.wikipedia.org/wiki/Zu_Chongzhi" },
      { label: "Wikipedia: Milü", url: "https://en.wikipedia.org/wiki/Mil%C3%BC" },
      { label: "Ramanujan's 1914 paper (PDF)", url: "https://ramanujan.sirinudi.org/Volumes/published/ram06.pdf" }
    ],
    tags: ["math", "pi", "ancient"],
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

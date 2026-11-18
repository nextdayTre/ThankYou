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
      "Zu Chongzhi, born in Jiankang (today's Nanjing), pinned pi between 3.1415926 and 3.1415927 and gave the famous fraction 355/113, a record that stood for nearly 900 years. Ramanujan used 355/113 in his 1914 pi paper, the same paper that gave his famous infinite series for 1/π. For another Chinese pi story, see Ming Antu in Beijing.",
    links: [
      { label: "Wikipedia: Zu Chongzhi", url: "https://en.wikipedia.org/wiki/Zu_Chongzhi" },
      { label: "Wikipedia: Milü", url: "https://en.wikipedia.org/wiki/Mil%C3%BC" },
      { label: "Ramanujan's 1914 paper (PDF)", url: "https://ramanujan.sirinudi.org/Volumes/published/ram06.pdf" }
    ],
    tags: ["math", "pi", "ancient"],
    example: false
  },

  {
    id: "ming-antu-infinite-series",
    title: "Geyuan Milü Jiefa: infinite series & Catalan numbers",
    creator: "Ming Antu (Minggatu)",
    year: "c. 1730s–1774",
    country: "China",
    lat: 39.9042, lon: 116.4074,
    place: "Beijing",
    description:
      "Working at the Imperial Astronomical Bureau in Beijing, Ming Antu spent about thirty years working out why the sine and pi series that Jesuit Pierre Jartoux brought to China in 1701 were true, then found more series of his own and used what are now called Catalan numbers along the way. There is no direct line to Ramanujan, but it is a lovely parallel in infinite-series thinking (see also Zu Chongzhi's pi).",
    links: [
      { label: "Wikipedia: Minggatu (Ming Antu)", url: "https://en.wikipedia.org/wiki/Minggatu" },
      { label: "Wikipedia: Ming Antu's infinite series expansion", url: "https://en.wikipedia.org/wiki/Ming_Antu%27s_infinite_series_expansion_of_trigonometric_functions" },
      { label: "Wikipedia: Catalan numbers (history)", url: "https://en.wikipedia.org/wiki/Catalan_number" }
    ],
    tags: ["math", "pi", "infinite series", "Catalan numbers"],
    example: false
  },

  /* ---------- Audio evolution: from soot-traced waves to software synths ---------- */
  {
    id: "scott-phonautograph",
    title: "The phonautograph",
    creator: "Édouard-Léon Scott de Martinville",
    year: 1857,
    country: "France",
    lat: 48.8566, lon: 2.3522,
    place: "Paris",
    description:
      "The earliest known sound-recording device: a horn, a membrane and a bristle that traced sound waves onto soot-blackened paper. It could only draw sound, not play it back, but in 2008 researchers scanned an old tracing and finally heard a recording of \"Au clair de la lune\". The first stop in the audio-evolution story.",
    links: [
      { label: "Wikipedia: Phonautograph", url: "https://en.wikipedia.org/wiki/Phonautograph" },
      { label: "Wikipedia: Édouard-Léon Scott de Martinville", url: "https://en.wikipedia.org/wiki/%C3%89douard-L%C3%A9on_Scott_de_Martinville" }
    ],
    tags: ["audio-evolution", "recording", "invention"],
    example: false
  },
  {
    id: "edison-phonograph",
    title: "The phonograph",
    creator: "Thomas Edison",
    year: 1877,
    country: "United States of America",
    lat: 40.5436, lon: -74.3293,
    place: "Menlo Park, New Jersey",
    description:
      "At his Menlo Park laboratory Edison built the first machine that could both record sound and play it back, first onto tinfoil wrapped around a grooved cylinder. Where Scott's phonautograph only drew sound, this one could finally talk back.",
    links: [
      { label: "Wikipedia: Phonograph", url: "https://en.wikipedia.org/wiki/Phonograph" },
      { label: "Wikipedia: Thomas Edison", url: "https://en.wikipedia.org/wiki/Thomas_Edison" }
    ],
    tags: ["audio-evolution", "recording", "invention"],
    example: false
  },
  {
    id: "poulsen-telegraphone",
    title: "The telegraphone (magnetic recording)",
    creator: "Valdemar Poulsen",
    year: 1898,
    country: "Denmark",
    lat: 55.6761, lon: 12.5683,
    place: "Copenhagen",
    description:
      "Danish engineer Valdemar Poulsen patented a machine that recorded sound as magnetic patterns on steel wire. It was the beginning of magnetic recording, the idea that later grew into recording tape.",
    links: [
      { label: "Wikipedia: Valdemar Poulsen", url: "https://en.wikipedia.org/wiki/Valdemar_Poulsen" }
    ],
    tags: ["audio-evolution", "recording", "invention"],
    example: false
  },
  {
    id: "blumlein-stereo",
    title: "Stereophonic sound (\"binaural sound\")",
    creator: "Alan Blumlein",
    year: 1931,
    country: "United Kingdom",
    lat: 51.5033, lon: -0.422,
    place: "Hayes, London",
    description:
      "Working at EMI's research labs in Hayes, Alan Blumlein patented what he called \"binaural sound\", which we now call stereo. The idea came from the cinema, where an actor on one side of the screen could be heard from the other. In 1934 he recorded Mozart's Jupiter Symphony at Abbey Road with his technique.",
    links: [
      { label: "Wikipedia: Alan Blumlein", url: "https://en.wikipedia.org/wiki/Alan_Blumlein" },
      { label: "Wikipedia: Stereophonic sound", url: "https://en.wikipedia.org/wiki/Stereophonic_sound" }
    ],
    tags: ["audio-evolution", "recording", "stereo"],
    example: false
  },
  {
    id: "mathews-music-program",
    title: "MUSIC, the first widely used computer-music program",
    creator: "Max Mathews",
    year: 1957,
    country: "United States of America",
    lat: 40.684, lon: -74.401,
    place: "Bell Labs, New Jersey",
    description:
      "Max Mathews wrote MUSIC at Bell Labs, and an IBM 704 played a 17-second piece from it. It was the first widely used program for making sound on a computer, and its family of descendants includes Csound. He also worked with John Chowning, whose FM synthesis is elsewhere on this globe.",
    links: [
      { label: "Wikipedia: Max Mathews", url: "https://en.wikipedia.org/wiki/Max_Mathews" },
      { label: "Wikipedia: MUSIC-N", url: "https://en.wikipedia.org/wiki/MUSIC-N" }
    ],
    tags: ["audio-evolution", "computer music", "synthesis", "digital audio"],
    example: false
  },
  {
    id: "moog-modular-synthesizer",
    title: "The Moog modular synthesizer",
    creator: "Robert Moog",
    year: 1964,
    country: "United States of America",
    lat: 42.5409, lon: -76.6666,
    place: "Trumansburg, New York",
    description:
      "Robert Moog, who also built theremins, began work in Trumansburg and debuted his voltage-controlled modular synthesizer at the 1964 Audio Engineering Society convention. It became the first commercial synthesizer and made the analog synth a real instrument.",
    links: [
      { label: "Wikipedia: Moog synthesizer", url: "https://en.wikipedia.org/wiki/Moog_synthesizer" },
      { label: "Wikipedia: Robert Moog", url: "https://en.wikipedia.org/wiki/Robert_Moog" }
    ],
    tags: ["audio-evolution", "music", "synthesis", "invention"],
    example: false
  },
  {
    id: "neve-1073-consoles",
    title: "Neve consoles & the 1073 preamp/EQ",
    creator: "Rupert Neve",
    year: 1970,
    country: "United Kingdom",
    lat: 52.0897, lon: 0.0176,
    place: "Melbourn, Cambridgeshire",
    description:
      "Rupert Neve founded Neve Electronics in 1961 and built one of the first transistor-based mixing consoles (for Philips Studios in London in 1964), then designed the 1073 module in 1970 at the company he led from near Cambridge. Its transformer-based sound is still copied by studios and makers today, and he received a Technical Grammy in 1997.",
    links: [
      { label: "Wikipedia: Rupert Neve", url: "https://en.wikipedia.org/wiki/Rupert_Neve" },
      { label: "Wikipedia: Neve Electronics", url: "https://en.wikipedia.org/wiki/Neve_Electronics" }
    ],
    tags: ["audio-evolution", "recording", "mixing", "analog"],
    example: false
  },
  {
    id: "midi-kakehashi-smith",
    title: "MIDI (Musical Instrument Digital Interface)",
    creator: "Ikutaro Kakehashi (Roland) & Dave Smith (Sequential)",
    year: 1983,
    country: "Japan",
    lat: 34.6937, lon: 135.5023,
    place: "Osaka",
    description:
      "Roland's Ikutaro Kakehashi, who founded Roland in Osaka, and Sequential's Dave Smith helped create a common language for electronic instruments. At the 1983 Winter NAMM show a Sequential Prophet-600 was successfully connected to a Roland Jupiter-6, and the two shared a 2013 Technical Grammy.",
    links: [
      { label: "Wikipedia: MIDI", url: "https://en.wikipedia.org/wiki/MIDI" },
      { label: "Wikipedia: Ikutaro Kakehashi", url: "https://en.wikipedia.org/wiki/Ikutaro_Kakehashi" },
      { label: "Wikipedia: Dave Smith (engineer)", url: "https://en.wikipedia.org/wiki/Dave_Smith_(engineer)" }
    ],
    tags: ["audio-evolution", "music", "standards", "digital audio"],
    example: false
  },
  {
    id: "fruityloops-fl-studio",
    title: "FruityLoops (FL Studio)",
    creator: "Didier \"Gol\" Dambrin (Image-Line)",
    year: 1997,
    country: "Belgium",
    lat: 51.0543, lon: 3.7174,
    place: "Ghent",
    description:
      "Image-Line, a Belgian company now headquartered in Ghent, released the first FruityLoops in December 1997 as a simple MIDI step sequencer written by Didier \"Gol\" Dambrin. It grew into FL Studio, one of the most popular music-production programs in the world.",
    links: [
      { label: "Wikipedia: FL Studio", url: "https://en.wikipedia.org/wiki/FL_Studio" },
      { label: "Wikipedia: Image-Line", url: "https://en.wikipedia.org/wiki/Image-Line" },
      { label: "Image-Line: company history", url: "https://www.image-line.com/company-history" }
    ],
    tags: ["audio-evolution", "music", "software", "digital audio"],
    example: false
  },
  {
    id: "brandenburg-mp3",
    title: "MP3 (MPEG-1 Audio Layer III)",
    creator: "Karlheinz Brandenburg & the Fraunhofer team",
    year: 1991,
    country: "Germany",
    lat: 49.5897, lon: 11.0078,
    place: "Erlangen",
    description:
      "Developed largely at the Fraunhofer Society in Germany under Karlheinz Brandenburg, who studied and earned his PhD at Erlangen, MP3 shrinks audio by dropping what we are least likely to hear. Layer III was defined in 1991 and the first software encoder arrived in 1994, helping to put music on computers and the internet.",
    links: [
      { label: "Wikipedia: MP3", url: "https://en.wikipedia.org/wiki/MP3" },
      { label: "Wikipedia: Karlheinz Brandenburg", url: "https://en.wikipedia.org/wiki/Karlheinz_Brandenburg" }
    ],
    tags: ["audio-evolution", "digital audio", "compression"],
    example: false
  },
  {
    id: "duda-serum",
    title: "Serum & Serum 2 wavetable synthesizer",
    creator: "Steve Duda (Xfer Records)",
    year: "2014 (Serum 2: 2025)",
    country: "United States of America",
    lat: 34.0522, lon: -118.2437,
    place: "Los Angeles",
    description:
      "Los Angeles producer Steve Duda programmed Serum, released in September 2014 on Xfer Records, a wavetable synth with a visual editor that became a staple of electronic music. Serum 2 arrived on March 18, 2025 as a free upgrade for Serum 1 owners, and FM is among its warp modes, a nod to Chowning.",
    links: [
      { label: "Wikipedia: Steve Duda", url: "https://en.wikipedia.org/wiki/Steve_Duda" },
      { label: "Xfer Records: Serum 2", url: "https://xferrecords.com/products/serum-2" },
      { label: "MusicTech: Serum 2 release", url: "https://musictech.com/news/gear/serum-2-everything-you-need-to-know/" }
    ],
    tags: ["audio-evolution", "music", "synthesis", "software"],
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

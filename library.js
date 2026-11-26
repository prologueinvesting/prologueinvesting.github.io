"use strict";

// Fixed examples shared by the catalog, manuscript pages and publisher's desk.
const manuscripts = [
  {
    id: "salt-orchard",
    title: "The Salt Orchard",
    author: "Mara Ellison",
    genre: "Literary fiction",
    art: "salt-orchard",
    alt: "A white cottage and windblown apple trees above a blue inlet.",
    pitch: "Two sisters inherit a failing orchard on the Maine coast. Only one of them wants to sell.",
    synopsis: "Nora comes home for a week to clear out her mother’s farmhouse. Her sister has kept the trees alive for fifteen years, and the buyer wants an answer by Friday. As they work their way through the house, a set of old packing slips calls the farm’s ownership into question.",
    bio: "Mara grew up on the Maine coast and spent her summers packing fruit. This is her first novel.",
    stage: "Second draft",
    words: 72000,
    goal: 6000,
    raised: 4080,
    backers: 82,
    reads: 1240,
    budget: [["Developmental edit", 3600], ["Line edit", 1800]],
    ask: "The middle of the book covers fifteen years in one summer. Mara is hiring an editor to work on the timeline before she queries agents.",
    bookRate: 8,
    screenRate: 0,
    updates: [
      { date: "Nov 18", title: "A second pass at the orchard scenes", body: "The harvest now runs through the whole middle section. Moving three scenes brought the sisters back into the same room much sooner." },
      { date: "Nov 4", title: "The editorial estimate is in", body: "The budget covers a full manuscript review and a separate line edit. Both estimates are in the funding plan." }
    ]
  },
  {
    id: "night-post",
    title: "The Night Post",
    author: "Kit Mercer",
    genre: "Mystery",
    art: "night-post",
    alt: "A red pillar postbox outside a warmly lit corner shop at dusk.",
    pitch: "A night clerk finds a letter addressed to a woman who disappeared from his street fourteen years ago.",
    synopsis: "On the last collection before Christmas, a letter turns up in the returns sack with a fresh postmark and an address that no longer exists. Ellis recognises the handwriting. He has until the morning shift to decide whether to pass it on.",
    bio: "Kit worked the late shift at a sorting office while writing the first draft. The book takes place over a single winter night.",
    stage: "Complete draft",
    words: 68000,
    goal: 4800,
    raised: 2640,
    backers: 56,
    reads: 918,
    budget: [["Structural edit", 2880], ["Copyedit", 1440]],
    ask: "Kit wants an editor to follow the trail of letters through the book, then a copyeditor to check the dates, addresses and postal routes.",
    bookRate: 10,
    screenRate: 5,
    updates: [
      { date: "Nov 20", title: "Checking the last collection", body: "A retired postal worker read the sorting office scenes. Two small changes to the night route have made the timing of the final delivery possible." },
      { date: "Nov 6", title: "The full draft is ready", body: "The manuscript is with its first readers. The next pass will follow each letter from the sorting bench to its destination." }
    ]
  },
  {
    id: "glasshouse-ledger",
    title: "The Glasshouse Ledger",
    author: "Iris Bell",
    genre: "Historical fiction",
    art: "glasshouse-ledger",
    alt: "An old glasshouse with green iron ribs, ferns and terracotta pots.",
    pitch: "In 1893, a gardener’s apprentice starts keeping a second set of records at a private botanical garden.",
    synopsis: "Ada can name every specimen in the north house, but her name appears nowhere in its records. When a collector arrives to take credit for a rare flowering, she begins to write down who really brought each plant through the winter.",
    bio: "Iris volunteers in a community greenhouse and collects old nursery catalogues. A pencilled name in the margin of one became the starting point for Ada.",
    stage: "Third draft",
    words: 84000,
    goal: 8000,
    raised: 6560,
    backers: 108,
    reads: 1684,
    budget: [["Manuscript edit", 4900], ["Historical fact-check", 2300]],
    ask: "Iris is commissioning a manuscript edit and a historian’s read of the glasshouse records, including the plant names in use in the 1890s.",
    bookRate: 8,
    screenRate: 0,
    updates: [
      { date: "Nov 15", title: "A correction in the plant register", body: "A nursery catalogue from 1891 settled the name of the orchid in chapter four. The manuscript and its notes now use the period spelling." },
      { date: "Oct 30", title: "Two readers for the next draft", body: "An editor will read for structure. A garden historian will check the growing calendar and the deliveries mentioned in Ada’s register." }
    ]
  }
];

const exampleDraft = {
  title: "The Winter Ferry",
  author: "Robin Vale",
  genre: "Literary fiction",
  pitch: "A ferry pilot makes one last crossing before the river freezes. The passenger she picks up has been missing for a year.",
  budget: 5000,
  plan: "A developmental edit of the full draft and a copyedit of the opening three chapters.",
  rights: "Book royalties",
  chapter: ""
};

"use strict";

function startPrologue() {
  const main = document.querySelector("#main");
  const dialog = document.querySelector("#pledge-dialog");
  const homeMarkup = main.innerHTML;
  const storageKey = "prologue.reading-room.v1";
  const genres = [...new Set(manuscripts.map(book => book.genre))];
  let stored = {};
  try { stored = JSON.parse(localStorage.getItem(storageKey)) || {}; } catch { /* Browser storage is optional. */ }

  const state = {
    saved: Array.isArray(stored.saved) ? stored.saved.filter(id => manuscripts.some(book => book.id === id)) : [],
    pledges: Array.isArray(stored.pledges) ? stored.pledges.filter(p => p && manuscripts.some(book => book.id === p.id) && Number.isSafeInteger(p.amount) && p.amount > 0 && ["book", "screen"].includes(p.track)) : [],
    draft: { ...exampleDraft, ...stored.draft },
    typeSize: [0, 1, 2].includes(stored.typeSize) ? stored.typeSize : 1,
    genre: "",
    industryFilter: "",
    exampleAmount: 50
  };
  const dollars = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
  const money = amount => dollars.format(amount).replace(/\.00$/, "");
  const count = value => Number(value).toLocaleString("en-US");
  const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const icon = (name, extra = "") => `<svg class="icon ${extra}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
  const findBook = id => manuscripts.find(book => book.id === id);
  const art = book => `./assets/art/${book.art}.webp`;
  const pathFor = (book, tab = "") => `#book/${book.id}${tab ? "/" + tab : ""}`;
  const readPath = (book, index = 1) => `#read/${book.id}/${index}`;
  const rightsName = track => track === "screen" ? "Screen licensing" : "Book royalties";
  const examplePledges = [{ id: "night-post", amount: 50, track: "screen" }, { id: "salt-orchard", amount: 25, track: "book" }];
  let previousRoute = [];
  let toastTimer;
  let pledgeBook = null;

  function persist() {
    const { saved, pledges, draft, typeSize } = state;
    try { localStorage.setItem(storageKey, JSON.stringify({ saved, pledges, draft, typeSize })); } catch { /* Keep the current session usable when storage is full or disabled. */ }
  }

  function announce(message) {
    const notice = document.querySelector("#notice");
    notice.textContent = message;
    notice.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => notice.classList.remove("is-visible"), 2500);
  }

  function totals(book) {
    const pledges = state.pledges.filter(pledge => pledge.id === book.id);
    const raised = book.raised + pledges.reduce((sum, pledge) => sum + pledge.amount, 0);
    return { raised, percent: Math.min(100, Math.round(raised / book.goal * 100)), backers: book.backers + (pledges.length ? 1 : 0), remaining: Math.max(0, book.goal - raised) };
  }

  function progress(book) {
    const { raised, percent } = totals(book);
    return `<div class="funding-line"><span><strong>${money(raised)}</strong> raised</span><span>${percent}%</span></div>
      <progress class="funding-bar" value="${Math.min(raised, book.goal)}" max="${book.goal}" aria-label="${percent}% of ${money(book.goal)} funded"></progress>`;
  }

  function saveButton(book, compact = false) {
    const saved = state.saved.includes(book.id);
    const text = saved ? "Saved to shelf" : "Save to shelf";
    return `<button type="button" class="${compact ? "card-save icon-button" : "button quiet"} save-button" data-action="save" data-book="${book.id}" aria-pressed="${saved}" aria-label="${saved ? "Remove" : "Save"} ${book.title} ${saved ? "from" : "to"} my shelf" title="${text}">${icon("bookmark")}${compact ? "" : `<span>${text}</span>`}</button>`;
  }

  function card(book) {
    return `<article class="book-card">
      <div class="card-art"><a href="${pathFor(book)}" aria-label="Open ${book.title}"><img src="${art(book)}" width="750" height="500" alt="${book.alt}"></a>${saveButton(book, true)}</div>
      <div class="card-body"><p class="genre">${book.genre}</p><h3><a href="${pathFor(book)}">${book.title}</a></h3>
      <p class="byline">by ${book.author}</p><p class="card-pitch">${book.pitch}</p></div>
      <div class="card-funding">${progress(book)}</div>
    </article>`;
  }

  function fillCatalog() {
    const grid = document.querySelector("#catalog-grid");
    if (!grid) return;
    grid.innerHTML = manuscripts.filter(book => !state.genre || book.genre === state.genre).map(card).join("");
    document.querySelector("#genre-filter").value = state.genre;
  }

  function crumb(items) {
    return `<nav class="crumb" aria-label="Breadcrumb">${items.map(([text, url]) => url ? `<a href="${url}">${esc(text)}</a>` : `<span aria-current="page">${esc(text)}</span>`).join('<span aria-hidden="true" class="slash">/</span>')}</nav>`;
  }

  function ledger(rows, classes = "") {
    return `<dl class="ledger ${classes}">${rows.map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join("")}</dl>`;
  }

  function feeRows(amount) {
    return [["Manuscript fund", money(amount * 0.9)], ["Platform fee (10%)", money(amount * 0.1)]];
  }

  function bookTerms(book, track) {
    return track === "screen"
      ? `If the writer receives a film or TV licensing payment, ${book.screenRate}% goes to readers who chose screen licensing.`
      : `If the book is published and earns royalties, ${book.bookRate}% of the writer’s royalties goes to readers who chose book royalties.`;
  }

  function updateList(book) {
    return `<div class="update-list">${book.updates.map(note => `<article><p class="overline">${note.date}</p><h3>${note.title}</h3><p>${note.body}</p></article>`).join("")}</div>`;
  }

  function bookPanel(book, tab) {
    if (tab === "chapters") {
      const source = readingSamples[book.id];
      return `<h2>Read a sample</h2><p>The demo reader pairs this campaign with passages from <cite>${source.title}</cite> by ${source.author}.</p>
        <div class="chapter-list">${source.parts.map((part, i) => `<a href="${readPath(book, i + 1)}">${icon("book")}<span>${part.heading}</span><span class="chapter-meta">Excerpt ${i + 1}</span></a>`).join("")}</div>`;
    }
    if (tab === "funding") {
      return `<h2>The editing budget</h2><p>${book.ask}</p>${ledger([...book.budget.map(([label, cost]) => [label, money(cost)]), ["Platform fee (10%)", money(book.goal * 0.1)], ["Campaign goal", money(book.goal)]], "total-last")}
        <h3>Rights &amp; royalties</h3><p>${bookTerms(book, "book")}${book.screenRate ? " " + bookTerms(book, "screen") : " Screen rights are outside this campaign."}</p>
        <p>Each reader’s share is proportional to their pledge within that group. The writer keeps the copyright and makes the editorial decisions. These are sample terms for this campaign.</p>`;
    }
    if (tab === "updates") return `<h2>Writer updates</h2>${updateList(book)}`;
    return `<h2>About the manuscript</h2><p>${book.synopsis}</p><dl class="book-facts"><div><dt>Manuscript</dt><dd>${book.stage}</dd></div><div><dt>Length</dt><dd>${count(book.words)} words</dd></div></dl>
      <h3>About ${book.author}</h3><p>${book.bio}</p>`;
  }

  function bookPage(book, tab) {
    const tabs = [["overview", "Overview"], ["chapters", "Chapters"], ["funding", "Funding & rights"], ["updates", "Writer updates"]];
    if (!tabs.some(([id]) => id === tab)) tab = "overview";
    const { backers, remaining } = totals(book);
    return `<div class="wrap inner-page book-page">${crumb([["Reading table", "#manuscripts"], [book.title]])}
      <section class="book-intro"><img class="book-plate" src="${art(book)}" width="750" height="500" alt="${book.alt}">
      <div><p class="overline">${book.genre}</p><h1>${book.title}</h1><p class="author-line">by ${book.author}</p><p class="book-deck">${book.pitch}</p>
      <div class="actions"><a class="button primary" href="${readPath(book)}">${icon("book")}Read a sample</a>${saveButton(book)}</div></div></section>
      <div class="detail-columns"><div class="detail-main"><nav class="detail-nav" aria-label="Manuscript sections">${tabs.map(([id, name]) => `<a href="${pathFor(book, id === "overview" ? "" : id)}" ${id === tab ? 'aria-current="page"' : ""}>${esc(name)}</a>`).join("")}</nav>
      <div class="prose detail-panel">${bookPanel(book, tab)}</div></div>
      <aside class="funding-box"><p class="overline">Campaign fund</p><h2>${money(book.goal)} goal</h2>${progress(book)}<p class="backer-count">${count(backers)} readers have pledged.</p>
      <button class="button primary full" data-action="pledge" data-book="${book.id}" ${remaining <= 0 ? "disabled" : ""}>${remaining <= 0 ? "Funding goal reached" : "Try a pledge"}</button><p class="fine">Sample campaign. No money changes hands.</p></aside></div></div>`;
  }

  function readerPage(book, number) {
    const source = readingSamples[book.id];
    const current = Math.min(source.parts.length, Math.max(1, Math.trunc(Number(number)) || 1));
    const part = source.parts[current - 1];
    return `<div class="wrap inner-page reader-page">${crumb([[book.title, pathFor(book, "chapters")], ["Sample reader"]])}
      <div class="reader-tools"><label class="select-control"><span class="sr-only">Choose excerpt</span><select id="chapter-choice" data-book="${book.id}">${source.parts.map((p, i) => `<option value="${i + 1}" ${i + 1 === current ? "selected" : ""}>Excerpt ${i + 1} of ${source.parts.length}</option>`).join("")}</select>${icon("down", "chevron")}</label>
      <div class="type-controls" role="group" aria-label="Reading text size"><button data-action="type" data-step="-1" aria-label="Decrease reading text size" ${state.typeSize === 0 ? "disabled" : ""}>A<span>−</span></button><button data-action="type" data-step="1" aria-label="Increase reading text size" ${state.typeSize === 2 ? "disabled" : ""}>A<span>+</span></button></div></div>
      <article class="reading-copy" data-size="${state.typeSize}"><header><p class="overline">From ${source.title}</p><h1>${part.heading}</h1><p class="author-line">by ${source.author}</p></header>
      <div class="reading-text">${part.paragraphs.map(p => `<p>${esc(p)}</p>`).join("")}</div>
      <p class="source-credit">This public-domain passage stands in for a submitted chapter in the demo. <a class="text-link" href="${source.url}" target="_blank" rel="noreferrer">Read the Standard Ebooks edition</a></p>
      <nav class="reader-bottom" aria-label="Continue reading"><a href="${pathFor(book)}" class="text-link">Back to manuscript</a>${current < source.parts.length ? `<a class="button secondary" href="${readPath(book, current + 1)}">Next excerpt</a>` : `<a class="button secondary" href="${pathFor(book, "funding")}">See funding plan</a>`}</nav></article></div>`;
  }

  function exampleStatement() {
    const pledge = examplePledges.find(p => p.id === "salt-orchard");
    const book = findBook(pledge.id);
    const royalties = 12000;
    const pool = royalties * book.bookRate / 100;
    const payment = pool * pledge.amount / book.goal;
    return `<section class="shelf-section royalty-example"><div><p class="overline">Illustrative payment</p><h2>A royalty statement</h2><p>Suppose ${book.title} reaches its ${money(book.goal)} goal and the writer later receives ${money(royalties)} in book royalties. Here’s the payment on the ${money(pledge.amount)} book pledge above.</p></div>
      ${ledger([["Writer’s book royalties", money(royalties)], [`${book.bookRate}% shared with book backers`, money(pool)], ["Your part of the round", `${money(pledge.amount)} of ${money(book.goal)}`], ["Your royalty payment", money(payment)]], "total-last")}</section>`;
  }

  function shelfPage(example) {
    const saved = example ? ["glasshouse-ledger", "salt-orchard"] : state.saved;
    const pledges = example ? examplePledges : state.pledges;
    const sum = pledges.reduce((total, p) => total + p.amount, 0);
    return `<div class="wrap inner-page desk-page"><div class="page-heading"><p class="overline ruled-label">Reading room</p><h1>My shelf</h1><p>Your saved manuscripts and the projects you’ve backed.</p></div>
      <nav class="detail-nav" aria-label="Shelf view"><a href="#shelf" ${example ? "" : 'aria-current="page"'}>My shelf</a><a href="#shelf/example" ${example ? 'aria-current="page"' : ""}>Example shelf</a></nav>
      ${example ? '<p class="inline-note">A filled-in example from a fictional reader.</p>' : ""}
      ${!saved.length && !pledges.length ? `<div class="empty-state">${icon("bookmark")}<h2>Your shelf is empty</h2><p>Save a manuscript with its bookmark, or try a pledge to see it here.</p><a href="#manuscripts" class="button primary">Browse manuscripts</a></div>` : `
      <section class="shelf-section"><div class="section-heading"><h2>Saved manuscripts</h2><span class="fine">${saved.length} saved</span></div>
      ${saved.length ? `<div class="saved-list">${saved.map(id => { const b = findBook(id); return `<article><img src="${art(b)}" width="150" height="100" alt=""><div><p class="genre">${b.genre}</p><h3><a href="${pathFor(b)}">${b.title}</a></h3><p>by ${b.author}</p></div>${example ? "" : saveButton(b, true)}</article>`; }).join("")}</div>` : '<p class="muted">Use a manuscript’s bookmark to save it here.</p>'}</section>
      <section class="shelf-section"><div class="section-heading"><h2>My pledges</h2><span>${money(sum)} pledged</span></div>
      ${pledges.length ? `<div class="table-scroll"><table><thead><tr><th scope="col">Manuscript</th><th scope="col">Backing terms</th><th scope="col" class="number">Pledge</th></tr></thead><tbody>${[...pledges].reverse().map(p => { const b = findBook(p.id); return `<tr><th scope="row"><a href="${pathFor(b, "funding")}">${b.title}</a></th><td>${rightsName(p.track)}</td><td class="number">${money(p.amount)}</td></tr>`; }).join("")}</tbody></table></div><p class="fine">Demo pledges only. Royalty payments depend on future earnings.</p>` : '<p class="muted">You haven’t tried a pledge yet.</p>'}</section>
      ${example ? exampleStatement() : ""}
      ${pledges.length ? `<section class="shelf-section"><h2>From your writers</h2><div class="shelf-updates">${[...new Set(pledges.map(p => p.id))].map(id => { const b = findBook(id); return `<article><p class="genre">${b.title} <span>·</span> ${b.updates[0].date}</p><h3><a href="${pathFor(b, "updates")}">${b.updates[0].title}</a></h3></article>`; }).join("")}</div></section>` : ""}`}</div>`;
  }

  const desks = prologueDesks({ state, esc, icon, money, count, ledger, feeRows, art, pathFor, totals, genres, persist, announce });

  function routeName(route, book) {
    if (route[0] === "book") return book?.title;
    if (route[0] === "read") return `Sample reader | ${book?.title}`;
    return ({ discover: "Discover manuscripts", manuscripts: "The reading table", shelf: "My shelf", how: "How backing works", writers: "The writer’s desk", industry: "The publisher’s desk" })[route[0]];
  }

  function closeMenu() {
    const toggle = document.querySelector(".menu-button");
    const nav = document.querySelector(".primary-nav");
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
    toggle.innerHTML = icon("menu");
  }

  function render(first = false) {
    let route = (location.hash.slice(1) || "discover").split("/");
    if (route[0] === "main") route = previousRoute.length ? previousRoute : ["discover"];
    const [page, id, tab] = route;
    const book = findBook(id);
    const sectionChange = page === previousRoute[0] && ((page === "book" && previousRoute[1] === id) || page === "industry" || page === "shelf");
    const atHome = page === "discover" || page === "manuscripts";
    if (dialog.open) dialog.close();
    closeMenu();
    if (atHome) {
      if (!document.querySelector("#catalog-grid")) main.innerHTML = homeMarkup;
      fillCatalog();
    } else if (page === "book" && book) main.innerHTML = bookPage(book, tab);
    else if (page === "read" && book) main.innerHTML = readerPage(book, tab);
    else if (page === "shelf") main.innerHTML = shelfPage(id === "example");
    else if (page === "how") main.innerHTML = desks.howPage();
    else if (page === "writers") main.innerHTML = desks.writerPage(id === "preview");
    else if (page === "industry") main.innerHTML = desks.industryPage(id);
    else main.innerHTML = `<div class="wrap inner-page empty-state"><h1>Page not found</h1><p>Return to the reading table to pick up a manuscript.</p><a class="button primary" href="#discover">Go to Discover</a></div>`;
    document.title = `${routeName(route, book) || "Page not found"} | Prologue`;
    const active = atHome || ["book", "read"].includes(page) ? "discover" : page;
    document.querySelectorAll("[data-nav]").forEach(link => {
      if (link.dataset.nav === active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    if (sectionChange) main.querySelector(".detail-nav [aria-current]")?.focus({ preventScroll: true });
    else if (page === "manuscripts") {
      const table = document.querySelector("#manuscripts");
      table.focus({ preventScroll: true });
      table.scrollIntoView();
    } else if (!first) {
      window.scrollTo(0, 0);
      main.focus({ preventScroll: true });
    }
    previousRoute = route;
  }

  function refreshSaveButtons(book) {
    document.querySelectorAll(`.save-button[data-book="${book.id}"]`).forEach(el => {
      const compact = el.classList.contains("icon-button");
      const hadFocus = el === document.activeElement;
      const holder = document.createElement("template");
      holder.innerHTML = saveButton(book, compact);
      const next = holder.content.firstElementChild;
      el.replaceWith(next);
      if (hadFocus) next.focus({ preventScroll: true });
    });
  }

  function toggleSave(id) {
    const book = findBook(id);
    if (!book) return;
    const saved = state.saved.includes(id);
    state.saved = saved ? state.saved.filter(item => item !== id) : [...state.saved, id];
    persist();
    if (previousRoute[0] === "shelf") render();
    else refreshSaveButtons(book);
    announce(saved ? `Removed ${book.title} from your shelf.` : `Saved ${book.title} to your shelf.`);
  }

  function openPledge(id) {
    const book = findBook(id);
    const { remaining } = totals(book);
    if (!remaining) return;
    pledgeBook = book;
    const amount = Math.min(50, remaining);
    dialog.innerHTML = `<form id="pledge-form"><div class="dialog-top"><p class="overline">Example pledge</p><button type="button" class="icon-button" data-action="close-dialog" aria-label="Close pledge preview">${icon("close")}</button></div>
      <h2 id="pledge-heading">Back ${book.title}</h2><p class="muted">Try the pledge form with an imaginary amount.</p>
      <label class="field"><span>Pledge amount</span><span class="currency-field"><span>$</span><input id="pledge-amount" required name="amount" type="number" min="1" max="${remaining}" step="1" value="${amount}" inputmode="numeric"></span></label>
      <div class="preset-list" role="group" aria-label="Suggested pledge amounts">${[25, 50, 100].filter(p => p <= remaining).map(p => `<button type="button" data-action="amount" data-amount="${p}" aria-pressed="${p === amount}">${money(p)}</button>`).join("")}</div>
      <label class="field"><span>Backing terms</span><span class="plain-select"><select id="pledge-track" name="track"><option value="book">Book royalties</option>${book.screenRate ? '<option value="screen">Screen licensing</option>' : ""}</select>${icon("down", "chevron")}</span></label>
      <p id="track-note" class="fine">${bookTerms(book, "book")} Pledges within that group determine each reader’s share.</p><div id="pledge-split">${ledger(feeRows(amount))}</div>
      <label class="check-field"><input type="checkbox" required><span>I understand that drafts can change, publication is uncertain and a pledge could return nothing.</span></label>
      <button class="button primary full" type="submit">Record demo pledge</button><p class="fine centered">Demo only. No payment details are collected.</p></form>`;
    dialog.showModal();
    dialog.querySelector("[data-action='close-dialog']").focus();
  }

  function updatePledge() {
    const amountControl = dialog.querySelector("#pledge-amount");
    const value = amountControl.valueAsNumber;
    dialog.querySelector("#pledge-split").innerHTML = Number.isFinite(value) && value >= 0 ? ledger(feeRows(value)) : "";
    dialog.querySelectorAll("[data-action='amount']").forEach(button => button.setAttribute("aria-pressed", Number(button.dataset.amount) === value));
    dialog.querySelector("#track-note").textContent = bookTerms(pledgeBook, dialog.querySelector("#pledge-track").value) + " Pledges within that group determine each reader’s share.";
  }

  function recordPledge(form) {
    const amount = form.elements.amount.valueAsNumber;
    if (!form.reportValidity() || !pledgeBook || !Number.isSafeInteger(amount) || amount > totals(pledgeBook).remaining) return;
    const book = pledgeBook;
    const track = form.elements.track.value === "screen" && book.screenRate ? "screen" : "book";
    state.pledges.push({ id: book.id, amount, track });
    persist();
    dialog.innerHTML = `<div class="pledge-success"><span class="success-mark">${icon("check")}</span><p class="overline">Demo pledge recorded</p><h2 id="pledge-heading">${money(amount)} for ${book.title}</h2><p>The pledge is on your shelf. You can follow the writer’s updates there as the draft changes.</p>${ledger([["Backing terms", rightsName(track)], ...feeRows(amount)])}<div class="actions"><a class="button primary" href="#shelf">View my shelf</a><button class="button secondary" data-action="close-dialog">Back to manuscript</button></div></div>`;
    dialog.querySelector("a").focus();
    if (previousRoute[0] === "book") main.innerHTML = bookPage(book, previousRoute[2]);
  }

  document.addEventListener("click", event => {
    const action = event.target.closest("[data-action]");
    if (!action) {
      if (event.target.closest(".skip-link")) { event.preventDefault(); main.focus(); }
      const link = event.target.closest("a[href]");
      if (link?.getAttribute("href") === location.hash) {
        closeMenu();
        if (location.hash === "#manuscripts") document.querySelector("#manuscripts")?.scrollIntoView();
        if (location.hash === "#discover") window.scrollTo(0, 0);
      }
      return;
    }
    const name = action.dataset.action;
    if (name === "menu") {
      const open = document.querySelector(".primary-nav").classList.toggle("is-open");
      action.setAttribute("aria-expanded", open);
      action.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
      action.innerHTML = icon(open ? "close" : "menu");
    } else if (name === "save") toggleSave(action.dataset.book);
    else if (name === "pledge") openPledge(action.dataset.book);
    else if (name === "close-dialog") dialog.close();
    else if (name === "amount") { dialog.querySelector("#pledge-amount").value = action.dataset.amount; updatePledge(); }
    else if (name === "type") {
      state.typeSize = Math.max(0, Math.min(2, state.typeSize + Number(action.dataset.step)));
      document.querySelector(".reading-copy").dataset.size = state.typeSize;
      document.querySelector('[data-step="-1"]').disabled = state.typeSize === 0;
      document.querySelector('[data-step="1"]').disabled = state.typeSize === 2;
      persist();
    } else desks.handleAction(action);
  });

  document.addEventListener("input", event => {
    if (event.target.id === "pledge-amount") updatePledge();
    else if (event.target.closest("#writer-form")) desks.updateDraft(event.target);
  });
  document.addEventListener("change", event => {
    const el = event.target;
    if (el.id === "genre-filter") {
      state.genre = el.value;
      fillCatalog();
      announce(`${document.querySelectorAll("#catalog-grid article").length} ${state.genre ? "manuscript" : "manuscripts"} shown.`);
    } else if (el.id === "chapter-choice") location.hash = readPath(findBook(el.dataset.book), Number(el.value));
    else if (el.id === "pledge-track") updatePledge();
    else if (el.id === "industry-filter") desks.filterIndustry(el.value);
    else if (el.closest("#writer-form")) desks.updateDraft(el);
  });
  document.addEventListener("submit", event => {
    if (event.target.id === "pledge-form") { event.preventDefault(); recordPledge(event.target); }
    if (event.target.id === "writer-form") {
      event.preventDefault();
      if (desks.checkDraft(event.target)) location.hash = "#writers/preview";
    }
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && document.querySelector(".primary-nav").classList.contains("is-open")) {
      closeMenu();
      document.querySelector(".menu-button").focus();
    }
  });
  dialog.addEventListener("click", event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener("close", () => {
    if (pledgeBook && previousRoute[0] === "book" && !document.activeElement?.closest("main")) {
      main.querySelector("[data-action='pledge']:not(:disabled)")?.focus({ preventScroll: true });
    }
    pledgeBook = null;
  });
  window.addEventListener("hashchange", () => render());
  render(true);
}

startPrologue();


"use strict";

function prologueDesks({ state, esc, icon, money, count, ledger, feeRows, art, pathFor, totals, genres, persist, announce }) {
  function feeExample() {
    return `<div class="pledge-example"><p class="overline">Try an amount</p><div class="preset-list" role="group" aria-label="Example pledge amount">${[25, 50, 100].map(amount => `<button type="button" data-action="example-amount" data-amount="${amount}" aria-pressed="${amount === state.exampleAmount}">${money(amount)}</button>`).join("")}</div>
      ${ledger([["Sample pledge", money(state.exampleAmount)], ...feeRows(state.exampleAmount)])}</div>`;
  }

  function howPage() {
    return `<div class="wrap inner-page info-page"><div class="page-heading"><p class="overline ruled-label">How it works</p><h1>Backing a manuscript</h1><p>Before a writer sends a book to agents, a good edit can cost more than they can pay on their own. Readers can help cover that bill.</p></div>
      <div class="info-columns"><div class="process-list">
      <article><h2>Read a few pages</h2><p>Start with a chapter. The manuscript page also tells you who wrote it, how far along the draft is and what kind of edit it needs.</p></article>
      <article><h2>Look at the budget</h2><p>Writers get estimates for the work they want to commission. Each campaign shows those costs and Prologue’s 10% fee.</p></article>
      <article><h2>Choose your terms</h2><p>A campaign can offer a share of future book royalties. Some writers also offer a separate share of film or TV licensing income. Pick the terms you want to back when you pledge.</p></article>
      <article><h2>Follow the draft</h2><p>Your shelf keeps the pledge and the writer’s updates together. If the project earns income covered by your terms, your share depends on how much you pledged.</p></article>
      </div><aside class="paper-panel how-receipt"><h2>Where the money goes</h2>${feeExample()}</aside></div>
      <section class="questions"><h2>A few questions</h2>
        ${[
          ["Who owns the manuscript?", "The writer keeps the copyright and decides what to change in the draft. A pledge gives the reader only the share of income described in that campaign."],
          ["What happens if the book changes?", "Chapters, characters and titles can change during an edit. Writers record substantial changes in their campaign updates. Readers can review the terms before they pledge."],
          ["What if the book never sells?", "The editing work can still go ahead. Publication and licensing are uncertain. If the project earns no covered income, readers receive no royalties and can lose their full pledge."],
          ["Where do editors and agents fit in?", "Writers use their budgets to hire editors. Agents and publishers can visit the publisher’s desk to compare early readership, review sample pages and see which rights a writer has included."]
        ].map(([q, answer]) => `<details><summary>${q}${icon("down", "chevron")}</summary><p>${answer}</p></details>`).join("")}
        <details><summary>What could a royalty payment look like?${icon("down", "chevron")}</summary><p>The example shelf shows how a writer’s royalties would be split for one book, down to the payment on a $25 pledge. <a class="text-link" href="#shelf/example">See the sample statement</a></p></details>
      </section><div class="closing-links"><a class="button primary" href="#manuscripts">Browse manuscripts</a><a class="text-link" href="#industry">Visit the publisher’s desk</a></div></div>`;
  }

  function draftProof() {
    const d = state.draft;
    return `<p class="overline">Campaign proof</p><div class="proof-rule"></div><p class="genre" data-proof="genre">${esc(d.genre)}</p><h2 data-proof="title">${esc(d.title || "Untitled manuscript")}</h2>
      <p class="author-line">by <span data-proof="author">${esc(d.author || "the writer")}</span></p><p class="proof-pitch" data-proof="pitch">${esc(d.pitch || "Your short description will appear here.")}</p>
      <dl class="ledger"><div><dt>Funding goal</dt><dd data-proof="budget">${money(Number(d.budget) || 0)}</dd></div><div><dt>Platform fee</dt><dd data-proof="fee">${money((Number(d.budget) || 0) * 0.1)}</dd></div></dl>`;
  }

  function select(name, options, chosen) {
    return `<span class="plain-select"><select name="${name}">${options.map(option => `<option ${option === chosen ? "selected" : ""}>${esc(option)}</option>`).join("")}</select>${icon("down", "chevron")}</span>`;
  }

  function writerPage(preview) {
    const d = state.draft;
    if (preview) return `<div class="wrap inner-page draft-preview"><div class="crumb"><a href="#writers">Writer’s desk</a><span class="slash">/</span><span>Campaign preview</span></div><div class="page-heading"><p class="overline ruled-label">Private campaign preview</p><h1>${esc(d.title || "Untitled manuscript")}</h1><p>by ${esc(d.author || "the writer")}</p></div>
      <div class="info-columns"><article class="prose"><p class="genre">${esc(d.genre)}</p><h2>About the manuscript</h2><p class="white-space">${esc(d.pitch)}</p><h3>What the fund pays for</h3><p class="white-space">${esc(d.plan)}</p><h3>Chapter sample</h3>${d.chapter.trim() ? `<p class="draft-excerpt white-space">${esc(d.chapter)}</p>` : "<p>A chapter will appear here when you add one to the draft.</p>"}
      <a class="button secondary" href="#writers">Edit draft</a></article><aside class="paper-panel"><p class="overline">Funding plan</p><h2>${money(Number(d.budget) || 0)} goal</h2>${ledger(feeRows(Number(d.budget) || 0))}<h3>Offered to readers</h3><p>${esc(d.rights)}</p><p class="fine">The writer keeps the copyright. This preview stays in your browser.</p></aside></div></div>`;
    return `<div class="wrap inner-page writer-page"><div class="page-heading"><p class="overline ruled-label">For writers</p><h1>The writer’s desk</h1><p>Put a chapter, an editing estimate and your backing terms together. This sample draft is yours to edit in this browser.</p></div>
      <div class="writer-layout"><form id="writer-form" class="writer-form">
        <fieldset><legend>The manuscript</legend>
          <div class="field-pair"><label class="field"><span>Working title</span><input name="title" maxlength="100" required value="${esc(d.title)}"></label><label class="field"><span>Author or pen name</span><input name="author" maxlength="70" required value="${esc(d.author)}"></label></div>
          <label class="field"><span>Genre</span>${select("genre", genres, d.genre)}</label>
          <label class="field"><span>Short description</span><textarea name="pitch" maxlength="600" rows="3" required>${esc(d.pitch)}</textarea></label>
          <label class="field"><span>Chapter sample <small>Optional in the demo</small></span><textarea name="chapter" rows="4" maxlength="25000" placeholder="Paste your opening pages here.">${esc(d.chapter)}</textarea></label>
        </fieldset>
        <fieldset><legend>The funding plan</legend>
          <div class="field-pair"><label class="field"><span>Funding goal</span><span class="currency-field"><span>$</span><input type="number" name="budget" min="1" max="1000000" step="1" required value="${esc(d.budget)}"></span></label><label class="field"><span>Backing terms</span>${select("rights", ["Book royalties", "Book royalties and screen licensing"], d.rights)}</label></div>
          <label class="field"><span>What will the money pay for?</span><textarea name="plan" rows="3" maxlength="1600" required>${esc(d.plan)}</textarea></label>
        </fieldset>
        <div class="ownership-note"><h3>Submitting your own work</h3><p>A live submission would ask you to confirm that you wrote the manuscript and hold its rights. You would keep the copyright and decide which revisions to make.</p></div>
        <button type="submit" class="button primary">Preview campaign</button>
      </form><aside class="campaign-proof">${draftProof()}</aside></div></div>`;
  }

  function updateDraft(field) {
    if (!Object.hasOwn(exampleDraft, field.name)) return;
    state.draft[field.name] = field.value;
    field.setCustomValidity("");
    persist();
    const value = field.value.trim();
    const proof = document.querySelector(`[data-proof="${field.name}"]`);
    if (field.name === "budget") {
      if (proof) proof.textContent = money(Number(value) || 0);
      document.querySelector('[data-proof="fee"]').textContent = money((Number(value) || 0) * 0.1);
    } else if (proof) proof.textContent = value || ({ title: "Untitled manuscript", author: "the writer", pitch: "Your short description will appear here." })[field.name] || "";
  }

  function checkDraft(form) {
    for (const name of ["title", "author", "pitch", "plan"]) {
      if (!form.elements[name].value.trim()) form.elements[name].setCustomValidity("Enter some text for this field.");
    }
    return form.reportValidity();
  }

  function signalsTable() {
    const list = manuscripts.filter(book => !state.industryFilter || (state.industryFilter === "screen" && book.screenRate));
    return `<div class="table-scroll"><table class="signals"><caption class="sr-only">Example readership and rights by manuscript</caption><thead><tr><th scope="col">Manuscript</th><th scope="col" class="number">Chapter reads</th><th scope="col" class="number">Backers</th><th scope="col" class="number">Pledged</th><th scope="col">Backing terms</th></tr></thead>
      <tbody>${list.map(book => `<tr><th scope="row"><a class="table-book" href="${pathFor(book)}"><img src="${art(book)}" width="76" height="58" alt=""><span>${book.title}<small>${book.genre}</small></span></a></th><td class="number" data-label="Chapter reads">${count(book.reads)}</td><td class="number" data-label="Backers">${count(totals(book).backers)}</td><td class="number" data-label="Pledged">${money(totals(book).raised)}</td><td data-label="Backing terms"><a class="text-link" href="${pathFor(book, "funding")}">${book.screenRate ? "Book and screen" : "Book only"}</a></td></tr>`).join("")}</tbody></table></div>`;
  }

  function tradeView(tab) {
    if (tab === "editorial") return `<div class="section-heading"><div><h2>Editorial work</h2><p>The work each writer wants to commission and the money set aside for it.</p></div></div>
      <div class="assignment-list">${manuscripts.map(book => `<article><div><p class="genre">${book.stage}</p><h3><a href="${pathFor(book, "funding")}">${book.title}</a></h3><p>${book.budget.map(([label, amount]) => `${label} (${money(amount)})`).join(" · ")}</p></div><div><strong>${money(book.budget.reduce((sum, [, amount]) => sum + amount, 0))}</strong><a class="text-link" href="${pathFor(book, "funding")}">Full budget</a></div></article>`).join("")}</div>`;
    if (tab === "screen") return `<div class="section-heading"><div><h2>Screen rights</h2><p>Manuscripts that include film or TV licensing income in their backing terms.</p></div></div>
      ${manuscripts.filter(book => book.screenRate).map(book => `<article class="screen-listing"><img src="${art(book)}" width="750" height="500" alt="${book.alt}"><div><p class="genre">${book.genre}</p><h3>${book.title}</h3><p class="author-line">by ${book.author}</p><p>${book.pitch}</p>${ledger([["Rights holder", book.author], ["Reader share of licensing income", `${book.screenRate}%`]])}<a class="text-link" href="${pathFor(book, "funding")}">Read the campaign terms</a></div></article>`).join("")}
      <p class="rights-footnote">A screen option or adaptation would require a separate agreement with the writer.</p>`;
    return `<div class="section-heading"><div><h2>Manuscript ledger</h2><p>Sample figures for the three campaigns on the reading table.</p></div><label class="select-control"><span class="sr-only">Filter manuscripts by rights</span>${icon("tune")}<select id="industry-filter"><option value="">All backing terms</option><option value="screen" ${state.industryFilter ? "selected" : ""}>Includes screen licensing</option></select>${icon("down", "chevron")}</label></div>
      <div id="signals-table">${signalsTable()}</div><div class="industry-notes"><article><h3>Chapter reads</h3><p>Each time a reader opens a sample chapter it counts as one read. Readers can return to a chapter as often as they like.</p></article>
      <article><h3>Reader backing</h3><p>The backer count is the number of individual readers who pledged. The total pledged includes every pledge, including repeat pledges by the same reader.</p></article></div>`;
  }

  function industryPage(tab = "ledger") {
    const tabs = [["ledger", "Readership"], ["editorial", "Editorial work"], ["screen", "Screen rights"]];
    if (!tabs.some(([id]) => id === tab)) tab = "ledger";
    return `<div class="wrap inner-page industry-page"><div class="page-heading"><p class="overline ruled-label">For agents &amp; publishers</p><h1>The publisher’s desk</h1><p>The proposed trade subscription gives agents, editors and producers a place to review readership, editing budgets and rights.</p></div>
      <nav class="detail-nav" aria-label="Publisher’s desk sections">${tabs.map(([id, label]) => `<a href="#industry${id === "ledger" ? "" : "/" + id}" ${tab === id ? 'aria-current="page"' : ""}>${label}</a>`).join("")}</nav><section class="trade-panel">${tradeView(tab)}</section></div>`;
  }

  function filterIndustry(value) {
    state.industryFilter = value;
    document.querySelector("#signals-table").innerHTML = signalsTable();
    announce(value ? "One manuscript offers screen licensing." : "All three manuscripts shown.");
  }

  function handleAction(button) {
    if (button.dataset.action !== "example-amount") return;
    state.exampleAmount = Number(button.dataset.amount);
    const panel = button.closest(".pledge-example");
    panel.outerHTML = feeExample();
    document.querySelector(`[data-action="example-amount"][data-amount="${state.exampleAmount}"]`).focus({ preventScroll: true });
  }

  return { howPage, writerPage, industryPage, handleAction, updateDraft, checkDraft, filterIndustry };
}


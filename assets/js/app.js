/* ============================================================================
   GODOMETER — router, views and interaction
   ========================================================================= */

const app = document.getElementById("app");
const IMG = "assets/img";

/* ------------------------------- helpers -------------------------------- */
const axisForField = (a, b) => AXES.find(x => x.field[0] === a && x.field[1] === b);
const bucketFor = (axis, slug) => axis.buckets.find(b => b.members.includes(slug));
const titleCase = s => s.charAt(0).toUpperCase() + s.slice(1);

const nameList = arr => arr.length <= 1 ? (arr[0] || "")
  : `${arr.slice(0, -1).join(", ")} and ${arr[arr.length - 1]}`;

const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
               "eleven", "twelve", "thirteen"];
const spell = n => WORDS[n] || String(n);

/** Selection for the comparison picker; survives re-renders within a session. */
let compareSel = [];
const CMP_MAX = 5, CMP_MIN = 2;

function picture(slug, cls, alt, lazy = true) {
  return `<img class="${cls}" src="${IMG}/gods/${slug}.jpg" alt="${esc(alt)}" ${lazy ? 'loading="lazy" decoding="async"' : ""}>`;
}
function thumb(slug, cls, alt) {
  return `<img class="${cls}" src="${IMG}/thumbs/${slug}.jpg" alt="${esc(alt)}" loading="lazy" decoding="async">`;
}

/* ------------------------------- routing -------------------------------- */
let returnTo = "/";
let internalNavs = 0;
let listeners;                       /* aborted + rebuilt on every render */

function parseRoute() {
  const raw = location.hash.replace(/^#/, "") || "/";
  const [path, query] = raw.split("?");
  return { path, params: new URLSearchParams(query || "") };
}

function go(hash) { location.hash = hash; }

/** Scroll an element under the sticky bar; honours prefers-reduced-motion. */
function scrollToEl(el) {
  if (!el) return;
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "start" });
}

function render() {
  const { path, params } = parseRoute();
  const m = path.match(/^\/tradition\/([a-z]+)/);
  listeners?.abort();
  listeners = new AbortController();
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });

  if (path === "/compare") {
    const picked = (params.get("t") || "").split(",").filter(x => BY_SLUG[x]);
    const uniq = [...new Set(picked)].slice(0, CMP_MAX);
    if (uniq.length < CMP_MIN) { go("/"); return; }
    /* drop unknown or duplicate slugs from the address bar too */
    if (uniq.join(",") !== (params.get("t") || "")) {
      try { history.replaceState(null, "", `#/compare?t=${uniq.join(",")}`); } catch (_) {}
    }
    compareSel = uniq;
    app.innerHTML = viewCompare(uniq.map(x => BY_SLUG[x]));
    wireCompare();
    document.title = `${uniq.map(x => BY_SLUG[x].tradition).join(" vs ")} · Godometer`;
    observeReveals();
    return;
  }

  if (m && BY_SLUG[m[1]]) {
    app.innerHTML = viewTradition(BY_SLUG[m[1]], params.get("v"));
    wireTradition();
    document.title = `${BY_SLUG[m[1]].tradition} · Godometer`;
  } else {
    returnTo = path === "/" ? location.hash.replace(/^#/, "") || "/" : "/";
    app.innerHTML = viewHome();
    wireHome(params);
    document.title = "Godometer · An alien tribunal measures the gods of Earth";
  }
  observeReveals();
}

/* ============================================================ HOME VIEW == */

function viewHome() {
  return `
  <!-- ------------------------------------------------------------ HERO -->
  <header class="hero">
    <div class="wrap hero__grid">
      <div class="hero__copy">
        <p class="eyebrow eyebrow--teal">Tribunal archive · file 001 · Sol-3</p>
        <h1 class="hero__title">The<em>Godometer</em></h1>
        <p class="hero__lede">
          An atheistic alien tribunal has finished reading Earth's theology — ten traditions, measured on
          <strong>what their gods are</strong> and <strong>what those gods permit</strong>.
        </p>
      </div>

      <aside class="hero__verdict">
        <p class="mono">Court note</p>
        <p>No defendant appeared for Buddhism or Jainism. There is no creator to summon — only a method,
           and a cosmos that runs without one.</p>
      </aside>

      <div class="hero__stage">
        <div class="hero__halo" aria-hidden="true"></div>
        <div class="hero__floor" aria-hidden="true"></div>
        <picture>
          <source srcset="${IMG}/judge.webp" type="image/webp">
          <img class="hero__judge" src="${IMG}/judge.png" width="980" height="682"
               alt="An alien judge in white and gold robes raises a gavel over a holographic bench of scales, with five glowing containment pods below holding divine figures.">
        </picture>
      </div>

      <!-- ------------------------------------------------------ CONSOLE -->
      <section class="deck" id="console" aria-label="Interrogation console">
        <header class="deck__head">
          <p class="eyebrow eyebrow--teal">Interrogation console</p>
          <h2>Ask one question. Watch ten theologies sort themselves.</h2>
        </header>

        <div class="deck__grid">
          <div class="deck__slot">
            <div class="deck__label"><span class="deck__num">01</span><h3>God model</h3></div>
            <p class="deck__hint">What kind of thing is this god, and how much room does it leave a human being?</p>
            <div class="select-wrap select-wrap--lg">
              <label class="visually-hidden" for="axisSel">Select a god-model question</label>
              <select id="axisSel">
                <option value="">Select a question…</option>
                <option value="${ALL}">All ${AXES.length} questions · ranked by authority</option>
                ${["God model", "Human autonomy"].map(g => `<optgroup label="${g}">
                  ${AXES.filter(a => a.group === g).map(a => `<option value="${a.id}">${esc(a.label)}</option>`).join("")}
                </optgroup>`).join("")}
              </select>
            </div>
          </div>

          <div class="deck__slot">
            <div class="deck__label"><span class="deck__num">02</span><h3>Modern human values</h3></div>
            <p class="deck__hint">Eleven values of the modern human world, tested against the theology — not against practice.</p>
            <div class="select-wrap select-wrap--lg">
              <label class="visually-hidden" for="valueSel">Select a modern human value</label>
              <select id="valueSel">
                <option value="">Select a value…</option>
                <option value="${ALL}">All ${VALUES.length} values · composite ranking</option>
                ${VALUES.map(v => `<option value="${v.key}">${esc(v.label)}</option>`).join("")}
              </select>
            </div>
          </div>
        </div>

        <section class="deck__compare">
          <div class="deck__label"><span class="deck__num">03</span><h3>Compare</h3>
            <p class="deck__hint deck__hint--inline">Put two to five traditions side by side.</p></div>
          <div class="cmp-pick" id="cmpPick" role="group" aria-label="Choose 2 to 5 traditions to compare">
            ${TRADITIONS.map(t => `<button type="button" class="cmp-chip" data-cmp="${t.slug}"
                style="--c:${t.color}" aria-pressed="false">
              <span class="cmp-chip__dot"></span>${esc(t.tradition)}</button>`).join("")}
          </div>
          <div class="cmp-go">
            <span class="cmp-go__count" id="cmpCount" aria-live="polite">None selected</span>
            <button type="button" class="btn btn--primary" id="cmpGo" disabled>Compare →</button>
          </div>
        </section>

        <footer class="deck__foot">
          <p class="scope-band__i" aria-hidden="true">[!]</p>
          <p><b>Scope.</b> Every reading is of theology and classical jurisprudence. Lived practice, the
             behaviour of followers and the policy of any modern government are excluded from the record.</p>
          <button type="button" class="deck__skip" data-scroll="traditions">Skip to the ten files →</button>
        </footer>
      </section>
    </div>
  </header>

  <!-- --------------------------------------------------------- RESULTS -->
  <section class="sec sec--tight" id="results">
    <div class="wrap">
      <div class="result-nav" id="resultNav" hidden>
        <button type="button" data-scroll="console">&uarr; Change selection</button>
      </div>
      <div class="panel panel--cut result" id="result"></div>
    </div>
  </section>

  <!-- ----------------------------------------------------------- STATS -->
  <div class="wrap">
    <div class="stats">
      ${[["10", "Traditions on record"], [String(AXES.length), "God-model questions"],
         [String(VALUES.length), "Modern human values"],
         [String(VALUES.length * TRADITIONS.length), "Value verdicts issued"], ["4", "Classes of god"]]
        .map(([n, l]) => `<div class="stat"><div class="stat__n">${n}</div><div class="stat__l">${l}</div></div>`).join("")}
    </div>
  </div>

  <!-- ------------------------------------------------------------ MAP -->
  <section class="sec" id="map">
    <div class="wrap">
      <div class="sec-head reveal">
        <p class="eyebrow">Chart 01 · The Godometer map</p>
        <h2>Two readings decide everything else.</h2>
        <p>How much authority the god holds, plotted against how much room the human keeps.
           The diagonal is almost perfect: where divine authority is absolute, human autonomy collapses.</p>
      </div>
      <div class="panel reveal" style="padding-block:clamp(1.2rem,1rem+1vw,2.2rem)">
        ${quadrantMap()}
        <p class="dim" style="font-size:var(--t-small);margin-top:1rem;max-width:78ch">
          Positions are the Tribunal's calibration of the god-model and autonomy fields — creator status, lawgiver
          strength, finality of judgment, exclusivity, and the human's freedom to question, disobey or refuse.
        </p>
      </div>
    </div>
  </section>

  <!-- --------------------------------------------------------- RANKINGS -->
  <section class="sec" id="rankings">
    <div class="wrap chart-grid">
      <div class="panel reveal">
        <p class="panel__label">Chart 02 · Divine authority index</p>
        <h3 style="font-size:var(--t-h3);margin-bottom:.5rem">Who holds the gavel?</h3>
        <p class="muted" style="font-size:var(--t-small);margin-bottom:1.4rem">
          Creator status, lawgiving power, finality of judgment and intolerance of rivals, combined into one reading.</p>
        ${rankBars("authority", { label: "divine authority" })}
      </div>

      <div class="panel reveal">
        <p class="panel__label">Chart 03 · Human autonomy index</p>
        <h3 style="font-size:var(--t-h3);margin-bottom:.5rem">How much of you is left?</h3>
        <p class="muted" style="font-size:var(--t-small);margin-bottom:1.4rem">
          Freedom to question, to morally disagree, to disobey legitimately, and to walk away entirely.</p>
        ${rankBars("autonomy", { label: "human autonomy" })}
      </div>
    </div>
  </section>

  <!-- ------------------------------------------------------ VALUES RANK -->
  <section class="sec" id="compat">
    <div class="wrap">
      <div class="sec-head reveal">
        <p class="eyebrow">Chart 04 · Compatibility index</p>
        <h2>Eleven modern values, ten doctrines, one score.</h2>
        <p>Each band is one value in the order listed below. Fully allowed scores 100, partially allowed 50,
           not allowed 0 — averaged across every value that applies. The highest reading in the sample is
           ${Math.max(...TRADITIONS.map(t => t.valuesScore))}; the lowest is
           ${Math.min(...TRADITIONS.map(t => t.valuesScore))}.</p>
      </div>
      <div class="panel reveal">
        ${valuesRank()}
        <div class="chart-legend chart-legend--index">
          ${VALUES.map((v, i) => `<span class="legend-item">${i + 1}. ${esc(v.short)}</span>`).join("")}
        </div>
        <div class="chart-legend" style="border-top:1px solid var(--line);padding-top:1rem;margin-top:1rem">
          ${Object.entries(RATING_META).map(([k, m]) => `<span class="legend-item"><i style="background:${m.color}"></i>${esc(k)}</span>`).join("")}
        </div>
      </div>
    </div>
  </section>

  <!-- ---------------------------------------------------------- MATRIX -->
  <section class="sec" id="matrix">
    <div class="wrap">
      <div class="sec-head reveal">
        <p class="eyebrow">Chart 05 · The verdict matrix</p>
        <h2>${VALUES.length * TRADITIONS.length} verdicts, on one wall.</h2>
        <p>Every tradition against every value. Amber dominates — almost nothing in Earth's theology is a clean yes or
           a clean no. Tap any cell to open that verdict in full.</p>
      </div>
      <div class="panel reveal">
        ${verdictMatrix()}
        <div class="chart-legend" style="margin-top:1.2rem">
          ${Object.entries(RATING_META).map(([k, m]) => `<span class="legend-item"><i style="background:${m.color}"></i>${esc(k)}</span>`).join("")}
        </div>
      </div>
    </div>
  </section>

  <!-- --------------------------------------------------------- CLASSES -->
  <section class="sec" id="classes">
    <div class="wrap">
      <div class="sec-head reveal">
        <p class="eyebrow">Taxonomy</p>
        <h2>Four classes of god.</h2>
        <p>Sorted purely by the structure of the deity — not by age, size or geography.</p>
      </div>
      <div class="class-grid">
        ${CLASSES.map(c => `<article class="panel class-card reveal" style="--c:${c.color}">
          <div class="class-card__num">${c.numeral}</div>
          <div>
            <p class="class-card__tag">Class ${c.numeral} · ${c.members.length} ${c.members.length === 1 ? "tradition" : "traditions"}</p>
            <h3>${esc(c.name)}</h3>
          </div>
          <p style="color:var(--ink);font-family:var(--font-display);font-weight:600;font-size:.95rem">${esc(c.tagline)}</p>
          <p>${esc(c.body)}</p>
          <div class="class-card__members">
            ${c.members.map(s => `<button type="button" data-slug="${s}">${esc(BY_SLUG[s].tradition)} →</button>`).join("")}
          </div>
        </article>`).join("")}
      </div>
    </div>
  </section>

  <!-- --------------------------------------------------------- GALLERY -->
  <section class="sec" id="traditions">
    <div class="wrap">
      <div class="sec-head reveal">
        <p class="eyebrow">The docket</p>
        <h2>The ten traditions.</h2>
        <p>Each file carries the complete god model, the human-autonomy findings, the vocabulary of relationship,
           and every value verdict with its reasoning.</p>
      </div>
      <div class="gallery">
        ${TRADITIONS.map(godCard).join("")}
      </div>
    </div>
  </section>`;
}

function godCard(t) {
  return `<button type="button" class="god-card reveal" data-slug="${t.slug}" style="--c:${t.color}"
            aria-label="Open the ${esc(t.tradition)} file">
    <span class="god-card__badge">${t.valuesScore}</span>
    <span class="god-card__media">${picture(t.image, "", t.imageCaption)}</span>
    <span class="god-card__body">
      <span class="god-card__class">Class ${t.classInfo.numeral} · ${esc(t.classInfo.name)}</span>
      <span class="god-card__name">${esc(t.tradition)}</span>
      <span class="god-card__deity">${esc(t.deity)}</span>
      <span class="god-card__meters">
        <span class="meter"><span class="meter__l">Authority</span>
          <span class="meter__t"><span class="meter__f" style="width:${t.metrics.authority}%;background:var(--gold)"></span></span></span>
        <span class="meter"><span class="meter__l">Autonomy</span>
          <span class="meter__t"><span class="meter__f" style="width:${t.metrics.autonomy}%;background:var(--teal)"></span></span></span>
      </span>
    </span>
  </button>`;
}

/* --------------------------- console rendering --------------------------- */

function renderAxisResult(axis) {
  return `
    <div class="result__head">
      <div>
        <p class="panel__label">God model · question ${AXES.indexOf(axis) + 1} of ${AXES.length}</p>
        <h3 class="result__q">${esc(axis.label)}</h3>
        <p class="result__sub">${esc(axis.question)}</p>
      </div>
      <span class="chip"><span class="chip__dot" style="color:var(--teal)"></span>${esc(axis.group)}</span>
    </div>
    ${distRibbon(axis.buckets)}
    ${axis.buckets.map(b => `
      <section class="bucket">
        <header class="bucket__head">
          <span class="bucket__bar" style="background:${TONE[b.tone].color}"></span>
          <span>
            <span class="bucket__name" style="color:${TONE[b.tone].color}">${esc(b.label)}</span>
            <span class="bucket__count"> · ${b.members.length} of ${TRADITIONS.length}</span>
          </span>
        </header>
        <div class="rel-list">
          ${b.members.map(s => {
            const t = BY_SLUG[s];
            return `<button type="button" class="rel-card" data-slug="${s}" style="--accent:${t.color}"
                      aria-label="Open the ${esc(t.tradition)} file">
              <span class="rel-card__top">
                ${thumb(t.image, "rel-row__img", "")}
                <span class="rel-row__body">
                  <span class="rel-row__name">${esc(t.tradition)}</span>
                  <span class="rel-row__meta">Class ${t.classInfo.numeral} · ${esc(t.classInfo.name)}</span>
                </span>
                <span class="rel-row__go">→</span>
              </span>
              <span class="rel-row__note">“${esc(t[axis.field[0]][axis.field[1]])}”</span>
            </button>`;
          }).join("")}
        </div>
      </section>`).join("")}`;
}

/* --------- ranked value results: the card on the left, the alignment
   slider on the right, best-aligned theology at the top ------------------ */

function rankRow(t, i, o) {
  return `<button type="button" class="vrank" data-slug="${t.slug}"${o.valueKey ? ` data-value="${o.valueKey}"` : ""}
      style="--accent:${t.color}"
      aria-label="Rank ${i + 1}, ${esc(t.tradition)}: ${esc(o.label)}. Open the file.">
    <span class="vrank__rank">${String(i + 1).padStart(2, "0")}</span>
    <span class="vrank__card">
      ${thumb(t.image, "rel-row__img", "")}
      <span class="rel-row__body">
        <span class="rel-row__name">${esc(t.tradition)}</span>
        <span class="rel-row__meta">Class ${t.classInfo.numeral} · ${esc(t.classInfo.name)}</span>
      </span>
      <span class="rel-row__go">→</span>
    </span>
    <span class="vrank__note">${o.note}</span>
    <span class="vrank__slider">${alignSlider(o.score, o.label, o)}</span>
  </button>`;
}

function tallyLine(t) {
  const bits = [
    [t.tally.full,    "aligned",    RATING_META["Fully allowed"].color],
    [t.tally.partial, "restricted", RATING_META["Partially allowed"].color],
    [t.tally.none,    "refused",    RATING_META["Not allowed"].color],
    [t.tally.na,      "n/a",        RATING_META["Not applicable"].color]
  ].filter(b => b[0] > 0);
  return `<span class="vrank__tally">${bits.map(([n, l, c]) =>
    `<span style="color:${c}">${n}</span> ${l}`).join(" · ")}</span>`;
}

function renderValueResult(value) {
  const rows = TRADITIONS.map(t => {
    const e = t.modern_human_values[value.key], m = RATING_META[e.rating];
    return { t, score: m.score, label: e.rating, color: m.color, note: esc(e.note), valueKey: value.key };
  }).sort((a, b) => (b.score === null ? -1 : b.score) - (a.score === null ? -1 : a.score));

  const counts = {};
  rows.forEach(r => counts[r.label] = (counts[r.label] || 0) + 1);

  return `
    <div class="result__head">
      <div>
        <p class="panel__label">Modern human value · ${VALUES.indexOf(value) + 1} of ${VALUES.length}</p>
        <h3 class="result__q">${esc(value.label)}</h3>
        <p class="result__sub">Ranked by how far the theology can travel with this value. Measured against
           doctrine and classical jurisprudence only — never against practice.</p>
      </div>
      <span class="chip"><span class="chip__dot" style="color:var(--gold)"></span>Value test</span>
    </div>
    <div class="tally-row">
      ${["Fully allowed", "Partially allowed", "Not allowed", "Not applicable"]
        .filter(r => counts[r]).map(r => `<span class="tally-row__item">
          <b style="color:${RATING_META[r].color}">${counts[r]}</b>
          <span title="${esc(SCOPE.rating_scale[r])}">${esc(r)}</span></span>`).join("")}
    </div>
    <div class="vrank-list">${rows.map((r, i) => rankRow(r.t, i, r)).join("")}</div>`;
}

function renderAllValues() {
  const rows = [...TRADITIONS].sort((a, b) => b.valuesScore - a.valuesScore);
  const top = rows[0], bottom = rows[rows.length - 1];
  return `
    <div class="result__head">
      <div>
        <p class="panel__label">All ${VALUES.length} values · composite</p>
        <h3 class="result__q">The whole board, ranked.</h3>
        <p class="result__sub">Every value averaged into one reading — fully allowed 100, partially allowed 50,
           not allowed 0, with not-applicable verdicts left out of the average. ${esc(top.tradition)} leads at
           ${top.valuesScore}; ${esc(bottom.tradition)} sits at ${bottom.valuesScore}.</p>
      </div>
      <span class="chip"><span class="chip__dot" style="color:var(--teal)"></span>Composite</span>
    </div>
    <div class="vrank-list">${rows.map((t, i) => rankRow(t, i, {
      score: t.valuesScore,
      label: "Composite alignment",
      color: alignColor(t.valuesScore),
      suffix: `${t.valuesScore}/100`,
      note: `${valueStrip(t)}${tallyLine(t)}`
    })).join("")}</div>
    <div class="chart-legend" style="margin-top:1.2rem">
      ${VALUES.map((v, i) => `<span class="legend-item">${i + 1}. ${esc(v.short)}</span>`).join("")}
    </div>`;
}

function renderAllAxes() {
  const rows = [...TRADITIONS].sort((a, b) => b.metrics.authority - a.metrics.authority);
  return `
    <div class="result__head">
      <div>
        <p class="panel__label">All ${AXES.length} questions · composite</p>
        <h3 class="result__q">Every god, ranked by how much it commands.</h3>
        <p class="result__sub">Creator status, lawgiving power, finality of judgment and intolerance of rivals,
           against the room the human keeps. Gold is a commanding god, teal is barely a god at all.</p>
      </div>
      <span class="chip"><span class="chip__dot" style="color:var(--gold)"></span>Composite</span>
    </div>
    <div class="vrank-list">${rows.map((t, i) => rankRow(t, i, {
      score: t.metrics.authority,
      label: "Divine authority",
      color: toneColor(t.metrics.authority),
      suffix: `${t.metrics.authority}/100`,
      leftEnd: "No god to obey",
      rightEnd: "Absolute command",
      ramp: "tone",
      note: `${axisStrip(t)}<span class="vrank__tally">human autonomy
             <span style="color:var(--teal)">${t.metrics.autonomy}</span> · values match
             <span style="color:${alignColor(t.valuesScore)}">${t.valuesScore}</span></span>`
    })).join("")}</div>
    <div class="chart-legend" style="margin-top:1.2rem">
      ${AXES.map((a, i) => `<span class="legend-item">${i + 1}. ${esc(a.label)}</span>`).join("")}
    </div>`;
}

function renderIdleResult() {
  return `
    <div class="result__head">
      <div>
        <p class="panel__label">Awaiting instruction</p>
        <h3 class="result__q">The bench is seated. Select a question.</h3>
        <p class="result__sub">Or start from one of these findings the tribunal flagged as unusual.</p>
      </div>
    </div>
    <div class="rel-list" style="grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr))">
      ${[
        { k: "axis", id: "bornguilty",  t: "Only one tradition starts you in debt", s: "Are humans born guilty?" },
        { k: "axis", id: "reject",      t: "Three theologies permit refusing God",  s: "Are you allowed to reject God?" },
        { k: "axis", id: "disagree",    t: "Five allow you to out-argue the divine", s: "Can you morally out-argue God?" },
        { k: "value", id: "freedom_to_leave_religion", t: "The hardest door to walk out of", s: "Freedom to leave religion" },
        { k: "value", id: "secular_governance",        t: "Where a civil state raises no objection", s: "Secular governance" },
        { k: "value", id: "equality_regardless_birth_caste_ethnicity", t: "The one value most agree on", s: "Equality regardless of birth or caste" },
        { k: "value", id: "acceptance_of_science", t: "Three theologies keep a veto over evidence", s: "Acceptance of science" },
        { k: "value", id: ALL,                     t: "The whole board, ranked", s: `All ${VALUES.length} values · composite` }
      ].map(p => `<button type="button" class="rel-card" data-preset="${p.k}:${p.id}" style="--accent:var(--violet)">
        <span class="rel-row__name" style="display:block">${esc(p.t)}</span>
        <span class="rel-row__meta" style="white-space:normal">${esc(p.s)} →</span>
      </button>`).join("")}
    </div>`;
}

/* ===================================================== COMPARISON VIEW == */

function godModelProse(list) {
  const names = list.map(t => t.tradition);
  const diff = differingAxes(list), same = AXES.length - diff.length;

  const byAuth = [...list].sort((a, b) => b.metrics.authority - a.metrics.authority);
  const byAuto = [...list].sort((a, b) => b.metrics.autonomy - a.metrics.autonomy);
  const authGap = byAuth[0].metrics.authority - byAuth[byAuth.length - 1].metrics.authority;
  const autoGap = byAuto[0].metrics.autonomy - byAuto[byAuto.length - 1].metrics.autonomy;

  /* the categorical question with the widest tone range */
  const sharp = diff.map(a => {
    const tones = list.map(t => bucketOf(a, t.slug).tone).filter(x => x > 0);
    return { a, range: tones.length ? Math.max(...tones) - Math.min(...tones) : 0 };
  }).sort((x, y) => y.range - x.range)[0];

  /* which tradition most often answers alone */
  let odd = null;
  if (list.length > 2 && diff.length) {
    const alone = list.map(t => ({ t, n: diff.filter(a => {
      const id = bucketOf(a, t.slug).id;
      return list.every(o => o === t || bucketOf(a, o.slug).id !== id);
    }).length })).sort((x, y) => y.n - x.n);
    if (alone[0].n > (alone[1] ? alone[1].n : 0)) odd = alone[0];
  }

  const bits = [];
  bits.push(diff.length === 0
    ? `${nameList(names)} give the same answer to all <b>${spell(AXES.length)}</b> god-model questions.
       Whatever separates them, it is not the structure of the god.`
    : `${nameList(names)} part company on <b>${diff.length} of the ${AXES.length}</b> god-model
       questions${same ? `, and answer the remaining ${spell(same)} the same way` : ""}.`);
  bits.push(`Divine authority runs from <b style="color:${byAuth[0].color}">${byAuth[0].metrics.authority}</b>
    (${esc(byAuth[0].tradition)}) down to <b style="color:${byAuth[byAuth.length - 1].color}">${byAuth[byAuth.length - 1].metrics.authority}</b>
    (${esc(byAuth[byAuth.length - 1].tradition)}), a gap of ${authGap} points, while human autonomy travels the
    other way — ${byAuto[0].metrics.autonomy} for ${esc(byAuto[0].tradition)} against
    ${byAuto[byAuto.length - 1].metrics.autonomy} for ${esc(byAuto[byAuto.length - 1].tradition)}, a gap of ${autoGap}.`);

  if (sharp && sharp.range > 0) {
    const ranked = [...list].sort((a, b) => bucketOf(sharp.a, b.slug).tone - bucketOf(sharp.a, a.slug).tone);
    const hi = ranked[0], lo = ranked[ranked.length - 1];
    bits.push(`The sharpest single split is on <b>“${esc(sharp.a.label)}”</b> — ${esc(hi.tradition)}
      lands on “${esc(bucketOf(sharp.a, hi.slug).label)}”, ${esc(lo.tradition)} on
      “${esc(bucketOf(sharp.a, lo.slug).label)}”.`);
  }
  if (odd) {
    bits.push(`${esc(odd.t.tradition)} is the outlier: on ${odd.n} of those ${diff.length} questions it gives
      an answer none of the others give.`);
  }
  return bits.map(b => `<p>${b}</p>`).join("");
}

function valuesProse(list) {
  const names = list.map(t => t.tradition);
  const diff = differingValues(list), same = VALUES.length - diff.length;
  const byScore = [...list].sort((a, b) => b.valuesScore - a.valuesScore);
  const gap = byScore[0].valuesScore - byScore[byScore.length - 1].valuesScore;

  const spread = diff.map(v => {
    const scores = list.map(t => RATING_META[t.modern_human_values[v.key].rating].score)
                       .filter(x => x !== null);
    return { v, range: scores.length > 1 ? Math.max(...scores) - Math.min(...scores) : 0 };
  }).sort((x, y) => y.range - x.range)[0];

  const refusers = list.map(t => ({ t, n: t.tally.none })).filter(x => x.n > 0)
                       .sort((a, b) => b.n - a.n);

  const bits = [];
  bits.push(diff.length === 0
    ? `These theologies return the identical verdict on all <b>${spell(VALUES.length)}</b> modern values.`
    : `Across the ${VALUES.length} modern values these theologies diverge on
       <b>${diff.length}</b>${same ? ` and return the identical verdict on the other ${spell(same)}` : ""}.`);
  bits.push(`Composite alignment runs from <b style="color:${alignColor(byScore[0].valuesScore)}">${byScore[0].valuesScore}</b>
    (${esc(byScore[0].tradition)}) to <b style="color:${alignColor(byScore[byScore.length - 1].valuesScore)}">${byScore[byScore.length - 1].valuesScore}</b>
    (${esc(byScore[byScore.length - 1].tradition)})${gap ? `, ${gap} points apart` : " — they finish level"}.`);

  if (spread && spread.range > 0) {
    const ranked = [...list].sort((a, b) => {
      const sc = x => { const v = RATING_META[x.modern_human_values[spread.v.key].rating].score; return v === null ? -1 : v; };
      return sc(b) - sc(a);
    });
    const hi = ranked[0], lo = ranked[ranked.length - 1];
    bits.push(`The widest gap is on <b>“${esc(spread.v.label)}”</b>: ${esc(hi.tradition)} is
      ${esc(hi.modern_human_values[spread.v.key].rating.toLowerCase())} where ${esc(lo.tradition)} is
      ${esc(lo.modern_human_values[spread.v.key].rating.toLowerCase())}.`);
  }
  bits.push(refusers.length
    ? `${nameList(refusers.map(r => `${esc(r.t.tradition)} (${r.n})`))} ${refusers.length === 1 ? "refuses" : "refuse"}
       values outright; the rest restrict without forbidding.`
    : `None of the selected traditions refuses any of the ${VALUES.length} values outright.`);
  return bits.map(b => `<p>${b}</p>`).join("");
}

function viewCompare(list) {
  return `
  <nav class="backbar">
    <div class="wrap backbar__in">
      <button class="back-btn" type="button" id="backBtn"><span>←</span><span>Back to the tribunal</span></button>
      <span class="backbar__ctx">Comparison · ${list.length} traditions</span>
    </div>
  </nav>

  <header class="cmp-hero">
    <div class="wrap">
      <p class="eyebrow eyebrow--teal">Side by side · ${list.length} of ${TRADITIONS.length} on record</p>
      <h1>${esc(nameList(list.map(t => t.tradition)))}</h1>
      <p class="cmp-hero__lede">Only the readings that actually separate them are drawn below.
         Where the selection agrees, the row is left out and counted.</p>
      <div class="cmp-hero__chips">
        ${list.map(t => `<button type="button" class="cmp-tile" data-slug="${t.slug}" style="--c:${t.color}">
          ${thumb(t.image, "cmp-tile__img", "")}
          <span class="cmp-tile__body">
            <span class="cmp-tile__name">${esc(t.tradition)}</span>
            <span class="cmp-tile__meta">Class ${t.classInfo.numeral} · authority ${t.metrics.authority} ·
              autonomy ${t.metrics.autonomy} · values ${t.valuesScore}</span>
          </span>
          <span class="rel-row__go">→</span>
        </button>`).join("")}
      </div>
    </div>
  </header>

  <section class="sec" id="cmp-god">
    <div class="wrap">
      <div class="sec-head reveal">
        <p class="eyebrow">Section 01</p>
        <h2>The god model.</h2>
        <p>The six-axis signature overlaid, then every one of the ${AXES.length} questions where these
           traditions do not give the same answer.</p>
      </div>
      <div class="panel reveal">
        <p class="panel__label">Theological signatures, overlaid</p>
        <div class="cmp-radar">${radarMulti(list)}</div>
        <div class="chart-legend" style="margin-top:.4rem">
          ${list.map(t => `<span class="legend-item"><i style="background:${t.color}"></i>${esc(t.tradition)}</span>`).join("")}
        </div>
      </div>
      <div class="panel reveal" style="margin-top:var(--gap)">
        <p class="panel__label">Where the answers diverge</p>
        ${diffMatrix(list)}
      </div>
      <div class="cmp-prose reveal">
        <p class="cmp-prose__l">What the bench reads into it</p>
        ${godModelProse(list)}
      </div>
    </div>
  </section>

  <section class="sec" id="cmp-values" style="padding-top:0">
    <div class="wrap">
      <div class="sec-head reveal">
        <p class="eyebrow">Section 02</p>
        <h2>Modern human values.</h2>
        <p>Every value on which these theologies return different verdicts, measured against doctrine
           and classical jurisprudence — never against practice.</p>
      </div>
      <div class="panel reveal">
        <p class="panel__label">Verdicts that differ</p>
        ${valuesHeatmap(list)}
      </div>
      <div class="cmp-prose reveal">
        <p class="cmp-prose__l">What the bench reads into it</p>
        ${valuesProse(list)}
      </div>
      <div style="display:flex;gap:.75rem;flex-wrap:wrap;margin-top:2.4rem">
        <button class="btn" type="button" id="backBtn2">← Pick a different set</button>
        <button class="btn" type="button" data-goto="traditions">All ten files</button>
      </div>
    </div>
  </section>`;
}

function wireCompare() {
  const on = listeners.signal;
  const back = () => { if (internalNavs > 0) history.back(); else go("/"); };
  document.getElementById("backBtn").addEventListener("click", back, { signal: on });
  document.getElementById("backBtn2").addEventListener("click", back, { signal: on });
  app.addEventListener("click", e => {
    const gt = e.target.closest("[data-goto]");
    if (gt) { go("/"); setTimeout(() => document.getElementById(gt.dataset.goto)
      ?.scrollIntoView({ behavior: "smooth" }), 80); return; }
    const hit = e.target.closest("[data-slug]");
    if (hit) go(`/tradition/${hit.dataset.slug}`);
  }, { signal: on });
}

/* ------------------------------ home wiring ------------------------------ */

function wireHome(params) {
  const axisSel = document.getElementById("axisSel");
  const valueSel = document.getElementById("valueSel");
  const result = document.getElementById("result");

  function sync(scroll) {
    const a = axisSel.value, v = valueSel.value;
    result.innerHTML = a === ALL ? renderAllAxes()
                     : a         ? renderAxisResult(AXIS_BY_ID[a])
                     : v === ALL ? renderAllValues()
                     : v         ? renderValueResult(VALUE_BY_KEY[v])
                     :             renderIdleResult();
    const q = a ? `?axis=${a}` : v ? `?value=${v}` : "";
    /* replaceState keeps the selection linkable without re-rendering the page;
       some browsers refuse it on file:// URLs, where the route simply stays put. */
    try { history.replaceState(null, "", `#/${q}`); } catch (_) { /* file:// */ }
    returnTo = `/${q}`;
    document.getElementById("resultNav").hidden = !(a || v);
    if (scroll) scrollToEl(result);
  }

  const on = listeners.signal;
  /* a fresh selection scrolls the reading into view — otherwise it lands
     below the fold and the reader has no idea anything happened */
  axisSel.addEventListener("change", () => {
    if (axisSel.value) valueSel.value = "";
    sync(Boolean(axisSel.value));
  }, { signal: on });
  valueSel.addEventListener("change", () => {
    if (valueSel.value) axisSel.value = "";
    sync(Boolean(valueSel.value));
  }, { signal: on });

  /* ---- comparison picker: 2 to 5 traditions, then Go ------------------- */
  const pick = document.getElementById("cmpPick");
  const count = document.getElementById("cmpCount");
  const goBtn = document.getElementById("cmpGo");

  function paintPicks() {
    pick.querySelectorAll("[data-cmp]").forEach(b => {
      const chosen = compareSel.includes(b.dataset.cmp);
      b.setAttribute("aria-pressed", String(chosen));
      b.classList.toggle("is-on", chosen);
      b.disabled = !chosen && compareSel.length >= CMP_MAX;
    });
    const n = compareSel.length;
    count.textContent = n === 0 ? `Pick ${CMP_MIN} to ${CMP_MAX}`
      : n < CMP_MIN ? `${n} selected — one more at least`
      : n === CMP_MAX ? `${n} selected — that is the maximum`
      : `${n} selected`;
    goBtn.disabled = n < CMP_MIN;
  }

  pick.addEventListener("click", e => {
    const b = e.target.closest("[data-cmp]");
    if (!b) return;
    const slug = b.dataset.cmp;
    compareSel = compareSel.includes(slug)
      ? compareSel.filter(x => x !== slug)
      : compareSel.length < CMP_MAX ? [...compareSel, slug] : compareSel;
    paintPicks();
  }, { signal: on });

  goBtn.addEventListener("click", () => {
    if (compareSel.length >= CMP_MIN) go(`/compare?t=${compareSel.join(",")}`);
  }, { signal: on });

  paintPicks();

  const a0 = params.get("axis"), v0 = params.get("value");
  if (a0 && (a0 === ALL || AXIS_BY_ID[a0])) axisSel.value = a0;
  else if (v0 && (v0 === ALL || VALUE_BY_KEY[v0])) valueSel.value = v0;
  sync(false);
  /* On a deep link the browser does its own scroll handling as the page
     finishes loading, which cancels an early programmatic scroll — so wait
     for load before jumping to the reading. */
  if (a0 || v0) {
    const jump = () => setTimeout(() => scrollToEl(document.getElementById("result")), 80);
    if (document.readyState === "complete") jump();
    else window.addEventListener("load", jump, { once: true });
  }

  app.addEventListener("click", e => {
    const preset = e.target.closest("[data-preset]");
    if (preset) {
      const [kind, id] = preset.dataset.preset.split(":");
      if (kind === "axis") { axisSel.value = id; valueSel.value = ""; }
      else { valueSel.value = id; axisSel.value = ""; }
      sync(true);
      return;
    }
    const scroll = e.target.closest("[data-scroll]");
    if (scroll) { scrollToEl(document.getElementById(scroll.dataset.scroll)); return; }
    const hit = e.target.closest("[data-slug]");
    if (hit) go(`/tradition/${hit.dataset.slug}${hit.dataset.value ? `?v=${hit.dataset.value}` : ""}`);
  }, { signal: on });

  app.addEventListener("keydown", e => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const dot = e.target.closest(".map-dot");
    if (dot) { e.preventDefault(); go(`/tradition/${dot.dataset.slug}`); }
  }, { signal: on });
}

/* ======================================================= TRADITION VIEW == */

function specRow(t, group, key) {
  const axis = axisForField(group, key);
  const raw = t[group][key];
  const tone = axis ? TONE[bucketFor(axis, t.slug).tone] : null;
  return `<div class="spec__row">
    <div class="spec__k">${esc(key.replace(/_/g, " "))}</div>
    <div class="spec__v" style="${tone ? `color:${tone.color}` : ""}">${esc(raw)}</div>
    ${axis ? `<button type="button" class="value-card__link" data-axis="${axis.id}">Compare all ten →</button>` : ""}
  </div>`;
}

function viewTradition(t, highlight) {
  const c = t.color;
  const gm = Object.keys(t.god_model).filter(k => k !== "other_god_worship_in_lived_practice");
  const ha = Object.keys(t.human_autonomy);
  const siblings = t.classInfo.members.filter(s => s !== t.slug);
  const others = TRADITIONS.filter(x => x.slug !== t.slug && !siblings.includes(x.slug)).slice(0, 5);

  return `
  <nav class="backbar">
    <div class="wrap backbar__in">
      <button class="back-btn" type="button" id="backBtn"><span>←</span><span>Back to the tribunal</span></button>
      <span class="backbar__ctx">File · ${esc(t.tradition)} · Class ${t.classInfo.numeral}</span>
    </div>
  </nav>

  <header class="rel-hero" style="--c:${c}">
    <div class="rel-hero__bg">${picture(t.image, "", t.imageCaption, false)}</div>
    <div class="wrap rel-hero__in">
      <p class="eyebrow" style="color:${c}">${esc(t.era)} · ${esc(t.origin)}</p>
      <h1>${esc(t.tradition)}</h1>
      <p class="rel-hero__deity">${esc(t.deity)}</p>
      <div class="rel-hero__meta">
        <span class="chip" style="color:${c};border-color:${c}"><span class="chip__dot"></span>Class ${t.classInfo.numeral} · ${esc(t.classInfo.name)}</span>
        <span class="chip">Authority ${t.metrics.authority}</span>
        <span class="chip">Autonomy ${t.metrics.autonomy}</span>
        <span class="chip">Values ${t.valuesScore}/100</span>
      </div>
      <p class="rel-hero__caption">${esc(t.imageCaption)}</p>
    </div>
  </header>

  <!-- ----------------------------------------------------- READING -->
  <section class="sec" id="reading" style="padding-block:clamp(2.2rem,1.4rem+2vw,3.6rem)">
    <div class="wrap split" style="align-items:center">
      <div class="rel-note" style="--c:${c}">
        <p class="rel-note__l">Tribunal note</p>
        <p>${esc(t.note)}</p>
        <p class="dim" style="font-size:var(--t-small);margin-top:1rem">
          ${esc(t.classInfo.body)}
        </p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem">
        ${gauge(t.metrics.authority, "var(--gold)", "Divine authority")}
        ${gauge(t.metrics.autonomy, "var(--teal)", "Human autonomy")}
        ${gauge(t.valuesScore, "var(--violet)", "Values match")}
      </div>
    </div>
  </section>

  <!-- --------------------------------------------------- GOD MODEL -->
  <section class="sec" id="godmodel" style="padding-top:0">
    <div class="wrap">
      <div class="sec-head reveal">
        <p class="eyebrow">Section A</p>
        <h2>The god model.</h2>
        <p>What the tribunal found when it asked what this god <em>is</em>. Colour marks the reading:
           gold for high divine authority, violet for mixed, teal for low or absent.</p>
      </div>
      <div class="split">
        <div class="panel reveal"><div class="spec">
          ${gm.map(k => specRow(t, "god_model", k)).join("")}
        </div></div>
        <div class="panel reveal" style="display:flex;flex-direction:column;justify-content:center">
          <p class="panel__label">Theological signature</p>
          ${radar(t)}
          <p class="dim" style="font-size:var(--t-small);margin-top:.6rem;text-align:center">
            Six-axis calibration. A wide gold shape is a commanding god; a shape leaning to autonomy is a permissive one.</p>
        </div>
      </div>
      ${t.god_model.other_god_worship_in_lived_practice ? `
        <p class="dim" style="font-size:var(--t-small);margin-top:1rem;border-left:2px solid var(--line-strong);padding-left:1rem">
          <b class="mono">Worship of other gods in lived practice —</b>
          ${esc(t.god_model.other_god_worship_in_lived_practice)}. The tribunal rates doctrine, not conduct.</p>` : ""}
    </div>
  </section>

  <!-- ----------------------------------------------- HUMAN AUTONOMY -->
  <section class="sec" id="autonomy" style="padding-top:0">
    <div class="wrap">
      <div class="sec-head reveal">
        <p class="eyebrow">Section B</p>
        <h2>What is left of the human.</h2>
        <p>Seven findings on the room a person keeps once this god exists.</p>
      </div>
      <div class="panel reveal"><div class="spec" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:0 2.4rem">
        ${ha.map(k => specRow(t, "human_autonomy", k)).join("")}
      </div></div>
    </div>
  </section>

  <!-- ----------------------------------------------- RELATIONSHIPS -->
  <section class="sec" id="relationships" style="padding-top:0">
    <div class="wrap">
      <div class="sec-head reveal">
        <p class="eyebrow">Section C</p>
        <h2>How a human may stand before it.</h2>
        <p>The vocabulary of relationship this tradition makes available —
           ${t.divine_relationships.length} recorded ${t.divine_relationships.length === 1 ? "form" : "forms"}.</p>
      </div>
      <div class="rel-chips reveal" style="--c:${c}">
        ${t.divine_relationships.map(r => `<span class="rel-chip">${esc(r)}</span>`).join("")}
      </div>
    </div>
  </section>

  <!-- ------------------------------------------------ MODERN VALUES -->
  <section class="sec" style="padding-top:0" id="values">
    <div class="wrap">
      <div class="sec-head reveal">
        <p class="eyebrow">Section D · ${t.tally.full} full · ${t.tally.partial} partial · ${t.tally.none} refused</p>
        <h2>${VALUES.length} modern human values.</h2>
        <p>Rated against ${esc(t.tradition)}'s theology and classical jurisprudence — never against the conduct of its
           followers or the policy of any state. Composite compatibility: <b style="color:${c}">${t.valuesScore}/100</b>.</p>
      </div>
      <div class="values-grid">
        ${VALUES.map(v => {
          const e = t.modern_human_values[v.key], m = RATING_META[e.rating];
          const hot = highlight === v.key;
          return `<article class="value-card reveal" id="v-${v.key}"
            style="${hot ? `border-color:${m.color};background:rgba(255,255,255,.05);box-shadow:0 0 34px -14px ${m.color}` : ""}">
            <div class="value-card__top">
              <h3 class="value-card__name">${esc(v.label)}</h3>
              <span class="pill" data-r="${m.key}">${esc(m.short)}</span>
            </div>
            <p class="value-card__note">${esc(e.note)}</p>
            <button type="button" class="value-card__link" data-value-axis="${v.key}">Who else · all ten →</button>
          </article>`;
        }).join("")}
      </div>
    </div>
  </section>

  <!-- ------------------------------------------------------ COMPARE -->
  <section class="sec" id="compare" style="padding-top:0">
    <div class="wrap">
      <div class="sec-head reveal">
        <p class="eyebrow">Adjacent files</p>
        <h2>${siblings.length ? `Also Class ${t.classInfo.numeral}.` : "A class of one."}</h2>
        <p>${siblings.length
          ? `Traditions the tribunal grouped alongside ${esc(t.tradition)} — same structure of deity, different everything else.`
          : `No other tradition in the sample shares this structure. The nearest neighbours are below.`}</p>
      </div>
      <div class="compare-strip">
        ${(siblings.length ? siblings.map(s => BY_SLUG[s]) : others).map(godCard).join("")}
      </div>

      <div class="panel cmp-inline reveal">
        <div class="deck__label"><span class="deck__num">vs</span>
          <h3>Compare ${esc(t.tradition)} with&hellip;</h3></div>
        <p class="deck__hint deck__hint--inline">Add up to ${CMP_MAX - 1} more and put them side by side.
           Only the readings that actually separate them get drawn.</p>
        <div class="cmp-pick" id="relPick" role="group" aria-label="Choose traditions to compare with ${esc(t.tradition)}">
          <span class="cmp-chip is-on cmp-chip--pinned" style="--c:${c}">
            <span class="cmp-chip__dot"></span>${esc(t.tradition)}<span class="cmp-chip__pin">fixed</span></span>
          ${TRADITIONS.filter(x => x.slug !== t.slug).map(x => `<button type="button" class="cmp-chip"
              data-cmp="${x.slug}" style="--c:${x.color}" aria-pressed="false">
            <span class="cmp-chip__dot"></span>${esc(x.tradition)}</button>`).join("")}
        </div>
        <div class="cmp-go">
          <span class="cmp-go__count" id="relCount" aria-live="polite">Pick at least one</span>
          <button type="button" class="btn btn--primary" id="relGo" disabled>Compare &rarr;</button>
        </div>
      </div>

      <div style="display:flex;gap:.75rem;flex-wrap:wrap;margin-top:2rem">
        <button class="btn" type="button" id="backBtn2">← Back to the tribunal</button>
        <button class="btn" type="button" data-goto="traditions">All ten files</button>
      </div>
    </div>
  </section>`;
}

function wireTradition() {
  const on = listeners.signal;
  const selfSlug = parseRoute().path.split("/")[2];

  /* inline "compare this with…" picker */
  const relPick = document.getElementById("relPick");
  const relCount = document.getElementById("relCount");
  const relGo = document.getElementById("relGo");
  let relSel = [];

  function paintRel() {
    relPick.querySelectorAll("[data-cmp]").forEach(b => {
      const chosen = relSel.includes(b.dataset.cmp);
      b.setAttribute("aria-pressed", String(chosen));
      b.classList.toggle("is-on", chosen);
      b.disabled = !chosen && relSel.length >= CMP_MAX - 1;
    });
    const n = relSel.length;
    relCount.textContent = n === 0 ? "Pick at least one"
      : n === CMP_MAX - 1 ? `${n + 1} traditions — that is the maximum`
      : `${n + 1} traditions`;
    relGo.disabled = n < 1;
  }

  relPick.addEventListener("click", e => {
    const b = e.target.closest("[data-cmp]");
    if (!b) return;
    const slug = b.dataset.cmp;
    relSel = relSel.includes(slug) ? relSel.filter(x => x !== slug)
           : relSel.length < CMP_MAX - 1 ? [...relSel, slug] : relSel;
    paintRel();
  }, { signal: on });

  relGo.addEventListener("click", () => {
    if (relSel.length) go(`/compare?t=${[selfSlug, ...relSel].join(",")}`);
  }, { signal: on });

  paintRel();
  const back = () => { if (internalNavs > 0) history.back(); else go(returnTo); };
  document.getElementById("backBtn").addEventListener("click", back, { signal: on });
  document.getElementById("backBtn2").addEventListener("click", back, { signal: on });

  app.addEventListener("click", e => {
    const ax = e.target.closest("[data-axis]");
    if (ax) return go(`/?axis=${ax.dataset.axis}`);
    const va = e.target.closest("[data-value-axis]");
    if (va) return go(`/?value=${va.dataset.valueAxis}`);
    const gt = e.target.closest("[data-goto]");
    if (gt) { go("/"); setTimeout(() => document.getElementById(gt.dataset.goto)
      ?.scrollIntoView({ behavior: "smooth" }), 80); return; }
    const hit = e.target.closest("[data-slug]");
    if (hit) go(`/tradition/${hit.dataset.slug}`);
  }, { signal: on });

  const { params } = parseRoute();
  const v = params.get("v");
  if (v) setTimeout(() => document.getElementById(`v-${v}`)
    ?.scrollIntoView({ behavior: "smooth", block: "center" }), 120);
}

/* ------------------------------- reveals -------------------------------- */
/* Rect-based rather than IntersectionObserver: an observer that never fires
   (background tab, offscreen embed) would leave the whole page invisible.    */
let pending = [];
let queued = false;

function checkReveals() {
  queued = false;
  const limit = window.innerHeight * 0.94;
  pending = pending.filter(el => {
    if (el.getBoundingClientRect().top > limit) return true;
    el.classList.add("is-in");
    return false;
  });
}
function queueCheck() { if (!queued) { queued = true; requestAnimationFrame(checkReveals); } }

function observeReveals() {
  pending = [...document.querySelectorAll(".reveal:not(.is-in)")];
  checkReveals();
  /* belt and braces: nothing stays hidden for more than a few seconds */
  setTimeout(() => { pending.forEach(el => el.classList.add("is-in")); pending = []; }, 4000);
}
window.addEventListener("scroll", queueCheck, { passive: true });
window.addEventListener("resize", queueCheck, { passive: true });

/* --------------------------------- boot --------------------------------- */
/* The router owns scroll position; stop the browser restoring its own. */
if ("scrollRestoration" in history) history.scrollRestoration = "manual";

/* Chrome nav lives outside #app, so its handler is installed once. */
document.addEventListener("click", e => {
  const nav = e.target.closest("[data-nav]");
  if (!nav) return;
  e.preventDefault();
  const target = nav.dataset.nav;
  const jump = () => document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  if (parseRoute().path === "/") jump();
  else { go("/"); setTimeout(jump, 90); }
});

window.addEventListener("hashchange", () => { internalNavs++; render(); });
render();

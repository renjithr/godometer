/* ============================================================================
   GODOMETER — chart builders. All output is inline SVG or semantic HTML.
   No chart library; every mark is drawn from the dataset at render time.
   ========================================================================= */

const esc = s => String(s).replace(/[&<>"']/g, c =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ------------------------------------------------------------------ 1. Map */
/* Divine authority (x) against human autonomy (y). Four quadrants of theology. */

const MAP_LABEL = {
  islam:          { anchor: "end",   dx: -13, dy: 5 },
  christianity:   { anchor: "end",   dx: -13, dy: 5 },
  zoroastrianism: { anchor: "end",   dx: -13, dy: 5 },
  judaism:        { anchor: "end",   dx: -13, dy: 5 },
  sikhism:        { anchor: "start", dx: 13,  dy: 5 },
  egyptian:       { anchor: "start", dx: 13,  dy: 5 },
  greek:          { anchor: "end",   dx: -13, dy: 5 },
  hindu:          { anchor: "start", dx: 13,  dy: 5 },
  jainism:        { anchor: "start", dx: 14,  dy: -4 },
  buddhism:       { anchor: "start", dx: 14,  dy: 15 }
};

function quadrantMap() {
  const W = 760, H = 560, M = { t: 34, r: 34, b: 56, l: 62 };
  const iw = W - M.l - M.r, ih = H - M.t - M.b;
  const X = v => M.l + (v / 100) * iw;
  const Y = v => M.t + (1 - v / 100) * ih;

  /* Label anchors are placed in the empty corner of each quadrant so they
     never sit under a data point. */
  const quads = [
    { x: 50, y: 50, fill: "rgba(255,197,61,.055)", label: "SOVEREIGN, YET ARGUABLE", c: "#FFC53D", tx: 99, ty: 99, dy: 14,  anchor: "end" },
    { x: 50, y: 0,  fill: "rgba(255,77,109,.06)",  label: "ABSOLUTE COMMAND",        c: "#FF4D6D", tx: 99, ty: 2,  dy: 4,   anchor: "end" },
    { x: 0,  y: 50, fill: "rgba(16,217,163,.055)", label: "SELF-DIRECTED PATH",      c: "#10D9A3", tx: 1,  ty: 54, dy: -7,  anchor: "start" },
    { x: 0,  y: 0,  fill: "rgba(139,123,255,.05)", label: "DIFFUSE POWERS",          c: "#8B7BFF", tx: 1,  ty: 2,  dy: 4,   anchor: "start" }
  ];

  const grid = [0, 25, 50, 75, 100];

  return `
  <svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img"
       aria-label="Scatter plot. Horizontal axis: divine authority, 0 to 100. Vertical axis: human autonomy, 0 to 100. Traditions with the highest divine authority — Islam, Christianity, Zoroastrianism — sit at the lowest human autonomy. Buddhism and Jainism sit at the opposite corner.">
    <defs>
      <filter id="dotGlow" x="-70%" y="-70%" width="240%" height="240%">
        <feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    ${quads.map(q => `<rect x="${X(q.x)}" y="${Y(q.y + 50)}" width="${iw / 2}" height="${ih / 2}" fill="${q.fill}"/>`).join("")}
    ${quads.map(q => `<text x="${X(q.tx)}" y="${Y(q.ty)}" text-anchor="${q.anchor}" dy="${q.dy}"
        font-family="var(--font-mono)" font-size="10.5" letter-spacing="2.4" fill="${q.c}" opacity=".78">${q.label}</text>`).join("")}

    ${grid.map(g => `
      <line x1="${X(g)}" y1="${M.t}" x2="${X(g)}" y2="${M.t + ih}" stroke="rgba(150,170,220,.13)" stroke-width="1"/>
      <line x1="${M.l}" y1="${Y(g)}" x2="${M.l + iw}" y2="${Y(g)}" stroke="rgba(150,170,220,.13)" stroke-width="1"/>
      <text x="${X(g)}" y="${M.t + ih + 22}" text-anchor="middle" font-family="var(--font-mono)" font-size="10" fill="#74809E">${g}</text>
      <text x="${M.l - 12}" y="${Y(g) + 4}" text-anchor="end" font-family="var(--font-mono)" font-size="10" fill="#74809E">${g}</text>`).join("")}

    <line x1="${X(50)}" y1="${M.t}" x2="${X(50)}" y2="${M.t + ih}" stroke="rgba(150,170,220,.3)" stroke-dasharray="4 5"/>
    <line x1="${M.l}" y1="${Y(50)}" x2="${M.l + iw}" y2="${Y(50)}" stroke="rgba(150,170,220,.3)" stroke-dasharray="4 5"/>

    <text x="${M.l + iw / 2}" y="${H - 10}" text-anchor="middle" font-family="var(--font-mono)" font-size="10.5" letter-spacing="2.6" fill="#A9B5D4">DIVINE AUTHORITY →</text>
    <text x="16" y="${M.t + ih / 2}" text-anchor="middle" font-family="var(--font-mono)" font-size="10.5" letter-spacing="2.6" fill="#A9B5D4"
          transform="rotate(-90 16 ${M.t + ih / 2})">HUMAN AUTONOMY →</text>

    ${TRADITIONS.map(t => {
      const cx = X(t.metrics.authority), cy = Y(t.metrics.autonomy);
      const L = MAP_LABEL[t.slug];
      return `<g class="map-dot" data-slug="${t.slug}" tabindex="0" role="link"
                 aria-label="${esc(t.tradition)}: divine authority ${t.metrics.authority}, human autonomy ${t.metrics.autonomy}"
                 style="cursor:pointer">
        <circle cx="${cx}" cy="${cy}" r="17" fill="${t.color}" opacity=".13"/>
        <circle cx="${cx}" cy="${cy}" r="7.5" fill="${t.color}" filter="url(#dotGlow)"/>
        <circle cx="${cx}" cy="${cy}" r="7.5" fill="${t.color}" stroke="#06070D" stroke-width="1.6"/>
        <text x="${cx + L.dx}" y="${cy + L.dy}" text-anchor="${L.anchor}"
              font-family="var(--font-body)" font-size="12.5" font-weight="500" fill="#E9EEFB">${esc(t.tradition)}</text>
      </g>`;
    }).join("")}
  </svg>`;
}

/* -------------------------------------------------------- 2. Ranked bars */
/* Single-metric ranking, one bar per tradition, coloured by tradition.      */

function rankBars(metricKey, opts = {}) {
  const rows = [...TRADITIONS].sort((a, b) =>
    (opts.get ? opts.get(b) : b.metrics[metricKey]) - (opts.get ? opts.get(a) : a.metrics[metricKey]));

  return `<div class="rank">${rows.map(t => {
    const v = opts.get ? opts.get(t) : t.metrics[metricKey];
    return `<button class="rank__row" data-slug="${t.slug}" type="button"
              aria-label="${esc(t.tradition)}, ${opts.label || metricKey} ${v} of 100. Open profile.">
      <span class="rank__name">${esc(t.tradition)}</span>
      <span class="rank__track"><span class="rank__fill" style="width:${v}%;background:linear-gradient(90deg, ${t.color}, ${t.color}aa)"></span></span>
      <span class="rank__val">${v}</span>
    </button>`;
  }).join("")}</div>`;
}

/* ------------------------------------------- 3. Modern-values stacked bars */

function valuesRank() {
  const rows = [...TRADITIONS].sort((a, b) => b.valuesScore - a.valuesScore);
  return `<div class="rank">${rows.map(t => {
    const seg = VALUES.map(v => {
      const r = t.modern_human_values[v.key];
      const m = RATING_META[r.rating];
      return `<span style="flex:1;background:${m.color};opacity:.92" title="${esc(v.label)}: ${esc(r.rating)}"></span>`;
    }).join("");
    return `<button class="rank__row" data-slug="${t.slug}" type="button"
              aria-label="${esc(t.tradition)}: compatibility score ${t.valuesScore} of 100 — ${t.tally.full} fully allowed, ${t.tally.partial} partially allowed, ${t.tally.none} not allowed. Open profile.">
      <span class="rank__name">${esc(t.tradition)}</span>
      <span class="rank__track" style="gap:2px">${seg}</span>
      <span class="rank__val">${t.valuesScore}</span>
    </button>`;
  }).join("")}</div>`;
}

/* ------------------------------------------------------- 4. Verdict matrix */

function verdictMatrix() {
  const rows = [...TRADITIONS].sort((a, b) => b.valuesScore - a.valuesScore);
  return `<div class="matrix-scroll"><table class="matrix">
    <caption class="visually-hidden">Ten traditions by ten modern human values, each cell rated fully, partially, not allowed or not applicable.</caption>
    <thead><tr><th scope="col"><span class="visually-hidden">Tradition</span></th>
      ${VALUES.map(v => `<th scope="col"><span>${esc(v.short)}</span></th>`).join("")}
    </tr></thead>
    <tbody>${rows.map(t => `<tr>
      <th scope="row"><button type="button" data-slug="${t.slug}">${esc(t.tradition)}</button></th>
      ${VALUES.map(v => {
        const r = t.modern_human_values[v.key], m = RATING_META[r.rating];
        return `<td><button type="button" class="cell" data-slug="${t.slug}" data-value="${v.key}"
                  style="background:${m.color};opacity:.88;color:${m.color}"
                  title="${esc(t.tradition)} — ${esc(v.label)}: ${esc(r.rating)}"
                  aria-label="${esc(t.tradition)}, ${esc(v.label)}: ${esc(r.rating)}"></button></td>`;
      }).join("")}
    </tr>`).join("")}</tbody>
  </table></div>`;
}

/* -------------------------------------------------------------- 5. Radar */
/* Six-axis theological signature for a single tradition.                    */

const RADAR_AXES = [
  { key: "creator",     label: "Creator" },
  { key: "lawgiver",    label: "Lawgiver" },
  { key: "judge",       label: "Judge" },
  { key: "exclusivity", label: "Exclusivity" },
  { key: "fear",        label: "Fear" },
  { key: "autonomy",    label: "Autonomy" }
];

function radar(t) {
  const S = 340, C = S / 2, R = 108;
  const n = RADAR_AXES.length;
  const pt = (i, v) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [C + Math.cos(a) * R * (v / 100), C + Math.sin(a) * R * (v / 100)];
  };
  const poly = RADAR_AXES.map((ax, i) => pt(i, t.metrics[ax.key]).join(",")).join(" ");
  const rings = [25, 50, 75, 100];

  return `<svg class="chart-svg" viewBox="0 0 ${S} ${S}" role="img"
      aria-label="Theological signature for ${esc(t.tradition)}: ${RADAR_AXES.map(a => a.label + " " + t.metrics[a.key]).join(", ")}, each out of 100.">
    ${rings.map(r => `<polygon points="${RADAR_AXES.map((_, i) => pt(i, r).join(",")).join(" ")}"
        fill="none" stroke="rgba(150,170,220,${r === 100 ? ".25" : ".12"})" stroke-width="1"/>`).join("")}
    ${RADAR_AXES.map((_, i) => { const [x, y] = pt(i, 100);
      return `<line x1="${C}" y1="${C}" x2="${x}" y2="${y}" stroke="rgba(150,170,220,.12)"/>`; }).join("")}
    <polygon points="${poly}" fill="${t.color}" fill-opacity=".22" stroke="${t.color}" stroke-width="2" stroke-linejoin="round"/>
    ${RADAR_AXES.map((ax, i) => { const [x, y] = pt(i, t.metrics[ax.key]);
      return `<circle cx="${x}" cy="${y}" r="4" fill="${t.color}" stroke="#06070D" stroke-width="1.4"/>`; }).join("")}
    ${RADAR_AXES.map((ax, i) => {
      const [x, y] = pt(i, 133);
      const anchor = Math.abs(x - C) < 6 ? "middle" : (x > C ? "start" : "end");
      return `<text x="${x}" y="${y + 4}" text-anchor="${anchor}" font-family="var(--font-mono)" font-size="10"
                letter-spacing="1.4" fill="#A9B5D4">${ax.label.toUpperCase()}</text>
              <text x="${x}" y="${y + 17}" text-anchor="${anchor}" font-family="var(--font-mono)" font-size="10.5"
                fill="${t.color}">${t.metrics[ax.key]}</text>`;
    }).join("")}
  </svg>`;
}

/* --------------------------------------------------------------- 6. Gauge */
/* A single arc — the Godometer reading itself.                              */

function gauge(value, color, caption, sub) {
  const S = 190, C = S / 2, R = 74, sw = 12;
  const a0 = Math.PI * 0.75, a1 = Math.PI * 2.25;               /* 270° sweep */
  const arc = (from, to) => {
    const p = (a) => [C + Math.cos(a) * R, C + Math.sin(a) * R];
    const [x0, y0] = p(from), [x1, y1] = p(to);
    return `M ${x0} ${y0} A ${R} ${R} 0 ${to - from > Math.PI ? 1 : 0} 1 ${x1} ${y1}`;
  };
  const end = a0 + (a1 - a0) * (value / 100);
  return `<svg class="chart-svg" viewBox="0 0 ${S} ${S}" role="img" aria-label="${esc(caption)}: ${value} of 100.">
    <path d="${arc(a0, a1)}" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="${sw}" stroke-linecap="round"/>
    <path d="${arc(a0, end)}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"
          style="filter:drop-shadow(0 0 8px ${color}66)"/>
    <text x="${C}" y="${C + 2}" text-anchor="middle" font-family="var(--font-display)" font-weight="800"
          font-size="42" letter-spacing="-2" fill="#E9EEFB">${value}</text>
    <text x="${C}" y="${C + 24}" text-anchor="middle" font-family="var(--font-mono)" font-size="9.5"
          letter-spacing="2.2" fill="#74809E">${esc(sub || "OF 100")}</text>
    <text x="${C}" y="${S - 4}" text-anchor="middle" font-family="var(--font-mono)" font-size="10"
          letter-spacing="2" fill="${color}">${esc(caption.toUpperCase())}</text>
  </svg>`;
}

/* ------------------------------------------------- 7. Distribution ribbon */

function distRibbon(buckets) {
  const total = buckets.reduce((n, b) => n + b.members.length, 0);
  return `<div class="dist" role="img" aria-label="${buckets.map(b => `${b.label}: ${b.members.length} of ${total}`).join("; ")}">
    ${buckets.map(b => `<span style="flex:${b.members.length};background:${TONE[b.tone].color};opacity:.85"></span>`).join("")}
  </div>`;
}

/* ------------------------------------------------- 8. Alignment slider */
/* Red where the theology conflicts with the value, green where it aligns.
   Used by the ranked value results in place of grouped verdict buckets.    */

const ALIGN_STOPS = [[0, [255, 77, 109]], [50, [255, 197, 61]], [100, [16, 217, 163]]];

function alignColor(score) {
  if (score === null || score === undefined) return "#7C88A8";
  const s = Math.max(0, Math.min(100, score));
  for (let i = 1; i < ALIGN_STOPS.length; i++) {
    const [p1, c1] = ALIGN_STOPS[i - 1], [p2, c2] = ALIGN_STOPS[i];
    if (s <= p2) {
      const k = (s - p1) / (p2 - p1);
      const mix = c1.map((v, j) => Math.round(v + (c2[j] - v) * k));
      return `rgb(${mix.join(",")})`;
    }
  }
  return "#10D9A3";
}

/** score: 0–100, or null for not-applicable. */
function alignSlider(score, label, opts = {}) {
  const na = score === null || score === undefined;
  const pos = na ? 0 : Math.max(0, Math.min(100, score));
  const c = opts.color || alignColor(score);
  const left = opts.leftEnd || "Conflicts";
  const right = opts.rightEnd || "Aligns";
  return `<span class="align${na ? " align--na" : ""}${opts.ramp === "tone" ? " align--tone" : ""}" role="img"
       aria-label="${esc(label)}${na ? "" : ` — ${pos} out of 100 on the ${left.toLowerCase()} to ${right.toLowerCase()} scale`}">
    <span class="align__bar">
      <span class="align__scale"></span>
      ${na ? "" : `<span class="align__fill" style="width:${pos}%;background:${c}"></span>`}
      <span class="align__thumb" style="left:${pos}%;background:${c};box-shadow:0 0 0 3px var(--surface),0 0 16px ${c}"></span>
    </span>
    <span class="align__foot">
      <span class="align__end">${esc(left)}</span>
      <span class="align__label" style="color:${c}">${esc(label)}${opts.suffix ? ` <b>${esc(opts.suffix)}</b>` : ""}</span>
      <span class="align__end">${esc(right)}</span>
    </span>
  </span>`;
}

/** The eleven verdict bands for one tradition, as a compact strip. */
function valueStrip(t) {
  return `<span class="vstrip" role="img" aria-label="${VALUES.map(v =>
      `${v.short}: ${t.modern_human_values[v.key].rating}`).join("; ")}">
    ${VALUES.map(v => {
      const m = RATING_META[t.modern_human_values[v.key].rating];
      return `<span style="background:${m.color}" title="${esc(v.label)}: ${esc(t.modern_human_values[v.key].rating)}"></span>`;
    }).join("")}
  </span>`;
}

/* Divine-authority ramp: teal (no god to obey) → violet → gold (absolute). */
const TONE_STOPS = [[0, [16, 217, 163]], [50, [139, 123, 255]], [100, [255, 197, 61]]];

function toneColor(score) {
  const s = Math.max(0, Math.min(100, score));
  for (let i = 1; i < TONE_STOPS.length; i++) {
    const [p1, c1] = TONE_STOPS[i - 1], [p2, c2] = TONE_STOPS[i];
    if (s <= p2) {
      const k = (s - p1) / (p2 - p1);
      return `rgb(${c1.map((v, j) => Math.round(v + (c2[j] - v) * k)).join(",")})`;
    }
  }
  return "#FFC53D";
}

/** The thirteen god-model readings for one tradition, as a compact strip. */
function axisStrip(t) {
  return `<span class="vstrip" role="img" aria-label="${AXES.map(a =>
      `${a.label}: ${a.buckets.find(b => b.members.includes(t.slug)).label}`).join("; ")}">
    ${AXES.map(a => {
      const b = a.buckets.find(x => x.members.includes(t.slug));
      return `<span style="background:${TONE[b.tone].color}" title="${esc(a.label)}: ${esc(b.label)}"></span>`;
    }).join("")}
  </span>`;
}

/* ============================================================ COMPARISON ==
   Charts for the side-by-side page. Rows where every selected tradition
   gives the same answer are dropped — only the differences are drawn.
   ========================================================================= */

const bucketOf = (axis, slug) => axis.buckets.find(b => b.members.includes(slug));

/** Axes where the selection does not agree. */
const differingAxes = list =>
  AXES.filter(a => new Set(list.map(t => bucketOf(a, t.slug).id)).size > 1);

/** Values where the selection does not agree. */
const differingValues = list =>
  VALUES.filter(v => new Set(list.map(t => t.modern_human_values[v.key].rating)).size > 1);

/* ------------------------------------------------- overlaid radar chart */

function radarMulti(list) {
  const S = 440, C = S / 2, R = 128, n = RADAR_AXES.length;
  const pt = (i, v) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [C + Math.cos(a) * R * (v / 100), C + Math.sin(a) * R * (v / 100)];
  };
  const poly = t => RADAR_AXES.map((ax, i) => pt(i, t.metrics[ax.key]).join(",")).join(" ");

  return `<svg class="chart-svg" viewBox="0 0 ${S} ${S}" role="img"
      aria-label="Overlaid theological signatures. ${list.map(t =>
        `${t.tradition}: ${RADAR_AXES.map(a => a.label + " " + t.metrics[a.key]).join(", ")}`).join(". ")}">
    ${[25, 50, 75, 100].map(r => `<polygon points="${RADAR_AXES.map((_, i) => pt(i, r).join(",")).join(" ")}"
        fill="none" stroke="rgba(150,170,220,${r === 100 ? ".26" : ".11"})"/>`).join("")}
    ${RADAR_AXES.map((_, i) => { const [x, y] = pt(i, 100);
      return `<line x1="${C}" y1="${C}" x2="${x}" y2="${y}" stroke="rgba(150,170,220,.11)"/>`; }).join("")}

    ${list.map(t => `<polygon points="${poly(t)}" fill="${t.color}" fill-opacity=".10"
        stroke="${t.color}" stroke-width="2.2" stroke-linejoin="round"/>`).join("")}
    ${list.map(t => RADAR_AXES.map((ax, i) => { const [x, y] = pt(i, t.metrics[ax.key]);
      return `<circle cx="${x}" cy="${y}" r="3.6" fill="${t.color}" stroke="#06070D" stroke-width="1.3"/>`;
    }).join("")).join("")}

    ${RADAR_AXES.map((ax, i) => {
      const [x, y] = pt(i, 152);
      const anchor = Math.abs(x - C) < 8 ? "middle" : (x > C ? "start" : "end");
      return `<text x="${x}" y="${y + 4}" text-anchor="${anchor}" font-family="var(--font-mono)"
                font-size="10.5" letter-spacing="1.6" fill="#A9B5D4">${ax.label.toUpperCase()}</text>`;
    }).join("")}
  </svg>

  <table class="metric-table">
    <caption class="visually-hidden">Six-axis signature values, 0 to 100</caption>
    <thead><tr><th scope="col">Axis</th>
      ${list.map(t => `<th scope="col" style="color:${t.color}">${esc(t.tradition)}</th>`).join("")}
      <th scope="col">Spread</th></tr></thead>
    <tbody>${RADAR_AXES.map(ax => {
      const vals = list.map(t => t.metrics[ax.key]);
      const spread = Math.max(...vals) - Math.min(...vals);
      return `<tr><th scope="row">${esc(ax.label)}</th>
        ${list.map(t => `<td style="color:${t.color}">${t.metrics[ax.key]}</td>`).join("")}
        <td class="metric-table__spread" style="opacity:${.35 + (spread / 100) * .65}">${spread}</td></tr>`;
    }).join("")}</tbody>
  </table>`;
}

/* --------------------------------------------- god-model difference grid */

function diffMatrix(list) {
  const rows = differingAxes(list);
  const hidden = AXES.length - rows.length;
  if (!rows.length) return `<p class="empty-note">These traditions answer all ${AXES.length}
    god-model questions the same way. There is nothing to separate them here.</p>`;

  return `<div class="cmp-scroll"><table class="cmp-grid" style="--cols:${list.length}">
    <caption class="visually-hidden">God-model questions where the selected traditions differ</caption>
    <thead><tr><th scope="col">Question</th>
      ${list.map(t => `<th scope="col"><span class="cmp-grid__head" style="color:${t.color}">${esc(t.tradition)}</span></th>`).join("")}
    </tr></thead>
    <tbody>${rows.map(a => `<tr>
      <th scope="row"><span class="cmp-grid__q">${esc(a.label)}</span>
        <span class="cmp-grid__group">${esc(a.group)}</span></th>
      ${list.map(t => {
        const b = bucketOf(a, t.slug), tone = TONE[b.tone];
        return `<td><span class="cmp-cell" style="--c:${tone.color}">
          <span class="cmp-cell__label">${esc(b.label)}</span>
          <span class="cmp-cell__raw">${esc(t[a.field[0]][a.field[1]])}</span>
        </span></td>`;
      }).join("")}
    </tr>`).join("")}</tbody>
  </table></div>
  ${hidden ? `<p class="empty-note empty-note--inline">${hidden} of the ${AXES.length}
    ${hidden === 1 ? "questions produces an identical answer" : "questions produce identical answers"}
    across this selection and ${hidden === 1 ? "is" : "are"} not shown.</p>` : ""}`;
}

/* -------------------------------------------------- modern-values heatmap */

function valuesHeatmap(list) {
  const rows = differingValues(list);
  const hidden = VALUES.length - rows.length;
  if (!rows.length) return `<p class="empty-note">These traditions return the same verdict on all
    ${VALUES.length} modern values. There is nothing to separate them here.</p>`;

  return `<div class="cmp-scroll"><table class="heat-grid" style="--cols:${list.length}">
    <caption class="visually-hidden">Modern human values where the selected traditions differ</caption>
    <thead><tr><th scope="col">Value</th>
      ${list.map(t => `<th scope="col"><span class="cmp-grid__head" style="color:${t.color}">${esc(t.tradition)}</span>
        <span class="heat-grid__score">${t.valuesScore}/100</span></th>`).join("")}
    </tr></thead>
    <tbody>${rows.map(v => `<tr>
      <th scope="row">${esc(v.label)}</th>
      ${list.map(t => {
        const e = t.modern_human_values[v.key], m = RATING_META[e.rating];
        return `<td><span class="heat-cell" style="--c:${m.color}" title="${esc(t.tradition)} — ${esc(v.label)}: ${esc(e.rating)}. ${esc(e.note)}">
          ${esc(m.short)}</span></td>`;
      }).join("")}
    </tr>`).join("")}</tbody>
  </table></div>
  <div class="chart-legend" style="margin-top:1rem">
    ${Object.entries(RATING_META).map(([k, m]) =>
      `<span class="legend-item"><i style="background:${m.color}"></i>${esc(k)}</span>`).join("")}
  </div>
  ${hidden ? `<p class="empty-note empty-note--inline">${hidden} of the ${VALUES.length}
    ${hidden === 1 ? "values returns the same verdict" : "values return the same verdict"}
    across this selection and ${hidden === 1 ? "is" : "are"} not shown.</p>` : ""}`;
}

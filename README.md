<p align="center">
  <img src="assets/img/judge.png" alt="An alien judge in white and gold robes raises a gavel over a holographic bench of scales, with five glowing containment pods below holding divine figures." width="620">
</p>

<h1 align="center">Godometer</h1>

<p align="center">
  <em>An atheistic alien tribunal has finished reading Earth's theology.</em><br>
  Ten traditions. Thirteen questions about what their gods are.<br>
  Eleven modern human values, weighed against doctrine.
</p>

---

Godometer is a static website that reads ten of Earth's religious traditions **from the
outside**: what kind of thing each god is, how much room it leaves a human being, and how
its doctrine sits beside a list of modern human values. It is framed as a hypothetical
report by an alien court that does not believe in any of it — a device for looking at
theology structurally rather than devotionally.

No build step, no dependencies, no server required. Open `index.html` and it runs.

## Scope — read this first

Every rating in this project describes **theology and classical jurisprudence**. It does
not describe:

- the behaviour of believers
- current social practice in any community
- the policy of any government

A tradition can be marked restrictive here while most of its adherents live otherwise, and
vice versa. The distinction is deliberate and it is the whole basis of the dataset. This is
a description of doctrine, not a scorecard of people, and no tradition is being ranked as
better or worse than another — only as more or less structurally compatible with one
specific list of modern values.

## What's in it

**The interrogation console.** Two selectors on the home page drive everything:

- **God model** — thirteen questions drawn from the theology itself. *Is God the creator?
  Can you morally out-argue God? Are humans born guilty? Are you allowed to reject God?*
  Pick one and the ten traditions sort themselves into answer groups, each showing its
  verbatim doctrinal position.
- **Modern human values** — eleven values, each rendered as a top-to-bottom ranking with a
  red-to-green alignment slider: green where the theology can travel with the value, red
  where it conflicts.

Both selectors carry an **All** option that ranks every tradition on a composite reading.

**Comparison.** Pick two to five traditions and put them side by side. You get an overlaid
six-axis radar, a matrix of every god-model question where they disagree, a heatmap of every
value verdict that differs, and a written reading generated from your specific selection.
Rows where the selection agrees are dropped and counted, so the page only draws what
actually separates them.

**Ten tradition files.** Each carries the complete god model, the human-autonomy findings,
the vocabulary of relationship the tradition makes available, and all eleven value verdicts
with their reasoning.

**Charts.** A quadrant map of divine authority against human autonomy, ranked authority and
autonomy indexes, a compatibility index, and a 110-cell verdict matrix.

## Running it

```bash
git clone https://github.com/renjithr/godometer.git
open godometer/index.html
```

That is genuinely all — every path is relative and nothing is fetched at runtime. If you'd
rather serve it:

```bash
python3 -m http.server 8899 --directory godometer
```

Google Fonts are linked but every face has a real fallback stack, so it degrades cleanly
offline.

## The data

**Everything lives in one file: [`assets/js/data.js`](assets/js/data.js).**

Despite the `.js` extension it is plain data — the same JSON structure the project started
from, kept as a JavaScript file so the site runs from `file://` with no build step and no
`fetch`. Nothing else needs editing when the data changes: every count, score, ranking,
chart and sentence on the site is computed from this file at render time.

Each tradition looks like this:

```js
{
  slug: "sikhism",
  tradition: "Sikhism",
  deity: "Ik Onkar — the One",
  class: "formless",
  metrics: { authority: 68, autonomy: 45, creator: 95, lawgiver: 75, judge: 60, exclusivity: 80, fear: 30 },

  god_model: {
    creator: "Yes",
    supreme_sovereign_lawgiver: "Strong but less anthropomorphic",
    final_judge: "Qualified",
    // …
  },

  human_autonomy: {
    allowed_to_reject_god: "No doctrinally",
    born_sinful_or_guilty: "No",
    // …
  },

  divine_relationships: ["Father", "Mother", "Friend", "Beloved", "Lord"],

  modern_human_values: {
    gender_equality: {
      rating: "Fully allowed",
      note: "Normative Sikh theology strongly rejects caste and gender-based spiritual inferiority…"
    },
    // …
  }
}
```

### The rating scale

| Rating | Meaning |
| --- | --- |
| **Fully allowed** | Broadly compatible with the theology and not subject to a major doctrinal restriction |
| **Partially allowed** | Allowed with restrictions, conditional, read differently by major schools, or only partly accepted |
| **Not allowed** | Mainstream or classical theology considers it religiously or morally illegitimate |
| **Not applicable** | The value assumes a theological structure the tradition does not contain, or a historical setting it did not survive into |

### How the numbers are derived

- **Values match** is computed directly from the verdicts — fully allowed 100, partially
  allowed 50, not allowed 0, averaged across every value that applies. Not-applicable
  verdicts are excluded from the average rather than counted as zero.
- **Divine authority**, **human autonomy** and the six radar axes are *calibrations*, not
  computations. The source fields are prose, so nothing could be plotted without them. They
  are hand-assigned readings of the god-model and autonomy text, labelled as the tribunal's
  calibration wherever they appear on the site.

## Disagree with a rating? Open a pull request

**This is the point of the repository being public.** These are readings of theology, and
readings can be wrong — a school you know better, a doctrine that has been mischaracterised,
a nuance the note flattens. Several ratings here have already been corrected this way.

If something is wrong, please don't just file an issue. **Edit the data and send a PR.**

1. Open [`assets/js/data.js`](assets/js/data.js) and find the tradition in the `TRADITIONS`
   array.
2. Change the `rating` — it must be one of the four exact strings in the table above — and
   rewrite the `note` so it states the actual theological reason, not a hedge.
3. **If you change a `god_model` or `human_autonomy` answer, also move that tradition's slug
   into the right bucket in the `AXES` array.** The thirteen questions are grouped by
   answer, and the buckets are what the console and the comparison matrix read. This is the
   one place the data can fall out of sync with itself.
4. Open the PR with the reasoning in the description. Cite the school, the text or the
   jurisprudence you're arguing from.

Everything downstream recalculates on its own — scores, rankings, chart bands, the "110
verdicts" counts, the generated prose. There is no second place to update.

**What makes a good PR here:** a specific doctrinal correction with a reason. A tradition
rated *Partially allowed* where classical theology actually imposes no restriction. A note
that describes practice when it should describe doctrine. A school whose position is
genuinely different from the one represented.

**What this project won't take:** changes that argue a tradition should score better because
its followers behave well, or worse because they don't. That is exactly the distinction the
scope section exists to hold.

Adding an eleventh tradition or a twelfth value is welcome too — add the entry, give every
other tradition a verdict on the new value, and the site will absorb it without any other
edit.

## Project layout

```
index.html                  markup shell, fonts, top bar, footer
assets/css/godometer.css    design tokens and every component
assets/js/data.js           ← all the data
assets/js/charts.js         SVG chart builders — no chart library
assets/js/app.js            hash router, views, generated prose
assets/img/                 artwork
```

Roughly 3,000 lines, vanilla throughout.

## Licence

[MIT](LICENSE) — free to use, copy, modify and redistribute, including commercially, as
long as the copyright notice travels with it.

The artwork in `assets/img/` ships with the project under the same terms. It is
illustrative rather than doctrinal, and worth noting: several of the traditions represented
hold that their god may not be depicted at all.

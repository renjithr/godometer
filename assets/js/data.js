/* ============================================================================
   GODOMETER — data layer
   Source: "Hypothetical atheistic alien analysis of religious theology" dataset.
   Verbatim theological fields are preserved exactly as supplied.
   Fields marked `metrics` and `note` are Tribunal-calibrated readings of those
   fields, added so the data can be charted. They are labelled as such in the UI.
   ========================================================================= */

const SCOPE = {
  perspective: "Hypothetical atheistic alien analysis of religious theology",
  practice_excluded: true,
  modern_values_basis:
    "Theological compatibility, not current social practice, government policy, or behavior of followers",
  rating_scale: {
    "Fully allowed":
      "Broadly compatible with the theology and not subject to a major doctrinal restriction",
    "Partially allowed":
      "Allowed with restrictions, conditional, interpreted differently by major schools, or only some aspects are accepted",
    "Not allowed":
      "Mainstream or classical theology considers the value or action religiously or morally illegitimate",
    "Not applicable":
      "The value assumes a theological structure the tradition does not contain, or a historical setting the tradition did not survive into"
  }
};

const RATING_META = {
  "Fully allowed":     { key: "full",    color: "#10D9A3", score: 100, sign: "+", short: "Full" },
  "Partially allowed": { key: "partial", color: "#FFC53D", score: 50,  sign: "~", short: "Partial" },
  "Not allowed":       { key: "none",    color: "#FF4D6D", score: 0,   sign: "-", short: "None" },
  "Not applicable":    { key: "na",      color: "#7C88A8", score: null, sign: "·", short: "N/A" }
};

/* The ten modern human values measured, in dataset order. */
const VALUES = [
  { key: "freedom_of_religion_and_belief",            label: "Freedom of religion and belief",              short: "Religious freedom", icon: "◈" },
  { key: "freedom_to_leave_religion",                 label: "Freedom to leave religion",                   short: "Right to exit",     icon: "⇥" },
  { key: "freedom_to_criticize_religion_or_god",      label: "Freedom to criticize religion or God",        short: "Criticism",         icon: "!" },
  { key: "equal_status_of_believers_and_nonbelievers",label: "Equal human status of believers and nonbelievers", short: "Believer parity", icon: "=" },
  { key: "gender_equality",                           label: "Gender equality",                             short: "Gender",            icon: "⚥" },
  { key: "lgbtq_relationship_equality",               label: "LGBTQ relationship equality",                 short: "LGBTQ",             icon: "◇" },
  { key: "interfaith_marriage",                       label: "Interfaith marriage",                         short: "Interfaith",        icon: "∞" },
  { key: "reproductive_autonomy",                     label: "Reproductive autonomy",                       short: "Reproductive",      icon: "◐" },
  { key: "secular_governance",                        label: "Secular governance",                          short: "Secular state",     icon: "⌂" },
  { key: "equality_regardless_birth_caste_ethnicity", label: "Equality regardless of birth, caste, or ethnicity", short: "Birth & caste", icon: "◎" },
  { key: "acceptance_of_science",                     label: "Acceptance of science",                          short: "Science",       icon: "⚛" }
];

/* Sentinel for the "All" entry in both selectors. */
const ALL = "__all__";

/* God classes — the Tribunal's taxonomy, derived from the god_model block. */
const CLASSES = [
  {
    id: "sovereign",
    numeral: "I",
    name: "Absolute Sovereign",
    tagline: "One creator. One lawgiver. One judge. No rivals.",
    body: "A single uncreated deity creates the cosmos, issues binding moral law, and judges every person at the end. No other god is genuine or legitimate. Human autonomy runs inside that law, never against it.",
    color: "#FFC53D",
    members: ["islam", "christianity", "judaism", "zoroastrianism"]
  },
  {
    id: "formless",
    numeral: "II",
    name: "The Formless One",
    tagline: "One reality, barely a person at all.",
    body: "A single ultimate reality that is deliberately not imagined as a king on a throne. Sovereignty is real but expressed as Hukam — cosmic order — and the dominant emotional register is awe rather than fear of sentence.",
    color: "#8B7BFF",
    members: ["sikhism"]
  },
  {
    id: "assembly",
    numeral: "III",
    name: "Divine Assembly",
    tagline: "Many gods, all of them genuine.",
    body: "Authority is distributed across a plural pantheon. Other gods are not errors to be corrected but legitimate powers. There is no single belief test, and no universal doctrine of eternal punishment for disbelief.",
    color: "#FF6B8B",
    members: ["hindu", "greek", "egyptian"]
  },
  {
    id: "acosmic",
    numeral: "IV",
    name: "No Creator-God",
    tagline: "The cosmos runs on law, not on a will.",
    body: "There is no creator, no supreme lawgiver, and no final divine judge. Celestial beings may exist, but they are inhabitants of the system rather than its author. Moral consequence is impersonal and mechanical.",
    color: "#10D9A3",
    members: ["buddhism", "jainism"]
  }
];

/* ---------------------------------------------------------------------------
   Axes: every field in `god_model` and `human_autonomy`, turned into a
   selectable classification with grouped buckets.
   ------------------------------------------------------------------------ */
const AXES = [
  {
    id: "creator", group: "God model", label: "Is God the creator?",
    field: ["god_model", "creator"],
    question: "Does the tradition posit a deity who brought the cosmos into being?",
    buckets: [
      { id: "yes",    label: "Creator affirmed",           tone: 3, members: ["islam","christianity","judaism","sikhism","zoroastrianism"] },
      { id: "plural", label: "Plural or variable creator", tone: 2, members: ["hindu","greek","egyptian"] },
      { id: "no",     label: "No creator at all",          tone: 1, members: ["buddhism","jainism"] }
    ]
  },
  {
    id: "lawgiver", group: "God model", label: "Supreme sovereign lawgiver",
    field: ["god_model", "supreme_sovereign_lawgiver"],
    question: "Does one deity issue binding moral law over everything that exists?",
    buckets: [
      { id: "strong", label: "Absolute or very strong",       tone: 3, members: ["islam","christianity","judaism","sikhism","zoroastrianism"] },
      { id: "mixed",  label: "Limited, varied or distributed", tone: 2, members: ["hindu","greek","egyptian"] },
      { id: "none",   label: "No divine lawgiver",             tone: 1, members: ["buddhism","jainism"] }
    ]
  },
  {
    id: "judge", group: "God model", label: "Final judge of souls",
    field: ["god_model", "final_judge"],
    question: "Is there one deity who delivers a final verdict on each human life?",
    buckets: [
      { id: "yes",  label: "Single final judge",              tone: 3, members: ["islam","christianity","zoroastrianism"] },
      { id: "qual", label: "Qualified or distributed judgment", tone: 2, members: ["judaism","sikhism","hindu","greek","egyptian"] },
      { id: "no",   label: "No supreme divine judge",          tone: 1, members: ["buddhism","jainism"] }
    ]
  },
  {
    id: "ultimate", group: "God model", label: "What is ultimate reality?",
    field: ["god_model", "ultimate_reality_cosmic_principle"],
    question: "Is the deepest layer of reality a divine person, an impersonal order, or neither?",
    buckets: [
      { id: "god",   label: "The divine itself is ultimate reality", tone: 3, members: ["islam","christianity","judaism","sikhism","hindu"] },
      { id: "order", label: "An impersonal cosmic order",            tone: 2, members: ["zoroastrianism","buddhism","jainism","egyptian"] },
      { id: "none",  label: "Not a central concept",                 tone: 1, members: ["greek"] }
    ]
  },
  {
    id: "othergods", group: "God model", label: "Can other genuine gods exist?",
    field: ["god_model", "other_genuine_gods_can_exist"],
    question: "Does the theology allow other real divine beings to exist at all?",
    buckets: [
      { id: "no",   label: "No other gods exist",           tone: 3, members: ["islam","christianity","judaism"] },
      { id: "sub",  label: "Only subordinate beings",        tone: 2, members: ["sikhism","zoroastrianism","buddhism","jainism"] },
      { id: "yes",  label: "Yes, a genuine plurality",       tone: 1, members: ["hindu","greek","egyptian"] }
    ]
  },
  {
    id: "legitimacy", group: "God model", label: "Are other gods legitimate?",
    field: ["god_model", "other_gods_theologically_legitimate"],
    question: "Beyond existing, is worship of another god a valid thing to do?",
    buckets: [
      { id: "no",   label: "Never legitimate",               tone: 3, members: ["islam","christianity","judaism","sikhism"] },
      { id: "sub",  label: "Legitimate but subordinate",     tone: 2, members: ["zoroastrianism","buddhism","jainism"] },
      { id: "yes",  label: "Fully legitimate",               tone: 1, members: ["hindu","greek","egyptian"] }
    ]
  },
  {
    id: "question", group: "Human autonomy", label: "Can you question divine authority?",
    field: ["human_autonomy", "can_question_divine_authority"],
    question: "Is it religiously acceptable to interrogate the deity's authority?",
    buckets: [
      { id: "yes",  label: "Broadly yes",     tone: 1, members: ["judaism","hindu","greek"] },
      { id: "part", label: "Partially",       tone: 2, members: ["islam","christianity","sikhism","zoroastrianism","egyptian"] },
      { id: "na",   label: "Not applicable",  tone: 0, members: ["buddhism","jainism"] }
    ]
  },
  {
    id: "disagree", group: "Human autonomy", label: "Can you morally out-argue God?",
    field: ["human_autonomy", "can_morally_disagree_with_god_and_still_be_right"],
    question: "Can a human hold a moral position against the deity and still be right?",
    buckets: [
      { id: "part", label: "Possible, at least partly",  tone: 1, members: ["judaism","sikhism","hindu","greek","egyptian"] },
      { id: "no",   label: "No — God defines the good",  tone: 3, members: ["islam","christianity","zoroastrianism"] },
      { id: "na",   label: "Not applicable",             tone: 0, members: ["buddhism","jainism"] }
    ]
  },
  {
    id: "disobey", group: "Human autonomy", label: "Can you legitimately disobey?",
    field: ["human_autonomy", "can_legitimately_choose_against_divine_command"],
    question: "Is choosing against a divine command ever a legitimate option, not merely a possible one?",
    buckets: [
      { id: "part", label: "Substantial room to choose", tone: 1, members: ["judaism","sikhism","hindu","greek","egyptian"] },
      { id: "no",   label: "Never legitimate",           tone: 3, members: ["islam","christianity","zoroastrianism"] },
      { id: "na",   label: "Not applicable",             tone: 0, members: ["buddhism","jainism"] }
    ]
  },
  {
    id: "reject", group: "Human autonomy", label: "Are you allowed to reject God?",
    field: ["human_autonomy", "allowed_to_reject_god"],
    question: "Is unbelief a permitted position inside the theology itself?",
    buckets: [
      { id: "no",   label: "Rejection is illegitimate", tone: 3, members: ["islam","christianity","sikhism","zoroastrianism"] },
      { id: "part", label: "Contested or partial",      tone: 2, members: ["judaism","greek","egyptian"] },
      { id: "yes",  label: "Rejection is permitted",    tone: 1, members: ["hindu","buddhism","jainism"] }
    ]
  },
  {
    id: "consequence", group: "Human autonomy", label: "Consequences of rejecting God",
    field: ["human_autonomy", "rejecting_god_has_divine_consequences"],
    question: "What happens to a person who refuses the deity?",
    buckets: [
      { id: "strong", label: "Severe consequences",     tone: 3, members: ["islam","christianity","zoroastrianism"] },
      { id: "qual",   label: "Qualified consequences",  tone: 2, members: ["judaism","sikhism","egyptian"] },
      { id: "none",   label: "No disbelief penalty",    tone: 1, members: ["hindu","buddhism","jainism","greek"] }
    ]
  },
  {
    id: "bornguilty", group: "Human autonomy", label: "Are humans born guilty?",
    field: ["human_autonomy", "born_sinful_or_guilty"],
    question: "Does a person arrive in the world already morally in deficit?",
    buckets: [
      { id: "yes", label: "Yes, or partially",       tone: 3, members: ["christianity"] },
      { id: "no",  label: "No inherited guilt",      tone: 1, members: ["islam","judaism","sikhism","hindu","buddhism","jainism","zoroastrianism","greek","egyptian"] }
    ]
  },
  {
    id: "fear", group: "Human autonomy", label: "Should you fear divine judgment?",
    field: ["human_autonomy", "should_fear_divine_judgment"],
    question: "How much of the tradition's motivational weight rests on fear?",
    buckets: [
      { id: "high", label: "High judgment pressure", tone: 3, members: ["islam","christianity","zoroastrianism","egyptian"] },
      { id: "mid",  label: "Moderate to low",        tone: 2, members: ["judaism","sikhism","hindu","greek"] },
      { id: "na",   label: "Not applicable",         tone: 0, members: ["buddhism","jainism"] }
    ]
  }
];

/* Tone → colour ramp for god-model buckets (gold = most divine authority). */
const TONE = {
  3: { color: "#FFC53D", label: "High divine authority" },
  2: { color: "#8B7BFF", label: "Mixed / partial" },
  1: { color: "#10D9A3", label: "Low divine authority" },
  0: { color: "#7C88A8", label: "Structure absent" }
};

/* ---------------------------------------------------------------------------
   Traditions
   ------------------------------------------------------------------------ */
const TRADITIONS = [
  {
    slug: "islam",
    tradition: "Islam",
    deity: "Allah",
    era: "Living tradition",
    origin: "7th century CE · Arabia",
    color: "#10D9A3",
    class: "sovereign",
    image: "islam",
    imageCaption: "The uncreated light over a created cosmos — Allah is never depicted in form.",
    note: "Maximum sovereignty. The Tribunal records the highest lawgiver reading in the sample, paired with the lowest human veto.",
    metrics: { authority: 100, autonomy: 12, creator: 100, lawgiver: 100, judge: 100, exclusivity: 100, fear: 90 },
    god_model: {
      creator: "Yes",
      supreme_sovereign_lawgiver: "Absolute",
      final_judge: "Yes",
      ultimate_reality_cosmic_principle: "Yes - Allah is the uncreated supreme reality and creator",
      other_genuine_gods_can_exist: "No",
      other_gods_theologically_legitimate: "No",
      other_god_worship_in_lived_practice: "Excluded from theological rating"
    },
    human_autonomy: {
      can_question_divine_authority: "Partially - questions can be asked, but established divine authority remains final",
      can_morally_disagree_with_god_and_still_be_right: "No",
      can_legitimately_choose_against_divine_command: "No - disobedience is possible but does not become morally legitimate",
      allowed_to_reject_god: "No",
      rejecting_god_has_divine_consequences: "Strong",
      born_sinful_or_guilty: "No - no Christian-style original sin",
      should_fear_divine_judgment: "Strong"
    },
    divine_relationships: ["Lord", "Master", "Creator", "Judge", "Protector"],
    modern_human_values: {
      freedom_of_religion_and_belief: { rating: "Partially allowed", note: "No-compulsion principle exists, but competing religions are not regarded as equally true and classical theology/fiqh creates religious distinctions." },
      freedom_to_leave_religion: { rating: "Not allowed", note: "Apostasy is theologically a grave rejection of Islam; classical jurisprudence traditionally adds legal consequences." },
      freedom_to_criticize_religion_or_god: { rating: "Partially allowed", note: "Questions and argument are possible; blasphemy, insulting Allah or revelation, and deliberate rejection of established revelation are not theologically legitimate." },
      equal_status_of_believers_and_nonbelievers: { rating: "Partially allowed", note: "All are human creations of God, but believers and unbelievers do not have equal theological or salvific status." },
      gender_equality: { rating: "Partially allowed", note: "Spiritual accountability applies to both sexes, but classical theology and law assign differentiated family, inheritance and religious roles." },
      lgbtq_relationship_equality: { rating: "Not allowed", note: "Classical mainstream theology does not recognize same-sex sexual relationships as morally legitimate." },
      interfaith_marriage: { rating: "Partially allowed", note: "Classical rules permit some Muslim men to marry women from People of the Book but do not provide symmetrical freedom for Muslim women or all religious combinations." },
      reproductive_autonomy: { rating: "Partially allowed", note: "Contraception can be permitted under conditions; abortion and sexual/reproductive choices are subject to theological restrictions." },
      secular_governance: { rating: "Partially allowed", note: "Modern Muslim interpretations vary, but classical Islam does not treat divine moral and legal authority as irrelevant to governance." },
      equality_regardless_birth_caste_ethnicity: { rating: "Fully allowed", note: "Ethnicity, tribe and caste do not determine spiritual worth; piety is the theological distinction." },
      acceptance_of_science: { rating: "Partially allowed", note: "Study of the natural world is theologically encouraged as reading the signs of creation, but revelation remains the higher authority wherever an established Qur'anic statement is held to conflict with a scientific claim." }
    }
  },

  {
    slug: "christianity",
    tradition: "Christianity",
    deity: "God the Father, Son and Holy Spirit",
    era: "Living tradition",
    origin: "1st century CE · Roman Judea",
    color: "#4EA8FF",
    class: "sovereign",
    image: "christianity",
    imageCaption: "The enthroned Father — sovereign, and simultaneously addressed as parent.",
    note: "The only tradition in the sample that starts the human account in deficit, and the only sovereign model that also offers friendship.",
    metrics: { authority: 92, autonomy: 22, creator: 100, lawgiver: 92, judge: 100, exclusivity: 95, fear: 75 },
    god_model: {
      creator: "Yes",
      supreme_sovereign_lawgiver: "Very strong",
      final_judge: "Yes",
      ultimate_reality_cosmic_principle: "Yes",
      other_genuine_gods_can_exist: "No",
      other_gods_theologically_legitimate: "No",
      other_god_worship_in_lived_practice: "Excluded from theological rating"
    },
    human_autonomy: {
      can_question_divine_authority: "Partially - questioning and lament are possible",
      can_morally_disagree_with_god_and_still_be_right: "Generally no",
      can_legitimately_choose_against_divine_command: "No",
      allowed_to_reject_god: "No within mainstream Christian theology",
      rejecting_god_has_divine_consequences: "Strong, though salvation doctrines differ",
      born_sinful_or_guilty: "Yes or partially - original sin doctrines vary substantially",
      should_fear_divine_judgment: "Moderate to strong"
    },
    divine_relationships: ["Father", "Lord", "Judge", "Friend", "Shepherd", "Savior"],
    modern_human_values: {
      freedom_of_religion_and_belief: { rating: "Partially allowed", note: "Many modern Christian theologies explicitly defend civil religious liberty, but Christianity does not regard contradictory religious claims as equally true." },
      freedom_to_leave_religion: { rating: "Not allowed", note: "Apostasy may be a civil freedom, but it is not theologically regarded as a legitimate spiritual choice." },
      freedom_to_criticize_religion_or_god: { rating: "Partially allowed", note: "Questioning, doubt and theological criticism can be allowed; blasphemy and deliberate rejection of God remain religiously wrong." },
      equal_status_of_believers_and_nonbelievers: { rating: "Partially allowed", note: "Equal human dignity is strongly affirmed in many traditions, while believers and nonbelievers retain different theological and salvific status." },
      gender_equality: { rating: "Partially allowed", note: "Equal dignity is widely affirmed, but major Catholic and Orthodox traditions reserve ordained priesthood to men; Protestant traditions differ." },
      lgbtq_relationship_equality: { rating: "Partially allowed", note: "Catholic, Orthodox and many Protestant traditions reject same-sex sexual relationships, while several major Protestant denominations accept them." },
      interfaith_marriage: { rating: "Partially allowed", note: "Allowed conditionally in some traditions and discouraged or restricted in others." },
      reproductive_autonomy: { rating: "Partially allowed", note: "Major disagreement exists. Catholic theology strongly restricts abortion and artificial contraception; Protestant positions range widely." },
      secular_governance: { rating: "Fully allowed", note: "Major contemporary Christian theologies can accept religious liberty and a civil state not governed directly by church authority." },
      equality_regardless_birth_caste_ethnicity: { rating: "Fully allowed", note: "Race, caste and ethnicity do not determine theological human worth." },
      acceptance_of_science: { rating: "Partially allowed", note: "Most major traditions treat science as compatible with faith and several have said so explicitly, while others hold scriptural accounts of creation and history as binding where the two are read as conflicting." }
    }
  },

  {
    slug: "judaism",
    tradition: "Judaism",
    deity: "YHWH",
    era: "Living tradition",
    origin: "Bronze Age Levant · continuous",
    color: "#8B7BFF",
    class: "sovereign",
    image: "judaism",
    imageCaption: "The covenant partner — a sovereign who can be argued with.",
    note: "An anomaly in Class I: the sovereign is also a counterparty. Argument with the deity is not deviance here, it is a tradition.",
    metrics: { authority: 74, autonomy: 55, creator: 100, lawgiver: 85, judge: 78, exclusivity: 90, fear: 55 },
    god_model: {
      creator: "Yes",
      supreme_sovereign_lawgiver: "Strong",
      final_judge: "Yes or qualified",
      ultimate_reality_cosmic_principle: "Yes",
      other_genuine_gods_can_exist: "No as legitimate gods",
      other_gods_theologically_legitimate: "No"
    },
    human_autonomy: {
      can_question_divine_authority: "Yes or partially - unusually strong tradition of arguing with God",
      can_morally_disagree_with_god_and_still_be_right: "Partially",
      can_legitimately_choose_against_divine_command: "Partially",
      allowed_to_reject_god: "Partially - Jewish identity can survive atheism even though normative theology affirms God",
      rejecting_god_has_divine_consequences: "Qualified",
      born_sinful_or_guilty: "No Christian-style original sin",
      should_fear_divine_judgment: "Moderate"
    },
    divine_relationships: ["Father", "King", "Lord", "Covenant Partner"],
    modern_human_values: {
      freedom_of_religion_and_belief: { rating: "Partially allowed", note: "Judaism does not require everyone to become Jewish, but traditional theology still distinguishes correct worship from idolatry." },
      freedom_to_leave_religion: { rating: "Partially allowed", note: "A person may reject belief yet remain ethnically/halakhically Jewish; apostasy is nevertheless not a theologically approved choice." },
      freedom_to_criticize_religion_or_god: { rating: "Partially allowed", note: "Argument, questioning and reinterpretation are deeply established, while blasphemy and some forms of rejection remain prohibited." },
      equal_status_of_believers_and_nonbelievers: { rating: "Partially allowed", note: "Universal human dignity coexists with covenantal distinctions between Jews and non-Jews." },
      gender_equality: { rating: "Partially allowed", note: "Reform and other liberal movements support broad equality; Orthodox theology maintains differentiated religious roles." },
      lgbtq_relationship_equality: { rating: "Partially allowed", note: "Liberal Jewish movements recognize same-sex relationships and marriage; Orthodox theology does not." },
      interfaith_marriage: { rating: "Partially allowed", note: "Traditional Judaism rejects or strongly restricts it, while some liberal movements accept it." },
      reproductive_autonomy: { rating: "Partially allowed", note: "Abortion can be permitted or required in some circumstances, but reproductive decisions are not treated as unrestricted individual autonomy." },
      secular_governance: { rating: "Partially allowed", note: "Judaism can function within secular states, while traditional Halakhah also contains extensive concepts of religious law." },
      equality_regardless_birth_caste_ethnicity: { rating: "Fully allowed", note: "All humans possess moral worth, despite distinct covenantal and ritual statuses." },
      acceptance_of_science: { rating: "Partially allowed", note: "A long tradition of reinterpreting scripture accommodates scientific findings comfortably, but Orthodox theology still treats Torah as authoritative where a conflict is held to be genuine." }
    }
  },

  {
    slug: "sikhism",
    tradition: "Sikhism",
    deity: "Ik Onkar — the One",
    era: "Living tradition",
    origin: "15th century CE · Punjab",
    color: "#FFC53D",
    class: "formless",
    image: "sikhism",
    imageCaption: "Ik Onkar — one reality, deliberately without face or form.",
    note: "A class of one. Monotheism with the throne removed: sovereignty survives, the courtroom does not.",
    metrics: { authority: 68, autonomy: 45, creator: 95, lawgiver: 75, judge: 60, exclusivity: 80, fear: 30 },
    god_model: {
      creator: "Yes",
      supreme_sovereign_lawgiver: "Strong but less anthropomorphic",
      final_judge: "Qualified",
      ultimate_reality_cosmic_principle: "Very strong - Ik Onkar",
      other_genuine_gods_can_exist: "Other divine figures can be mentioned but are not independent equals of the One",
      other_gods_theologically_legitimate: "No as independent objects of Sikh worship"
    },
    human_autonomy: {
      can_question_divine_authority: "Partially - inquiry and reflection are permitted",
      can_morally_disagree_with_god_and_still_be_right: "Partially - Hukam remains ultimate",
      can_legitimately_choose_against_divine_command: "Partially",
      allowed_to_reject_god: "No doctrinally",
      rejecting_god_has_divine_consequences: "Qualified",
      born_sinful_or_guilty: "No",
      should_fear_divine_judgment: "Low to moderate - awe and reverence are more characteristic"
    },
    divine_relationships: ["Father", "Mother", "Friend", "Beloved", "Lord"],
    modern_human_values: {
      freedom_of_religion_and_belief: { rating: "Fully allowed", note: "Sikh theology strongly supports the dignity and religious freedom of people outside Sikhism while maintaining Sikh doctrinal commitments." },
      freedom_to_leave_religion: { rating: "Partially allowed", note: "There is no creator-God apostasy punishment structure comparable to classical Islamic law, but rejection of the One and Gurus is incompatible with remaining Sikh." },
      freedom_to_criticize_religion_or_god: { rating: "Partially allowed", note: "Inquiry is compatible with Sikh thought, while deliberate rejection or desecration of Guru and scripture is not religiously neutral." },
      equal_status_of_believers_and_nonbelievers: { rating: "Fully allowed", note: "Human dignity is not restricted to Sikhs." },
      gender_equality: { rating: "Fully allowed", note: "Normative Sikh theology strongly rejects caste and gender-based spiritual inferiority and applies religious discipline to both men and women." },
      lgbtq_relationship_equality: { rating: "Partially allowed", note: "Scripture does not provide a modern orientation-based doctrine, while normative Anand Karaj tradition is structured around male-female marriage." },
      interfaith_marriage: { rating: "Partially allowed", note: "The Rehat Maryada restricts Anand Karaj to persons professing Sikh faith, although this does not amount to a prohibition on all civil relationships." },
      reproductive_autonomy: { rating: "Fully allowed", note: "Sikh theology issues no doctrine on contraception or abortion and no authority exists to impose one. The condemnation of female foeticide targets sex-selective discrimination, not reproductive choice." },
      secular_governance: { rating: "Fully allowed", note: "There is no revealed legal code binding on a state, and Sikh theology actively defends the religious freedom of those outside it. Miri-Piri assigns temporal and spiritual responsibility to the person rather than requiring religious rule." },
      equality_regardless_birth_caste_ethnicity: { rating: "Fully allowed", note: "Explicit rejection of caste, untouchability and inherited spiritual superiority is central." },
      acceptance_of_science: { rating: "Fully allowed", note: "Sikh scripture fixes no binding account of the physical world, so empirical inquiry is not placed in competition with a text that must win." }
    }
  },

  {
    slug: "hindu",
    tradition: "Hindu traditions",
    deity: "Brahman and its countless forms",
    era: "Living tradition",
    origin: "Ancient South Asia · continuous",
    color: "#FF6B8B",
    class: "assembly",
    image: "hindu",
    imageCaption: "One reality wearing every face at once.",
    note: "Not one theology but a landscape of them. The widest relationship vocabulary in the sample — nine distinct ways to stand before the divine — and no central authority able to close any of them.",
    metrics: { authority: 40, autonomy: 74, creator: 55, lawgiver: 45, judge: 45, exclusivity: 15, fear: 30 },
    god_model: {
      creator: "Varies by school",
      supreme_sovereign_lawgiver: "Varies greatly",
      final_judge: "Varies greatly",
      ultimate_reality_cosmic_principle: "Very strong in many schools",
      other_genuine_gods_can_exist: "Frequently yes",
      other_gods_theologically_legitimate: "Frequently yes, or understood as manifestations/aspects of a larger reality"
    },
    human_autonomy: {
      can_question_divine_authority: "Broadly yes, but varies by school",
      can_morally_disagree_with_god_and_still_be_right: "Varies",
      can_legitimately_choose_against_divine_command: "Often substantial autonomy within karma/dharma",
      allowed_to_reject_god: "Yes in several philosophical traditions; varies elsewhere",
      rejecting_god_has_divine_consequences: "No universal disbelief-to-eternal-punishment doctrine",
      born_sinful_or_guilty: "No universal original-sin doctrine",
      should_fear_divine_judgment: "Not universally central"
    },
    divine_relationships: ["Father", "Mother", "Friend", "Lover", "Child", "Master", "Teacher", "Guest", "Ultimate Reality"],
    modern_human_values: {
      freedom_of_religion_and_belief: { rating: "Fully allowed", note: "The broader Hindu philosophical landscape accommodates highly divergent theistic, non-theistic and metaphysical positions, although individual sects may be more exclusive." },
      freedom_to_leave_religion: { rating: "Fully allowed", note: "There is no apostasy doctrine, no authority empowered to declare one, and no divine penalty for leaving. A person may stop identifying as Hindu without any theological offence having occurred." },
      freedom_to_criticize_religion_or_god: { rating: "Fully allowed", note: "Criticism of deities, scripture and priesthood is a genre inside the tradition rather than a breach of it. The nastika schools reject a creator God from within the philosophical canon — Charvaka materially, Samkhya metaphysically, Mimamsa ritually — and remain part of it." },
      equal_status_of_believers_and_nonbelievers: { rating: "Fully allowed", note: "Belief in a creator God is not a universal membership or salvation test across Hindu philosophy." },
      gender_equality: { rating: "Fully allowed", note: "Ultimate reality is worshipped as feminine across the Shakta traditions, women hold the full renunciate status of sanyasini, and living gurus such as Mata Amritanandamayi command mass followings. No doctrine reserves realization or religious office for men." },
      lgbtq_relationship_equality: { rating: "Fully allowed", note: "The only tradition in the sample that names a third gender in its own texts — tritiya-prakriti — with temples and cults attached to it, from Aravan at Koovagam to Bahuchara Mata, beside deities of dual or changing gender in Ardhanarishvara and Mohini. No doctrine condemns same-sex relationships." },
      interfaith_marriage: { rating: "Partially allowed", note: "No universal central prohibition exists, but traditional caste, lineage and dharma systems have frequently preferred endogamy." },
      reproductive_autonomy: { rating: "Fully allowed", note: "No theological rule governs contraception or abortion and no authority exists to issue one. Reproductive decisions sit with the individual and the family rather than with doctrine." },
      secular_governance: { rating: "Fully allowed", note: "There is no church, no clergy holding jurisdiction, and no revealed legal code binding on a state. The tradition is structurally pluralistic and requires no religious government." },
      equality_regardless_birth_caste_ethnicity: { rating: "Partially allowed", note: "Universalist, bhakti and Vedantic traditions challenge birth hierarchy, while caste/varna concepts have also received theological support in other traditions." },
      acceptance_of_science: { rating: "Fully allowed", note: "No single binding cosmology or central authority exists across the traditions, and the philosophical schools already accommodate radically different accounts of the physical world." }
    }
  },

  {
    slug: "buddhism",
    tradition: "Buddhism",
    deity: "No creator — the Dharma",
    era: "Living tradition",
    origin: "5th century BCE · Gangetic plain",
    color: "#FF8A3D",
    class: "acosmic",
    image: "buddhism",
    imageCaption: "A teacher, not a ruler. The seat is empty of sovereignty.",
    note: "The Tribunal finds no defendant. Where a god should be there is a method, and every autonomy question returns 'not applicable'.",
    metrics: { authority: 8, autonomy: 92, creator: 0, lawgiver: 5, judge: 10, exclusivity: 5, fear: 5 },
    god_model: {
      creator: "No",
      supreme_sovereign_lawgiver: "No",
      final_judge: "No supreme divine judge",
      ultimate_reality_cosmic_principle: "Dharma or ultimate truth rather than Creator-God",
      other_genuine_gods_can_exist: "Yes - devas and other beings",
      other_gods_theologically_legitimate: "They may exist but are not supreme creators"
    },
    human_autonomy: {
      can_question_divine_authority: "Not applicable",
      can_morally_disagree_with_god_and_still_be_right: "Not applicable",
      can_legitimately_choose_against_divine_command: "Not applicable",
      allowed_to_reject_god: "Yes",
      rejecting_god_has_divine_consequences: "No creator-God rejection penalty",
      born_sinful_or_guilty: "No",
      should_fear_divine_judgment: "Not applicable"
    },
    divine_relationships: ["Teacher", "Guide", "Compassionate Ideal", "Protector in some traditions"],
    modern_human_values: {
      freedom_of_religion_and_belief: { rating: "Fully allowed", note: "No supreme deity requires belief or exclusive worship; Buddhist ethics can coexist with religious pluralism." },
      freedom_to_leave_religion: { rating: "Fully allowed", note: "There is no apostasy against a supreme God and no divine punishment for ceasing to identify as Buddhist." },
      freedom_to_criticize_religion_or_god: { rating: "Fully allowed", note: "There is no god to blaspheme against, and the Kalama Sutta makes testing a teaching against your own examination the recommended method rather than a transgression. Some traditions still count deliberate slander of the Dharma as karmically costly, but nothing places inquiry itself out of bounds." },
      equal_status_of_believers_and_nonbelievers: { rating: "Fully allowed", note: "Moral consequences primarily depend on intention and action rather than membership in a believer class." },
      gender_equality: { rating: "Partially allowed", note: "Women can attain profound spiritual realization, but monastic structures and some historical doctrines impose unequal roles." },
      lgbtq_relationship_equality: { rating: "Partially allowed", note: "No universal orientation-based condemnation exists, but interpretations of sexual misconduct and monastic sexual ethics vary." },
      interfaith_marriage: { rating: "Fully allowed", note: "There is no general Buddhist theological rule requiring a spouse to accept Buddhism." },
      reproductive_autonomy: { rating: "Partially allowed", note: "Contraception is generally compatible, while traditional Buddhist ethics usually regard abortion as morally serious killing." },
      secular_governance: { rating: "Fully allowed", note: "Buddhist moral teaching does not require governance by a creator God's revealed law." },
      equality_regardless_birth_caste_ethnicity: { rating: "Fully allowed", note: "Spiritual potential is not determined by caste or ethnicity." },
      acceptance_of_science: { rating: "Fully allowed", note: "Investigation and testing are methodologically central, and there is no revealed account of the physical world that has to be defended against evidence." }
    }
  },

  {
    slug: "jainism",
    tradition: "Jainism",
    deity: "No creator — perfected souls",
    era: "Living tradition",
    origin: "Ancient South Asia · continuous",
    color: "#E8E2D0",
    class: "acosmic",
    image: "jainism",
    imageCaption: "The perfected exemplar — liberated, and in charge of nothing.",
    note: "The only tradition that rejects a creator-god as a doctrine rather than an omission. Highest autonomy reading in the sample.",
    metrics: { authority: 5, autonomy: 95, creator: 0, lawgiver: 0, judge: 0, exclusivity: 5, fear: 0 },
    god_model: {
      creator: "No",
      supreme_sovereign_lawgiver: "No",
      final_judge: "No",
      ultimate_reality_cosmic_principle: "Eternal cosmos and karmic order",
      other_genuine_gods_can_exist: "Celestial beings exist",
      other_gods_theologically_legitimate: "Yes as beings, but not creator rulers"
    },
    human_autonomy: {
      can_question_divine_authority: "Not applicable",
      can_morally_disagree_with_god_and_still_be_right: "Not applicable",
      can_legitimately_choose_against_divine_command: "Not applicable",
      allowed_to_reject_god: "Yes - Creator-God is itself rejected",
      rejecting_god_has_divine_consequences: "No",
      born_sinful_or_guilty: "No",
      should_fear_divine_judgment: "Not applicable"
    },
    divine_relationships: ["Teacher", "Perfected Exemplar", "Liberated Being"],
    modern_human_values: {
      freedom_of_religion_and_belief: { rating: "Fully allowed", note: "Jain many-sidedness and absence of a jealous creator deity make theological pluralism comparatively easy to accommodate." },
      freedom_to_leave_religion: { rating: "Fully allowed", note: "There is no apostasy offense against a Creator-God." },
      freedom_to_criticize_religion_or_god: { rating: "Fully allowed", note: "Philosophical disagreement is structurally compatible with anekantavada, subject to ethical constraints against harmful or dishonest speech." },
      equal_status_of_believers_and_nonbelievers: { rating: "Fully allowed", note: "Karmic and spiritual status depends on actions and the condition of the soul, not belief in a creator." },
      gender_equality: { rating: "Partially allowed", note: "Shvetambara traditions accept women's direct liberation; Digambara theology traditionally holds that final liberation requires male rebirth." },
      lgbtq_relationship_equality: { rating: "Partially allowed", note: "Jain ethics imposes strong sexual restraint generally and does not straightforwardly map onto modern relationship-equality concepts." },
      interfaith_marriage: { rating: "Partially allowed", note: "No creator-God exclusivity requires conversion, but traditional Jain lay ethics and community structures place substantial importance on religious discipline and family life." },
      reproductive_autonomy: { rating: "Partially allowed", note: "Strong ahimsa commitments place significant restrictions on abortion and other actions understood to destroy living beings." },
      secular_governance: { rating: "Fully allowed", note: "No supreme divine lawgiver must govern the state." },
      equality_regardless_birth_caste_ethnicity: { rating: "Fully allowed", note: "All souls have the same fundamental potential for purification and liberation." },
      acceptance_of_science: { rating: "Fully allowed", note: "Anekantavada treats every single description as partial, leaving no doctrinal requirement to reject a finding because it contradicts one account." }
    }
  },

  {
    slug: "zoroastrianism",
    tradition: "Zoroastrianism",
    deity: "Ahura Mazda",
    era: "Living tradition",
    origin: "2nd–1st millennium BCE · Iran",
    color: "#FF4D4D",
    class: "sovereign",
    image: "zoroastrianism",
    imageCaption: "Ahura Mazda and Asha — a sovereign identical with the good.",
    note: "Sovereignty routed through cosmic truth. Choice is central here, but only one of the two choices is real.",
    metrics: { authority: 80, autonomy: 38, creator: 90, lawgiver: 85, judge: 90, exclusivity: 75, fear: 75 },
    god_model: {
      creator: "Yes or qualified",
      supreme_sovereign_lawgiver: "Strong",
      final_judge: "Yes",
      ultimate_reality_cosmic_principle: "Asha and cosmic moral order",
      other_genuine_gods_can_exist: "Subordinate spiritual beings exist",
      other_gods_theologically_legitimate: "Yazatas are legitimate subordinate beings, not rival supreme gods"
    },
    human_autonomy: {
      can_question_divine_authority: "Partially",
      can_morally_disagree_with_god_and_still_be_right: "Generally no - Ahura Mazda represents ultimate good",
      can_legitimately_choose_against_divine_command: "Humans possess strong moral choice, but choosing evil is not morally legitimate",
      allowed_to_reject_god: "No or partially",
      rejecting_god_has_divine_consequences: "Moderate to strong",
      born_sinful_or_guilty: "No",
      should_fear_divine_judgment: "Moderate to strong"
    },
    divine_relationships: ["Creator", "Lord", "Source of Good", "Judge"],
    modern_human_values: {
      freedom_of_religion_and_belief: { rating: "Partially allowed", note: "Free moral choice is important, but the theology sharply distinguishes truth/asha from falsehood/druj." },
      freedom_to_leave_religion: { rating: "Not allowed", note: "Classical Zoroastrian traditions treat apostasy as religiously serious." },
      freedom_to_criticize_religion_or_god: { rating: "Partially allowed", note: "Choice and moral reasoning matter, but rejection of Ahura Mazda and truth is not regarded as an equally valid theological position." },
      equal_status_of_believers_and_nonbelievers: { rating: "Partially allowed", note: "Universal moral choice exists alongside strong boundaries between the good religion and religious outsiders." },
      gender_equality: { rating: "Partially allowed", note: "Women possess religious significance and moral agency, while classical family and religious law contains substantial gender hierarchy." },
      lgbtq_relationship_equality: { rating: "Not allowed", note: "Classical Zoroastrian theological literature explicitly condemns male same-sex intercourse." },
      interfaith_marriage: { rating: "Not allowed", note: "Classical and traditional Zoroastrian systems strongly restrict marriage outside the religious community." },
      reproductive_autonomy: { rating: "Partially allowed", note: "Procreation is connected with cosmic moral duty, limiting a purely individual-autonomy model." },
      secular_governance: { rating: "Partially allowed", note: "Classical Zoroastrian political theology closely connected righteous kingship, religion and cosmic order." },
      equality_regardless_birth_caste_ethnicity: { rating: "Partially allowed", note: "Universal moral agency coexists in classical literature with significant communal and Iranian/non-Iranian distinctions." },
      acceptance_of_science: { rating: "Fully allowed", note: "Asha is truth itself, and the theology issues no revealed description of the physical world that must be upheld against observation." }
    }
  },

  {
    slug: "greek",
    tradition: "Ancient Greek religion",
    deity: "The Olympian pantheon",
    era: "Historical",
    origin: "Archaic–Classical Greece",
    color: "#46E0F5",
    class: "assembly",
    image: "greek",
    imageCaption: "Zeus is king of the gods, and still not above the story.",
    note: "The only model in the sample where the gods themselves can be portrayed as morally wrong — and the audience is expected to notice.",
    metrics: { authority: 34, autonomy: 66, creator: 30, lawgiver: 35, judge: 40, exclusivity: 10, fear: 40 },
    god_model: {
      creator: "No single universal creator model",
      supreme_sovereign_lawgiver: "Limited - Zeus is king but not absolute",
      final_judge: "Distributed",
      ultimate_reality_cosmic_principle: "Generally not in ordinary cultic religion",
      other_genuine_gods_can_exist: "Yes",
      other_gods_theologically_legitimate: "Yes"
    },
    human_autonomy: {
      can_question_divine_authority: "Yes or partially",
      can_morally_disagree_with_god_and_still_be_right: "Yes or partially - mythology can portray gods as morally flawed",
      can_legitimately_choose_against_divine_command: "Partially",
      allowed_to_reject_god: "Partially - atheism and impiety could be condemned",
      rejecting_god_has_divine_consequences: "No universal eternal-disbelief punishment",
      born_sinful_or_guilty: "No",
      should_fear_divine_judgment: "Fear of particular divine consequences rather than one absolute Judge"
    },
    divine_relationships: ["King", "Patron", "Protector", "Parent", "Lover", "Companion"],
    modern_human_values: {
      freedom_of_religion_and_belief: { rating: "Partially allowed", note: "Multiple gods and cults were legitimate, but respect for civic gods was considered religiously important and atheism could be associated with impiety." },
      freedom_to_leave_religion: { rating: "Partially allowed", note: "There was no single church to leave, but rejecting the gods and civic cult altogether could constitute impiety." },
      freedom_to_criticize_religion_or_god: { rating: "Partially allowed", note: "Myths and philosophy could criticize divine behavior, while impiety placed limits on religious rejection or insult." },
      equal_status_of_believers_and_nonbelievers: { rating: "Partially allowed", note: "There was no salvation test based simply on belief, but atheism and impiety were not necessarily regarded as neutral." },
      gender_equality: { rating: "Partially allowed", note: "Powerful goddesses and important priestesses coexisted with strongly differentiated gender roles." },
      lgbtq_relationship_equality: { rating: "Partially allowed", note: "Same-sex relationships existed and were not universally theologically condemned, but ancient sexual categories were status-, age- and role-based rather than modern equality-based." },
      interfaith_marriage: { rating: "Partially allowed", note: "Foreign gods could be acknowledged and incorporated, but religion, citizenship and family identity were intertwined." },
      reproductive_autonomy: { rating: "Partially allowed", note: "No single divine law regulated reproduction, but ancient religious concepts of family, fertility and civic duty do not equal modern individual autonomy." },
      secular_governance: { rating: "Partially allowed", note: "There was no revealed divine legal code comparable to Sharia or Halakhah, but polis religion and government were deeply integrated." },
      equality_regardless_birth_caste_ethnicity: { rating: "Partially allowed", note: "Religion did not create a universal equal-citizenship theology; citizen, foreigner, slave and gender distinctions remained religiously significant." },
      acceptance_of_science: { rating: "Not applicable", note: "The tradition did not survive into the era of modern science. Greek natural philosophy produced some of its earliest ancestors, but the cultic religion never had to rule on it." }
    }
  },

  {
    slug: "egyptian",
    tradition: "Ancient Egyptian religion",
    deity: "The Ennead and Ma'at",
    era: "Historical",
    origin: "c. 3100 BCE – Roman period · Nile valley",
    color: "#C77DFF",
    class: "assembly",
    image: "egyptian",
    imageCaption: "Ma'at on the scales — order weighed against the human heart.",
    note: "Plural gods, singular order. The only entry the Tribunal marks as structurally incapable of a secular state.",
    metrics: { authority: 46, autonomy: 48, creator: 60, lawgiver: 55, judge: 80, exclusivity: 12, fear: 65 },
    god_model: {
      creator: "Multiple creator traditions",
      supreme_sovereign_lawgiver: "Distributed, with divine kingship",
      final_judge: "Strong afterlife judgment",
      ultimate_reality_cosmic_principle: "Ma'at and cosmic order",
      other_genuine_gods_can_exist: "Yes",
      other_gods_theologically_legitimate: "Yes"
    },
    human_autonomy: {
      can_question_divine_authority: "Partially",
      can_morally_disagree_with_god_and_still_be_right: "Partially",
      can_legitimately_choose_against_divine_command: "Partially",
      allowed_to_reject_god: "Partially - no single monotheistic belief test, but divine order was fundamental",
      rejecting_god_has_divine_consequences: "Primarily tied to moral and cosmic disorder rather than rejection of one deity",
      born_sinful_or_guilty: "No",
      should_fear_divine_judgment: "Moderate to strong"
    },
    divine_relationships: ["Parent", "Protector", "Ruler", "Patron", "Creator"],
    modern_human_values: {
      freedom_of_religion_and_belief: { rating: "Partially allowed", note: "Plural gods were normal and foreign deities could be assimilated, but participation in divine cosmic and state order was fundamental." },
      freedom_to_leave_religion: { rating: "Partially allowed", note: "There was no single creed to renounce, but total rejection of gods and Ma'at was not a recognized neutral theological position." },
      freedom_to_criticize_religion_or_god: { rating: "Partially allowed", note: "No centralized doctrine of blasphemy comparable to later monotheisms existed, but disrespect toward gods and sacred order was not simply unrestricted." },
      equal_status_of_believers_and_nonbelievers: { rating: "Partially allowed", note: "Religious status was not based on one exclusive belief confession, but cosmic and political hierarchy remained central." },
      gender_equality: { rating: "Partially allowed", note: "Powerful female deities and female religious participation coexisted with a predominantly male religious hierarchy and differentiated gender roles." },
      lgbtq_relationship_equality: { rating: "Partially allowed", note: "Same-sex acts appear in religious and literary material, but evidence does not support a modern doctrine of equal same-sex relationships." },
      interfaith_marriage: { rating: "Partially allowed", note: "The polytheistic system could absorb foreign gods, but marriage and social identity remained linked to community and political hierarchy." },
      reproductive_autonomy: { rating: "Partially allowed", note: "Fertility and reproduction were religiously significant, while no universal revealed reproductive law equivalent to later monotheistic systems existed." },
      secular_governance: { rating: "Not allowed", note: "Classical Egyptian theology embedded kingship in the divine cosmic order; the Pharaoh's sacred role was integral to maintaining Ma'at." },
      equality_regardless_birth_caste_ethnicity: { rating: "Partially allowed", note: "The theology did not teach modern universal civic equality and was deeply connected to hierarchical kingship and social order." },
      acceptance_of_science: { rating: "Not applicable", note: "The tradition ended long before modern science existed and left no doctrine capable of accepting or refusing it." }
    }
  }
];

/* --------------------------- derived helpers ---------------------------- */

const BY_SLUG = Object.fromEntries(TRADITIONS.map(t => [t.slug, t]));

/** Modern-values compatibility score, 0–100, averaged over applicable values. */
function valuesScore(t) {
  const scored = VALUES
    .map(v => RATING_META[t.modern_human_values[v.key].rating].score)
    .filter(s => s !== null);
  return Math.round(scored.reduce((a, b) => a + b, 0) / scored.length);
}

/** Count of each rating for a tradition. */
function ratingTally(t) {
  const tally = { full: 0, partial: 0, none: 0, na: 0 };
  VALUES.forEach(v => tally[RATING_META[t.modern_human_values[v.key].rating].key]++);
  return tally;
}

TRADITIONS.forEach(t => {
  t.valuesScore = valuesScore(t);
  t.tally = ratingTally(t);
  t.classInfo = CLASSES.find(c => c.id === t.class);
});

const AXIS_BY_ID  = Object.fromEntries(AXES.map(a => [a.id, a]));
const VALUE_BY_KEY = Object.fromEntries(VALUES.map(v => [v.key, v]));

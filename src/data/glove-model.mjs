/*
 * 手套合规数据模型 —— 全站唯一的「事实来源」。
 * 自检器页、EN/ANSI 对照页、行业对照页都从这里取数；改这里，三页同时更新。
 *
 * 依据：
 *   EN 388:2016+A1:2018      机械危害：磨耗 / 刀割(库佩) / 撕裂 / 刺穿 / ISO 13997 切割 / 冲击
 *   ANSI/ISEA 105-2016       美国自愿性标准：切割 A1-A9（ASTM F2992-15）
 *   OSHA 29 CFR 1910.138     美国法规：要求「选择合适的手部防护」，不规定具体等级
 *   Regulation (EU) 2016/425 欧盟 PPE 法规：要求型式检验与 CE 标记，等级由 EN 388 测试得出
 *
 * ⚠️ 重要：applications 里的等级是「行业常见要求」(common industry practice)，不是法规强制值。
 *    法规只要求雇主做危害评估；具体数字来自客户合同、保险公司、工会协议和企业自己的 EHS 标准。
 */

/* ---------- 两套切割等级刻度 ---------- */

export const CUT_SCALES = {
  en: {
    code: 'en',
    short: 'EN 388',
    label: 'EN 388:2016+A1:2018 — TDM cut (ISO 13997)',
    unit: 'N',
    unitLabel: 'newtons',
    levels: [
      { level: 'A', min: 2, max: 5 },
      { level: 'B', min: 5, max: 10 },
      { level: 'C', min: 10, max: 15 },
      { level: 'D', min: 15, max: 22 },
      { level: 'E', min: 22, max: 30 },
      { level: 'F', min: 30, max: null },
    ],
  },
  us: {
    code: 'us',
    short: 'ANSI/ISEA 105',
    label: 'ANSI/ISEA 105-2016 — cut levels A1-A9 (ASTM F2992-15)',
    unit: 'g',
    unitLabel: 'grams of force',
    levels: [
      { level: 'A1', min: 200, max: 500 },
      { level: 'A2', min: 500, max: 1000 },
      { level: 'A3', min: 1000, max: 1500 },
      { level: 'A4', min: 1500, max: 2200 },
      { level: 'A5', min: 2200, max: 3000 },
      { level: 'A6', min: 3000, max: 4000 },
      { level: 'A7', min: 4000, max: 5000 },
      { level: 'A8', min: 5000, max: 6000 },
      { level: 'A9', min: 6000, max: null },
    ],
  },
};

/* 1 newton = 101.97 gram-force。
   两套切割测试都用 TDM（直线刀片、加载到底）原理，所以力值可以直接换算比较 ——
   这也是本站对照表比别家「字母对字母」更准的原因。 */
export const N_TO_GF = 101.97;

function levelRange(scaleCode, levelName) {
  const scale = CUT_SCALES[scaleCode];
  const found = scale.levels.find((l) => l.level === levelName);
  return found ? { min: found.min, max: found.max === null ? Infinity : found.max } : null;
}

/* EN 388 的 N 区间换算成克，看它落在哪些 ANSI 等级里。
   等级边界是取整过的，直接按重叠判断会出现「EN A 同时等于 A1 和 A2」这种碎片
   （因为 5 N = 510 g，而 A2 从 500 g 起）。所以这里只看占 EN 区间 10% 以上的重叠，
   把四舍五入造成的碎片滤掉 —— 结果是 A→A1、B→A2、C→A3、D→A4、E→A5、F→A6 及以上。 */
export function enToAnsi(letter) {
  const r = levelRange('en', letter);
  if (!r) return [];
  const gMin = r.min * N_TO_GF;
  const gMax = r.max * N_TO_GF;
  const span = gMax - gMin;
  return CUT_SCALES.us.levels
    .filter((l) => {
      const aMin = l.min;
      const aMax = l.max === null ? Infinity : l.max;
      if (gMin >= aMax || gMax <= aMin) return false;
      if (!isFinite(span)) return true;
      const overlap = Math.min(gMax, aMax) - Math.max(gMin, aMin);
      return overlap / span >= 0.1;
    })
    .map((l) => l.level);
}

/* 生成对照表数据（构建时算好，页面上直接渲染） */
export const CONVERSION_TABLE = CUT_SCALES.en.levels.map((l) => {
  const gMin = Math.round(l.min * N_TO_GF);
  const gMax = l.max === null ? null : Math.round(l.max * N_TO_GF);
  return {
    en: l.level,
    newtons: l.max === null ? l.min + '+' : l.min + '–' + l.max,
    grams: gMax === null ? gMin + '+' : gMin + '–' + gMax,
    ansi: enToAnsi(l.level),
  };
});

/* ---------- 国家 / 地区的法规框架 ---------- */

export const COUNTRIES = [
  {
    id: 'us',
    label: 'United States',
    scale: 'us',
    enforcement: 'OSHA (US Department of Labor)',
    points: [
      {
        title: 'OSHA 29 CFR 1910.138 — no cut level is named',
        text: 'The standard requires employers to select hand protection "appropriate for the performance and construction of the work", based on the hazards identified. It does not require A4, A5 or any other number.',
      },
      {
        title: 'ANSI/ISEA 105-2016 — voluntary, but effectively the market standard',
        text: 'This is the consensus standard that defines the A1–A9 cut levels. It is not law, but US buyers, insurers and contracts reference it constantly.',
      },
      {
        title: 'Where the real requirement comes from',
        text: 'An automotive plant specifying A4–A5 in its purchase order, a customer audit, an insurer condition, or OSHA General Duty Clause 5(a)(1) enforcement after an injury. The number comes from the risk assessment and the contract — not from the regulation.',
      },
    ],
  },
  {
    id: 'eu',
    label: 'European Union',
    scale: 'en',
    enforcement: 'National market surveillance authorities (per Member State)',
    points: [
      {
        title: 'Regulation (EU) 2016/425 — certification, not levels',
        text: 'Gloves for mechanical risks are Category II PPE: they need an EU type-examination, a technical file, a notified body certificate and CE marking. The Regulation says nothing about which cut level is required.',
      },
      {
        title: 'EN 388:2016+A1:2018 — where the number comes from',
        text: 'This is the harmonised test standard for mechanical risks. Its six-position marking (like 4X42D) is what appears on the glove and what buyers compare.',
      },
      {
        title: 'EN ISO 21420:2020 — general requirements',
        text: 'Replaced EN 420. Covers innocuousness, sizing and marking. A compliant glove normally references both EN ISO 21420 and EN 388.',
      },
      {
        title: 'Where the real requirement comes from',
        text: 'Framework Directive 89/391/EEC requires the employer to carry out a risk assessment. The output of that assessment — plus customer contracts and trade union agreements — sets the level you must buy.',
      },
    ],
  },
  {
    id: 'uk',
    label: 'United Kingdom',
    scale: 'en',
    enforcement: 'HSE (Health and Safety Executive)',
    points: [
      {
        title: 'PPE Regulations 2022 (as amended)',
        text: 'The UK retained the EU-era hand protection duties after Brexit. Employers must provide suitable PPE based on a risk assessment; no numeric cut level is prescribed.',
      },
      {
        title: 'EN standards are still the reference',
        text: 'UK buyers continue to specify EN 388 levels, and UKCA marking runs alongside CE for the products affected. In practice you will see the same EN 388 markings as in the EU.',
      },
      {
        title: 'Where the real requirement comes from',
        text: 'HSE guidance, the employer risk assessment, and increasingly client contract requirements pushed down the supply chain.',
      },
    ],
  },
  {
    id: 'both',
    label: 'Both US & EU (exporting to both)',
    scale: 'both',
    enforcement: 'OSHA in the US · notified bodies and market surveillance in the EU',
    points: [
      {
        title: 'Dual marking is normal on a supply contract',
        text: 'A glove sold into both markets is usually tested against EN 388 (for the CE marking) and against ASTM F2992-15 (to print the A1–A9 level on the US artwork).',
      },
      {
        title: 'Do not assume the numbers match across scales',
        text: 'The two cut tests use the same TDM principle but different edge and load conditions. "EN level D" does not automatically mean "ANSI A4" — the conversion is approximate, which is why we publish the overlap ranges rather than a single mapping.',
      },
      {
        title: 'Practical route',
        text: 'Test once, mark both. When you write the purchase order, state the level in the buyer\'s own scale (A-levels for the US, EN letter for the EU) and require the test report as an attachment.',
      },
    ],
  },
];

/* ---------- 12 个典型工种 ---------- */

export const APPLICATIONS = [
  {
    id: 'sheet-metal',
    label: 'Sheet metal, stamping & press work',
    icon: 'metal',
    hazard: 'Sharp edges, burrs and slivers from blanking and trimming; pinch points at the press',
    en: 'D–E',
    ansi: 'A4–A6',
    liner: 'HPPE or HPPE/steel-wire blend, 13–15 gauge',
    coating: 'Nitrile palm dip (dry and light oil) or PU where feel matters',
    features: ['Reinforced thumb crotch', 'Impact "P" marking where hands work near the press', 'Knit wrist, 70–100 mm cuff'],
    also: ['EN ISO 10819 if vibrating tools are used', 'EN 16350 in ATEX areas'],
    watch: 'A4–A5 is the everyday level. Step up to A6 only for raw coil or trim scrap — higher cut gloves are thicker and slower, and operators quietly stop using them.',
  },
  {
    id: 'glass-handling',
    label: 'Glass handling, glazing & window assembly',
    icon: 'glass',
    hazard: 'Cut and puncture from sharp edges, breakage and slivers; heavy flat loads',
    en: 'D–E',
    ansi: 'A4–A6',
    liner: 'HPPE or glass-fibre blend with steel or basalt wire, 13 gauge',
    coating: 'Nitrile or sandy nitrile palm for wet glass',
    features: ['High puncture rating (EN 388 position 4 at 3–4)', 'Reinforced thumb crotch', 'Long 100 mm+ cuff', 'Impact back for large pane work'],
    also: ['Cut-resistant sleeves for forearms', 'EN ISO 21420 general requirements'],
    watch: 'Glass slivers puncture as well as cut. Read the puncture digit, not just the cut letter — a glove can be EN level E and still let a sliver through a weak palm.',
  },
  {
    id: 'automotive',
    label: 'Automotive assembly, engine & parts handling',
    icon: 'car',
    hazard: 'Sharp stamped panels, machined edges and burrs; oil and coolant on the hands',
    en: 'C–D',
    ansi: 'A3–A5',
    liner: 'HPPE blend, 15–18 gauge for dexterity',
    coating: 'Nitrile foam or PU — oil grip with real touch sensitivity',
    features: ['Thin gauge for small fasteners', 'Touchscreen-compatible fingertips', 'Oil and coolant resistance'],
    also: ['EN 374 where fluids are handled', 'EN 16350 for EV battery and paint shop areas'],
    watch: 'Most assembly jobs sit at A3–A4. Going higher costs dexterity, operators take the gloves off, and that is how a plant ends up with a worse real-world outcome at a higher nominal level.',
  },
  {
    id: 'food',
    label: 'Food processing, meat & poultry',
    icon: 'food',
    hazard: 'Knives, bandsaw and bone; wet and greasy at all times; hygiene risk',
    en: 'C–E',
    ansi: 'A3–A6',
    liner: 'HPPE blend, 13–18 gauge',
    coating: 'Nitrile or PVC with food-contact approval',
    features: ['Food-contact compliant (FDA 21 CFR 177.2600 / EU 1935/2004 and 10/2011)', 'Blue or metal-detectable versions for HACCP', 'EN ISO 374-5 where micro-organisms are a risk', 'Dexterity for knife work'],
    also: ['EN 374 / EN ISO 374-5', 'EN 407 where ovens, fryers or sterilisers are nearby'],
    watch: 'Filleting and boning lines commonly run A4–A6. In food plants the glove is also a hygiene item, so food-contact approval and detectability are not optional extras.',
  },
  {
    id: 'warehouse',
    label: 'Warehouse, picking & parcel handling',
    icon: 'box',
    hazard: 'Cardboard edges, plastic strapping, the occasional blade; hours of repetitive handling',
    en: 'A–B',
    ansi: 'A1–A3',
    liner: 'Nylon or light HPPE blend, 13–15 gauge',
    coating: 'PU palm — dry, breathable and inexpensive',
    features: ['Breathable back', 'Touchscreen fingertips', 'Machine washable'],
    also: ['EN 511 if working in chilled or frozen areas'],
    watch: 'Over-specifying here is the classic error. Pickers lose dexterity, gloves come off, and the accident happens anyway. A2–A3 with excellent grip wins.',
  },
  {
    id: 'construction',
    label: 'Construction, rebar & scaffolding',
    icon: 'crane',
    hazard: 'Rebar, wire mesh and tie wire; crushed stone; impact and pinch',
    en: 'D–E',
    ansi: 'A4–A6',
    liner: 'HPPE blend with steel wire, 13 gauge',
    coating: 'Nitrile or latex crinkle palm for wet and dry grip',
    features: ['Impact "P" with TPR back-of-hand', 'Reinforced thumb crotch', 'Water-repellent back'],
    also: ['EN 511 for winter sites', 'EN ISO 10819 for breaker and hammer work'],
    watch: 'Anti-vibration is a separate standard. A glove can be A6 and still transmit full vibration to the hands — you need the EN ISO 10819 marking for that, not a higher cut level.',
  },
  {
    id: 'oil-gas',
    label: 'Oil & gas, drilling & well service',
    icon: 'oil',
    hazard: 'Pipe and tool handling, wireline, slips and tongs; impact; hydrocarbon exposure',
    en: 'D–E (impact "P")',
    ansi: 'A4–A6',
    liner: 'HPPE/steel blend, 13 gauge, with TPR impact back',
    coating: 'Nitrile or sandy nitrile',
    features: ['Impact marking "P"', 'Oil and hydrocarbon resistance', 'EN 16350 antistatic for ATEX zones', 'Cut-resistant sleeves and arm guards'],
    also: ['EN 16350', 'EN 407 for hot surface contact'],
    watch: 'Offshore operators usually fix the level in their own HSE standard. On this application the contract sets the number far more often than the regulation does.',
  },
  {
    id: 'composites',
    label: 'Composites, fibreglass & carbon fibre',
    icon: 'factory',
    hazard: 'Glass and carbon fibre strands, sharp trim scrap, resins and solvents; skin irritation',
    en: 'D–F',
    ansi: 'A4–A6',
    liner: 'HPPE or glass-fibre blend, 13–18 gauge',
    coating: 'Nitrile (resin and solvent resistance) or PU for feel',
    features: ['Cut and puncture for trim scrap', 'Chemical-resistant coating', 'Long cuff so no skin is exposed'],
    also: ['EN 374 for resins, styrene and acetone', 'Antistatic in lay-up areas'],
    watch: 'Fibre dust is an abrasion and irritation problem as much as a cut problem. Covered forearms and long cuffs matter more here than the headline cut letter.',
  },
  {
    id: 'machining',
    label: 'Machining, tool room & blade changes',
    icon: 'tool',
    hazard: 'Cutting tools, inserts, swarf and blades; oils and coolant',
    en: 'C–D',
    ansi: 'A3–A5',
    liner: 'HPPE blend, 18 gauge for maximum feel',
    coating: 'PU or nitrile micro-foam, oil resistant',
    features: ['Very high dexterity', 'Coolant resistance', 'Fingertip-reinforced variants for precision work'],
    also: ['EN 374 if coolant concentrates are handled'],
    watch: 'Precision machinists will not wear a full A6 glove. Fingertip-reinforced designs at A3–A4 get worn all shift, which is the only compliance that counts.',
  },
  {
    id: 'recycling',
    label: 'Recycling, waste sorting & scrap',
    icon: 'recycle',
    hazard: 'Mixed sharps — glass, metal, ceramics, needles; unpredictable loads and contamination',
    en: 'E–F',
    ansi: 'A5–A7',
    liner: 'HPPE with steel wire, 10–13 gauge, heavy construction',
    coating: 'Nitrile or PVC full dip — no exposed knit',
    features: ['Highest cut and puncture in the range', 'Full-coverage dip', 'Gauntlet cuff', 'Needle-resistant palm where the contract requires it'],
    also: ['EN ISO 374-5 for biological hazards', 'Cut-resistant aprons and sleeves for needle risk'],
    watch: 'This is the one application where going high is correct: loads are unpredictable and the biological hazard is real. Note that EN 388 puncture testing uses a blunt probe and does not cover hypodermic needles — that is a separate test (ASTM F2878).',
  },
  {
    id: 'landscaping',
    label: 'Landscaping, forestry & brush clearing',
    icon: 'tree',
    hazard: 'Hand tools, branches, brambles and thorny material; chainsaw work if felling',
    en: 'B–D',
    ansi: 'A2–A4',
    liner: 'HPPE blend, or latex crinkle for wet work',
    coating: 'Latex crinkle (outstanding wet grip) or PU',
    features: ['Wet grip', 'Thorn and abrasion resistance', 'Breathable back for summer work'],
    also: ['Chainsaw work needs EN ISO 11393-4 (formerly EN 381-7) gloves — a different standard with its own class numbers', 'EN 511 for winter work'],
    watch: 'A cut-resistant work glove is not chainsaw protection. If the task is felling or clearing with a saw, you need EN ISO 11393-4 gloves plus matching leg protection — no A-level makes a glove safe for a saw chain.',
  },
  {
    id: 'electrical',
    label: 'Electrical, utilities & panel work',
    icon: 'bolt',
    hazard: 'Sharp sheet-metal enclosures, cable, tool edges; live conductors',
    en: 'B–D',
    ansi: 'A2–A4',
    liner: 'HPPE blend, 18 gauge for terminations',
    coating: 'PU palm, non-marking',
    features: ['High dexterity', 'No exposed metal parts', 'Insulating glove worn over the cut glove for live work'],
    also: ['EN 60903 / IEC 60903 insulating gloves (Class 00–4) for live working', 'Arc flash protection to IEC 61482', 'EN 16350 antistatic'],
    watch: 'Cut-resistant gloves provide no electrical insulation. On live work the EN 60903 insulating glove is the outer layer and it carries its own class system — never substitute one for the other.',
  },
];

/* ---------- 涂层怎么选 ---------- */

export const COATING_GUIDE = [
  { name: 'PU (polyurethane)', best: 'Dry parts, precision handling', note: 'Thinnest and most dexterous, lowest cost. Poor with oil.' },
  { name: 'Nitrile (smooth)', best: 'Oils, greases, light chemicals', note: 'The all-round oil-resistant choice.' },
  { name: 'Nitrile foam / sandy nitrile', best: 'Wet and oily grip', note: 'The default in automotive and food plants.' },
  { name: 'Latex crinkle', best: 'Wet and dry grip, glass, masonry', note: 'Best wet grip available. Check the plant latex-allergy policy.' },
  { name: 'PVC', best: 'Coarse, chemical and cold handling', note: 'Bulky and low dexterity, but chemically resistant.' },
  { name: 'Neoprene / butyl', best: 'Solvents and aggressive chemicals', note: 'Select against EN 374 permeation data, not by feel.' },
];

/* ---------- EN 388 六位标号怎么读 ---------- */

export const EN388_POSITIONS = [
  { pos: 1, name: 'Abrasion', values: '0–4', method: 'Martindale abrasion cycles' },
  { pos: 2, name: 'Blade cut (Coupe)', values: '0–5, or X', method: 'Rotating circular blade. Marked X when the material blunts the blade and the test is not meaningful — common on high-performance liners.' },
  { pos: 3, name: 'Tear', values: '0–4', method: 'Force to propagate a tear' },
  { pos: 4, name: 'Puncture', values: '0–4', method: 'Blunt probe. Does not cover hypodermic needles.' },
  { pos: 5, name: 'Cut (TDM, ISO 13997)', values: 'A–F, or X', method: 'Straight blade under increasing load. This is the number that matters for real cut performance.' },
  { pos: 6, name: 'Impact', values: 'P, or not shown', method: 'Added by amendment A1:2018. Only shown when the glove passes — which is why you often see five characters instead of six.' },
];

/* ---------- 其它相关标准 ---------- */

export const OTHER_STANDARDS = [
  { code: 'EN ISO 21420:2020', scope: 'General requirements for protective gloves (replaced EN 420)' },
  { code: 'EN 374 / EN ISO 374', scope: 'Chemicals and micro-organisms' },
  { code: 'EN 407', scope: 'Thermal risks — heat and/or fire' },
  { code: 'EN 511', scope: 'Protection against cold' },
  { code: 'EN 16350', scope: 'Antistatic properties' },
  { code: 'EN ISO 10819', scope: 'Hand-arm vibration' },
  { code: 'EN ISO 11393-4', scope: 'Chain-saw protective gloves (replaced EN 381-7)' },
  { code: 'EN 60903 / IEC 60903', scope: 'Live working — insulating gloves' },
  { code: 'ANSI/ISEA 105-2016', scope: 'US consensus standard: cut A1–A9 plus abrasion, puncture and more' },
  { code: 'ASTM F2992-15', scope: 'The TDM cut test behind the ANSI/ISEA cut levels' },
  { code: 'OSHA 29 CFR 1910.138', scope: 'US law: choose appropriate hand protection — no numeric level' },
  { code: 'Regulation (EU) 2016/425', scope: 'EU PPE Regulation: type-examination, technical file, CE marking' },
];
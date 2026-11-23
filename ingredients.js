/* LabelLens ingredient knowledge base.
   type:  "watch" (concern) or "good" (healthy)
   level: watch only. 3 = high concern (RED), 2 = concern (RED), 1 = caution / regulators disagree / depends on amount (YELLOW)
   good entries are GREEN.
   match: lowercase fragments searched inside each ingredient.
   world: how regulators and health bodies around the world see it (EU/EFSA, WHO, IARC, JECFA, FDA, Health Canada, FSANZ...).
   General consumer information, not medical advice. */

window.INGREDIENT_DB = [
  /* ================= RED / YELLOW (WATCH) ================= */
  { name: "High fructose corn syrup", type: "watch", level: 2, match: ["high fructose corn syrup", "hfcs", "glucose-fructose", "glucose fructose", "isoglucose"],
    found: "Soda, sauces, bread, cereal, candy, packaged snacks",
    reason: "A heavily processed liquid sugar. Large amounts of added fructose are linked to weight gain, fatty liver and blood sugar problems, and it adds calories with no nutrients.",
    world: "Called glucose-fructose in Canada and isoglucose in the EU. Health bodies treat it like any added sugar: the WHO advises keeping free sugars under 10% of daily energy, ideally under 5%." },
  { name: "Added sugar", type: "watch", level: 2, match: ["cane sugar", "brown sugar", "corn syrup", "dextrose", "maltose", "sucrose", "invert sugar", "agave", "fruit juice concentrate", "evaporated cane", "molasses", "rice syrup", "malt syrup", "glucose syrup", "treacle", "turbinado", " sugar"],
    found: "Almost everything packaged: cereal, yogurt, sauces, bread, drinks, snacks",
    reason: "Added sugar raises calories fast and spikes blood sugar. High intake is linked to cavities, weight gain and type 2 diabetes. Sugar near the top of a list means there is a lot of it.",
    world: "WHO guideline: free sugars under 10% of daily energy, with extra benefit under 5% (about 25 g). Several countries (UK, Mexico, South Africa, Thailand and others) tax sugary drinks." },
  { name: "Partially hydrogenated oil (trans fat)", type: "watch", level: 3, match: ["partially hydrogenated", "hydrogenated"],
    found: "Margarine, shortening, packaged baked goods, fried snacks, some frostings",
    reason: "The main source of artificial trans fat, which raises bad LDL cholesterol, lowers good HDL and raises heart disease risk. No safe level is recognized.",
    world: "The WHO called in 2018 for worldwide elimination of industrially produced trans fat (REPLACE). Denmark limited it in 2003, the US revoked its approval in 2015, and many countries now cap it at 2 g per 100 g of fat." },
  { name: "Artificial colors", type: "watch", level: 2, match: ["red 40", "red no. 40", "red 3", "yellow 5", "yellow 6", "blue 1", "blue 2", "erythrosine", "tartrazine", "allura red", "sunset yellow", "brilliant blue", "carmoisine", "ponceau", "quinoline yellow", "fd&c", "artificial color", "artificial colour"],
    found: "Candy, cereal, drinks, frosting, gelatin desserts, snacks, medicines",
    reason: "Synthetic dyes add no nutrition and exist only to make food look bright. Some are linked to hyperactivity and attention problems in sensitive children.",
    world: "In the EU, foods containing six specific dyes must carry a warning that they may affect activity and attention in children. The US moved to ban Red 3 in food in 2025, and it is restricted in many other countries." },
  { name: "Caramel color (class III / IV)", type: "watch", level: 1, match: ["caramel color", "caramel colour", "e150c", "e150d"],
    found: "Colas, sauces, soy sauce, dark bread, gravy",
    reason: "Made with ammonia, some caramel colors contain 4-MEI, a by-product the IARC rates as possibly carcinogenic. Amounts in food are low, so it is a caution rather than an alarm.",
    world: "California requires a warning when 4-MEI exceeds a set level. The EU and Codex set purity limits for 4-MEI instead of banning the color." },
  { name: "Sodium nitrite / nitrate", type: "watch", level: 3, match: ["sodium nitrite", "sodium nitrate", "potassium nitrite", "potassium nitrate", "nitrite", "nitrate", "e250", "e249"],
    found: "Bacon, ham, hot dogs, salami, deli meats, jerky",
    reason: "Curing agents in processed meat. They can form nitrosamines during cooking and digestion, compounds linked to higher colorectal cancer risk.",
    world: "The IARC classifies processed meat as carcinogenic to humans (Group 1). The EU lowered permitted nitrite and nitrate levels in 2023, while the US and most countries cap amounts rather than ban them." },
  { name: "BHA", type: "watch", level: 3, match: ["bha", "butylated hydroxyanisole", "e320"],
    found: "Cereal, chips, gum, instant potatoes, fats and oils",
    reason: "A synthetic preservative that stops fats from going rancid. It is classified as a possible human carcinogen and flagged as a potential hormone disruptor.",
    world: "The IARC lists it as possibly carcinogenic (Group 2B). The EU allows it (E320) only in limited foods at strict limits, and Japan and other regions also restrict it." },
  { name: "BHT", type: "watch", level: 1, match: ["bht", "butylated hydroxytoluene", "e321"],
    found: "Cereal, chips, fats and oils, gum, dry mixes",
    reason: "A synthetic preservative with the same job as BHA. Animal studies at high doses raise concerns, but regulators allow it at low levels, so it is worth limiting rather than panicking over.",
    world: "Permitted in the US, EU (E321) and elsewhere with maximum limits, and the evidence is less worrying than for BHA." },
  { name: "TBHQ", type: "watch", level: 1, match: ["tbhq", "tertiary butylhydroquinone", "e319"],
    found: "Fast food, crackers, instant noodles, microwave popcorn, frozen fried foods",
    reason: "A petroleum-derived preservative. Large doses in animal studies have been tied to immune and digestive effects, so keep intake low.",
    world: "Allowed with a low cap (0.02% of the fat) in the US, EU (E319) and many other regions." },
  { name: "Potassium bromate", type: "watch", level: 3, match: ["potassium bromate", "bromated flour", "e924"],
    found: "Some breads, rolls, bagels and flour",
    reason: "A flour improver classified as a possible human carcinogen.",
    world: "Banned in the EU, UK, Canada, Brazil, China and many others. Still allowed in the US, though California passed a ban taking effect in 2027." },
  { name: "Brominated vegetable oil", type: "watch", level: 3, match: ["brominated vegetable oil", "bvo"],
    found: "Some citrus sodas and sports drinks",
    reason: "Bromine-containing oil used to keep flavoring evenly mixed. It can build up in the body and has been linked to health problems at high intake.",
    world: "Banned in the EU and Japan. The US FDA revoked its authorization in 2024." },
  { name: "Azodicarbonamide", type: "watch", level: 3, match: ["azodicarbonamide", "e927"],
    found: "Some breads, buns and fast-food rolls",
    reason: "A dough conditioner that is also used in foamed plastics. Its breakdown products may trigger asthma.",
    world: "Banned as a food additive in the EU and Australia. Still allowed in the US." },
  { name: "Titanium dioxide", type: "watch", level: 3, match: ["titanium dioxide", "e171"],
    found: "Candy, white icing, gum, coffee creamers, supplements",
    reason: "A whitening agent that adds nothing but color. Concerns focus on tiny nanoparticles that may damage DNA.",
    world: "Banned as a food additive in the EU in 2022 after EFSA could not rule out DNA damage. Still permitted in the US and Great Britain." },
  { name: "Artificial sweeteners", type: "watch", level: 1, match: ["aspartame", "sucralose", "saccharin", "acesulfame", "neotame", "advantame", "cyclamate", "e951", "e955", "e950"],
    found: "Diet soda, sugar-free gum, light yogurt, protein bars, 'zero sugar' products",
    reason: "Zero-calorie sweeteners that may change gut bacteria and keep sweet cravings alive. Research is mixed.",
    world: "In 2023 the WHO advised against using non-sugar sweeteners to control weight. The IARC rated aspartame possibly carcinogenic (2B) while JECFA kept the safe daily limit at 40 mg per kg of body weight." },
  { name: "Sugar alcohols", type: "watch", level: 1, match: ["sorbitol", "maltitol", "xylitol", "erythritol", "mannitol", "isomalt", "lactitol"],
    found: "Sugar-free candy, gum, keto and low-carb snacks, protein bars",
    reason: "Lower in calories but poorly digested, so they can cause gas, bloating and diarrhea. Xylitol is also toxic to dogs.",
    world: "The EU requires foods with more than 10% polyols to warn that excess consumption may have a laxative effect." },
  { name: "Maltodextrin", type: "watch", level: 1, match: ["maltodextrin", "dextrin"],
    found: "Powdered drinks, sauces, snacks, sweeteners, protein powders",
    reason: "A processed starch that digests faster than table sugar, so it can spike blood sugar even though it tastes bland.",
    world: "Permitted worldwide. Its high glycemic index is the main concern for people watching blood sugar." },
  { name: "MSG & flavor enhancers", type: "watch", level: 1, match: ["monosodium glutamate", "msg", "disodium inosinate", "disodium guanylate", "autolyzed yeast", "hydrolyzed protein", "hydrolyzed vegetable protein", "yeast extract", "e621"],
    found: "Instant noodles, chips, soups, seasoning blends, frozen meals",
    reason: "Boost savory taste so food seems richer than it is. Some people report headaches or flushing, and they are a marker of highly processed food.",
    world: "EFSA set a group safe daily intake of 30 mg per kg of body weight for glutamates in 2017. Regulators consider normal food amounts safe." },
  { name: "Natural / artificial flavors", type: "watch", level: 1, match: ["artificial flavor", "artificial flavour", "natural flavor", "natural flavour", "natural and artificial flavor", "flavoring", "flavouring"],
    found: "Nearly all processed food and drinks",
    reason: "A catch-all term that can hide dozens of undisclosed chemicals. You cannot tell what is really inside, which matters for allergies and sensitivities.",
    world: "What counts as 'natural' flavor differs between the EU, the US and other regions, so the word means less than it sounds." },
  { name: "Sodium benzoate", type: "watch", level: 1, match: ["sodium benzoate", "potassium benzoate", "benzoic acid", "e211", "e212"],
    found: "Soft drinks, juices, pickles, salad dressing, sauces",
    reason: "A preservative that can form benzene, a known carcinogen, when mixed with vitamin C and exposed to heat or light. Also linked to hyperactivity in some children.",
    world: "Permitted worldwide with maximum limits. The benzene issue pushed many drink makers to reformulate." },
  { name: "Propylparaben", type: "watch", level: 2, match: ["propylparaben", "methylparaben", "paraben", "e216", "e218"],
    found: "Tortillas, baked goods, some sauces and syrups",
    reason: "Parabens are preservatives that act weakly like the hormone estrogen, so regulators are cautious about them.",
    world: "Propylparaben has not been allowed as a food additive in the EU since 2006. The US still permits it." },
  { name: "Calcium propionate", type: "watch", level: 1, match: ["calcium propionate", "sodium propionate", "propionic acid", "e282"],
    found: "Store-bought bread, rolls, tortillas, baked goods",
    reason: "A mold inhibitor. Evidence of harm is limited, though a small trial linked it to irritability in some children.",
    world: "Permitted worldwide and widely used. It is a minor caution, not a red flag." },
  { name: "Sulfites", type: "watch", level: 1, match: ["sulfite", "sulphite", "sulfur dioxide", "metabisulfite", "e220", "e221", "e223"],
    found: "Wine, dried fruit, pickles, vinegar, processed potatoes",
    reason: "Preservatives that can trigger asthma attacks and allergic reactions in sensitive people.",
    world: "The EU, US, Canada, Australia and others require labeling when sulfites exceed 10 mg per kg." },
  { name: "Carrageenan", type: "watch", level: 1, match: ["carrageenan", "e407"],
    found: "Plant milks, deli meats, ice cream, yogurt, chocolate milk",
    reason: "A seaweed-derived thickener that some studies link to gut inflammation and digestive upset.",
    world: "EFSA re-evaluated it in 2018 and judged it safe at current use levels. Critics point to animal studies." },
  { name: "Polysorbate 80", type: "watch", level: 1, match: ["polysorbate", "e433"],
    found: "Ice cream, salad dressing, sauces, baked goods",
    reason: "An emulsifier that animal studies link to gut lining disruption and inflammation.",
    world: "Permitted in the EU (E433) and the US. Most concerning research is in animals, so human impact is still unclear." },
  { name: "Mono- and diglycerides", type: "watch", level: 1, match: ["mono- and diglycerides", "monoglycerides", "diglycerides", "mono and diglycerides", "e471"],
    found: "Bread, peanut butter, ice cream, margarine, baked goods",
    reason: "Emulsifiers made from fats. They can contain small amounts of trans fat that never appear on the nutrition label.",
    world: "Permitted worldwide. The hidden trans fat is the reason for the caution." },
  { name: "Cellulose gum & thickeners", type: "watch", level: 1, match: ["carboxymethylcellulose", "cellulose gum", "microcrystalline cellulose", "xanthan gum", "guar gum", "e466"],
    found: "Sauces, gluten-free bread, light ice cream, shredded cheese, dressings",
    reason: "Texture additives that are generally safe in small amounts, but heavy use signals ultra-processed food and may bother sensitive guts.",
    world: "Permitted worldwide. Some emulsifier and thickener research suggests effects on gut bacteria, but results are early." },
  { name: "Refined / seed oils", type: "watch", level: 1, match: ["soybean oil", "canola oil", "corn oil", "cottonseed oil", "vegetable oil", "palm oil", "sunflower oil", "safflower oil", "rapeseed oil"],
    found: "Chips, cookies, fried foods, dressings, frozen meals, margarine",
    reason: "Heavily refined oils are common in ultra-processed food. Palm oil is high in saturated fat and has environmental concerns.",
    world: "The WHO recommends replacing saturated and trans fats with unsaturated fats, so the oils themselves are not villains. The concern is heating and refining in junk food." },
  { name: "Enriched / bleached flour", type: "watch", level: 1, match: ["enriched flour", "bleached flour", "enriched wheat flour", "white flour", "wheat flour"],
    found: "White bread, pasta, crackers, pastries, cookies",
    reason: "Refined grain stripped of fiber and most nutrients, then partly added back. It digests quickly and spikes blood sugar.",
    world: "Flour fortification (iron, folic acid, B vitamins) is mandatory in over 80 countries to prevent deficiencies, so enriched flour is not harmful, just lower in fiber than whole grain." },
  { name: "Phosphates", type: "watch", level: 1, match: ["sodium phosphate", "phosphoric acid", "calcium phosphate", "disodium phosphate", "trisodium phosphate", "sodium aluminum phosphate", "sodium aluminium phosphate", "e338", "e450", "e451"],
    found: "Cola, processed meat, processed cheese, baked goods, frozen foods",
    reason: "Phosphate additives are absorbed very easily and, in excess, are linked to kidney and bone stress, especially for people with kidney disease.",
    world: "EFSA's 2019 review said some groups, such as young children, may exceed safe intake once additive and natural phosphorus are added up." },
  { name: "Salt (sodium)", type: "watch", level: 1, match: ["monosodium", "sodium chloride", "salt"],
    found: "Soups, deli meat, chips, canned food, sauces, bread",
    reason: "Salt is fine in moderation, but processed food packs a large share of the daily limit, which raises blood pressure.",
    world: "The WHO recommends under 5 g of salt (2 g sodium) per day. The UK, Chile, South Africa and others set salt targets for manufacturers." },
  { name: "Propylene glycol", type: "watch", level: 1, match: ["propylene glycol", "e1520"],
    found: "Salad dressing, flavorings, baked goods, drinks",
    reason: "A solvent and moisture-holder related to antifreeze, though far less toxic. Considered safe in small amounts but unnecessary.",
    world: "Permitted in the EU (E1520), the US and others at low levels." },

  /* ================= GREEN (GOOD) ================= */
  { name: "Whole grains", type: "good", match: ["whole grain", "whole wheat", "whole oat", "rolled oats", "oats", "brown rice", "quinoa", "barley", "buckwheat", "millet", "whole rye", "sprouted"],
    found: "Oatmeal, whole wheat bread, brown rice, quinoa, barley soup",
    reason: "Keep the fiber, B vitamins and minerals of the grain. Linked to better heart health, digestion and steadier blood sugar.",
    world: "Dietary guidelines from the WHO, the EU, Brazil, Canada and Japan all recommend whole grains over refined grains." },
  { name: "Fruit & vegetables", type: "good", match: ["apple", "banana", "blueberr", "strawberr", "raspberr", "spinach", "kale", "broccoli", "carrot", "tomato", "sweet potato", "beet", "pumpkin", "avocado", "orange", "lemon", "mango", "cherry", "cherries", "pineapple", "cucumber", "pepper", "onion", "garlic", "mushroom", "cauliflower", "zucchini", "cabbage"],
    found: "Fresh, frozen and dried produce, sauces, soups",
    reason: "Whole fruits and vegetables deliver vitamins, fiber and antioxidants with few calories.",
    world: "The WHO recommends at least 400 g of fruit and vegetables a day." },
  { name: "Legumes & beans", type: "good", match: ["lentil", "chickpea", "black bean", "kidney bean", "pinto bean", "navy bean", "peas", "edamame", "lupin"],
    found: "Hummus, chili, dal, soups, veggie burgers",
    reason: "Rich in plant protein and fiber, which support fullness, gut health and cholesterol control.",
    world: "Staple of the Mediterranean, Indian, Mexican and Japanese diets, all linked to long lifespans." },
  { name: "Nuts & seeds", type: "good", match: ["almond", "walnut", "pecan", "cashew", "pistachio", "hazelnut", "chia", "flax", "hemp seed", "pumpkin seed", "sunflower seed", "sesame", "tahini"],
    found: "Nut butters, trail mix, granola, tahini, seed crackers",
    reason: "Provide healthy unsaturated fats, protein, vitamin E and minerals. Chia and flax add omega-3 fats and fiber.",
    world: "Allergens in many countries. Sesame is a required allergen label in the EU, US, Canada and Australia." },
  { name: "Olive & avocado oil", type: "good", match: ["olive oil", "extra virgin", "avocado oil"],
    found: "Dressings, hummus, canned fish, sauces",
    reason: "Rich in monounsaturated fat and antioxidants, tied to lower heart disease risk.",
    world: "The core fat of the Mediterranean diet, which has the strongest evidence for heart health." },
  { name: "Omega-3 sources", type: "good", match: ["salmon", "sardine", "anchov", "mackerel", "fish oil", "algal oil", "krill"],
    found: "Canned fish, fortified eggs, supplements",
    reason: "Provide EPA and DHA omega-3 fats that support heart and brain health.",
    world: "Many national guidelines, including the UK, EU and Japan, recommend eating oily fish about once or twice a week." },
  { name: "Lean protein", type: "good", match: ["chicken breast", "turkey", "egg white", "whey protein", "pea protein", "tofu", "tempeh", "greek yogurt", "cottage cheese", "eggs", "egg"],
    found: "Plain yogurt, tofu, eggs, protein products",
    reason: "Quality protein supports muscle, fullness and steady energy.",
    world: "Allergens in the EU (14 listed), US (9 listed) and elsewhere: eggs, milk, soy and fish must be highlighted." },
  { name: "Fiber", type: "good", match: ["fiber", "fibre", "inulin", "chicory root", "psyllium", "oat fiber", "beta glucan", "resistant starch"],
    found: "Cereals, bars, whole grains, beans, fruit",
    reason: "Feeds good gut bacteria, supports digestion and helps control cholesterol and blood sugar.",
    world: "The WHO recommends at least 25 g of fiber a day for adults. Added fibers like inulin are fine but whole foods are better." },
  { name: "Probiotics & ferments", type: "good", match: ["live and active cultures", "live cultures", "lactobacillus", "bifidobacterium", "acidophilus", "kefir", "kimchi", "sauerkraut", "kombucha", "miso", "fermented"],
    found: "Yogurt, kefir, kimchi, sauerkraut, miso, tempeh",
    reason: "Supply beneficial bacteria that may support gut and immune health.",
    world: "Fermented food is traditional across Korea, Japan, Eastern Europe and the Middle East." },
  { name: "Herbs & spices", type: "good", match: ["turmeric", "ginger", "cinnamon", "oregano", "basil", "rosemary", "thyme", "parsley", "cilantro", "cumin", "paprika", "cayenne", "black pepper", "cardamom", "clove"],
    found: "Seasonings, sauces, teas, spice blends",
    reason: "Add flavor without salt or sugar and contain antioxidant and anti-inflammatory plant compounds.",
    world: "Used medicinally and in cooking across India, China, the Middle East and Africa for thousands of years." },
  { name: "Vitamins & minerals", type: "good", match: ["vitamin c", "ascorbic acid", "vitamin d", "vitamin e", "tocopherol", "vitamin b12", "folate", "folic acid", "magnesium", "zinc", "iron", "potassium chloride", "calcium carbonate", "selenium", "niacin", "riboflavin", "thiamin"],
    found: "Fortified cereals, flours, plant milks, vitamins",
    reason: "Essential nutrients. Vitamin C and E (tocopherols) also work as natural preservatives, a good sign versus synthetic ones.",
    world: "Fortification programs recommended by the WHO prevent deficiencies such as spina bifida (folic acid) and anemia (iron)." },
  { name: "Natural sweeteners (low impact)", type: "good", match: ["stevia", "monk fruit", "luo han guo", "raw honey", "dates", "date paste"],
    found: "Reduced-sugar drinks, tea, energy balls, yogurt",
    reason: "Plant-based or whole-food sweeteners with less blood sugar impact than refined sugar. Honey and dates still count as sugar, so use sparingly.",
    world: "Stevia glycosides are approved by JECFA, EFSA, the FDA and Health Canada." },
  { name: "Dark chocolate / cocoa", type: "good", match: ["cocoa", "cacao", "dark chocolate"],
    found: "Dark chocolate, cocoa powder, nibs",
    reason: "Rich in flavanols linked to heart and blood vessel benefits. Look for low added sugar.",
    world: "EFSA approved a health claim for cocoa flavanols and normal blood vessel function." },
  { name: "Green tea & matcha", type: "good", match: ["green tea", "matcha"],
    found: "Tea, matcha powder, drinks",
    reason: "Contains catechin antioxidants such as EGCG that support heart and metabolic health.",
    world: "Traditional in Japan and China, where regular tea drinking is linked to better health outcomes." },
  { name: "Coconut & healthy fats", type: "good", match: ["coconut water", "coconut milk", "ghee", "grass-fed", "grass fed"],
    found: "Curries, plant milks, cooking fats",
    reason: "Natural whole-food fats and hydration sources that are far less processed than refined oils. Coconut milk is still high in saturated fat.",
    world: "Traditional in South Asia, Southeast Asia and the Pacific. Guidelines still say to limit saturated fat." },
  { name: "Organic / simple ingredients", type: "good", match: ["organic", "no preservatives", "unsweetened"],
    found: "Whole-food products, simple pantry staples",
    reason: "Signals less processing and fewer synthetic additives. Always check the full list to confirm.",
    world: "'Organic' is regulated differently in the US (USDA Organic), EU (leaf logo), Canada, Japan and elsewhere." }
];

/* colors: red / yellow / green */
window.INGREDIENT_DB.forEach(e => { e.color = e.type === "good" ? "green" : e.type === "neutral" ? "neutral" : (e.level >= 2 ? "red" : "yellow"); });

/* ---------- Analyzer ---------- */
window.IngredientEngine = {
  /* Strip "Ingredients:" heading and trailing "contains" lines */
  clean(raw) {
    return (raw || "")
      .replace(/\r?\n+/g, " ")
      .replace(/^[\s\S]*?ingredients?\s*[:\-]/i, "")
      .replace(/\bcontains\b[^.]*\.?\s*$/i, "")
      .replace(/\*/g, "")
      .replace(/\s+/g, " ")
      .trim();
  },

  /* Split on commas that are not inside brackets */
  splitTop(text) {
    const parts = []; let depth = 0, cur = "";
    for (const ch of text) {
      if (ch === "(" || ch === "[") depth++;
      if (ch === ")" || ch === "]") depth = Math.max(0, depth - 1);
      if ((ch === "," || ch === ";" || ch === "•" || ch === "·") && depth === 0) { parts.push(cur); cur = ""; }
      else cur += ch;
    }
    parts.push(cur);
    return parts.map(p => p.trim().replace(/\.$/, "")).filter(Boolean);
  },

  /* All ingredient tokens, including the sub-ingredients inside brackets */
  parse(raw) {
    const out = [];
    this.splitTop(this.clean(raw)).forEach(t => {
      out.push(t);
      const m = t.match(/[(\[](.+)[)\]]/);
      if (m) m[1].split(/[,;]/).forEach(s => { const x = s.trim(); if (x) out.push(x); });
    });
    return [...new Set(out)];
  },

  /* DB entries that match one token */
  matches(token) {
    const low = " " + token.toLowerCase() + " ";
    return window.INGREDIENT_DB.filter(entry =>
      entry.match.some(frag => low.includes(frag.startsWith(" ") ? frag : (frag.length <= 4 ? " " + frag : frag))) &&
      !(entry.not || []).some(n => low.includes(n)));
  },

  /* The label as colored pieces: red > yellow > green > plain */
  highlight(raw) {
    const rank = { red: 3, yellow: 2, green: 1, neutral: 0.5 };
    return this.splitTop(this.clean(raw)).map(text => {
      const found = this.matches(text);
      let color = "plain";
      found.forEach(e => { if ((rank[e.color] || 0) > (rank[color] || 0)) color = e.color; });
      return { text, color, names: found.map(e => e.name) };
    });
  },

  analyze(raw) {
    const tokens = this.parse(raw);
    const watch = new Map(), good = new Map(), neutral = new Map();
    tokens.forEach(token => {
      this.matches(token).forEach(entry => {
        const bucket = entry.type === "watch" ? watch : entry.type === "neutral" ? neutral : good;
        if (!bucket.has(entry.name)) bucket.set(entry.name, { entry, found: [] });
        bucket.get(entry.name).found.push(token);
      });
    });
    const watchList = [...watch.values()].sort((a, b) => b.entry.level - a.entry.level);
    const redList = watchList.filter(w => w.entry.color === "red");
    const yellowList = watchList.filter(w => w.entry.color === "yellow");
    const goodList = [...good.values()];
    let score = 70;
    watchList.forEach(w => score -= w.entry.level * 6);
    goodList.forEach(() => score += 4);
    score = Math.max(0, Math.min(100, Math.round(score)));
    const neutralList = [...neutral.values()];
    const matched = new Set([...watchList, ...goodList, ...neutralList].flatMap(x => x.found));
    return { tokens, watchList, redList, yellowList, goodList, neutralList, score, unmatched: tokens.filter(t => !matched.has(t)) };
  }
};

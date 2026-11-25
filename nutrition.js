/* LabelLens nutrition + ingredient-list extraction.
   - LEXICON: real food/additive words used to decide what is an ingredient.
   - parse(): reads Nutrition Facts rows (calories, fat, sodium...) so they are TRACKED, not treated as ingredients.
   - extractIngredients(): keeps only the ingredient list from messy label text. */
(() => {
  const LEX = new Set(`water salt sugar syrup honey molasses flour wheat corn maize rice oat oats barley rye spelt millet quinoa buckwheat sorghum tapioca potato sweet
  starch bran germ semolina durum cornmeal grits cornstarch oil palm soybean soy canola rapeseed sunflower safflower cottonseed peanut olive avocado coconut sesame flaxseed linseed
  grapeseed walnut almond cashew pecan hazelnut pistachio macadamia seeds chia hemp pumpkin milk cream butter buttermilk cheese cheddar mozzarella parmesan yogurt yoghurt whey casein
  lactose egg eggs yolk albumen chicken beef pork turkey lamb bacon ham sausage fish salmon tuna cod anchovy shrimp crab lobster krill gelatin collagen broth stock bone
  tomato tomatoes onion garlic ginger pepper peppers paprika chili chilli cayenne cumin turmeric cinnamon nutmeg clove cardamom coriander parsley basil oregano thyme rosemary sage dill mustard
  vinegar lemon lime orange apple grape banana berry strawberry blueberry raspberry cranberry cherry peach pear plum mango pineapple date fig raisin prune carrot celery spinach kale cabbage
  broccoli cauliflower lettuce cucumber pickle beet beans bean lentil chickpea pea peas lupin cocoa chocolate cacao vanilla coffee tea matcha caffeine yeast malt hops maltodextrin dextrose fructose
  glucose sucrose lactose maltose sorbitol xylitol erythritol mannitol maltitol isomalt stevia sucralose aspartame saccharin acesulfame monk fruit lecithin glycerin glycerol pectin agar carrageenan
  gum guar xanthan gellan acacia arabic locust cellulose methylcellulose carboxymethylcellulose inulin chicory fiber psyllium konjac citric ascorbic acetic lactic malic tartaric phosphoric sorbic benzoic
  propionic fumaric sodium potassium calcium magnesium iron zinc copper manganese selenium iodine chloride carbonate bicarbonate hydroxide sulfate sulphate sulfite sulphite phosphate nitrite nitrate
  benzoate sorbate propionate lactate citrate acetate stearate palmitate oleate tartrate glutamate monosodium disodium dipotassium trisodium monoglycerides diglycerides polysorbate sorbitan
  mono diglyceride emulsifier stabilizer thickener antioxidant preservative flavor flavour flavors flavoring natural artificial spice spices seasoning extract concentrate isolate protein hydrolyzed
  hydrogenated partially interesterified shortening margarine lard tallow ghee color colour colors dye caramel annatto carotene beta lycopene lutein paprika turmeric curcumin beetroot spirulina
  carmine cochineal titanium dioxide silicon silica talc shellac beeswax carnauba wax glaze enriched bleached unbleached niacin riboflavin thiamine thiamin folic folate biotin pantothenic pyridoxine
  cobalamin cyanocobalamin tocopherol tocopherols retinyl palmitate cholecalciferol ergocalciferol vitamin vitamins minerals yeast autolyzed torula bht bha tbhq edta azodicarbonamide bromate
  brominated vegetable propylene glycol polydextrose sucralose rennet enzymes enzyme cultures culture probiotic lactobacillus bifidobacterium cultured fermented kombucha kefir tempeh miso natto
  seaweed kelp nori spirulina chlorella algae agave maple cane beet juice puree paste powder flakes pieces dried dehydrated fresh frozen smoked roasted toasted sprouted whole grain grains organic
  gluten crustaceans mollusks sulphites contain contains traces less than following`.split(/\s+/));
  const E_NUM = /\b(?:e|ins)[\s-]?\d{3,4}[a-z]?\b/i;

  /* ----- nutrition ----- */
  const FIELDS = [
    { k: "cal", label: "Calories", unit: "kcal", dv: 2000 },
    { k: "fat", label: "Total fat", unit: "g", dv: 78 },
    { k: "sat", label: "Saturated fat", unit: "g", dv: 20 },
    { k: "trans", label: "Trans fat", unit: "g", dv: 0, note: "No daily value. As low as possible." },
    { k: "chol", label: "Cholesterol", unit: "mg", dv: 300 },
    { k: "sod", label: "Sodium", unit: "mg", dv: 2300 },
    { k: "carb", label: "Total carbs", unit: "g", dv: 275 },
    { k: "fib", label: "Fiber", unit: "g", dv: 28, good: true },
    { k: "sug", label: "Total sugars", unit: "g", dv: 0 },
    { k: "add", label: "Added sugars", unit: "g", dv: 50 },
    { k: "pro", label: "Protein", unit: "g", dv: 50, good: true }
  ];
  const num = s => { const v = parseFloat(String(s).replace(",", ".")); return isNaN(v) ? null : v; };
  function fixDigits(t) { // common OCR slips inside nutrition rows
    return t.replace(/\b[Oo](?=\s?(?:g|mg|mcg)\b)/g, "0").replace(/(\d)[Oo](?=\s?(?:g|mg|mcg)\b)/g, "$10").replace(/(\d),(\d)\s?g/g, "$1.$2 g");
  }
  const RX = {
    cal: [/calories\s*(?:per serving)?\s*[:\-]?\s*(\d{2,4})/i],
    fat: [/total\s*fat\s*(\d+(?:[.,]\d+)?)\s*g/i],
    sat: [/sat(?:urated)?\.?\s*fat\s*(\d+(?:[.,]\d+)?)\s*g/i],
    trans: [/trans\s*fat\s*(\d+(?:[.,]\d+)?)\s*g/i],
    chol: [/cholesterol\s*(\d+(?:[.,]\d+)?)\s*mg/i],
    sod: [/sodium\s*(\d+(?:[.,]\d+)?)\s*mg/i],
    carb: [/total\s*carb\w*\.?\s*(\d+(?:[.,]\d+)?)\s*g/i],
    fib: [/(?:dietary\s*)?fib(?:er|re)\s*(\d+(?:[.,]\d+)?)\s*g/i],
    sug: [/total\s*sugars?\s*(\d+(?:[.,]\d+)?)\s*g/i],
    add: [/includes\s*(\d+(?:[.,]\d+)?)\s*g\s*added/i, /added\s*sugars?\s*(\d+(?:[.,]\d+)?)\s*g/i],
    pro: [/protein\s*(\d+(?:[.,]\d+)?)\s*g/i]
  };
  function parse(text) {
    const t = fixDigits(" " + String(text || "") + " "), out = {}; let n = 0;
    for (const f of FIELDS) for (const r of RX[f.k]) { const m = t.match(r); if (m) { const v = num(m[1]); if (v != null) { out[f.k] = v; n++; break; } } }
    const sv = t.match(/serving\s*size\s*[:\-]?\s*([^\n]{2,40}?)(?=\s+(?:servings|amount|calories|per)\b|$)/i);
    if (sv) out.serving = sv[1].trim();
    out._n = n; return out;
  }

  /* ----- ingredient list extraction ----- */
  const NUTRI_WORD = /\b(calories|total\s*fat|saturated\s*fat|sat\.?\s*fat|trans\s*fat|polyunsaturated|monounsaturated|cholesterol|total\s*carb\w*|dietary\s*fib\w*|total\s*sugars?|added\s*sugars?|serving\s*size|servings?\s*per|daily\s*value|amount\s*per|%\s*dv|not\s*a\s*significant)\b/i;
  const NUTRI_ROW = /^(?:sodium|protein|fiber|fibre|potassium|calcium|iron|vitamin\s*d)\s*[\d.,]+\s*(?:g|mg|mcg|µg|%)/i;
  const STOP = /\b(?:contains(?!\s*(?:\d|less|the following|one or more))|allergen\s*(?:info|advice)|distributed|manufactured|produced\s*(?:in|by)|made\s*in|packed|nutrition\s*facts|supplement\s*facts|best\s*(?:by|before)|use\s*by|net\s*(?:wt|weight)|www\.|©|keep\s*refrigerated|storage|directions|questions\??|barcode)\b/i;
  function isIngredientish(seg) {
    if (E_NUM.test(seg)) return true;
    const toks = seg.toLowerCase().split(/[^a-z]+/).filter(w => w.length >= 3);
    if (!toks.length) return false;
    if (toks.some(w => LEX.has(w))) return true;
    if (window.INGREDIENT_DB && window.IngredientEngine && window.IngredientEngine.matches(seg).length) return true;
    return toks.length <= 3 && !/\d/.test(seg);          // short unknown names stay (shown gray)
  }
  function extractIngredients(text) {
    let t = String(text || "").replace(/\s+/g, " ");
    const h = t.search(/ingredients?\s*[:;.\-]?/i);
    if (h >= 0) t = t.slice(h).replace(/^ingredients?\s*[:;.\-]?\s*/i, "");
    const stop = t.search(STOP); if (stop > 0) t = t.slice(0, stop);
    const IE = window.IngredientEngine;
    const segs = IE ? IE.splitTop(t) : t.split(",");
    const keep = segs.map(s => s.replace(/\s+/g, " ").trim()).filter(s => s && !NUTRI_WORD.test(s) && !NUTRI_ROW.test(s) && !/^[\d\s.,%gmc]+$/i.test(s) && s.length >= 3 && s.length <= 90 && isIngredientish(s));
    return { text: keep.join(", "), count: keep.length, hasHeading: h >= 0 };
  }
  window.LLNut = { FIELDS, parse, extractIngredients, LEX, isIngredientish };
})();

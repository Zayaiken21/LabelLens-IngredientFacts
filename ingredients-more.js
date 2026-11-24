/* More ingredients, incl. toothpaste and personal-care items. Loaded after ingredients-extra.js. */
(() => {
  const DB = window.INGREDIENT_DB;
  const add = (name, type, level, match, found, reason, world, not) => {
    const e = { name, type, level: level || 0, match, found, reason, world, not };
    e.color = type === "good" ? "green" : type === "neutral" ? "neutral" : (level >= 2 ? "red" : "yellow");
    DB.push(e);
  };
  add("Fluoride (toothpaste & water)", "watch", 1, ["sodium fluoride", "stannous fluoride", "sodium monofluorophosphate", "monofluorophosphate", "fluoride"],
    "Toothpaste, mouthwash, fluoridated water, some teas",
    "Topical fluoride reduces tooth decay. Swallowing too much while teeth form can cause dental fluorosis, so children should use only a smear (under 3) or pea-sized amount (3 to 6) and spit. A 2024 US NTP review found an association with lower child IQ at water levels above 1.5 mg/L. Check your local water level and ask your dentist what fits you.",
    "Recommended for cavity prevention by WHO, FDI and US agencies. Some countries (for example much of Western Europe) do not fluoridate water but use fluoridated salt or toothpaste.");
  add("Sodium lauryl sulfate (SLS)", "watch", 1, ["sodium lauryl sulfate", "sodium laureth sulfate", "sls", "sodium dodecyl sulfate"],
    "Toothpaste, shampoo, body wash, cleaners",
    "A foaming detergent. It is not shown to cause cancer, but it can irritate skin and the mouth in sensitive people, and some people with frequent canker sores do better without it.",
    "Permitted in the EU, US and elsewhere in cosmetics at set limits.");
  add("Triclosan", "watch", 2, ["triclosan", "triclocarban"],
    "Older antibacterial soaps, some toothpaste and cosmetics",
    "An antibacterial chemical. The US FDA removed it from consumer antiseptic washes in 2016 because makers did not show it was safe and effective. It can disrupt hormone signaling in animal studies and builds up in the environment.",
    "The EU restricted triclosan in hygiene products and limits it in cosmetics. Many toothpaste makers have dropped it.");
  add("Aluminum additives", "watch", 1, ["sodium aluminum phosphate", "sodium aluminum sulfate", "aluminum sulfate", "aluminium", "aluminum lake", "e554", "e520", "e541", "e173"],
    "Some baking powders, processed cheese, cake mixes, colored candy coatings",
    "Used as leavening acids, anti-caking agents and in color lakes. Health agencies set a tolerable weekly intake and say most people stay under it, but heavy intake from processed food adds up, and people with kidney disease are more sensitive.",
    "The EU restricted several aluminum additives in 2012 and set limits. JECFA set a tolerable weekly intake of 2 mg per kg body weight.");
  add("Shellac / confectioner's glaze", "watch", 1, ["shellac", "confectioner's glaze", "confectioners glaze", "e904", "pharmaceutical glaze"],
    "Candy coatings, glossy fruit, pills, chocolate-covered snacks",
    "A resin secreted by the lac insect. Considered safe to eat, but it is not vegan or vegetarian and signals a coated, processed food.",
    "Permitted in the EU (E904) and US.");
  add("L-cysteine", "neutral", 0, ["l-cysteine", "cysteine hydrochloride", "e920"],
    "Bagels, commercial bread, pizza dough",
    "An amino acid used to soften dough. Some is made from hair or feathers, some by fermentation, so check if you avoid animal sources.",
    "Permitted in the EU (E920) and US.");
  add("Silicon dioxide (anti-caking)", "neutral", 0, ["silicon dioxide", "silica", "hydrated silica", "e551"],
    "Spice mixes, powdered drinks, salt, supplements, toothpaste (as an abrasive)",
    "A mineral used to keep powders flowing. Food-grade silica has been assessed as safe at approved levels by EFSA and others.",
    "Permitted in the EU (E551) and US.");
  add("Emulsifiers (DATEM, SSL, polyglycerol esters)", "watch", 1, ["datem", "sodium stearoyl lactylate", "stearoyl lactylate", "polyglycerol", "e472e", "e481", "e475", "lactylate"],
    "Commercial bread, buns, cake mixes, creamers, whipped toppings",
    "Dough and texture improvers. They are approved, but they are a marker of highly processed baked goods, and lab and animal work on emulsifiers and gut bacteria is still being studied.",
    "Permitted in the EU and US at approved levels.");
  add("Sucralose", "watch", 1, ["sucralose", "splenda", "e955"],
    "Diet drinks, protein powders, sugar-free sweets, flavored water",
    "A zero-calorie sweetener. WHO's 2023 guideline advises against using non-sugar sweeteners for weight control because long-term benefits were not shown. Lab studies on a by-product are still being examined.",
    "Permitted in the EU (E955), US and many other countries with an acceptable daily intake.");
  add("Acesulfame potassium", "watch", 1, ["acesulfame", "ace-k", "ace k", "e950"],
    "Diet soda, zero-sugar drinks, gum, protein products",
    "A zero-calorie sweetener, often blended with others. Approved at set limits, but the same WHO advice about non-sugar sweeteners applies.",
    "Permitted in the EU (E950), US and many other countries.");
  add("Yeast extract", "watch", 1, ["yeast extract", "autolyzed yeast", "torula yeast", "e640"],
    "Soups, broths, chips, instant noodles, seasoning mixes",
    "A natural source of glutamate that works like MSG without using the name. Fine for most people, but those who feel sensitive to MSG may react to it.",
    "Permitted worldwide as a food ingredient.");
  add("Inulin & chicory root fiber", "neutral", 0, ["inulin", "chicory root", "chicory fiber", "oligofructose", "fructooligosaccharide"],
    "Bars, yogurt, fiber-added foods, cereals",
    "A prebiotic fiber that feeds gut bacteria. Useful in small amounts, but large amounts cause gas and bloating, especially in people with IBS.",
    "Permitted worldwide; the EU recognizes a digestive claim for chicory inulin.");
  add("Pectin, guar & xanthan gums", "neutral", 0, ["pectin", "guar gum", "xanthan gum", "gellan gum", "locust bean gum", "gum arabic", "acacia gum"],
    "Jam, sauces, dressings, plant milks, ice cream",
    "Plant or fermentation-based thickeners. Generally well tolerated in food amounts, though large amounts can cause gas.",
    "Permitted in the EU and US.");
})();

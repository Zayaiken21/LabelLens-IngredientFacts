/* LabelLens extended ingredient database (loaded after ingredients.js).
   Adds more additives, neutral/harmless ingredients, allergens and extra healthy foods,
   and widens the names matched by existing entries. */
(() => {
  const DB = window.INGREDIENT_DB;
  const add = (name, type, level, match, found, reason, world, not) =>
    DB.push({ name, type, level: level || 0, match, found, reason, world, not });
  const extend = (name, match, not) => {
    const e = DB.find(x => x.name === name);
    if (!e) return;
    e.match = e.match.concat(match || []);
    if (not) e.not = (e.not || []).concat(not);
  };

  /* ---- widen existing entries ---- */
  extend("Added sugar", ["cane juice", "dehydrated cane juice", "fructose", "glucose", "crystalline fructose", "corn syrup solids", "cane syrup", "maple syrup", "honey", "sorghum syrup", "date syrup", "coconut sugar", "palm sugar", "jaggery", "demerara", "muscovado", "barley malt", "brown rice syrup", "powdered sugar", "confectioners sugar"], ["oligosaccharide", "sugar alcohol", "sugar free", "sugar-free"]);
  extend("Natural / artificial flavors", ["vanillin", "ethyl vanillin", "smoke flavor", "natural smoke", "spice extractives", "flavor", "flavour"]);
  extend("MSG & flavor enhancers", ["hydrolyzed soy protein", "hydrolyzed corn protein", "protein hydrolysate", "glutamic acid", "glutamate", "autolyzed"]);
  extend("Phosphates", ["sodium hexametaphosphate", "sodium tripolyphosphate", "tetrasodium pyrophosphate", "sodium acid pyrophosphate", "polyphosphate", "pyrophosphate"]);
  extend("Refined / seed oils", ["palm kernel oil", "grapeseed oil", "rice bran oil", "peanut oil", "partially hydrogenated soybean"]);
  extend("Artificial colors", ["e102", "e110", "e122", "e124", "e129", "e133", "e142", "e127", "e132", "e131", "e104", "color added", "colour added"]);
  extend("Sodium nitrite / nitrate", ["curing salt", "pink salt", "prague powder"]);
  extend("Whole grains", ["amaranth", "teff", "farro", "freekeh", "bulgur", "sorghum", "wild rice", "whole spelt", "kamut", "whole corn", "whole barley", "sourdough"]);
  extend("Fruit & vegetables", ["arugula", "bok choy", "brussels sprout", "collard", "chard", "lettuce", "asparagus", "eggplant", "radish", "turnip", "squash", "leek", "fennel", "peach", "pear", "plum", "grape", "kiwi", "pomegranate", "fig", "papaya", "watermelon", "melon", "peppers", "scallion", "beetroot", "okra", "green bean", "corn kernel", "cranberr", "blackberr"]);
  extend("Probiotics & ferments", ["natto", "kvass", "sourdough starter", "yogurt cultures", "cultured vegetables", "cultured"]);
  extend("Olive & avocado oil", ["olives"]);
  extend("Herbs & spices", ["mint", "dill", "sage", "chives", "tarragon", "bay leaf", "coriander", "fenugreek", "nutmeg", "saffron", "star anise", "garlic powder", "onion powder"]);

  /* ---- more watch list ---- */
  add("Shortening & margarine", "watch", 1, ["shortening", "margarine", "interesterified"],
    "Pastry, cookies, frosting, popcorn, packaged baked goods",
    "Solid fats made by processing oils. Modern versions contain far less trans fat than old ones, but they are refined and mostly appear in ultra-processed baked goods and snacks.",
    "Most countries now limit industrial trans fat. Look for 'hydrogenated' in the same list to see if it is still there.");
  add("Natural nitrite sources (celery powder)", "watch", 2, ["celery powder", "celery juice powder", "cultured celery", "celery juice", "cherry powder"],
    "'Uncured' bacon, ham, hot dogs and deli meats",
    "Celery and cherry powders are rich in natural nitrate that turns into nitrite, doing the same job as synthetic curing agents. 'Uncured' or 'no nitrites added' meats still contain nitrite.",
    "The IARC classes processed meat as carcinogenic to humans (Group 1) whether the nitrite is synthetic or from vegetables.");
  add("Carmine (cochineal)", "watch", 1, ["carmine", "cochineal", "e120", "natural red 4"],
    "Red and pink drinks, yogurt, candy, ice cream, cosmetics",
    "A red dye made from crushed insects. It can trigger allergic reactions in some people and is not vegetarian or vegan.",
    "The US has required it to be named on labels since 2011. The EU lists it as E120.");
  add("EDTA", "watch", 1, ["calcium disodium edta", "disodium edta", "edta", "e385"],
    "Mayonnaise, dressings, canned beans, soda, sauces",
    "A preservative that locks up metals to protect color and flavor. Safe at approved levels, but it can reduce mineral absorption and signals processed food.",
    "Permitted in the EU (E385), the US and others with low limits.");
  add("Dimethylpolysiloxane (anti-foam)", "watch", 1, ["dimethylpolysiloxane", "polydimethylsiloxane", "dimethyl polysiloxane", "e900"],
    "Fried foods, fast-food frying oil, some drinks and sauces",
    "A silicone anti-foaming agent. Approved in tiny amounts but an odd thing to find in food.",
    "Permitted in the EU (E900), the US and other regions at low limits.");
  add("Polydextrose", "watch", 1, ["polydextrose", "e1200"],
    "Low-sugar bars, diet desserts, light ice cream, fiber-fortified foods",
    "A synthetic bulking fiber. It is poorly digested, so large amounts can cause gas and loose stools.",
    "The EU requires a laxative-effect warning when intake could be high.");
  add("Soy protein isolate & textured protein", "watch", 1, ["soy protein isolate", "textured vegetable protein", "textured soy", "tvp", "protein isolate", "isolated soy protein"],
    "Protein bars, meat substitutes, cereal, shakes, processed meats",
    "A highly processed protein extract. Fine occasionally, but it often stands in for real foods in ultra-processed products.",
    "Permitted worldwide. Soy is also a major allergen.", ["soy sauce"]);
  add("Mechanically separated meat", "watch", 1, ["mechanically separated", "mechanically recovered", "meat by-product", "meat byproduct"],
    "Hot dogs, chicken nuggets, bologna, some canned meats",
    "Meat forced off the bone as a paste, lower in quality than whole cuts and a marker of highly processed meat products.",
    "Both the EU and the US require it to be named on the label.");
  add("Caffeine & stimulants", "watch", 1, ["caffeine", "guarana"],
    "Energy drinks, soda, coffee, tea, pre-workout, some bars",
    "A stimulant. Moderate amounts are fine for most adults, but it can disturb sleep, raise heart rate and is not advised in large amounts for children or during pregnancy.",
    "EFSA considers up to 400 mg a day safe for most adults, and 200 mg a day during pregnancy. Several countries restrict energy-drink sales to minors.");

  /* ---- neutral (generally harmless) ---- */
  const N = (name, match, found, reason, not) => add(name, "neutral", 0, match, found, reason, "", not);
  N("Water", ["water"], "Almost everything", "Plain water as an ingredient is harmless. It simply tells you the product is diluted, so ingredients listed after it are in smaller amounts.", ["coconut water"]);
  N("Food acids", ["citric acid", "lactic acid", "malic acid", "tartaric acid", "cream of tartar", "fumaric acid", "acetic acid", "ascorbic acid"], "Drinks, candy, sauces, jams", "Acids add tang and protect freshness. Found naturally in fruit and fermented food, and safe at normal levels.");
  N("Vinegar", ["vinegar"], "Dressings, pickles, sauces", "A fermented acid used for flavor and preservation. Harmless and often a sign of simple food.");
  N("Lecithin", ["lecithin", "e322"], "Chocolate, bread, dressings, spreads", "A natural emulsifier from soy, sunflower or egg that mixes oil and water. Safe at food levels. Soy or egg versions matter for allergies.");
  N("Pectin, agar & natural gums", ["pectin", "agar", "gum arabic", "acacia gum", "locust bean", "carob bean gum", "gellan", "tara gum", "sodium alginate", "alginate"], "Jams, jelly, dairy-free yogurt, desserts", "Plant or seaweed thickeners that give texture. Generally safe and gentler than synthetic thickeners.");
  N("Gelatin", ["gelatin", "gelatine"], "Gummies, marshmallows, desserts, capsules", "A protein made from animal collagen. Harmless for most people, but not vegetarian, vegan, halal or kosher unless stated.");
  N("Leavening agents", ["baking soda", "sodium bicarbonate", "baking powder", "ammonium bicarbonate"], "Bread, cakes, cookies, pancakes", "Gas-making ingredients that make dough rise. Harmless in baked goods.");
  N("Yeast", ["yeast"], "Bread, pizza dough, beer, spreads", "A living fungus used for rising and fermenting. Harmless (yeast extract and autolyzed yeast are listed separately).", ["extract", "autolyzed"]);
  N("Starches", ["cornstarch", "corn starch", "potato starch", "tapioca", "arrowroot", "modified food starch", "modified starch", "rice starch", "starch"], "Soups, sauces, puddings, snacks", "Thickeners made from plants. Fine, though 'modified starch' hints at a processed food.", ["resistant starch"]);
  N("Glycerin", ["glycerin", "glycerol", "glycerine"], "Bars, candies, baked goods", "A moisture-holder from plant or animal fat. Safe at food levels.");
  N("Anti-caking agents", ["silicon dioxide", "magnesium stearate", "stearic acid", "calcium silicate", "tricalcium phosphate", "e551", "e470b"], "Spices, powders, salt, supplements", "Keep powders free-flowing. Used in tiny amounts and generally regarded as safe.");
  N("Sorbate preservatives", ["potassium sorbate", "sorbic acid", "sodium erythorbate", "e202", "e200"], "Cheese, wine, baked goods, dried fruit", "Common mold inhibitors with a long safety record. Low concern at normal levels.");
  N("Natural colors", ["annatto", "beta carotene", "beta-carotene", "beet juice", "beet powder", "paprika extract", "spirulina extract", "natural color", "natural colour", "fruit and vegetable juice for color", "vegetable juice color", "anthocyanin", "chlorophyll"], "Cheese, snacks, candy, drinks", "Colors from plants. Better than synthetic dyes, though they still only change appearance.");
  N("Shellac & waxes", ["shellac", "carnauba wax", "confectioner's glaze", "confectioners glaze", "beeswax", "e904", "e903"], "Candy, shiny fruit, pills", "Glossy coatings. Safe, but shellac comes from lac insects, so it is not vegan.");
  N("DATEM & stearoyl lactylate", ["datem", "sodium stearoyl lactylate", "calcium stearoyl lactylate", "e472e", "e481"], "Bread, rolls, tortillas, cake mixes", "Dough conditioners. Regarded as safe, but they are a marker of industrial baking.");
  N("Enzymes & cultures", ["enzymes", "rennet", "lactase", "protease", "amylase"], "Cheese, bread, plant milks", "Natural helpers used to make cheese, bread and other foods. Harmless.");
  N("Vanilla", ["vanilla", "vanilla extract", "vanilla bean"], "Ice cream, baked goods, yogurt", "Real vanilla is a harmless natural flavor. Imitation vanilla is listed as vanillin and counted under artificial flavors.", ["vanillin"]);
  N("Cocoa butter", ["cocoa butter"], "Chocolate, cosmetics", "The natural fat in the cacao bean. It is saturated fat but a whole-food source.");
  N("Firming agents", ["calcium chloride", "calcium sulfate", "calcium lactate", "calcium hydroxide"], "Canned vegetables, tofu, pickles, cheese", "Keep texture firm. Also a source of calcium, and safe at food levels.");

  /* ---- allergens (neutral flag, EU 14 + extras) ---- */
  const world = "The EU requires 14 major allergens to be highlighted on food labels. The US names 9 (sesame was added in 2023). Canada, Australia/New Zealand, Japan, Korea and others have similar lists.";
  const A = (nm, match, found, reason, not) => {
    DB.push({ name: "Allergen: " + nm, type: "neutral", level: 0, allergen: true, match, found, reason, world, not });
  };
  A("Gluten (wheat, barley, rye)", ["gluten", "wheat", "barley", "rye", "spelt", "semolina", "durum", "kamut", "triticale", "malt", "farina", "couscous", "seitan"], "Bread, pasta, cereal, beer, sauces, soy sauce", "Must be avoided with celiac disease and non-celiac gluten sensitivity. Wheat is also a major allergen on its own.", ["gluten free", "gluten-free"]);
  A("Milk", ["milk", "whey", "casein", "caseinate", "lactose", "butter", "cream", "cheese", "yogurt", "yoghurt", "ghee", "buttermilk", "kefir"], "Dairy, chocolate, baked goods, sauces", "A leading allergen, especially in children. Lactose intolerance is different and is about digestion, not allergy.", ["coconut milk", "almond milk", "oat milk", "soy milk", "rice milk", "cashew milk", "plant milk", "cocoa butter", "peanut butter", "almond butter", "shea butter", "nut butter", "ice cream cone", "cream of tartar"]);
  A("Eggs", ["egg", "albumin", "ovalbumin", "mayonnaise", "meringue", "lysozyme"], "Baked goods, mayonnaise, pasta, sauces", "A common allergen in children. Eggs can hide in baked goods, glazes and sauces.", ["eggplant"]);
  A("Peanuts", ["peanut", "groundnut", "arachis"], "Snacks, sauces, baked goods, candy", "A leading cause of severe allergic reactions. Cross-contact in factories is common.");
  A("Tree nuts", ["almond", "cashew", "walnut", "pecan", "hazelnut", "pistachio", "macadamia", "brazil nut", "pine nut", "chestnut", "praline", "marzipan", "nougat"], "Granola, chocolate, baked goods, nut butters", "Tree nut allergies are often lifelong and can be severe.", ["almond milk"]);
  A("Soy", ["soy", "soya", "soybean", "edamame", "tofu", "tempeh", "miso", "natto"], "Sauces, processed foods, protein products", "A common allergen found in many processed foods.");
  A("Fish", ["fish", "salmon", "tuna", "cod", "anchov", "sardine", "mackerel", "tilapia", "haddock", "pollock", "worcestershire"], "Seafood, sauces, dressings, Caesar salad", "Fish allergy is usually lifelong. Worcestershire sauce and Caesar dressing often contain anchovy.");
  A("Crustaceans & mollusks", ["shrimp", "prawn", "crab", "lobster", "crayfish", "crawfish", "oyster", "clam", "mussel", "scallop", "squid", "octopus", "snail", "abalone"], "Seafood, soups, stir-fries, seasonings", "Shellfish allergy can be severe and is often lifelong.");
  A("Sesame", ["sesame", "tahini", "hummus", "halva", "gomasio"], "Bread, hummus, crackers, Asian foods", "A growing allergen in many countries, hidden in breads and spice blends.");
  A("Mustard & celery", ["mustard", "celery", "celeriac"], "Dressings, sauces, soups, spice blends", "Required allergens in the EU, UK and Canada, and common triggers in Europe.");
  A("Lupin", ["lupin", "lupine"], "Gluten-free flours, baked goods, pasta", "A legume related to peanut, a required allergen in the EU that can trigger peanut-allergic people.");

  /* ---- more good stuff ---- */
  add("Seaweed & algae", "good", 0, ["seaweed", "nori", "kelp", "wakame", "kombu", "dulse", "spirulina", "chlorella", "algae"],
    "Sushi, soups, snacks, supplements",
    "Provide iodine, minerals and fiber. Iodine is vital for thyroid health, though very large amounts of kelp can be too much.",
    "A staple in Japan, Korea and coastal Europe.");
  add("Sprouts & live greens", "good", 0, ["sprouts", "sprouted grain", "microgreens", "alfalfa", "wheatgrass", "bean sprouts"],
    "Salads, sandwiches, sprouted breads",
    "Young plants rich in enzymes, vitamins and fiber. Cooked sprouts are safest for people who are pregnant, elderly or immunocompromised.",
    "Food-safety agencies in the US, EU and UK advise vulnerable people to cook sprouts.");
  add("Fresh whole proteins", "good", 0, ["grass-fed beef", "pasture-raised", "wild-caught", "free-range", "cage-free", "wild caught"],
    "Fresh meat, eggs, fish",
    "Labels pointing to how animals were raised or fish were caught. They are marketing terms, but usually go with fresher, less processed food.",
    "Definitions of 'free-range' and 'pasture-raised' vary widely between countries.");

  /* colors for every new entry */
  DB.forEach(e => {
    if (!e.color) e.color = e.type === "good" ? "green" : e.type === "neutral" ? "neutral" : (e.level >= 2 ? "red" : "yellow");
  });
})();

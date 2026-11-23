/* LabelLens Education Center content.
   General consumer education drawn from WHO, EFSA, IARC, UK FSA, Health Canada, FDA and national dietary guidelines.
   Not medical advice. */

window.EDU = [
  { icon: "🎨", title: "What the colors mean", color: "plain", points: [
    "🔴 Red = high or moderate concern: classified as a possible carcinogen, banned or restricted in some regions, or linked to clear health risks.",
    "🟡 Yellow = caution: regulators disagree, evidence is mixed, or it only matters in large amounts or for sensitive people.",
    "🟢 Green = good: whole-food or nutrient-rich ingredients that most dietary guidelines encourage.",
    "Gray = not in our database. That does not mean safe or unsafe, only that we have no note on it yet.",
    "The score is a simple estimate. Dose, your health, allergies and the whole diet matter more than any one ingredient."
  ]},
  { icon: "📖", title: "How to read a food label", color: "plain", points: [
    "Ingredients are listed from most to least by weight. The first three make up most of the food.",
    "A short list of ingredients you recognize is usually a better sign than a long list of chemical names.",
    "'Contains 2% or less of' hides the smallest ingredients, which often include flavors, preservatives and colors.",
    "Check the serving size first. Calories and sugar on the label are for one serving, not the whole package.",
    "US and Canada show % Daily Value: 5% or less is low, 20% or more is high. The EU and UK show % Reference Intake."
  ]},
  { icon: "🚦", title: "Front-of-pack labels around the world", color: "plain", points: [
    "UK traffic lights per 100 g: sugars high above 22.5 g and low at 5 g or less; salt high above 1.5 g and low at 0.3 g or less; saturated fat high above 5 g and low at 1.5 g or less.",
    "France and several EU countries use Nutri-Score, rating foods from A (green) to E (red).",
    "Chile, Mexico and others use black 'high in' warning stamps for sugar, salt, saturated fat and calories.",
    "Brazil's guidelines tell people to build meals from fresh foods and avoid ultra-processed products."
  ]},
  { icon: "🏭", title: "What 'ultra-processed' means", color: "red", points: [
    "The NOVA system sorts food into four groups: unprocessed, culinary ingredients (oil, salt), processed (canned beans, cheese) and ultra-processed.",
    "Ultra-processed foods are industrial formulas made mostly from extracted ingredients and additives, such as soda, packaged snacks, instant noodles and reconstituted meats.",
    "Signs on the label: flavors, colors, emulsifiers, sweeteners, thickeners, hydrolyzed proteins, and ingredients you would not keep in a home kitchen.",
    "Large studies link high intake to obesity, heart disease and type 2 diabetes, though research is still developing."
  ]},
  { icon: "🚩", title: "Red flags on any label", color: "red", points: [
    "Sugar listed first or second, or sugar appearing under several names.",
    "'Hydrogenated' or 'partially hydrogenated' anything.",
    "Artificial colors, artificial flavors or 'flavor' with no detail.",
    "Nitrites or nitrates in processed meat.",
    "Four or more sweeteners, thickeners or emulsifiers in one product.",
    "Health claims on the front that the back does not support, such as 'natural', 'light' or 'made with real fruit'."
  ]},
  { icon: "🍬", title: "Sugar's many names", color: "yellow", points: [
    "Sucrose, glucose, fructose, dextrose, maltose, lactose.",
    "Corn syrup, high fructose corn syrup, glucose syrup, glucose-fructose, isoglucose.",
    "Cane sugar, cane juice, evaporated cane juice, turbinado, muscovado, brown sugar, treacle, molasses.",
    "Agave nectar, honey, maple syrup, barley malt, brown rice syrup, date syrup.",
    "Fruit juice concentrate, maltodextrin and dextrin act like sugar in the body.",
    "If three or more of these appear, sugar is probably the main ingredient even if no single one is first."
  ]},
  { icon: "🪄", title: "Marketing words decoded", color: "yellow", points: [
    "'Natural' has no strict legal meaning in most countries.",
    "'Multigrain' only means more than one grain. Look for 'whole grain' as the first ingredient.",
    "'No added sugar' can still contain sugar from fruit juice or milk.",
    "'Sugar free' often means artificial sweeteners or sugar alcohols.",
    "'Low fat' foods often replace fat with extra sugar or starch.",
    "'Organic' is regulated differently by the USDA, the EU, Canada and Japan, and does not guarantee a food is healthy."
  ]},
  { icon: "🥦", title: "What good food looks like", color: "green", points: [
    "A short list of recognizable ingredients, ideally with a whole food first (oats, beans, vegetables, eggs, nuts).",
    "Whole grain as the first ingredient and at least 3 g of fiber per serving for grain products.",
    "Protein and fiber together keep you fuller and steady blood sugar.",
    "Fresh, frozen and canned fruit and vegetables with no added sugar or salt are all good choices.",
    "Plain versions (plain yogurt, unsweetened nut milk, plain oats) let you control sugar and salt yourself."
  ]},
  { icon: "🌍", title: "Why rules differ by country", color: "plain", points: [
    "The EU follows the precautionary principle, so an additive can be banned when safety cannot be proven, as happened with titanium dioxide in 2022.",
    "The US FDA generally requires proof of harm before removing an additive already in wide use.",
    "The IARC classifies hazards (can it cause cancer?), while EFSA, JECFA and national agencies assess risk (how much is a problem?).",
    "A banned additive in one country is not automatically dangerous in small amounts, and a legal one is not automatically harmless. That is why LabelLens notes each region's view."
  ]},
  { icon: "⚠️", title: "Allergens to watch", color: "red", points: [
    "The EU requires 14 allergens to be highlighted: cereals with gluten, crustaceans, eggs, fish, peanuts, soy, milk, tree nuts, celery, mustard, sesame, sulphites, lupin and mollusks.",
    "The US requires 9: milk, eggs, fish, shellfish, tree nuts, peanuts, wheat, soy and sesame.",
    "'May contain' warnings are voluntary in many countries. Contact the maker if the allergy is severe.",
    "LabelLens is not an allergy checker. Always read the allergen statement on the package."
  ]}
];

/* ===================== LIVING vs DEAD FOODS ===================== */
window.EDU_LIVING = [
  { icon: "🌱", title: "What 'living food' means (and what it doesn't)", color: "green", points: [
    "'Living' vs 'dead' food is a wellness idea, not an official scientific category. LabelLens uses it as a simple way to judge how close a food is to how it grew or was traditionally made.",
    "Living food: fresh, whole and minimally processed, or still biologically active, such as sprouts and live fermented foods.",
    "Dead (or 'fake') food: stripped, refined, heavily processed or built from isolated ingredients and additives, with little left of the original plant or animal.",
    "The science behind the idea is real: large studies link diets high in whole, minimally processed foods with better health and diets high in ultra-processed food with worse health.",
    "The extreme version is not: raw is not always better, and cooking, canning and freezing are not always bad."
  ]},
  { icon: "🥬", title: "What makes food 'living'", color: "green", points: [
    "Fresh produce eaten soon after harvest, when vitamin C and other delicate nutrients are highest.",
    "Sprouted and soaked grains, beans, nuts and seeds, which are easier to digest for many people.",
    "Live fermented foods: yogurt and kefir with live cultures, kimchi, sauerkraut, miso, natto, tempeh, kombucha and traditionally made pickles.",
    "Whole intact foods where the fiber, skin, germ and bran are still there.",
    "Fresh herbs, raw nuts and seeds, extra virgin olive oil and minimally processed fats.",
    "Food you can trace back to a plant, animal or simple traditional process."
  ]},
  { icon: "🏭", title: "What makes food 'dead' or fake", color: "red", points: [
    "Refined: white flour, white sugar and polished grains stripped of fiber and nutrients.",
    "Ultra-processed formulas built from extracted ingredients: protein isolates, modified starches, hydrogenated oils, syrups and additives.",
    "Artificial colors, flavors, sweeteners and preservatives that exist to imitate or extend food.",
    "Very long shelf life through additives and heavy processing (some natural foods like honey, salt and dried beans last long too, so check the ingredients, not just the date).",
    "Packaged as 'food-like products': snack bars, flavored drinks, imitation cheese, instant everything.",
    "Labels where the first ingredients are sugar, refined flour or refined oil, with a long tail of chemical names."
  ]},
  { icon: "✅", title: "The 6-question aliveness test", color: "green", points: [
    "1. Did it grow, or was it made in a factory?",
    "2. Could you recognize every ingredient and picture it in a kitchen?",
    "3. How many steps are there between the field and your plate?",
    "4. Is the fiber still in it?",
    "5. Does it spoil? Real fresh food does, but so do plenty of healthy foods in the fridge, so treat this as a clue, not a rule.",
    "6. Is it mostly one ingredient, or a list of twenty?"
  ]},
  { icon: "🔄", title: "Dead-to-living swaps", color: "green", points: [
    "White bread → sprouted grain, sourdough or 100% whole grain bread.",
    "Soda or energy drinks → water with citrus or mint, sparkling water with fruit, unsweetened tea.",
    "Chips → plain popcorn, nuts, olives or vegetables with hummus.",
    "Sugary cereal or bars → oats with fruit and nuts.",
    "Flavored yogurt → plain yogurt or kefir with fresh fruit.",
    "Fruit juice → the whole fruit.",
    "Margarine and shortening → butter in moderation or olive oil.",
    "Deli meats with nitrites → home-cooked chicken, eggs, beans or canned fish.",
    "Candy → dates with nuts, dark chocolate or berries."
  ]},
  { icon: "🧪", title: "Myth check", color: "yellow", points: [
    "'Raw is always better': cooking makes some nutrients easier to absorb (lycopene in tomatoes, carotenoids in carrots) and kills germs. Eat a mix of raw and cooked.",
    "'Natural means healthy': arsenic and sugar are natural too. Check the ingredient list, not the front of the pack.",
    "'All processed food is bad': frozen vegetables, canned beans, plain yogurt and tinned fish are processed and healthy. Processing level matters, not just whether something is processed.",
    "'Fermented food is always safe': it can be very salty and can trouble people sensitive to histamine. Introduce it gradually.",
    "'Raw sprouts and raw milk are healthier': food-safety agencies warn they can carry harmful bacteria, especially for children, pregnant people, older adults and anyone immunocompromised."
  ]},
  { icon: "🌈", title: "Habits that keep your plate alive", color: "green", points: [
    "Eat the rainbow: different colors bring different plant compounds.",
    "Aim for variety. Some researchers link eating around 30 different plants a week with a more diverse gut microbiome, though this evidence is observational.",
    "Cook from scratch more often: even simple meals beat packaged ones.",
    "Buy in season and shop for ingredients rather than ready-made products.",
    "Keep a fermented food or two in your fridge.",
    "Treat packaged food as the exception, not the foundation."
  ]}
];

/* ===================== GET HEALTHIER ===================== */
window.EDU_HEALTH = [
  { icon: "🧭", title: "Start here", color: "plain", points: [
    "Check with a doctor or registered dietitian before big diet or exercise changes, especially if you are pregnant, take medication, or have a medical condition.",
    "Pick one or two changes, not ten. Habits stick when they are small and repeated.",
    "Add before you subtract: add vegetables, water and protein first, and the processed food crowds itself out.",
    "Aim for progress, not perfection. Eating well most of the time works better than being strict and quitting.",
    "This app is education, not medical advice."
  ]},
  { icon: "🍽", title: "Build a balanced plate", color: "green", points: [
    "Fill about half your plate with vegetables and fruit, a quarter with whole grains or starchy vegetables, and a quarter with protein.",
    "Add a thumb of healthy fat: olive oil, nuts, seeds, avocado or fatty fish.",
    "Choose water, tea or coffee (without lots of sugar) as your main drinks.",
    "Eat protein and fiber at every meal to stay full and keep blood sugar steadier.",
    "These ideas match the Harvard Healthy Eating Plate and the guidelines of the WHO, Brazil and many other countries."
  ]},
  { icon: "💧", title: "Water and drinks", color: "green", points: [
    "Make water your default drink. Needs vary, but pale yellow urine is a simple sign of good hydration.",
    "Sugary drinks are one of the easiest things to cut for a big health payoff.",
    "Limit alcohol. Many health bodies, including the WHO, say that no level of alcohol is completely risk free.",
    "Caffeine is fine for most adults in moderate amounts (EFSA: up to 400 mg a day), but not late in the day if it affects your sleep."
  ]},
  { icon: "😴", title: "Sleep", color: "green", points: [
    "Most adults need at least 7 hours of sleep a night.",
    "Keep a regular bedtime and wake time, even on weekends.",
    "Dim lights and put screens away an hour before bed.",
    "Avoid large meals, alcohol and caffeine close to bedtime.",
    "Poor sleep raises hunger hormones and cravings, so sleep is part of any food plan."
  ]},
  { icon: "🏃", title: "Move your body", color: "green", points: [
    "The WHO recommends 150 to 300 minutes of moderate activity a week, plus muscle-strengthening on at least 2 days.",
    "Walking counts. A 10 to 30 minute walk after meals helps blood sugar.",
    "Build strength with bodyweight, bands or weights. Muscle protects metabolism and bones as you age.",
    "Pick something you enjoy so you keep doing it.",
    "Break up long sitting with a short walk every hour."
  ]},
  { icon: "🦠", title: "Gut health", color: "green", points: [
    "Fiber feeds good gut bacteria. The WHO suggests at least 25 g a day, and most people eat far less.",
    "Eat a wide variety of plants: vegetables, fruit, beans, whole grains, nuts, seeds and herbs.",
    "Include fermented foods like yogurt, kefir, kimchi and sauerkraut.",
    "Add fiber slowly and drink water to avoid bloating.",
    "Limit ultra-processed foods and emulsifier-heavy products when you can."
  ]},
  { icon: "🛒", title: "Smart shopping and cooking", color: "green", points: [
    "Make a list and eat before you shop.",
    "Build the cart from whole foods: produce, beans, whole grains, eggs, fish, plain dairy, nuts.",
    "Use the scanner on products you buy often and keep the ones that come back green.",
    "Frozen vegetables and fruit, canned beans and tinned fish are cheap, healthy and convenient.",
    "Batch cook one or two things a week so a healthy meal is always ready.",
    "At restaurants, look for grilled, baked or steamed dishes and ask for dressing and sauce on the side."
  ]},
  { icon: "🧠", title: "Cravings, habits and slips", color: "yellow", points: [
    "Change your environment: keep tempting foods out of sight or out of the house.",
    "Stack habits: attach a new habit to something you already do, like water after brushing your teeth.",
    "Plan for cravings with an if-then plan: 'If I want a snack after dinner, then I drink tea and eat fruit first.'",
    "Eat enough protein and don't skip meals so hunger doesn't win later.",
    "If you slip, make the next choice a good one. One meal never undoes your progress.",
    "Be kind to yourself. Shame and rigid rules usually backfire."
  ]},
  { icon: "🧘", title: "Stress, mind and spirit", color: "green", points: [
    "Chronic stress drives cravings and poor sleep. Walk outside, breathe slowly or stretch for a few minutes each day.",
    "Spend time with people you love. Social connection is strongly linked to better health and longer life.",
    "Daily reflection, gratitude, prayer or meditation can help you stay grounded, if these are part of your life.",
    "Spend time in sunlight and nature when you can.",
    "Limit doomscrolling and late-night screens."
  ]},
  { icon: "🩺", title: "When to get professional help", color: "red", points: [
    "See a doctor for unexplained weight loss or gain, constant fatigue, digestive problems that don't settle, or any new symptoms.",
    "Get advice before starting supplements, fasting plans or very low calorie diets.",
    "If food starts to feel stressful, rigid or out of control, or you feel guilt around eating, talk to a healthcare professional. Tracking numbers is not right for everyone.",
    "A registered dietitian can build a plan around your medical needs, budget and culture."
  ]}
];

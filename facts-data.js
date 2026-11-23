/* LabelLens Facts: evidence-graded claims, law history, labeling rules, health education.
   Every entry links to a primary or authoritative source (government, WHO/IARC/JECFA, EFSA, EUR-Lex, NIH/PubMed, journals).
   Verdicts describe the STATE OF THE EVIDENCE, not a recommendation. Not medical advice. */
window.FACTS = {
  verdicts: {
    supported: ["Well supported", "green"],
    partial: ["Partly supported", "yellow"],
    mixed: ["Mixed or unclear", "yellow"],
    overstated: ["Overstated", "yellow"],
    unsupported: ["Not supported", "red"]
  },
  claims: [
    { q: "Added sugar and high-fructose corn syrup drive disease", v: "supported",
      a: "Excess free sugars are linked to weight gain and dental caries. WHO advises keeping free sugars under 10% of energy, and under 5% for added benefit. HFCS is metabolically very similar to table sugar, so the issue is the amount of added sugar, not one sweetener.",
      src: [["WHO sugars guideline (2015)", "https://www.who.int/publications/i/item/9789241549028"]] },
    { q: "Processed meat (nitrites/nitrates) causes cancer", v: "supported",
      a: "IARC classified processed meat as carcinogenic to humans (Group 1, colorectal cancer) in 2015. The risk rises with amount eaten. Nitrite also has a food-safety role (it stops botulism), which is why it is regulated with limits instead of simply banned. 'Celery powder' is a natural nitrate source that still ends up as nitrite.",
      src: [["IARC Monographs Vol. 114 summary", "https://www.who.int/news-room/questions-and-answers/item/cancer-carcinogenicity-of-the-consumption-of-red-meat-and-processed-meat"]] },
    { q: "Synthetic food dyes affect children's behavior", v: "partial",
      a: "A randomized trial (McCann, Lancet 2007) found increased hyperactivity in some children after dye + benzoate mixes. The EU requires a warning on foods containing six of these dyes. California's OEHHA concluded in 2021 that synthetic dyes can affect behavior in some children. Effects are small on average and vary by child.",
      src: [["McCann et al., Lancet 2007", "https://pubmed.ncbi.nlm.nih.gov/17825405/"], ["California OEHHA 2021 report", "https://oehha.ca.gov/risk-assessment/report/health-effects-assessment-potential-neurobehavioral-effects-synthetic-food"]] },
    { q: "Red No. 3 is banned because it is dangerous", v: "partial",
      a: "FDA revoked authorization of Red 3 in food in January 2025 under the Delaney Clause, because high doses caused cancer in male rats. FDA noted the rat mechanism does not appear to apply to humans, but the law bars additives shown to cause cancer in animals. It had long been restricted in cosmetics (1990) and is still allowed in some other countries.",
      src: [["FDA: Red No. 3 revocation", "https://www.fda.gov/food/food-additives-petitions/fda-revoke-authorization-use-red-no-3-food-and-ingested-drugs"]] },
    { q: "Titanium dioxide (E171) is banned in Europe", v: "supported",
      a: "True for use as a food additive in the EU since 2022, after EFSA could not rule out genotoxicity from nanoparticles. It remains permitted in the US. This is a real regulatory difference, not a rumor.",
      src: [["EU Regulation 2022/63", "https://eur-lex.europa.eu/eli/reg/2022/63/oj"]] },
    { q: "Aspartame is a poison", v: "overstated",
      a: "IARC (2023) placed aspartame in Group 2B, 'possibly carcinogenic', meaning limited evidence. The same week JECFA reviewed it and kept the acceptable daily intake at 40 mg per kg body weight. For a 70 kg adult that is roughly 9 to 14 cans of diet soda a day. People with phenylketonuria must avoid it.",
      src: [["WHO: IARC and JECFA aspartame results", "https://www.who.int/news/item/14-07-2023-aspartame-hazard-and-risk-assessment-results-released"]] },
    { q: "MSG causes headaches and brain damage", v: "unsupported",
      a: "Blinded studies have not reliably reproduced symptoms at normal dietary amounts. Glutamate is also in tomatoes, parmesan and breast milk. JECFA did not set a numerical limit. A small number of people report sensitivity, and large doses without food may trigger short symptoms.",
      src: [["FDA: MSG Q&A", "https://www.fda.gov/food/food-additives-petitions/questions-and-answers-monosodium-glutamate-msg"]] },
    { q: "Seed oils are toxic", v: "overstated",
      a: "Replacing saturated fat with polyunsaturated oils lowers LDL cholesterol and is supported by the American Heart Association. Repeatedly reheated frying oil forms harmful compounds, and ultra-processed fried foods are the real concern. 'Seed oil' as a category is not shown to be poisonous.",
      src: [["AHA presidential advisory on dietary fats", "https://www.ahajournals.org/doi/10.1161/CIR.0000000000000510"]] },
    { q: "'Natural flavors' are always natural and harmless", v: "partial",
      a: "'Natural' describes the source of the flavor molecule, not its safety or its simplicity. A natural flavor can be a blend of dozens of compounds plus solvents and carriers that do not have to be itemized. It is a legitimate flag for transparency, not proof of harm.",
      src: [["21 CFR 101.22 (flavors)", "https://www.ecfr.gov/current/title-21/chapter-I/subchapter-B/part-101/subpart-B/section-101.22"]] },
    { q: "Sodium benzoate plus vitamin C makes benzene", v: "partial",
      a: "The chemistry is real: under heat and light the two can form benzene in drinks. FDA tested beverages in 2006 and found most below the 5 ppb drinking-water limit, and some products were reformulated. It is a storage and formulation issue.",
      src: [["FDA: benzene in soft drinks", "https://www.fda.gov/food/chemicals/questions-and-answers-about-benzene-and-soft-drinks"]] },
    { q: "Potassium bromate in bread is a carcinogen", v: "supported",
      a: "IARC lists it as possibly carcinogenic (2B). It is banned in the EU, UK and Canada. California passed a law banning it from 2027. Many US bakers have already dropped it.",
      src: [["California AB 418 (2023)", "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202320240AB418"], ["IARC Monographs Vol. 73", "https://monographs.iarc.who.int/list-of-classifications"]] },
    { q: "Brominated vegetable oil (BVO) is unsafe", v: "supported",
      a: "FDA revoked its authorization in 2024 after studies showed it could build up in body tissue and affect the thyroid at high intakes. It had been used to keep flavor oils suspended in some citrus sodas.",
      src: [["FDA: BVO", "https://www.fda.gov/food/food-additives-petitions/brominated-vegetable-oil-bvo"]] },
    { q: "Carrageenan causes gut inflammation", v: "mixed",
      a: "Degraded carrageenan (poligeenan) is inflammatory in animals and is not allowed in food. Food-grade carrageenan was reviewed as acceptable by JECFA and EFSA. Human evidence of harm is limited, though some people with gut disease report feeling better without it.",
      src: [["EFSA re-evaluation of carrageenan (E407)", "https://www.efsa.europa.eu/en/efsajournal/pub/4238"]] },
    { q: "BHA and BHT preservatives are carcinogens", v: "mixed",
      a: "BHA is classed as possibly carcinogenic (IARC 2B) based on rodent forestomach tumors, which humans do not have. Both are permitted at limits in the US and EU. Choose foods that do not need them if you want to be cautious.",
      src: [["IARC classifications list", "https://monographs.iarc.who.int/list-of-classifications"]] },
    { q: "Glyphosate residues in food cause cancer", v: "mixed",
      a: "IARC classed glyphosate as probably carcinogenic (2A) in 2015, while EFSA and the US EPA concluded it is unlikely to pose a cancer risk at dietary exposure. The disagreement is about hazard versus real-world exposure. Occupational exposure studies are the main source of concern.",
      src: [["EFSA conclusion on glyphosate (2015)", "https://www.efsa.europa.eu/en/efsajournal/pub/4302"]] },
    { q: "Fluoride in toothpaste calcifies the pineal gland and harms the brain", v: "overstated",
      a: "See the Fluoride tab. Short version: fluoride at normal toothpaste use prevents cavities. Higher intake over time causes dental fluorosis, and some high-exposure studies link fluoride to lower child IQ. There is no good human evidence that brushing with toothpaste 'calcifies' you.",
      src: [["NTP fluoride monograph (2024)", "https://ntp.niehs.nih.gov/research/assessments/noncancer/completed/fluoride"]] }
  ],

  laws: [
    { y: "1906", t: "Pure Food and Drug Act", d: "First US federal law against adulterated and misbranded food. Followed public outrage over the meatpacking industry and Harvey Wiley's 'Poison Squad' tests of preservatives.", src: ["FDA milestones", "https://www.fda.gov/about-fda/fdas-evolving-regulatory-powers/milestones-us-food-and-drug-law"] },
    { y: "1938", t: "Federal Food, Drug, and Cosmetic Act", d: "Passed after Elixir Sulfanilamide killed over 100 people. Required safety proof for new drugs and set food standards. Food additives were still not pre-approved.", src: ["FDA milestones", "https://www.fda.gov/about-fda/fdas-evolving-regulatory-powers/milestones-us-food-and-drug-law"] },
    { y: "1958", t: "Food Additives Amendment: GRAS and the Delaney Clause", d: "Companies must prove new additives are safe before use. The law also exempted substances 'generally recognized as safe' (GRAS) by qualified experts, and banned any additive shown to cause cancer in people or animals (the Delaney Clause). The GRAS exemption later became the main route onto the market. Industry says it keeps proven foods available. Critics say it let companies decide safety themselves.", src: ["FDA: GRAS", "https://www.fda.gov/food/food-ingredients-packaging/generally-recognized-safe-gras"] },
    { y: "1960s", t: "Sugar industry shapes the science", d: "Internal documents analyzed in JAMA Internal Medicine (2016) show the Sugar Research Foundation paid Harvard researchers in 1967 for a review that downplayed sugar's role in heart disease and pointed at fat. It is a documented case of industry funding shaping nutrition messaging. Modern journals require funding disclosure.", src: ["Kearns et al., JAMA Intern Med 2016", "https://doi.org/10.1001/jamainternmed.2016.5394"] },
    { y: "1990", t: "Nutrition Labeling and Education Act", d: "Made nutrition facts panels mandatory and set rules for health claims.", src: ["FDA milestones", "https://www.fda.gov/about-fda/fdas-evolving-regulatory-powers/milestones-us-food-and-drug-law"] },
    { y: "1994", t: "DSHEA: supplements and herbs", d: "The Dietary Supplement Health and Education Act treats supplements as foods, not drugs. They need no FDA approval before sale, and FDA has to show a product is unsafe to act against it. Makers may not claim to treat disease, but may make 'structure/function' claims. Supporters say it protects consumer access. Critics point to products with contamination, wrong doses or hidden drugs.", src: ["FDA: dietary supplements", "https://www.fda.gov/food/dietary-supplements"] },
    { y: "1997 to 2016", t: "GRAS notification becomes the practice", d: "FDA proposed a voluntary GRAS notice program in 1997 and finalized it in 2016. Companies can still self-affirm GRAS without telling FDA. Public-health groups have long asked for mandatory notification.", src: ["FDA: GRAS", "https://www.fda.gov/food/food-ingredients-packaging/generally-recognized-safe-gras"] },
    { y: "2004 and 2023", t: "Allergen labeling laws", d: "FALCPA (2004) required plain-language labeling of major allergens. Sesame was added as the ninth in 2023 (FASTER Act).", src: ["FDA: food allergies", "https://www.fda.gov/food/nutrition-food-labeling-and-critical-foods/food-allergies"] },
    { y: "2011", t: "EU Food Information Regulation", d: "Regulation 1169/2011 sets EU label rules, including allergens emphasized in the ingredient list and nutrition declarations.", src: ["EUR-Lex 1169/2011", "https://eur-lex.europa.eu/eli/reg/2011/1169/oj"] },
    { y: "2022", t: "EU bans titanium dioxide as an additive", d: "A precautionary decision after EFSA could not exclude genotoxicity. The US has not followed.", src: ["EUR-Lex 2022/63", "https://eur-lex.europa.eu/eli/reg/2022/63/oj"] },
    { y: "2024 to 2025", t: "US revokes BVO and Red No. 3", d: "FDA revoked BVO (2024) and Red No. 3 (January 2025), years after the evidence and after petitions. State laws such as California AB 418 pushed the pace.", src: ["FDA: Red No. 3", "https://www.fda.gov/food/food-additives-petitions/fda-revoke-authorization-use-red-no-3-food-and-ingested-drugs"] },
    { y: "2026", t: "Proposal to make GRAS notification mandatory", d: "In August 2026 FDA proposed requiring companies to notify it about GRAS conclusions. The comment period runs to December 9, 2026. It is a proposal, not final, so check FDA's page for the current status.", src: ["FDA: GRAS", "https://www.fda.gov/food/food-ingredients-packaging/generally-recognized-safe-gras"] }
  ],
  lawsNote: "How to read this: the record shows both real public-health wins and real industry influence. Defenders of the current system say it is faster, protects innovation and has a long safety record. Critics say it relies on company-run safety conclusions and moves slowly. Check the sources and decide for yourself.",

  enzymes: [
    ["What they are", "Enzymes are proteins that speed up chemical reactions. Food makers use them in baking (amylase), cheese (chymosin/rennet), juice (pectinase), dairy (lactase) and brewing."],
    ["When they are listed (US)", "An enzyme that stays in the food and still does a job (for example lactase in lactose-free milk) is generally listed by name or as 'enzymes'. An enzyme used only as a processing aid, with no technical effect left in the finished food, can be left off the label."],
    ["The loophole", "Because processing aids may go unlisted, a loaf can be made with several enzymes and show none. If you are allergic or avoid certain sources (animal rennet, fungal, GM-derived microbes) the label may not tell you. Contact the maker."],
    ["Europe", "Food enzymes are regulated under Regulation (EC) 1332/2008, with a EU-wide approved list in progress. Under 1169/2011 processing aids are also exempt from the ingredient list. Allergen-derived processing aids still have to be declared if they remain in the product."],
    ["Do enzymes in food 'heal' you?", "Raw foods contain their own enzymes, but stomach acid and digestion break most of them down. Digestive-enzyme supplements are proven for specific conditions (for example pancreatic insufficiency under medical care, lactase for lactose intolerance). Claims that eating 'live enzymes' repairs the body are not established."]
  ],
  enzymesSrc: [["21 CFR 101.100 (US exemptions)", "https://www.ecfr.gov/current/title-21/chapter-I/subchapter-B/part-101/subpart-G/section-101.100"], ["EU Reg 1332/2008 (food enzymes)", "https://eur-lex.europa.eu/eli/reg/2008/1332/oj"], ["EU Reg 1169/2011", "https://eur-lex.europa.eu/eli/reg/2011/1169/oj"]],

  fluoride: [
    ["What is well supported", "Topical fluoride (toothpaste, varnish) reduces tooth decay. Community water fluoridation at about 0.7 mg/L is recommended by US public-health agencies for cavity prevention."],
    ["Dental fluorosis", "Too much fluoride while teeth form (under about 8 years) causes white flecks or staining. This is why young children should use only a smear (under 3) or pea-sized amount (3 to 6) of toothpaste and spit instead of swallowing."],
    ["The brain question", "The US National Toxicology Program's 2024 review concluded with moderate confidence that fluoride exposure above 1.5 mg/L in drinking water is associated with lower IQ in children. It did not find enough evidence at the 0.7 mg/L level. Researchers are still debating dose, timing and confounders."],
    ["The 'calcified pineal gland' claim", "Some studies found fluoride can accumulate in the pineal gland, and the pineal commonly calcifies with age. That is not the same as showing toothpaste or fluoridated water causes harmful calcification. No strong human evidence connects the two."],
    ["What you can do", "Use the amount recommended for age, spit and do not rinse right after, supervise children, check your local water report for its fluoride level, and talk to your dentist or doctor about your own situation. If your water is above the recommended level, ask the utility about it."]
  ],
  fluorideSrc: [["NTP fluoride monograph (2024)", "https://ntp.niehs.nih.gov/research/assessments/noncancer/completed/fluoride"], ["CDC: community water fluoridation", "https://www.cdc.gov/fluoridation/"], ["ADA: fluoride", "https://www.ada.org/resources/ada-library/oral-health-topics/fluoride-topical-and-systemic-supplements"]],

  body: [
    ["Why bloodwork matters", "Symptoms like fatigue overlap across dozens of conditions. A lab test shows what your body is actually doing, so you can fix a real deficiency instead of guessing."],
    ["Common tests to ask about", "Complete blood count (anemia, infection), metabolic panel (kidneys, liver, electrolytes), lipid panel (cholesterol), HbA1c or fasting glucose (blood sugar), ferritin and iron (iron stores), vitamin B12, 25-hydroxy vitamin D, TSH (thyroid) and hs-CRP (inflammation). Which ones apply depends on you."],
    ["Ranges are not one size fits all", "Reference ranges differ by lab, age, sex and pregnancy. A result near the edge means something different for different people. Interpretation belongs to a clinician who knows your history."],
    ["Do not self-dose fat-soluble vitamins", "Vitamins A, D, E and K and minerals like iron and zinc build up. Upper intake levels for adults, per NIH: vitamin D 100 mcg (4,000 IU), preformed vitamin A 3,000 mcg, iron 45 mg, zinc 40 mg a day. Past these, harm risk rises. Test first, then work out a dose with a clinician."],
    ["How the basics fit together", "Food is broken down by stomach acid and enzymes, absorbed in the small intestine, and processed by the liver. Fiber feeds gut bacteria, which make short-chain fatty acids. Sleep, movement, stress and food all change blood sugar, inflammation and hormones. This is why the 90-day plan in the Change tab focuses on habits."]
  ],
  bodySrc: [["MedlinePlus lab tests", "https://medlineplus.gov/lab-tests/"], ["NIH Office of Dietary Supplements", "https://ods.od.nih.gov/"], ["NIH: dietary reference intakes", "https://ods.od.nih.gov/HealthInformation/nutrientrecommendations.aspx"]],

  herbs: [
    ["Plants really are medicine", "Aspirin came from willow bark, digoxin from foxglove, artemisinin from sweet wormwood (Nobel Prize 2015) and metformin from French lilac. This is why herbs deserve respect: they act like drugs, which means they have doses, side effects and interactions."],
    ["What 'cure' means", "A cure is something shown in good trials to remove a specific disease. For most chronic diseases no single herb has been shown to cure them. Where an herb helps, it is for a defined use at a studied dose. I can't give you a personal cure plan, and neither can a label or website. That takes a clinician who knows your results."],
    ["St John's wort", "Speeds up how the liver clears many drugs. It can weaken birth control, blood thinners, transplant drugs and some HIV and cancer drugs, and can cause serotonin syndrome with antidepressants."],
    ["Ginkgo, garlic, ginger, fish oil", "Can add to bleeding risk with blood thinners or before surgery."],
    ["Kava, green tea extract, turmeric extract", "Concentrated extracts have been linked to liver injury in case reports. Food amounts are not the same as capsules."],
    ["Licorice root", "Real licorice can raise blood pressure and lower potassium."],
    ["Safer habits", "Tell every clinician and pharmacist what you take. Stop supplements before surgery as advised. Pick products tested by a third party (USP, NSF). Do not replace prescribed medicine with an herb without talking to your prescriber. Seek urgent care for chest pain, trouble breathing, severe allergic reaction or yellow skin or eyes."]
  ],
  herbsSrc: [["NCCIH: herbs at a glance", "https://www.nccih.nih.gov/health/herbsataglance"], ["NIH LiverTox", "https://livertox.nih.gov/"], ["Nobel Prize 2015 (artemisinin)", "https://www.nobelprize.org/prizes/medicine/2015/tu/facts/"]],

  sources: [
    ["WHO / JECFA food additives database", "https://apps.who.int/food-additives-contaminants-jecfa-database/"],
    ["IARC Monographs classifications", "https://monographs.iarc.who.int/list-of-classifications"],
    ["EFSA food additives", "https://www.efsa.europa.eu/en/topics/topic/food-additives"],
    ["EUR-Lex (EU law)", "https://eur-lex.europa.eu/"],
    ["US FDA: food ingredients", "https://www.fda.gov/food/food-ingredients-packaging"],
    ["US eCFR 21 CFR Part 101 (labeling)", "https://www.ecfr.gov/current/title-21/chapter-I/subchapter-B/part-101"],
    ["PubMed (research papers)", "https://pubmed.ncbi.nlm.nih.gov/"],
    ["NIH Office of Dietary Supplements", "https://ods.od.nih.gov/"],
    ["NCCIH (herbs, evidence)", "https://www.nccih.nih.gov/"],
    ["Health Canada food additives", "https://www.canada.ca/en/health-canada/services/food-nutrition/food-safety/food-additives.html"],
    ["UK Food Standards Agency", "https://www.food.gov.uk/"]
  ],
  disclaimer: "This is education, not medical advice. Ask a licensed clinician about your own tests, medicines and doses. Links point to government, international health bodies and peer-reviewed or primary sources. Laws change, so check the linked page for the current rule."
};

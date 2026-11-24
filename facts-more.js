/* Additional claims and law milestones. Loaded after facts-data.js. */
(() => {
  const F = window.FACTS; if (!F) return;
  F.claims.push(
    { q: "Trans fats (partially hydrogenated oils) are harmful", v: "supported",
      a: "Industrial trans fat raises LDL and lowers HDL cholesterol and is linked to heart disease. FDA determined in 2015 that partially hydrogenated oils are not generally recognized as safe, with a phase-out after that. WHO has a program to eliminate industrially produced trans fat worldwide. Small amounts of natural trans fat occur in dairy and meat.",
      src: [["WHO: trans fat fact sheet", "https://www.who.int/news-room/fact-sheets/detail/trans-fat"], ["FDA: trans fat", "https://www.fda.gov/food/food-additives-petitions/trans-fat"]] },
    { q: "Non-sugar sweeteners (sucralose, acesulfame, aspartame) are a healthy swap for sugar", v: "partial",
      a: "WHO's 2023 guideline conditionally recommends against using non-sugar sweeteners to control body weight or reduce disease risk, because trials and cohorts did not show lasting benefit and suggested possible long-term harms. That is a precaution built on limited evidence, not a finding that they poison you. Approved sweeteners stay within acceptable daily intakes.",
      src: [["WHO guideline on non-sugar sweeteners (2023)", "https://www.who.int/news/item/15-05-2023-who-advises-not-to-use-non-sugar-sweeteners-for-weight-control-in-newly-released-guideline"]] },
    { q: "Erythritol (a sugar alcohol) raises heart attack and stroke risk", v: "mixed",
      a: "A 2023 Nature Medicine study found higher blood erythritol was associated with more cardiovascular events and that it made platelets more clot-prone in a small experiment. That is observational evidence plus a short test, and the body also makes erythritol itself, so causation is not settled. If you have heart disease, ask your clinician.",
      src: [["Witkowski et al., Nature Medicine 2023", "https://doi.org/10.1038/s41591-023-02223-9"]] },
    { q: "Ultra-processed foods make you sick", v: "partial",
      a: "A 2024 BMJ umbrella review found higher ultra-processed food intake associated with higher risk of many outcomes, including cardiovascular disease, type 2 diabetes, depression and early death. Most evidence is observational, and the NOVA grouping is broad, so researchers are still working out which features (sugar, salt, additives, low fiber, eating speed) matter most.",
      src: [["Lane et al., BMJ 2024", "https://doi.org/10.1136/bmj-2023-077310"]] },
    { q: "Salt (sodium) in processed food is a problem", v: "supported",
      a: "WHO advises adults eat under 2 g sodium (about 5 g salt) a day. Most people eat roughly double. High sodium raises blood pressure, which drives stroke and heart disease. Packaged foods and restaurant meals are the main source in many countries.",
      src: [["WHO: salt reduction fact sheet", "https://www.who.int/news-room/fact-sheets/detail/salt-reduction"]] },
    { q: "Caramel color causes cancer", v: "partial",
      a: "The by-product 4-methylimidazole (4-MEI) formed in class III and IV caramel color is classified as possibly carcinogenic (IARC 2B) from rodent studies. California's Prop 65 set a daily exposure threshold, and many drink makers reformulated to cut 4-MEI. Class I caramel color has no such by-product.",
      src: [["IARC classifications list", "https://monographs.iarc.who.int/list-of-classifications"]] },
    { q: "Sulfites in food and wine cause headaches", v: "mixed",
      a: "Sulfites can trigger asthma attacks and hives in sensitive people, which is why they must be labeled at 10 ppm or more in the US. Evidence that they cause headaches in the general population is weak.",
      src: [["21 CFR 101.100 (sulfite declaration)", "https://www.ecfr.gov/current/title-21/chapter-I/subchapter-B/part-101/subpart-G/section-101.100"]] },
    { q: "Triclosan in soap and toothpaste is safe and helps", v: "unsupported",
      a: "FDA ruled in 2016 that consumer antiseptic washes with triclosan could no longer be marketed because makers did not show they were safer or better than plain soap and water. Concerns include hormone disruption in animal studies and environmental build-up.",
      src: [["FDA: triclosan", "https://www.fda.gov/consumers/consumer-updates/triclosan-what-consumers-should-know"]] },
    { q: "Baby food contains toxic heavy metals", v: "supported",
      a: "Testing, including a 2021 US congressional report, found lead, arsenic, cadmium and mercury in many baby foods, mostly from soil and water rather than additives. FDA's Closer to Zero program is working to lower them. Varying the foods a child eats lowers exposure to any one source.",
      src: [["FDA: Closer to Zero", "https://www.fda.gov/food/environmental-contaminants-food/closer-zero-reducing-childhood-exposure-contaminants-foods-babies-and-young-children"]] },
    { q: "Aluminum in food additives causes Alzheimer's", v: "unsupported",
      a: "Reviews have not shown aluminum from food or antiperspirant causes Alzheimer's disease. Health bodies still set a tolerable weekly intake because aluminum builds up in people with kidney disease.",
      src: [["EFSA aluminium opinion (2008)", "https://www.efsa.europa.eu/en/efsajournal/pub/754"]] }
  );
  F.laws.push(
    { y: "2015", t: "FDA finds partially hydrogenated oils not GRAS", d: "Decades after studies tied trans fat to heart disease, FDA moved to remove the main source from the US food supply. Several countries (Denmark in 2003) had restricted it earlier.", src: ["FDA: trans fat", "https://www.fda.gov/food/food-additives-petitions/trans-fat"] },
    { y: "2016", t: "FDA acts on triclosan in consumer soaps", d: "Makers were given a year to remove triclosan and 18 other ingredients from consumer antiseptic washes.", src: ["FDA: triclosan", "https://www.fda.gov/consumers/consumer-updates/triclosan-what-consumers-should-know"] },
    { y: "2023", t: "WHO advises against non-sugar sweeteners for weight control", d: "A conditional guideline based on a review of the evidence.", src: ["WHO news", "https://www.who.int/news/item/15-05-2023-who-advises-not-to-use-non-sugar-sweeteners-for-weight-control-in-newly-released-guideline"] }
  );
  F.laws.sort((a, b) => parseInt(a.y) - parseInt(b.y));
})();

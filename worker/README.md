# Submit-without-an-account setup (one time, about 10 minutes, free)

1. **Token.** GitHub → Settings → Developer settings → Fine-grained tokens → Generate. Repository access: only `LabelLens-IngredientFacts`. Permissions: **Issues: Read and write** (nothing else). Copy it.
2. **Worker.** Sign in at dash.cloudflare.com → Workers & Pages → Create → Hello World → name it `labellens-submit` → Deploy → Edit code → paste `worker/worker.js` → Deploy.
3. **Secret.** Worker → Settings → Variables and Secrets → add secret `GH_TOKEN` = the token.
4. **Link the site.** Copy the Worker URL (`https://labellens-submit.<you>.workers.dev`). In the repo: Settings → Secrets and variables → Actions → New secret `SUBMIT_URL` = that URL. Re-run the "Deploy site" workflow.

The token can only open issues, so even if it leaked it cannot change your code. The workflow then fact-checks each issue and publishes it.

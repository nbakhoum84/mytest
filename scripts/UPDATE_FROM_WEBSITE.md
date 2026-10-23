# Scheduled task: keep the app in sync with home-nader.com

This file is the runbook for the daily scheduled task. Repository: `nbakhoum84/mytest`,
branch `claude/home-nader-app-code-qq450r`. The web app is published from a second repository,
`nbakhoum84/nbakhoum84.github.io` (GitHub Pages, branch `main`, address https://nbakhoum84.github.io/).

## Rules
- Only change what the website clearly shows has changed. Never invent values. If something is unclear, leave it and say so in the report.
- WebFetch returns a summary, which can misread or reformat text (phone numbers, spacing, quotes, link paths). Treat a difference as real only if it is
  substantive (a different number, address, city, link or key, not just formatting) AND a second WebFetch with a prompt asking for the exact
  text/URL verbatim shows the same new value. When in doubt, change nothing and mention it in the report.
- Never remove a working city, link or calculator because it was missing from one fetch; only remove it if the site clearly no longer has it on two fetches.
- The Pages repository `nbakhoum84/nbakhoum84.github.io` also hosts files the website itself loads (for example `hn.js`). NEVER delete, rename or edit any file there except the app's own build files, and never wipe the repository. After publishing, confirm `hn.js` is still present.
- No design changes, no new features, no pull requests, no force pushes. Touch only the two repositories above.
- If nothing changed: make no commit and no push. Just report "No website changes found".
- If the build or any check fails: do not push or publish anything. Report the error.

## Steps
1. Get the code: clone `nbakhoum84/mytest` if it is not already present (use the add_repo tool with push access if needed),
   check out `claude/home-nader-app-code-qq450r`, pull. Run `npm install` and `pip install pillow` if needed.
2. Read the live website. Direct `curl` is blocked (403); use WebFetch on:
   - https://home-nader.com/  (header contact details, navigation menus, footer, address)
   - https://home-nader.com/mortgage-calculators  (calculator widgets)
3. Compare with `src/config.js`:
   - `AGENT`: phone, phoneDisplay, email, address, whatsapp link, calendly link.
   - `CITIES`: the list of cities in the Residential menu, and the URL patterns in `CATEGORIES`
     (`/{city}-listings`, `/{city}` for commercial, `/presales-{city}`, `/{city}-sold-listings`; city slugs are lower case with hyphens).
   - The two non-city pages in the Presales/New menu, kept in `CATEGORIES` (presales) `extras`:
     `/new-homes-under-construction` and `/foreclosures-listings`.
   - `RESOURCES`: buyer's guide `/home-buyers-guide`, `/faq`, `/blog` and the two PDF guide links.
   - `COST_PAGES`: the Cash to Close (`/cash-to-close`) and Seller Cost (`/seller-cost`) pages in the website's Calculators menu.
   - `RATEHUB`: the widget keys on the calculators page (`PaymentCalculator`, `ProductTableMortgages`,
     `AffordabilityCalculator`, `DownPaymentCalculator`, `LandTransferTaxCalculator`) and the calculator names.
   - Mortgage rules in `src/calc.js` (CMHC tiers, BC transfer tax) are NOT on the website. Do not change them.
   - The built-in Cash to Close and Seller cost calculators (`BUYER`, `SELLER`, `buyerCost`, `sellerCost` in `src/calc.js`) copy the
     figures on https://home-nader.com/cash-to-close and /seller-cost (fixed amounts, exemption notes, commission defaults, GST).
     The website page text is the only thing the task can read. If the notes/defaults there clearly differ from the code, do NOT edit
     the calculators. Report the difference to the owner so they can confirm the new figures.
   - The 10-item checklists (`CHECKLISTS` in `src/config.js`) come from the Checklist tab of those pages, which the task cannot read. Leave them alone.
4. If nothing differs, stop here (see Rules).
5. Otherwise edit `src/config.js` (only the differing values), then:
   - `npm run build:web`   (must succeed; writes `dist/`)
   - `python3 scripts/make_snack.py`, then `npx esbuild --loader:.js=jsx snack/App.js --outfile=/tmp/snack-check.js` (must succeed)
   - rebuild `web-build/home-nader-web.zip` from `dist/` (every file at the top level, no folders)
   - commit everything to the branch with a message listing what changed on the website, and push.
     (A push also starts one Android build on Expo. That is expected.)
6. Publish the web app: add the repo `nbakhoum84/nbakhoum84.github.io` with the add_repo tool (push access), clone it with depth 1
   to `/home/user/nbakhoum84.github.io`, then run
   `scripts/deploy_web.sh /home/user/nbakhoum84.github.io "Sync with website: <short summary>"`.
   If add_repo is refused, do not try other ways. Report that publishing needs a manual upload of `web-build/home-nader-web.zip`.
7. The website's home page block (`website/install-app-block.html`) lives in Lofty and cannot be edited from here.
   It only needs a change if the app's address or name changes, which website edits do not cause. If it ever
   needs to change, update the file in the repo and tell the user to paste it into Lofty again.
8. Final report (short, plain language): what changed on the website, what was updated in the app, whether it was
   published, and anything the user must do by hand.

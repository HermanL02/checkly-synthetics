# Checkly Synthetics

Monitoring as code for your synthetics, deployed with the [Checkly CLI](https://www.checklyhq.com/docs/cli/).

| Group | What it monitors | Defined in |
|---|---|---|
| **Playwright Checks** | One Browser Check per Playwright test in `src/tests/` | `src/__checks__/playwright/playwright-checks.check.ts` |
| **User API Checks** | One API Check per user in `users.json` | `src/__checks__/api/user-api-checks.check.ts` |

- Checks run every 10 minutes from `us-east-1` and `eu-central-1`.
- If a check fails, it is retried once from another location. If the retry also fails, **raccoon@checklyhq.com** gets an email. You get another email when the check recovers.

## Project structure

```
.
├── checkly.config.ts                      # Project defaults: frequency, locations, runtime
├── playwright.config.ts                   # Only used to run the tests on your machine
├── eslint.config.mjs                      # Lint rules, including Playwright rules
└── src/
    ├── tests/                             # ALL Playwright tests live here
    │   ├── automation-exercise-checkout.spec.ts
    │   └── pokemon-type.spec.ts
    └── __checks__/
        ├── utils/alert-channels.ts        # Email alert channel
        ├── playwright/
        │   └── playwright-checks.check.ts # Group 1: picks up every src/tests/**/*.spec.ts
        └── api/
            ├── users.json                 # The users to monitor
            ├── create-user-api-check.ts   # Reusable function that builds one API Check
            └── user-api-checks.check.ts   # Group 2: one API Check per user
```

## Setup (one time)

You need Node.js 18 or later and a Checkly account.

```bash
npm install
npx checkly login
```

Save the API token as a **secret** environment variable in Checkly. Don't put the token in code or commit it to git. Once a variable is saved as a secret, it can't be read back and is hidden in check results.

```bash
npx checkly env add USERS_API_TOKEN <token-without-the-Bearer-prefix> --secret
```

At run time, the API Checks send it as `Authorization: Bearer {{USERS_API_TOKEN}}`.

## Daily use

| Command | What it does |
|---|---|
| `npm test` (`npx checkly test`) | Runs every check once from Checkly's infrastructure. Nothing is deployed. |
| `npm run deploy` (`npx checkly deploy`) | Deploys the checks so they run on schedule and send alerts |
| `npm run test:local` (`npx playwright test`) | Runs the Playwright tests on your machine while you write them |
| `npm run lint` | Lints the project, e.g. finds missing `await`s in tests |
| `npm run typecheck` | Type-checks the checks and tests with TypeScript |

Useful options:

```bash
npx checkly test --tags playwright         # Only the Playwright group (or --tags api)
npx checkly test --record                  # Save the run as a test session with a shareable link
npx checkly deploy --preview               # Show what a deploy would change
```

### Add a new Playwright check

Add a `*.spec.ts` file to `src/tests/`, then run `npx checkly test` and `npx checkly deploy`. You don't need to change any config. The group uses `testMatch: '../../tests/**/*.spec.ts'`, so every new file becomes a Browser Check in the **Playwright Checks** group.

### Add, change or remove an API check

Edit `src/__checks__/api/users.json` and deploy. Each user becomes one API Check that asserts:

- the status code is `200`
- `$.id` in the response equals the user's `id`
- `$.name` in the response equals the user's `name`

If you remove a user from the file, `checkly deploy` deletes that user's check. To monitor other data the same way, call `createUserApiCheck(user, group)` from `create-user-api-check.ts`.

## What was wrong with the original tests

Each fix is in its own commit, so you can see exactly what changed in the git history.

**pokemon-type.spec.ts**

- `forms` is an array. Use `forms[0].url`, not `forms.url`. `forms.url` was `undefined`, so the third request failed with `Invalid URL`.
- `types[0].type` is an object (`{ name, url }`). Compare `types[0].type.name` with `'electric'`.
- `expect(response).toBeOK()` is async and needs `await`. Without it, the test keeps running after a failed request and fails later with a confusing error.

**automation-exercise-checkout.spec.ts**

- "Continue Shopping" is a `button`, not a `link`. The test waited for a link that doesn't exist and timed out.
- The checkout modal's link is "Register / Login", not "Register / Signup".
- `expect(locator).toBeVisible` was missing `await` and `()`, so none of the three assertions ever ran.
- The GDPR consent dialog only appears in some regions, such as `eu-central-1`. `isVisible()` checks once and doesn't wait. `page.addLocatorHandler` now dismisses the dialog whenever it appears.
- "Products" and "Cart" are scoped to the page header. Ads on the page are also exposed as links (for example "Biba Product Cart"), which made `getByRole('link', { name: 'Cart' })` match two elements.
- `page.goto` waits for `domcontentloaded` instead of the full `load` event. Third-party ads sometimes never finish loading, which made `goto` time out.

`npm run lint` now catches the first class of problems (missing `await`, uncalled matchers) before they reach Checkly.

## Known issues

**jsonmap.site is down (as of 2026-11-04).** The three User API Checks fail from every location:

- The TLS certificate is only valid for `*.up.railway.app`, so certificate verification fails.
- With verification skipped, the server returns `404 Application not found`. This is what the host (Railway) returns when no app is deployed behind the domain.

The checks are set up correctly and report the outage as they should. Once the API is back, they'll pass with no changes, as long as the response has top-level `id` and `name` fields. If the fields have different names or are nested, update the two `jsonBody(...)` paths in `create-user-api-check.ts`.

**automationexercise.com is sometimes overloaded.** It's a public practice site and occasionally returns "This website is under heavy load (queue full)". The retry on another location filters out most of these, so a single overloaded run doesn't alert you.

## Running the tests locally on Linux

`playwright.config.ts` sets `channel: 'chrome'`, so local runs use your installed Google Chrome. Some newer Linux distributions don't support Playwright's bundled Chromium. If you'd rather use the bundled browser, remove that line and run `npx playwright install chromium`. This setting only affects local runs. Checkly uses the browser that comes with its runtime.

import { AlertEscalationBuilder, CheckGroupV2, RetryStrategyBuilder } from 'checkly/constructs'
import { emailChannel } from '../utils/alert-channels'

/**
 * Group: every Playwright test in src/tests.
 *
 * `testMatch` turns each matching file into a check inside this group, so a new test
 * added to src/tests is picked up automatically on the next `npx checkly deploy`:
 *   - *.api.spec.ts -> Multistep Check (API calls only, no browser)
 *   - other *.spec.ts -> Browser Check
 * Paths are relative to this file.
 */
export const playwrightGroup = new CheckGroupV2('playwright-checks-group', {
  name: 'Playwright Checks',
  tags: ['playwright'],
  alertChannels: [emailChannel],
  alertEscalationPolicy: AlertEscalationBuilder.runBasedEscalation(1),
  retryStrategy: RetryStrategyBuilder.linearStrategy({
    baseBackoffSeconds: 30,
    maxRetries: 1,
    sameRegion: false,
  }),
  // Tests that open a page run as Browser Checks.
  browserChecks: {
    testMatch: '../../tests/**/!(*.api).spec.ts',
  },
  // API-only tests (named *.api.spec.ts) run as Multistep Checks: no browser, faster and cheaper.
  multiStepChecks: {
    testMatch: '../../tests/**/*.api.spec.ts',
  },
})

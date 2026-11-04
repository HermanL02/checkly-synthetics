import { CheckGroupV2, RetryStrategyBuilder } from 'checkly/constructs'
import { emailChannel } from '../utils/alert-channels'

/**
 * Group: every Playwright test in src/tests.
 *
 * `testMatch` turns each matching *.spec.ts file into a Browser Check inside this group,
 * so a new test added to src/tests is picked up automatically on the next `npx checkly deploy`.
 * The path is relative to this file.
 */
export const playwrightGroup = new CheckGroupV2('playwright-checks-group', {
  name: 'Playwright Checks',
  tags: ['playwright'],
  alertChannels: [emailChannel],
  retryStrategy: RetryStrategyBuilder.linearStrategy({
    baseBackoffSeconds: 30,
    maxRetries: 1,
    sameRegion: false,
  }),
  browserChecks: {
    testMatch: '../../tests/**/*.spec.ts',
  },
})

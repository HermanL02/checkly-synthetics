import { defineConfig, devices } from '@playwright/test'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(__dirname, '.env') })

/**
 * See https://playwright.dev/docs/test-configuration.
 */

export default defineConfig({
  timeout: 30000,
  use: {
    viewport: { width: 1280, height: 720 },
    trace: 'on',
  },
  projects: [
    {
      name: 'Chromium',
      testDir: './src/tests/',
      use: {
        ...devices['Desktop Chrome'],
        // Optionally add Checkly user-agent
        userAgent: `${devices['Desktop Chrome'].userAgent} (Checkly, https://www.checklyhq.com)`,
      },
    },
  ]
})

import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import playwright from 'eslint-plugin-playwright'

export default tseslint.config(
  { ignores: ['node_modules/', 'test-results/', 'playwright-report/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Playwright rules for the tests, e.g. `missing-playwright-await` catches
    // async assertions like `expect(response).toBeOK()` that are not awaited.
    ...playwright.configs['flat/recommended'],
    files: ['src/tests/**/*.ts'],
  },
)

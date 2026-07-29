import { defineConfig, devices } from '@playwright/test'

// GitHub-hosted runners do not expose a physical GPU. Functional browser tests
// do not need one: Chromium's SwiftShader backend is sufficient to exercise the
// WebGL scene, interactions and fallback behavior. Real-GPU performance and
// pixel-fidelity checks belong in a separate, non-blocking test suite.
const ciSoftwareWebGLArgs = [
  '--use-gl=angle',
  '--use-angle=swiftshader-webgl',
  '--enable-unsafe-swiftshader',
]
const runningInCI = Boolean(globalThis.process?.env?.CI)

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  // SwiftShader is CPU-backed. One worker keeps functional WebGL checks
  // deterministic on shared GitHub runners without weakening their assertions.
  workers: runningInCI ? 1 : 2,
  retries: 1,
  // These tests generate review assets by opening multiple simultaneous 3D
  // contexts and taking dozens of screenshots. They are intentionally local
  // visual-review tools, not functional CI gates.
  grepInvert: runningInCI ? /@visual/ : undefined,
  reporter: [['list'], ['html', { outputFolder: 'artifacts/playwright-report', open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4318',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    reducedMotion: 'no-preference',
  },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        // Playwright's default headless shell does not expose SwiftShader WebGL
        // on Linux. The full Chromium channel uses the modern headless path.
        channel: runningInCI ? 'chromium' : undefined,
        launchOptions: runningInCI ? { args: ciSoftwareWebGLArgs } : undefined,
      },
    },
    {
      name: 'tablet',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1024, height: 768 },
        hasTouch: true,
      },
    },
    {
      name: 'mobile-390',
      use: {
        ...devices['iPhone 13'],
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: 'mobile-320',
      use: {
        ...devices['iPhone SE'],
        browserName: 'chromium',
        viewport: { width: 320, height: 568 },
      },
    },
  ],
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4318',
    url: 'http://127.0.0.1:4318',
    reuseExistingServer: true,
    timeout: 120_000,
  },
})

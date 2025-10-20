// jest.config.cjs / jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],

  // 让 ts-jest 走 ESM
  extensionsToTreatAsEsm: ['.ts', '.tsx'],

  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|avif|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
        '<rootDir>/src/__mocks__/fileMock.js',
  },

  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          jsx: 'react-jsx',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          skipLibCheck: true,
          strict: false,
          noEmit: true,
          module: 'esnext',
          moduleResolution: 'node',
          target: 'es2015',
          lib: ['es2015', 'dom'],
          types: ['jest', 'node'],
        },
      },
    ],
    '^.+\\.(js|jsx)$': 'babel-jest',
  },

  // ✅ 只匹配 .test/.spec 结尾的用例（去掉宽松规则）
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(test|spec).[tj]s?(x)',
  ],

  // ✅ 明确忽略 Vitest 专用文件或目录
  testPathIgnorePatterns: [
    '<rootDir>/src/__tests__/.*\\.vitest\\.[tj]sx?$',
    '<rootDir>/tests/vitest/',
    '/node_modules/',
    '/dist/',
  ],

  collectCoverageFrom: [
    'src/sections/QueenslandSatellite/**/*.{ts,tsx}',
    'src/sections/VictoriaSatellite/**/*.{ts,tsx}',
    'src/sections/home/**/*.{ts,tsx}',
    'src/Outreach/**/*.{ts,tsx}',
    'src/Mentorship.tsx',
    '!src/sections/QueenslandSatellite/**/*.d.ts',
    '!src/sections/VictoriaSatellite/**/*.d.ts',
    '!src/sections/home/**/*.d.ts',
    '!src/Outreach/**/*.d.ts',
    '!src/sections/QueenslandSatellite/**/index.{ts,tsx}',
    '!src/sections/VictoriaSatellite/**/index.{ts,tsx}',
    '!src/sections/home/**/index.{ts,tsx}',
    '!src/Outreach/**/index.{ts,tsx}',
    'src/gallery/**/*.{ts,tsx,js,jsx}',
    'src/news/**/*.{ts,tsx,js,jsx}',
  ],

  coverageThreshold: {
    global: { branches: 80, functions: 80, lines: 80, statements: 80 },
    'src/sections/QueenslandSatellite/': { branches: 50, functions: 80, lines: 80, statements: 80 },
    'src/sections/VictoriaSatellite/':  { branches: 50, functions: 80, lines: 80, statements: 80 },
    'src/Outreach/':                    { branches: 50, functions: 80, lines: 80, statements: 80 },
  },

  coverageReporters: ['text', 'lcov', 'html'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // 仅让某些 ESM 包参与转译
  transformIgnorePatterns: [
    'node_modules/(?!(framer-motion)/)',
  ],
};

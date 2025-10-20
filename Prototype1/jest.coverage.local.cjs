// jest.coverage.local.cjs — 仅跑 news，并修正 ts-jest 的 JSX/interop 选项
/** @type {import('jest').Config} */
const path = require('path');

module.exports = {
    testEnvironment: 'jsdom',
    roots: ['<rootDir>/src/news'],
    testMatch: [
        '**/__tests__/**/*.(test|spec).[jt]s?(x)',
        '**/?(*.)+(test|spec).[tj]s?(x)',
    ],
    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        '<rootDir>/src/__tests__/.*\\.vitest\\.[tj]sx?$',
        '<rootDir>/tests/vitest/',
    ],

    // 关键：让 ts-jest 处理 TS/TSX，并内联 tsconfig 选项（无需改你的 tsconfig.json）
    transform: {
        '^.+\\.(ts|tsx)$': [
            'ts-jest',
            {
                tsconfig: {
                    jsx: 'react-jsx',                 // 或 'react'（旧项目）
                    esModuleInterop: true,            // 允许 `import React from "react"`
                    allowSyntheticDefaultImports: true,
                    isolatedModules: false,           // 用 TS 编译器全编译
                    module: 'commonjs',
                    target: 'es2019',
                },
                diagnostics: { warnOnly: false },
            },
        ],
        '^.+\\.(js|jsx|mjs)$': 'babel-jest',    // 如果没有 babel-jest 也没关系，可删掉这一行
    },

    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    transformIgnorePatterns: ['/node_modules/'],

    // 只统计 news 下的文件覆盖率
    collectCoverageFrom: [
        'src/news/**/*.{js,jsx,ts,tsx}',
        '!src/news/**/__tests__/**',
        '!src/news/**/?(*.)+(test|spec).[tj]s?(x)',
        '!src/news/**/*.{d.ts,css}',
        '!src/news/**/{types,data}.ts',
    ],
    coverageDirectory: 'coverage-news',
    coverageReporters: ['html', 'text-summary'],

    // 有的话就自动加载
    setupFilesAfterEnv: (() => {
        const fs = require('fs');
        const p = path.join(__dirname, 'jest.setup.js');
        return fs.existsSync(p) ? ['<rootDir>/jest.setup.js'] : [];
    })(),
};

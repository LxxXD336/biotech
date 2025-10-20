// vitest.pastwinners.config.ts
import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config' // ← 关键：继承你的 Vite 配置（含 @vitejs/plugin-react）

export default mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            environment: 'jsdom',
            coverage: {
                provider: 'v8',
                include: ['src/components/PastWinners.tsx'], // ← 只统计这个文件
                all: true,
                reporter: ['html','text-summary','lcov'],
                reportsDirectory: './coverage-pastwinners'
            },
        },
        // 保险起见，即使某些场景没加载到 react 插件，也强制自动 JSX：
        esbuild: { jsx: 'automatic', jsxImportSource: 'react' },
    })
)

import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import '@testing-library/jest-dom'

/** ---------- 轻量 mock AuroraBadge：只校验关键 props ---------- */
jest.mock('../AuroraBadge', () => {
  return {
    __esModule: true,
    default: (props: any) => (
      <div
        data-testid="aurora-badge"
        data-percent={props.percent}
        data-label={props.label}
        data-size={props.size}
        data-active={props.active ? '1' : '0'}
      />
    ),
  }
})

/** ---------- Polyfills：IntersectionObserver & RAF ---------- */
let lastIO: any
class IO {
  _cb: IntersectionObserverCallback
  disconnect = jest.fn()
  constructor(cb: IntersectionObserverCallback) {
    this._cb = cb
    lastIO = this
  }
  observe = (el: Element) => {
    // 立即回调：进入可视区
    this._cb([{ isIntersecting: true, target: el } as any], this as any)
  }
  unobserve = () => {}
  takeRecords = () => []
}
;(globalThis as any).IntersectionObserver = IO as any

if (!(globalThis as any).requestAnimationFrame) {
  ;(globalThis as any).requestAnimationFrame = (cb: (t: number) => void) =>
    setTimeout(() => cb(typeof performance !== 'undefined' ? performance.now() : Date.now()), 0) as unknown as number
}
if (!(globalThis as any).cancelAnimationFrame) {
  ;(globalThis as any).cancelAnimationFrame = (id: number) => clearTimeout(id as unknown as any)
}

/** 为了更稳定地加载被测组件（避免顶层执行与 mock 次序问题） */
const loadStats = () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require('../OutreachAnimatedStats')
  return (mod.default ?? mod.Stats) as React.ComponentType<any>
}

describe('OutreachAnimatedStats', () => {
  test('标题区：kicker/title/subtitle 渲染 + 居中对齐', async () => {
    const Stats = loadStats()
    render(
      <Stats
        kicker="STATS"
        title="Our Impact"
        subtitle="Animated counters for outreach"
        items={[{ label: 'People Reached', value: 100 }]}
        align="center"
        durationMs={1}
      />
    )
    expect(screen.getByText('STATS')).toBeInTheDocument()
    const h = screen.getByRole('heading', { name: 'Our Impact' })
    expect(h).toBeInTheDocument()
    expect(screen.getByText('Animated counters for outreach')).toBeInTheDocument()
    expect(h.closest('header')).toHaveClass('text-center')
  })

  test('没有标题内容时不渲染 header；默认左对齐数字卡片', () => {
    const Stats = loadStats()
    render(<Stats items={[{ label: 'A', value: 1 }]} durationMs={1} />)
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    // 找到一个数字卡片并验证 label 存在
    expect(screen.getByText('A')).toBeInTheDocument()
  })

  test('数字动画到最终值并显示 suffix', async () => {
    const Stats = loadStats()
    render(
      <Stats
        items={[
          { label: 'Attendees', value: 1200, suffix: '+' },
          { label: 'Schools', value: 15 },
        ]}
        durationMs={1}
      />
    )
    // label 先渲染
    expect(screen.getByText('Attendees')).toBeInTheDocument()
    expect(screen.getByText('Schools')).toBeInTheDocument()

    // 等动画到终态
    await waitFor(() => {
      expect(screen.getByText('1200+')).toBeInTheDocument()
      expect(screen.getByText('15')).toBeInTheDocument()
    })
  })

  test('AuroraBadge 透传 props 且进入视口后 active=1；卸载时调用 IO.disconnect', async () => {
    const Stats = loadStats()
    const { unmount } = render(
      <Stats
        items={[{ label: 'B', value: 2 }]}
        badgePercent={72}
        badgeLabel="Female participants"
        badgeSize={180}
        durationMs={1}
      />
    )
    const badge = await screen.findByTestId('aurora-badge')
    expect(badge).toHaveAttribute('data-percent', '72')
    expect(badge).toHaveAttribute('data-label', 'Female participants')
    expect(badge).toHaveAttribute('data-size', '180')
    expect(badge).toHaveAttribute('data-active', '1') // IO 已触发

    unmount()
    expect(lastIO.disconnect).toHaveBeenCalled()
  })

  test('Donut：渲染圆环与图例；不传 donutItems 则不渲染', async () => {
    const Stats = loadStats()
    const { rerender } = render(
      <Stats
        items={[{ label: 'X', value: 1 }]}
        donutTitle="Attendance breakdown"
        donutItems={[
          { label: 'Students', value: 80, color: '#123' }, // 显式颜色
          { label: 'Mentors', value: 20 },                 // 走 palette 回退
        ]}
        donutPalette={['#111', '#222']}
        donutSize={180}
        donutThickness={20}
        durationMs={1}
      />
    )
    // 标题作为 aria-label
    const donut = screen.getByLabelText('Attendance breakdown')
    expect(donut).toBeInTheDocument()
    // 图例
    expect(screen.getByText('Students')).toBeInTheDocument()
    expect(screen.getByText('Mentors')).toBeInTheDocument()
    expect(screen.getByText('80')).toBeInTheDocument()
    expect(screen.getByText('20')).toBeInTheDocument()

    // SVG 里：1 条背景 + 2 条分段
    const svg = donut.querySelector('svg')!
    const circles = svg.querySelectorAll('circle')
    expect(circles.length).toBeGreaterThanOrEqual(3)

    // 过滤出分段圆弧（排除灰色背景）
    const segs = Array.from(circles).filter(
      c => c.getAttribute('stroke') && c.getAttribute('stroke') !== 'rgba(0,0,0,.08)'
    )
    expect(segs).toHaveLength(2)
    expect(segs[0].getAttribute('stroke')).toBe('#123') // 显式
    expect(segs[1].getAttribute('stroke')).toBe('#222') // palette 回退生效

    // 不传 donutItems -> 不渲染图例
    rerender(<Stats items={[{ label: 'Only', value: 1 }]} durationMs={1} />)
    expect(screen.queryByText('Students')).not.toBeInTheDocument()
    expect(screen.queryByText('Mentors')).not.toBeInTheDocument()
  })

  test('cols 布局：2/3/4 栅格类名切换', () => {
    const Stats = loadStats()

    const { rerender } = render(
      <Stats
        items={[
          { label: 'I1', value: 1 },
          { label: 'I2', value: 2 },
          { label: 'I3', value: 3 },
          { label: 'I4', value: 4 },
        ]}
        cols={2}
        durationMs={1}
      />
    )
    // 找一个卡片，向上找到包含 grid 的容器
    const card = screen.getByText('I1')
    const grid = card.closest('.grid') as HTMLElement
    expect(grid?.className).toMatch(/grid-cols-2(?!.*md:grid-cols-4)/)

    rerender(
      <Stats
        items={[
          { label: 'I1', value: 1 },
          { label: 'I2', value: 2 },
          { label: 'I3', value: 3 },
          { label: 'I4', value: 4 },
        ]}
        cols={4}
        durationMs={1}
      />
    )
    const grid2 = screen.getByText('I1').closest('.grid') as HTMLElement
    expect(grid2?.className).toMatch(/md:grid-cols-4/)
  })

  test('进度条存在且随动画增长（终态宽度接近 100%）', async () => {
    const Stats = loadStats()
    render(
      <Stats
        items={[{ label: 'Bars', value: 10 }]}
        durationMs={1}
      />
    )
    // 进度条外层在 label 卡片内第三块；直接查找“Bars”卡片内部的第一个圆角条的填充
    const card = screen.getByText('Bars').closest('div')!.parentElement as HTMLElement
    const fill = within(card).getAllByRole('generic').find(
      el => el instanceof HTMLDivElement && el.style.width
    ) as HTMLDivElement | undefined

    // 若你的 DOM 结构与这里不同，也可用更直接的选择器：
    // const fill = card.querySelector('div > div > div > div[style*="width"]') as HTMLDivElement

    expect(fill).toBeTruthy()
    await waitFor(() => {
      const w = parseFloat((fill as HTMLDivElement).style.width || '0')
      expect(w).toBeGreaterThan(90) // ~100%
    })
  })
})

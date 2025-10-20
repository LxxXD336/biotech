import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import AuroraBadge from '../AuroraBadge'

/** ---- 环境 polyfills ---- */
// 让组件走“减少动画”分支：数值/进度立即到终态
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (q: string) => ({
      matches: true, media: q, onchange: null,
      addListener: jest.fn(), removeListener: jest.fn(),
      addEventListener: jest.fn(), removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }),
  })

  // IO：一 observe 就触发 isIntersecting=true
  class IO {
    _cb: IntersectionObserverCallback
    constructor(cb: IntersectionObserverCallback) { this._cb = cb }
    observe = (el: Element) => { this._cb([{ isIntersecting: true, target: el } as any], this as any) }
    unobserve = () => {}
    disconnect = () => {}
    takeRecords = () => []
  }
  ;(globalThis as any).IntersectionObserver = IO as any
})

describe('AuroraBadge', () => {
  test('渲染数值/百分号/标签与 aria-label；size/className 生效', async () => {
    const { container } = render(
      <AuroraBadge
        percent={72}
        label="Completion"
        size={200}
        ring={20}
        glow={false}
        active={true}
        className="custom-badge"
      />
    )
    // wrapper：aria-label + 尺寸 + class
    const wrap = screen.getByLabelText('72% Completion')
    expect(wrap).toHaveStyle({ width: '200px', height: '200px' })
    expect(wrap).toHaveClass('custom-badge')

    // 数值 + 百分号 + 文案
    expect(screen.getByText('72')).toBeInTheDocument()
    expect(screen.getByText('%')).toBeInTheDocument()
    expect(screen.getByText('Completion')).toBeInTheDocument()

    // SVG 圆环参数验证
    const circles = container.querySelectorAll('svg circle')
    expect(circles.length).toBeGreaterThanOrEqual(2)
    const track = circles[0] as SVGCircleElement
    const progress = circles[1] as SVGCircleElement

    const size = 200, ring = 20
    const radius = (size - ring) / 2
    const circ = 2 * Math.PI * radius
    const dash = (72 / 100) * circ
    const expectedOffset = (circ - dash).toString()

    expect(track.getAttribute('stroke')).toBe('rgba(255,255,255,0.55)') // 默认 trackColor
    expect(track.getAttribute('stroke-width')).toBe(String(ring))
    expect(track.getAttribute('stroke-dasharray')).toBeCloseToString(circ)

    expect(progress.getAttribute('stroke')).toBe('url(#grad)')
    expect(progress.getAttribute('stroke-dasharray')).toBeCloseToString(circ)
    expect(progress.getAttribute('stroke-dashoffset')).toBeCloseToString(Number(expectedOffset))
  })

  test('linearGradient 使用 colorFrom/colorTo', () => {
    const { container } = render(
      <AuroraBadge percent={10} colorFrom="#111111" colorTo="#222222" active />
    )
    const stops = container.querySelectorAll('linearGradient#grad stop')
    expect(stops[0].getAttribute('stop-color') || stops[0].getAttribute('stopColor')).toBe('#111111')
    expect(stops[1].getAttribute('stop-color') || stops[1].getAttribute('stopColor')).toBe('#222222')
  })

  test('glow=false 不渲染柔光层；glow=true 渲染', () => {
    const { container, rerender } = render(<AuroraBadge percent={50} glow={false} active />)
    expect(container.querySelector('.blur-2xl')).not.toBeInTheDocument()

    rerender(<AuroraBadge percent={50} glow={true} active />)
    expect(container.querySelector('.blur-2xl')).toBeInTheDocument()
  })

  test('percent 超出范围会 clamp 到 0–100：显示100%，但 aria 仍是原始值', async () => {
    render(<AuroraBadge percent={150} label="Over" active />)
    // aria-label 使用原始 percent
    expect(screen.getByLabelText('150% Over')).toBeInTheDocument()
    // 视觉显示 clamp 后的 100
    await waitFor(() => expect(screen.getByText('100')).toBeInTheDocument())
  })

  test('active=false 时不开始：保持 0%', () => {
    render(<AuroraBadge percent={40} label="Wait" active={false} />)
    // 没开始，文本仍为 0%
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('%')).toBeInTheDocument()
    // aria 仍显示目标 40%（来源于 props）
    expect(screen.getByLabelText('40% Wait')).toBeInTheDocument()
  })

  test('active 未传时自动 in-view 启动（由 IO polyfill 触发）', async () => {
    render(<AuroraBadge percent={25} label="Auto" />) // 未传 active
    await waitFor(() => expect(screen.getByText('25')).toBeInTheDocument())
  })
})

/** ---- 小工具：浮点数字符串断言（避免小数误差） ---- */
declare global {
  // 为了 TS 友好：扩展 expect
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeCloseToString(expected: number, digits?: number): R
    }
  }
}
expect.extend({
  toBeCloseToString(received: string | null, expected: number, digits = 4) {
    if (received == null) return { pass: false, message: () => `attribute is null` }
    const recNum = Number(received)
    const pass = Math.abs(recNum - expected) < Math.pow(10, -digits)
    return {
      pass,
      message: () =>
        `expected ${received} to be approximately ${expected} (±1e-${digits})`,
    }
  },
})

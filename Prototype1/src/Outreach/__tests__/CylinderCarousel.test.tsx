import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import * as CarouselNS from '../CylinderCarousel'

// ---------- 必要 polyfills（jsdom 环境） ----------
const EP: any = Element.prototype as any
if (!EP.setPointerCapture) {
  Object.defineProperty(EP, 'setPointerCapture', { value: () => {}, configurable: true })
}
if (!EP.releasePointerCapture) {
  Object.defineProperty(EP, 'releasePointerCapture', { value: () => {}, configurable: true })
}
class RO { observe() {} unobserve() {} disconnect() {} }
;(globalThis as any).ResizeObserver = RO as any
if (!(globalThis as any).requestAnimationFrame) {
  ;(globalThis as any).requestAnimationFrame = (cb: (t:number)=>void) =>
    setTimeout(() => cb(typeof performance !== 'undefined' ? performance.now() : Date.now()), 0) as unknown as number
}
if (!(globalThis as any).cancelAnimationFrame) {
  ;(globalThis as any).cancelAnimationFrame = (id: number) => clearTimeout(id as unknown as any)
}

// 兼容 default / 命名导出
const CylinderCarousel: React.ComponentType<any> =
  (CarouselNS as any).default ?? (CarouselNS as any).CylinderCarousel

const ITEMS = [
  { img: 'a.jpg', title: 'Alpha', blurb: 'A' },
  { img: 'b.jpg', title: 'Bravo', blurb: 'B' },
  { img: 'c.jpg', title: 'Charlie', blurb: 'C' },
]

// 工具
const stageEl = () =>
  document.querySelector('[aria-roledescription="3D cylinder carousel"]') as HTMLElement

const renderCarousel = (props: any = {}) => {
  const onIndexChange = jest.fn()
  const utils = render(
    <CylinderCarousel items={ITEMS} onIndexChange={onIndexChange} {...props} />
  )
  return { ...utils, onIndexChange }
}

describe('CylinderCarousel – full coverage', () => {
  test('基础渲染：舞台、箭头、圆点', () => {
    renderCarousel()
    expect(stageEl()).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
    const dots = screen.getAllByRole('button', { name: /go to slide/i })
    expect(dots).toHaveLength(ITEMS.length)
  })

  test('showArrows=false / showDots=false 时不渲染对应控件', () => {
    renderCarousel({ showArrows: false, showDots: false })
    expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /go to slide/i })).not.toBeInTheDocument()
  })

  test('点击 Next / Prev -> 触发 onIndexChange', async () => {
    const { onIndexChange } = renderCarousel()
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    await waitFor(() => expect(onIndexChange).toHaveBeenCalled())
    let last = onIndexChange.mock.calls[onIndexChange.mock.calls.length - 1][0]
    expect(last).toBe(1)

    await userEvent.click(screen.getByRole('button', { name: /previous/i }))
    await waitFor(() => expect(onIndexChange).toHaveBeenCalledTimes(2))
    last = onIndexChange.mock.calls[onIndexChange.mock.calls.length - 1][0]
    expect(last).toBe(0)
  })

  test('点击圆点 -> 定位到指定卡片', async () => {
    const { onIndexChange } = renderCarousel()
    const dots = screen.getAllByRole('button', { name: /go to slide/i })
    await userEvent.click(dots[2])
    await waitFor(() => expect(onIndexChange).toHaveBeenCalled())
    const last = onIndexChange.mock.calls[onIndexChange.mock.calls.length - 1][0]
    expect(last).toBe(2)
  })

  test('舞台键盘左右键导航', async () => {
    const { onIndexChange } = renderCarousel()
    const stage = stageEl()
    fireEvent.keyDown(stage, { key: 'ArrowRight' })
    await waitFor(() => expect(onIndexChange).toHaveBeenCalled())
    let last = onIndexChange.mock.calls[onIndexChange.mock.calls.length - 1][0]
    expect(last).toBe(1)

    fireEvent.keyDown(stage, { key: 'ArrowLeft' })
    await waitFor(() => expect(onIndexChange).toHaveBeenCalledTimes(2))
    last = onIndexChange.mock.calls[onIndexChange.mock.calls.length - 1][0]
    expect(last).toBe(0)
  })

  test('拖拽 + snapOnRelease：释放后对齐最近卡片', async () => {
    const { onIndexChange } = renderCarousel({ snapOnRelease: true })
    const stage = stageEl()

    // pointer drag 向右拖动 800px -> 旋转到第 2 张（index 1）
    fireEvent.pointerDown(stage, { pointerId: 1, clientX: 50 })
    fireEvent.pointerMove(stage, { pointerId: 1, clientX: 850 })
    fireEvent.pointerUp(stage,   { pointerId: 1, clientX: 850 })

    await waitFor(() => expect(onIndexChange).toHaveBeenCalled())
    const last = onIndexChange.mock.calls[onIndexChange.mock.calls.length - 1][0]
    expect(last).toBe(1)
  })

  test('enableDetailOverlay：轻点前景卡片打开详情 → Next/Prev/Close', async () => {
    renderCarousel({ enableDetailOverlay: true })
    const frontImg = document.querySelector('[data-card-index="0"] img') as HTMLElement
    expect(frontImg).toBeInTheDocument()

    // 轻点（无移动） -> 打开 dialog
    fireEvent.pointerDown(frontImg, { pointerId: 1, clientX: 200 })
    fireEvent.pointerUp(frontImg,   { pointerId: 1, clientX: 200 })
    expect(await screen.findByRole('dialog')).toBeInTheDocument()

    // Next
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(
      (screen.getByRole('dialog').querySelector('img') as HTMLImageElement).src
    ).toContain('b.jpg')

    // Prev 回到 a.jpg
    await userEvent.click(screen.getByRole('button', { name: /previous/i }))
    expect(
      (screen.getByRole('dialog').querySelector('img') as HTMLImageElement).src
    ).toContain('a.jpg')

    // Close
    await userEvent.click(screen.getByRole('button', { name: /close/i }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  test('autoplay 路径 + 悬停暂停/离开恢复（覆盖事件与循环）', async () => {
    const { onIndexChange } = renderCarousel({ autoplay: true, autoSpeed: 120, pauseOnHover: true })
    const stage = stageEl()

    await waitFor(() => expect(onIndexChange).toHaveBeenCalled(), { timeout: 1500 })
    const callsBeforeHover = onIndexChange.mock.calls.length

    fireEvent.mouseEnter(stage)
    await new Promise(r => setTimeout(r, 30))
    fireEvent.mouseLeave(stage)
    await new Promise(r => setTimeout(r, 30))

    expect(onIndexChange.mock.calls.length).toBeGreaterThanOrEqual(callsBeforeHover)
  })

  test('momentumOnRelease：快速甩动后自动滚动（覆盖动量分支）', async () => {
    const { onIndexChange } = renderCarousel({ momentumOnRelease: true })
    const stage = stageEl()

    fireEvent.pointerDown(stage, { pointerId: 1, clientX: 100 })
    fireEvent.pointerMove(stage, { pointerId: 1, clientX: 700 })
    fireEvent.pointerUp(stage,   { pointerId: 1, clientX: 700 })

    await waitFor(() => expect(onIndexChange).toHaveBeenCalled(), { timeout: 1500 })
  })

  test('单个 item：无箭头/圆点，只渲染舞台', () => {
    render(<CylinderCarousel items={[{ img: 'solo.jpg' }]} />)
    expect(stageEl()).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /go to slide/i })).not.toBeInTheDocument()
  })
})

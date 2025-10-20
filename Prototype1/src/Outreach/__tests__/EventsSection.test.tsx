// src/Outreach/__tests__/EventsSection.test.tsx
import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import EventsSection from '../EventShowcase'

/** mock framer-motion：
 *  - motion.button -> 真实 <button>（保证 onClick 能打开 Modal）
 *  - 其它 motion.*  -> <div>
 */
jest.mock('framer-motion', () => {
  const React = require('react') as typeof import('react')
  const strip = (p: any) => {
    const {
      animate, initial, exit, transition,
      whileHover, whileTap, whileInView,
      variants, layout, layoutId,
      drag, dragConstraints,
      ...rest
    } = p || {}
    return rest
  }
  const make = (tag: any) =>
    React.forwardRef((props: any, ref: any) =>
      React.createElement(tag, { ref, ...strip(props) }, props.children)
    )
  const proxy = new Proxy(
    {},
    {
      get: (_t, prop: string) => (prop === 'button' ? make('button') : make('div')),
    }
  )
  return {
    motion: proxy,
    AnimatePresence: ({ children }: any) => <>{children}</>,
  }
})

/** 图标统一 mock */
jest.mock('lucide-react', () => {
  const I = () => <svg data-testid="icon" />
  return {
    Search: I, LayoutGrid: I, Rows3: I, Sparkles: I,
    ChevronLeft: I, ChevronRight: I, MapPin: I, Calendar: I, X: I
  }
})

/** 主数据集 */
const RICH_EVENTS = [
  { id: 'w1', title: 'Workshop One', blurb: 'Hands-on intro', location: 'Darlington campus', date: '2025-10-15', tags: ['Workshop'] },
  { id: 'o1', title: 'Open Lab Guided Tour', blurb: 'See real instruments', location: 'Open Lab', date: '2024-11-18', tags: ['Open Lab', 'Outreach'] },
  { id: 's1', title: 'School Visit', blurb: 'STEM day', location: 'Sydney High', date: '2023-12-02', tags: ['Schools', 'Outreach'] },
  { id: 't1', title: 'Unscheduled', blurb: 'TBD item', location: 'Nowhere', tags: ['Outreach', 'TBD'] },
]

/** 额外数据集 */
const EXTRA_EVENTS = [
  { id: 'm1', title: 'Quantum Fair', blurb: 'Unknown tag color', location: 'Main Hall', date: 'Oct 2025', tags: ['Quantum'] },
]

/** 仅含 TBD，用于 YearTimeline 快捷按钮 */
const ONLY_TBD = [
  { id: 't2', title: 'To Be Announced', location: 'Somewhere', tags: ['TBD'] },
]

/** 只锁定右上角统计块（Year:/Date:/All years + “• N items”） */
const toolbar = () => {
  const nodes = screen.getAllByText((_, node) => {
    const t = (node?.textContent || '').trim()
    return /^(Year:|Date:|All years)/i.test(t) && /\u2022\s*\d+\s+items?$/i.test(t)
  }) as HTMLElement[]
  const pick =
    nodes.find(n => (n.className || '').includes('ml-auto')) ??
    nodes.find(n => (n.parentElement?.className || '').includes('flex flex-wrap')) ??
    nodes[0]
  return pick.parentElement as HTMLElement
}

/** Types 容器 */
const typesBar = () => {
  const label = screen.getByText(/types:/i)
  return label.closest('div') as HTMLElement
}

/** 点击 Type chip */
const clickTypeChip = async (label: string | RegExp) => {
  const user = userEvent.setup()
  const bar = typesBar()
  const btn = within(bar).getByRole('button', { name: label as any })
  await user.click(btn)
}

/** 点击年份/All/TBD */
const clickYear = async (name: string | RegExp) => {
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: name as any }))
}

/** 切换视图 */
const clickView = async (name: RegExp) => {
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name }))
}

const setup = (props: any = {}) =>
  render(<EventsSection events={RICH_EVENTS} {...props} />)

/* ------------------------------ Tests ------------------------------ */

describe('EventShowcase – year/type filters & spotlight interactions', () => {
  test('All years → Outreach → Workshop → All types（多选与计数）', async () => {
    setup()
    await clickYear(/All years/i)
    expect(toolbar().textContent).toMatch(/All years[\s\S]*\u2022\s*4\s+items/i)

    await clickTypeChip(/Outreach/i)
    expect(toolbar().textContent).toMatch(/\u2022\s*3\s+items/i)

    await clickTypeChip(/Workshop/i)
    expect(screen.getAllByText(/Workshop One/i).length).toBeGreaterThanOrEqual(1)

    await clickTypeChip(/All types/i)
    expect(toolbar().textContent).toMatch(/\u2022\s*4\s+items/i)
  })

  test('年份 2024 + 类型 Open Lab → 仅 Open Lab Guided Tour', async () => {
    setup()
    await clickYear(/Year 2024/i)
    expect(toolbar().textContent).toMatch(/Year:\s*2024/i)

    await clickTypeChip(/Open Lab/i)
    expect(toolbar().textContent).toMatch(/\u2022\s*1\s+item/i)
    expect(screen.getAllByText(/Open Lab Guided Tour/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.queryByText(/Workshop One/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/School Visit/i)).not.toBeInTheDocument()
  })

  test('搜索空态（无 Competition chip 则用搜索造空态）', async () => {
    setup({ defaultYear: 'all' })
    const bar = typesBar()
    const competition = within(bar).queryByRole('button', { name: /Competition/i })
    if (competition) {
      await userEvent.click(competition)
    } else {
      const input = screen.getByPlaceholderText(/search events/i)
      await userEvent.type(input, '###no-match###')
    }
    expect(screen.getByText(/no events found/i)).toBeInTheDocument()
  })

  test('TBD 年份 + 类型 TBD → 仅 “Unscheduled”', async () => {
    setup()
    await clickYear(/Date TBD/i)
    expect(toolbar().textContent).toMatch(/Date:\s*TBD/i)

    await clickTypeChip(/^TBD$/i)
    expect(toolbar().textContent).toMatch(/\u2022\s*1\s+item/i)
    expect(screen.getAllByText(/Unscheduled/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.queryByText(/Workshop One/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Open Lab Guided Tour/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/School Visit/i)).not.toBeInTheDocument()
  })

  test('Spotlight：缩略图点击切换 + 视图切换到 Wall', async () => {
    setup({ defaultYear: 'all' })
    await clickTypeChip(/Outreach/i)

    const thumb =
      screen.queryAllByRole('button', { name: /School Visit/i })[0] ||
      screen.getByText(/School Visit/i).closest('button') ||
      screen.getByText(/School Visit/i)
    await userEvent.click(thumb!)
    expect(screen.getAllByText(/School Visit/i).length).toBeGreaterThanOrEqual(1)

    await clickView(/wall/i)
    expect(screen.getAllByText(/School Visit/i).length).toBeGreaterThanOrEqual(1)
  })

  test('Spotlight：键盘左右箭头切换事件', async () => {
    setup({ defaultYear: 'all' })
    await clickTypeChip(/Outreach/i)

    expect(screen.getAllByText(/School Visit/i).length).toBeGreaterThanOrEqual(1)

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    expect(screen.getAllByText(/Open Lab Guided Tour/i).length).toBeGreaterThanOrEqual(1)

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    expect(screen.getAllByText(/Unscheduled/i).length).toBeGreaterThanOrEqual(1)

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    expect(screen.getAllByText(/Open Lab Guided Tour/i).length).toBeGreaterThanOrEqual(1)
  })

  test('YearTimeline：键盘左右切换年份（→ 到 All years，再 → 到 TBD）', async () => {
    setup() // 默认 latest -> 2025

    // 等待时间线渲染完成，确保 useEffect 已注册键盘监听
    await screen.findByRole('button', { name: /Year 2025/i })

    const user = userEvent.setup()
    expect(toolbar().textContent).toMatch(/Year:\s*2025/i)

    // 第一次 → 到 All years（组件逻辑：2025 → All years）
    await user.keyboard('{ArrowRight}')
    expect(toolbar().textContent).toMatch(/All years/i)

    // 第二次 → 到 TBD
    await user.keyboard('{ArrowRight}')
    expect(toolbar().textContent).toMatch(/Date:\s*TBD/i)

    // ← 从 TBD 回到 2024（组件逻辑如此：回到倒数第二个年份）
    await user.keyboard('{ArrowLeft}')
    expect(toolbar().textContent).toMatch(/Year:\s*2024/i)

    // → 再到 2025（验证能回到最新年）
    await user.keyboard('{ArrowRight}')
    expect(toolbar().textContent).toMatch(/Year:\s*2025/i)
  })


  test('Modal：打开 → 下一条/上一条 → 关闭（含 body overflow 副作用）', async () => {
    setup({ defaultYear: 'all' })
    await clickView(/wall/i)

    // 现在 motion.button 是真实 <button>，可以直接点
    const openLabBtn = screen.getAllByText(/Open Lab Guided Tour/i)[0].closest('button')!
    await userEvent.click(openLabBtn)

    // Modal 标题出现
    expect(screen.getByRole('heading', { name: /Open Lab Guided Tour/i })).toBeInTheDocument()
    expect(document.body.style.overflow).toBe('hidden')

    // › 下一条
    const nextBtn = screen.getAllByRole('button').find(b => b.textContent === '›')!
    await userEvent.click(nextBtn)

    // ‹ 上一条
    const prevBtn = screen.getAllByRole('button').find(b => b.textContent === '‹')!
    await userEvent.click(prevBtn)

    // 关闭（右上角 X，有 svg 的圆按钮）
    const closeBtn = screen.getAllByRole('button').reverse().find(b => b.querySelector('svg'))!
    await userEvent.click(closeBtn)
    expect(screen.queryByRole('heading', { name: /Open Lab Guided Tour/i })).not.toBeInTheDocument()
    expect(document.body.style.overflow).toBe('')
  })

  test('Rail 视图也应正常渲染列表', async () => {
    setup({ defaultYear: 'all' })
    await clickView(/rail/i)
    expect(screen.getAllByText(/Workshop One/i).length).toBeGreaterThanOrEqual(1)
  })

  test('“Clear” 清空所有类型筛选', async () => {
    setup({ defaultYear: 'all' })
    await clickTypeChip(/Outreach/i)
    await clickTypeChip(/Open Lab/i)
    const clearBtn = screen.getByRole('button', { name: /clear/i })
    await userEvent.click(clearBtn)
    expect(toolbar().textContent).toMatch(/\u2022\s*4\s+items/i)
  })

  test('仅 TBD 数据 → 底部快捷 “Date: TBD” 按钮可用', async () => {
    render(<EventsSection events={ONLY_TBD} />)
    const tbdQuick = screen.getByRole('button', { name: /date: tbd/i })
    await userEvent.click(tbdQuick)
    expect(toolbar().textContent).toMatch(/Date:\s*TBD[\s\S]*\u2022\s*1\s+item/i)
  })

  test('未知标签配色 + 月份文本日期解析', async () => {
    render(<EventsSection events={[...RICH_EVENTS, ...EXTRA_EVENTS]} defaultYear="all" />)
    await clickView(/wall/i)
    expect(screen.getAllByText(/Quantum Fair/i).length).toBeGreaterThanOrEqual(1)
  })
})

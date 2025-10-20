import React from 'react'
import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import FuturePlans from '../FuturePlans' // ← 路径按你的实际位置调整

// ---- 环境 mock：IntersectionObserver（组件里用到了） ----
class IO { observe() {} unobserve() {} disconnect() {} }
;(globalThis as any).IntersectionObserver = IO as any

describe('FuturePlans', () => {
  test('渲染默认头部(kicker/title/subtitle) 与可访问性属性', () => {
    render(<FuturePlans allowLocalSave={false} />)
    // aria
    expect(screen.getByLabelText(/future plans section/i)).toBeInTheDocument()
    // kicker / title / subtitle
    expect(screen.getByText('FUTURE')).toBeInTheDocument()
    expect(screen.getByText('Future plans')).toBeInTheDocument()
    expect(
      screen.getByText(/write down your event ideas and suggestions/i)
    ).toBeInTheDocument()
  })

  test('Hope Time 下拉包含 “not sure”，且至少若干月份选项', () => {
    render(<FuturePlans allowLocalSave={false} />)
    // label 未关联控件 → 用 role 找 select（HTML select 的可访问角色是 combobox）
    const select = screen.getByRole('combobox') as HTMLSelectElement
    const options = within(select).getAllByRole('option')
    // 第一项是 not sure
    expect(options[0]).toHaveValue('')
    expect(options[0]).toHaveTextContent(/not sure/i)
    // 至少 7 个选项（not sure + 多个月份）；避免与实现细节强耦合
    expect(options.length).toBeGreaterThanOrEqual(7)
  })

  test('Quick label 标签可切换选中样式', async () => {
    render(<FuturePlans allowLocalSave={false} />)
    const user = userEvent.setup()

    const workshop = screen.getByRole('button', { name: 'Workshop' })
    // 初始未选中（边框为非透明）
    expect(workshop).toHaveStyle('border-color: rgba(0,0,0,.10)')
    await user.click(workshop)
    // 选中后边框透明
    expect(workshop).toHaveStyle('border-color: transparent')
    await user.click(workshop)
    // 再次点击取消选中
    expect(workshop).toHaveStyle('border-color: rgba(0,0,0,.10)')
  })

  test('表单校验：不足条件时禁用提交；满足后可提交并新增到列表', async () => {
    const onSubmit = jest.fn()
    const user = userEvent.setup()
    render(<FuturePlans allowLocalSave={false} onSubmit={onSubmit} />)

    // ⚠️ 这些 label 未与控件关联 → 用 placeholder 查找
    const titleInput = screen.getByPlaceholderText(
      /such as: ai workshop for beginners/i
    ) as HTMLInputElement
    const detailsArea = screen.getByPlaceholderText(
      /your idea description/i
    ) as HTMLTextAreaElement
    const typeInput = screen.getByPlaceholderText(
      /workshop \/ competition \/ mentorship/i
    ) as HTMLInputElement

    const submitBtn = screen.getByRole('button', { name: /submit idea/i })
    expect(submitBtn).toBeDisabled()

    // >= 3 个单词（组件副文显示“at least 3 words”）
    await user.type(titleInput, 'AI Workshop Basics')
    await user.type(detailsArea, 'A beginner-friendly workshop about AI basics.')
    await user.type(typeInput, 'Workshop')

    // 选择月份（第一个非 not sure 的选项）
    const select = screen.getByRole('combobox') as HTMLSelectElement
    const options = within(select).getAllByRole('option')
    if (options.length > 1) {
      await user.selectOptions(select, options[1] as HTMLOptionElement)
    }

    // 选择两个标签（若存在）
    const tag1 = screen.queryByRole('button', { name: 'Workshop' })
    const tag2 = screen.queryByRole('button', { name: 'Hackathon' })
    if (tag1) await user.click(tag1)
    if (tag2) await user.click(tag2)

    expect(submitBtn).not.toBeDisabled()
    await user.click(submitBtn)

    // onSubmit被调用一次，且带有基本字段
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    const payload = onSubmit.mock.calls[0][0]
    expect(payload.title).toBe('AI Workshop Basics')
    expect(payload.details).toMatch(/beginner-friendly/i)
    expect(payload.category).toBe('Workshop')

    // 列表里出现新卡片（标题/详情/标签）
    expect(screen.getByText('AI Workshop Basics')).toBeInTheDocument()
    expect(
      screen.getByText(/beginner-friendly workshop about ai basics/i)
    ).toBeInTheDocument()
    // 标签断言（存在则至少出现一次）
    if (tag1) expect(screen.getAllByText('Workshop').length).toBeGreaterThanOrEqual(1)
    if (tag2) expect(screen.getAllByText('Hackathon').length).toBeGreaterThanOrEqual(1)

    // 清空表单：标题与详情被重置；详情计数归零
    expect((screen.getByPlaceholderText(/ai workshop for beginners/i) as HTMLInputElement).value).toBe('')
    expect((screen.getByPlaceholderText(/your idea description/i) as HTMLTextAreaElement).value).toBe('')
    expect(screen.getByText('0/400')).toBeInTheDocument()
  })

  test('Clear 按钮会重置所有输入', async () => {
    const user = userEvent.setup()
    render(<FuturePlans allowLocalSave={false} />)

    const titleInput = screen.getByPlaceholderText(/ai workshop for beginners/i) as HTMLInputElement
    const detailsArea = screen.getByPlaceholderText(/your idea description/i) as HTMLTextAreaElement
    const clearBtn = screen.getByRole('button', { name: /clear/i })

    await user.type(titleInput, 'X Y Z')
    await user.type(detailsArea, 'some details long enough')
    expect(titleInput.value).toBe('X Y Z')
    expect(detailsArea.value).toMatch(/some details/)

    await user.click(clearBtn)
    expect(titleInput.value).toBe('')
    expect(detailsArea.value).toBe('')
  })

  test('allowLocalSave=true 时，会把 ideas 写入 localStorage（storageKey 可自定义）', async () => {
    const user = userEvent.setup()
    const setItemSpy = jest.spyOn(window.localStorage.__proto__, 'setItem')

    render(<FuturePlans allowLocalSave storageKey="fp_test_key" />)

    await user.type(
      screen.getByPlaceholderText(/ai workshop for beginners/i),
      'Career Talk Session'
    ) // 3 个单词
    await user.type(
      screen.getByPlaceholderText(/your idea description/i),
      'Invite industry speakers to share career paths.'
    )
    await user.click(screen.getByRole('button', { name: /submit idea/i }))

    // ideas 更新后 useEffect 会写 localStorage
    await waitFor(() => {
      expect(setItemSpy).toHaveBeenCalled()
    })
    const calls = setItemSpy.mock.calls.filter(([k]) => k === 'fp_test_key')
    expect(calls.length).toBeGreaterThanOrEqual(1)
    const value = calls[calls.length - 1][1] as string
    const parsed = JSON.parse(value)
    expect(Array.isArray(parsed)).toBe(true)
    expect(parsed[0].title).toBe('Career Talk Session')

    setItemSpy.mockRestore()
  })
})

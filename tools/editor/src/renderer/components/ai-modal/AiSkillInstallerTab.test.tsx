import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import React from 'react'
import { AiSkillInstallerTab } from './AiSkillInstallerTab'

describe('AiSkillInstallerTab', () => {
  const originalElectron = window.electronAPI

  beforeEach(() => {
    vi.clearAllMocks()
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  it('renders default state and matches snapshot', async () => {
    window.electronAPI = {
      ...originalElectron,
      getSkillContent: vi.fn().mockResolvedValue({ success: true, content: '# Test Skill' }),
    } as any

    let container: HTMLElement
    await act(async () => {
      const rendered = render(<AiSkillInstallerTab />)
      container = rendered.container
    })

    expect(container!).toMatchSnapshot()
    expect(screen.getByText(/Antigravity \/ Gemini CLI/i)).toBeInTheDocument()
    expect(screen.getByText(/Copiar SKILL.md completo/i)).toBeInTheDocument()
  })

  it('handles installing skill successfully', async () => {
    const installSkillMock = vi.fn().mockResolvedValue({ success: true, path: '/home/user/.gemini/skills/importer' })
    window.electronAPI = {
      ...originalElectron,
      getSkillContent: vi.fn().mockResolvedValue({ success: false }),
      installSkill: installSkillMock,
    } as any

    await act(async () => {
      render(<AiSkillInstallerTab />)
    })

    const antigravityBtn = screen.getByText(/Antigravity \/ Gemini CLI/i).closest('button')!
    await act(async () => {
      fireEvent.click(antigravityBtn)
    })

    expect(installSkillMock).toHaveBeenCalledWith('antigravity')
    expect(screen.getByText(/Skill instalada com sucesso!/i)).toBeInTheDocument()
    expect(screen.getByText(/Local: \/home\/user\/\.gemini\/skills\/importer/i)).toBeInTheDocument()
  })

  it('handles installation failure from API response', async () => {
    window.electronAPI = {
      ...originalElectron,
      getSkillContent: vi.fn().mockResolvedValue({ success: false }),
      installSkill: vi.fn().mockResolvedValue({ success: false, error: 'Permission denied' }),
    } as any

    await act(async () => {
      render(<AiSkillInstallerTab />)
    })

    const cursorBtn = screen.getByText(/Cursor \/ Windsurf/i).closest('button')!
    await act(async () => {
      fireEvent.click(cursorBtn)
    })

    expect(screen.getByText(/Erro: Permission denied/i)).toBeInTheDocument()
  })

  it('handles installation exception thrown', async () => {
    window.electronAPI = {
      ...originalElectron,
      getSkillContent: vi.fn().mockResolvedValue({ success: false }),
      installSkill: vi.fn().mockRejectedValue(new Error('Network crash')),
    } as any

    await act(async () => {
      render(<AiSkillInstallerTab />)
    })

    const claudeBtn = screen.getByText(/Claude Code/i).closest('button')!
    await act(async () => {
      fireEvent.click(claudeBtn)
    })

    expect(screen.getByText(/Erro: Network crash/i)).toBeInTheDocument()
  })

  it('handles installation when electronAPI is not present', async () => {
    delete (window as any).electronAPI

    await act(async () => {
      render(<AiSkillInstallerTab />)
    })

    const claudeBtn = screen.getByText(/Claude Code/i).closest('button')!
    await act(async () => {
      fireEvent.click(claudeBtn)
    })

    expect(screen.getByText(/API do Electron não disponível/i)).toBeInTheDocument()
  })

  it('handles copy prompt, copy command, and copy skill', async () => {
    window.electronAPI = {
      ...originalElectron,
      getSkillContent: vi.fn().mockResolvedValue({ success: true, content: 'SKILL MD DATA' }),
    } as any

    await act(async () => {
      render(<AiSkillInstallerTab />)
    })

    // Copy Prompt
    const promptBtn = screen.getByText(/Copiar Prompt Mestre/i).closest('button')!
    fireEvent.click(promptBtn)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('Você é um compilador'))

    // Copy Command
    const commandBtn = screen.getByRole('button', { name: /^Copiar$/i })
    fireEvent.click(commandBtn)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('Converta o arquivo fatura.pdf'))

    // Copy Skill Content
    const skillBtn = screen.getByText(/Copiar SKILL\.md completo/i)
    fireEvent.click(skillBtn)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('SKILL MD DATA')
  })
})

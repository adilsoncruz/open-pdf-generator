import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AiImportModal } from './AiImportModal'

describe('AiImportModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
    // Mock window.electronAPI
    window.electronAPI = {
      ...window.electronAPI,
      installSkill: vi.fn().mockResolvedValue({ success: true, path: '/fake/path' }),
      getSkillContent: vi.fn().mockResolvedValue({ success: true, content: '# Test Skill' }),
      openPdfFile: vi.fn().mockResolvedValue({ path: '/tmp/test.pdf', name: 'test.pdf', base64: 'fake' }),
    }
  })

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<AiImportModal isOpen={false} onClose={vi.fn()} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders modal header and default skill tab when isOpen is true', () => {
    render(<AiImportModal isOpen={true} onClose={vi.fn()} />)

    expect(screen.getByText('Importar PDF com IA')).toBeInTheDocument()
    expect(screen.getByText('Instalar Skill no seu Assistente (Recomendado)')).toBeInTheDocument()
    expect(screen.getByText('Antigravity / Gemini CLI')).toBeInTheDocument()
    expect(screen.getByText('Cursor / Windsurf')).toBeInTheDocument()
    expect(screen.getByText('Claude Code')).toBeInTheDocument()
    expect(screen.getByText('Outros (Codex, ChatGPT, Copilot)')).toBeInTheDocument()
  })

  it('calls onClose when close button or Fechar is clicked', () => {
    const onClose = vi.fn()
    render(<AiImportModal isOpen={true} onClose={onClose} />)

    const closeBtn = screen.getByLabelText('Fechar modal')
    fireEvent.click(closeBtn)
    expect(onClose).toHaveBeenCalledTimes(1)

    const fecharFooterBtn = screen.getByRole('button', { name: 'Fechar' })
    fireEvent.click(fecharFooterBtn)
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('switches between Skill and Direct tabs', () => {
    render(<AiImportModal isOpen={true} onClose={vi.fn()} />)

    // Switch to direct tab
    const directTabBtn = screen.getByText('Conversão Direta via API (BYOK)')
    fireEvent.click(directTabBtn)

    expect(screen.getByText('Documento PDF de Origem')).toBeInTheDocument()
    expect(screen.getByText('Provedor de IA')).toBeInTheDocument()
    expect(screen.getByText('Chave de API (BYOK)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Converter Template' })).toBeDisabled()

    // Switch back to skill tab
    const skillTabBtn = screen.getByText('Instalar Skill no seu Assistente (Recomendado)')
    fireEvent.click(skillTabBtn)

    expect(screen.getByText('Antigravity / Gemini CLI')).toBeInTheDocument()
  })

  it('installs skill when target agent button is clicked', async () => {
    render(<AiImportModal isOpen={true} onClose={vi.fn()} />)

    const antigravityBtn = screen.getByText('⚡ Instalar no CLI →')
    fireEvent.click(antigravityBtn)

    expect(window.electronAPI.installSkill).toHaveBeenCalledWith('antigravity')
    const successMsg = await screen.findByText('✓ Skill instalada com sucesso!')
    expect(successMsg).toBeInTheDocument()
  })

  it('copies command and prompt to clipboard', () => {
    render(<AiImportModal isOpen={true} onClose={vi.fn()} />)

    const copyPromptBtn = screen.getByText('📋 Copiar Prompt Mestre →')
    fireEvent.click(copyPromptBtn)
    expect(navigator.clipboard.writeText).toHaveBeenCalled()

    const copyCmdBtn = screen.getByText('Copiar')
    fireEvent.click(copyCmdBtn)
    expect(navigator.clipboard.writeText).toHaveBeenCalled()
  })

  it('allows selecting PDF in direct tab', async () => {
    render(<AiImportModal isOpen={true} onClose={vi.fn()} />)

    fireEvent.click(screen.getByText('Conversão Direta via API (BYOK)'))

    const selectPdfBtn = screen.getByRole('button', { name: /Selecionar PDF/i })
    fireEvent.click(selectPdfBtn)

    expect(window.electronAPI.openPdfFile).toHaveBeenCalled()
    const fileName = await screen.findByText('test.pdf')
    expect(fileName).toBeInTheDocument()
  })
})

import React from 'react'
import {
  ExclamationTriangleIcon,
  CommandLineIcon,
  CodeBracketSquareIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import { Button } from '../../atoms'
import { useTranslation } from '../../../i18n'
import type { PreviewErrorStateProps } from '../types'

export const PreviewErrorState: React.FC<PreviewErrorStateProps> = ({
  error,
  errorCode,
  onRetry,
}) => {
  const { t } = useTranslation()

  const isJavaMissing = errorCode === 'JAVA_NOT_INSTALLED' || error.includes('Java is not installed')
  const isCliMissing =
    errorCode === 'CLI_NOT_INSTALLED' ||
    error.includes('CLI is not installed') ||
    error.includes('PDF Generator CLI is not installed')

  const isDetailedCliError = !isJavaMissing && !isCliMissing && error.length > 80

  return (
    <div className="flex items-center justify-center h-full p-6 bg-slate-900/50">
      <div className="flex flex-col items-center gap-4 max-w-md w-full text-center p-6 bg-slate-900/90 border border-slate-800 rounded-xl shadow-2xl backdrop-blur-sm">
        {/* Error Icon */}
        <div className="p-3 rounded-full bg-slate-800/80 border border-slate-700/60 shadow-inner">
          {isJavaMissing ? (
            <CodeBracketSquareIcon className="w-10 h-10 text-amber-400" />
          ) : isCliMissing ? (
            <CommandLineIcon className="w-10 h-10 text-amber-400" />
          ) : (
            <ExclamationTriangleIcon className="w-10 h-10 text-rose-400" />
          )}
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5 w-full">
          <h3 className="text-base font-semibold text-white">
            {isJavaMissing
              ? t.errors.javaNotInstalled || 'Java não encontrado'
              : isCliMissing
              ? t.errors.cliNotInstalled || 'CLI não instalada'
              : 'Falha na compilação do PDF'}
          </h3>

          <p className="text-xs text-slate-400">
            {isJavaMissing
              ? t.errors.javaNotInstalledHint || 'Instale o Java 11 ou superior para compilar templates PDF.'
              : isCliMissing
              ? t.errors.cliNotInstalledHint || 'Instale a CLI do Open PDF Generator nas configurações do editor.'
              : 'Ocorreu um erro ao processar o template com os dados informados.'}
          </p>
        </div>

        {/* Detailed error log output for compilation errors */}
        {isDetailedCliError && (
          <div className="w-full text-left bg-slate-950/80 border border-slate-800 rounded-lg p-3 overflow-auto max-h-40">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block mb-1">
              Log de erro da CLI:
            </span>
            <pre className="font-mono text-[11px] leading-relaxed text-rose-300 whitespace-pre-wrap break-all select-text">
              {error}
            </pre>
          </div>
        )}

        {/* Simple error message display if short and not special code */}
        {!isJavaMissing && !isCliMissing && !isDetailedCliError && (
          <p className="text-xs text-rose-300 bg-rose-950/30 border border-rose-900/40 rounded px-3 py-2 w-full">
            {error}
          </p>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <Button
            onClick={onRetry}
            variant="primary"
            size="sm"
            className="flex items-center gap-1.5 px-4"
          >
            <ArrowPathIcon className="w-3.5 h-3.5" />
            <span>{t.preview.tryAgain || 'Tentar novamente'}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

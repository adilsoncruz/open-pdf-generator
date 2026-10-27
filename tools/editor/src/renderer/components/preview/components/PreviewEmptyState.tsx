import React from 'react'
import { DocumentPlusIcon } from '@heroicons/react/24/outline'
import { useTranslation } from '../../../i18n'

export const PreviewEmptyState: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="flex flex-col items-center gap-4 max-w-sm text-center p-6">
        <DocumentPlusIcon className="w-16 h-16 text-white/40" />
        <div>
          <h3 className="text-white text-lg font-medium mb-2">
            {t.preview.emptyTemplate}
          </h3>
          <p className="text-white/60 text-sm">
            {t.preview.emptyTemplateHint}
          </p>
        </div>
      </div>
    </div>
  )
}

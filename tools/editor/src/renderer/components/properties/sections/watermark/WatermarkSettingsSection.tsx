import { useTemplateStore } from '../../../../store/templateStore'
import { WatermarkActivationToggle, WatermarkGeneralControls } from './WatermarkGeneralControls'
import { WatermarkTypeSelector } from './WatermarkTypeSelector'
import { WatermarkTextControls } from './WatermarkTextControls'
import { WatermarkImageControls } from './WatermarkImageControls'

export function WatermarkSettingsSection() {
  const store = useTemplateStore()
  const watermark = store.template.pageSettings.watermark

  return (
    <div className="pt-3 border-t border-slate-800/80 space-y-3">
      <WatermarkActivationToggle />

      {watermark && (
        <div className="space-y-3 pt-2 border-t border-slate-800/60">
          <WatermarkTypeSelector />

          {(watermark.type || 'text') === 'text' ? (
            <WatermarkTextControls />
          ) : (
            <WatermarkImageControls />
          )}

          <WatermarkGeneralControls />
        </div>
      )}
    </div>
  )
}

export default WatermarkSettingsSection

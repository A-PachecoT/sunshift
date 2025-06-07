import { Button, Tooltip } from '@mantine/core';
import { useGammaStore } from '../stores/gammaStore';

interface PresetButtonProps {
  presetId: string;
  compact?: boolean;
}

export function PresetButton({ presetId, compact = false }: PresetButtonProps) {
  const { presets, activePreset, applyPreset } = useGammaStore();
  const preset = presets.find(p => p.id === presetId);
  
  if (!preset) return null;
  
  const isActive = activePreset === presetId;
  
  return (
    <Tooltip 
      label={`${preset.temperature}K / ${Math.round(preset.brightness * 100)}%`}
      position="top"
    >
      <Button
        variant={isActive ? "filled" : "light"}
        color={isActive ? "orange" : "gray"}
        size={compact ? "xs" : "sm"}
        onClick={() => applyPreset(presetId)}
        styles={{
          root: {
            backgroundColor: isActive ? 'rgba(255, 165, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)',
            border: isActive ? '1px solid rgba(255, 165, 0, 0.5)' : '1px solid rgba(255, 255, 255, 0.2)',
            color: 'rgba(255, 255, 255, 0.9)',
            '&:hover': {
              backgroundColor: isActive ? 'rgba(255, 165, 0, 0.3)' : 'rgba(255, 255, 255, 0.2)',
            }
          }
        }}
      >
        {preset.name}
      </Button>
    </Tooltip>
  );
} 
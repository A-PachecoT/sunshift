import { Slider, Text, Group } from '@mantine/core';
import { useGammaStore } from '../stores/gammaStore';

export function BrightnessSlider() {
  const { state, setBrightness } = useGammaStore();
  
  const marks = [
    { value: 0.2, label: '20%' },
    { value: 0.4, label: '40%' },
    { value: 0.6, label: '60%' },
    { value: 0.8, label: '80%' },
    { value: 1.0, label: '100%' },
  ];
  
  return (
    <div>
      <Group justify="space-between" mb="xs">
        <Text size="sm" fw={500} style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
          Screen Brightness
        </Text>
        <Text size="sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          {Math.round(state.brightness * 100)}%
        </Text>
      </Group>
      
      <Slider
        value={state.brightness}
        onChange={setBrightness}
        min={0.1}
        max={1}
        step={0.05}
        marks={marks}
        styles={{
          root: { marginBottom: '30px' },
          track: { 
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            height: '10px' 
          },
          bar: { 
            background: 'linear-gradient(to right, rgba(100, 100, 255, 0.5), rgba(100, 200, 255, 0.8))',
            height: '10px' 
          },
          thumb: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: '2px solid rgba(100, 200, 255, 0.8)',
            width: '20px',
            height: '20px',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
            }
          },
          mark: {
            width: '2px',
            height: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            border: 'none'
          },
          markLabel: {
            fontSize: '10px',
            color: 'rgba(255, 255, 255, 0.6)'
          }
        }}
      />
    </div>
  );
} 
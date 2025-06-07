import { Slider, Text, Group } from '@mantine/core';
import { useGammaStore } from '../stores/gammaStore';

export function TemperatureSlider() {
  const { state, setTemperature } = useGammaStore();
  
  const marks = [
    { value: 2000, label: '2000K' },
    { value: 3000, label: '3000K' },
    { value: 4000, label: '4000K' },
    { value: 5000, label: '5000K' },
    { value: 6000, label: '6000K' },
    { value: 6500, label: '6500K' },
  ];
  
  return (
    <div>
      <Group justify="space-between" mb="xs">
        <Text size="sm" fw={500} style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
          Color Temperature
        </Text>
        <Text size="sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          {state.temperature}K
        </Text>
      </Group>
      
      <div style={{ position: 'relative' }}>
        <div 
          className="temp-slider"
          style={{ 
            position: 'absolute',
            width: '100%',
            height: '40px',
            borderRadius: '20px',
            top: '-15px',
            pointerEvents: 'none',
            opacity: 0.3
          }} 
        />
        
        <Slider
          value={state.temperature}
          onChange={setTemperature}
          min={2000}
          max={6500}
          step={100}
          marks={marks}
          styles={{
            root: { marginTop: '10px', marginBottom: '30px' },
            track: { 
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              height: '10px' 
            },
            bar: { 
              backgroundColor: 'transparent',
              height: '10px' 
            },
            thumb: {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '2px solid rgba(255, 165, 0, 0.8)',
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
    </div>
  );
} 
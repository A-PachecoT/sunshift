import { RingProgress, Text, Center } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';
import { format } from 'date-fns';

export function CircularTimeIndicator() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  
  // Calculate percentage of day passed (0-100)
  const totalMinutes = hours * 60 + minutes;
  const dayProgress = (totalMinutes / (24 * 60)) * 100;
  
  // Determine icon and color based on time
  const isDaytime = hours >= 6 && hours < 18;
  const isEvening = hours >= 18 && hours < 21;
  
  const getIcon = () => {
    if (isDaytime) return <IconSun size={24} />;
    return <IconMoon size={24} />;
  };
  
  const getColor = () => {
    if (isDaytime) return 'orange';
    if (isEvening) return 'violet';
    return 'indigo';
  };
  
  const getTimeLabel = () => {
    if (hours >= 5 && hours < 12) return 'Morning';
    if (hours >= 12 && hours < 17) return 'Afternoon';
    if (hours >= 17 && hours < 21) return 'Evening';
    return 'Night';
  };
  
  return (
    <Center>
      <RingProgress
        size={200}
        thickness={12}
        sections={[{ value: dayProgress, color: getColor() }]}
        label={
          <Center style={{ flexDirection: 'column', gap: '8px' }}>
            {getIcon()}
            <Text size="lg" fw={600} style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              {format(now, 'HH:mm')}
            </Text>
            <Text size="sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              {getTimeLabel()}
            </Text>
          </Center>
        }
        rootColor="rgba(255, 255, 255, 0.1)"
        styles={{
          root: {
            filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2))'
          }
        }}
      />
    </Center>
  );
} 
import { MantineProvider, AppShell, Title, Text, Container, Tabs, Stack, Group, Badge } from '@mantine/core';
import { IconSun, IconClock, IconSettings } from '@tabler/icons-react';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import './styles/global.css';
import { useState } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState<string | null>('overview');
  const [currentTemp, setCurrentTemp] = useState(5500); // Default temperature
  
  // Determine background class based on temperature
  const getBackgroundClass = () => {
    if (currentTemp <= 3500) return 'night';
    if (currentTemp >= 5500) return 'cool';
    return '';
  };

  return (
    <MantineProvider 
      defaultColorScheme="dark"
      theme={{
        colors: {
          dark: [
            '#C1C2C5',
            '#A6A7AB',
            '#909296',
            '#5C5F66',
            '#373A40',
            '#2C2E33',
            '#25262B',
            '#1A1B1E',
            '#141517',
            '#101113',
          ],
        },
      }}
    >
      {/* Animated gradient background */}
      <div className={`gradient-background ${getBackgroundClass()}`} />
      
      <AppShell
        header={{ height: 60 }}
        padding="md"
        styles={{
          main: { background: 'transparent' },
          header: { 
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }
        }}
      >
        <AppShell.Header>
          <Container size="xl" h="100%" style={{ display: 'flex', alignItems: 'center' }}>
            <Group justify="space-between" style={{ width: '100%' }}>
              <Group>
                <IconSun size={28} style={{ color: 'rgba(255, 255, 255, 0.9)' }} />
                <Title order={2} style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Sunshift</Title>
              </Group>
              <Badge variant="light" color="orange" size="lg">
                {currentTemp}K
              </Badge>
            </Group>
          </Container>
        </AppShell.Header>

        <AppShell.Main>
          <Container size="xl">
            <div className="glass-card" style={{ padding: '2rem', marginTop: '2rem' }}>
              <Tabs value={activeTab} onChange={setActiveTab}>
                <Tabs.List>
                  <Tabs.Tab value="overview" leftSection={<IconSun size={16} />}>
                    Overview
                  </Tabs.Tab>
                  <Tabs.Tab value="schedule" leftSection={<IconClock size={16} />}>
                    Schedule
                  </Tabs.Tab>
                  <Tabs.Tab value="settings" leftSection={<IconSettings size={16} />}>
                    Settings
                  </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="overview" pt="xl">
                  <Stack gap="lg">
                    <Text size="xl" fw={500} style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      The sun is up. Light is making your body earlier.
                    </Text>
                    <Text size="sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Sunrise: 4 hours ago, Wake: 4 hours ago
                    </Text>
                    <Text size="sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                      Circadian response: 65% (Ready to Work)
                    </Text>
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="schedule" pt="xl">
                  <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Schedule configuration coming soon...</Text>
                </Tabs.Panel>

                <Tabs.Panel value="settings" pt="xl">
                  <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Settings coming soon...</Text>
                </Tabs.Panel>
              </Tabs>
            </div>
          </Container>
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}

export default App;

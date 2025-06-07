import { MantineProvider, AppShell, Title, Text, Container, Tabs, Stack, Group, Badge, Alert } from '@mantine/core';
import { IconSun, IconClock, IconSettings, IconAlertCircle } from '@tabler/icons-react';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import './styles/global.css';
import { useState } from 'react';
import { useGammaRelay } from './hooks/useGammaRelay';

function App() {
  const [activeTab, setActiveTab] = useState<string | null>('overview');
  const { state, error, loading } = useGammaRelay();
  
  // Determine background class based on temperature
  const getBackgroundClass = () => {
    if (state.temperature <= 3500) return 'night';
    if (state.temperature >= 5500) return 'cool';
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
              <Group>
                <Badge variant="light" color="orange" size="lg">
                  {loading ? 'Loading...' : `${state.temperature}K`}
                </Badge>
                <Badge variant="light" color="blue" size="lg">
                  {loading ? '...' : `${Math.round(state.brightness * 100)}%`}
                </Badge>
              </Group>
            </Group>
          </Container>
        </AppShell.Header>

        <AppShell.Main>
          <Container size="xl">
            {error && (
              <Alert 
                icon={<IconAlertCircle size={16} />} 
                title="Connection Error" 
                color="red"
                mb="md"
                styles={{ root: { backgroundColor: 'rgba(255, 0, 0, 0.1)' } }}
              >
                {error}
              </Alert>
            )}
            
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
                      {state.temperature <= 3500 ? 'Night mode active' : 
                       state.temperature <= 4500 ? 'Evening light' :
                       'Daylight mode'}
                    </Text>
                    <Text size="sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Color Temperature: {state.temperature}K
                    </Text>
                    <Text size="sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Screen Brightness: {Math.round(state.brightness * 100)}%
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

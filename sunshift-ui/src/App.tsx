import { MantineProvider, AppShell, Title, Text, Container, Tabs, Stack, Group, Badge, Alert, Divider, Switch, Grid } from '@mantine/core';
import { IconSun, IconClock, IconSettings, IconAlertCircle, IconMoon, IconBulb } from '@tabler/icons-react';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import './styles/global.css';
import { useEffect } from 'react';
import { useGammaStore } from './stores/gammaStore';
import { useUIStore } from './stores/uiStore';
import { useTrayEvents } from './hooks/useTrayEvents';
import { TemperatureSlider } from './components/TemperatureSlider';
import { BrightnessSlider } from './components/BrightnessSlider';
import { PresetButton } from './components/PresetButton';
import { CircularTimeIndicator } from './components/CircularTimeIndicator';
import { DayGraph } from './components/DayGraph';

function App() {
  const { 
    state, 
    error, 
    loading, 
    connected,
    fetchState,
    autoMode,
    setAutoMode,
    presets 
  } = useGammaStore();
  
  const { 
    activeTab, 
    setActiveTab,
    currentTheme 
  } = useUIStore();
  
  // Initialize tray event listeners
  useTrayEvents();
  
  // Fetch initial state on mount
  useEffect(() => {
    fetchState();
  }, [fetchState]);
  
  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchState, 30000);
    return () => clearInterval(interval);
  }, [fetchState]);
  
  // Determine background class based on temperature
  const getBackgroundClass = () => {
    if (state.temperature <= 3500) return 'night';
    if (state.temperature >= 5500) return 'cool';
    return '';
  };

  return (
    <MantineProvider 
      defaultColorScheme={currentTheme}
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
                <Badge 
                  variant="light" 
                  color={connected ? "orange" : "red"} 
                  size="lg"
                  leftSection={<IconSun size={14} />}
                >
                  {loading ? 'Loading...' : `${state.temperature}K`}
                </Badge>
                <Badge 
                  variant="light" 
                  color={connected ? "blue" : "red"} 
                  size="lg"
                  leftSection={<IconBulb size={14} />}
                >
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
              <Tabs value={activeTab} onChange={(value) => setActiveTab(value as any)}>
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
                  <Grid gutter="xl">
                    <Grid.Col span={{ base: 12, md: 8 }}>
                      <Stack gap="xl">
                        {/* Mode and Status */}
                        <Group justify="space-between">
                          <div>
                            <Text size="xl" fw={500} style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                              {state.temperature <= 3500 ? 'Night mode active' : 
                               state.temperature <= 4500 ? 'Evening light' :
                               'Daylight mode'}
                            </Text>
                            <Text size="xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                              Status: {connected ? 'Connected to wl-gammarelay' : 'Disconnected'}
                            </Text>
                          </div>
                          <Switch
                            checked={autoMode}
                            onChange={(event) => setAutoMode(event.currentTarget.checked)}
                            label="Auto Mode"
                            size="md"
                            styles={{
                              track: {
                                backgroundColor: autoMode ? 'rgba(255, 165, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                                borderColor: autoMode ? 'rgba(255, 165, 0, 0.5)' : 'rgba(255, 255, 255, 0.2)',
                              }
                            }}
                          />
                        </Group>

                        <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                        {/* 24-hour Graph */}
                        <div>
                          <Text size="sm" mb="md" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            Daily Temperature & Brightness Schedule
                          </Text>
                          <DayGraph />
                        </div>

                        <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                        {/* Preset Buttons */}
                        <div>
                          <Text size="sm" mb="sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            Quick Presets
                          </Text>
                          <Group>
                            {presets.map(preset => (
                              <PresetButton key={preset.id} presetId={preset.id} />
                            ))}
                          </Group>
                        </div>

                        <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                        {/* Sliders */}
                        <Stack gap="xl">
                          <TemperatureSlider />
                          <BrightnessSlider />
                        </Stack>
                      </Stack>
                    </Grid.Col>
                    
                    <Grid.Col span={{ base: 12, md: 4 }}>
                      <Stack gap="xl" align="center">
                        {/* Time Indicator */}
                        <div>
                          <Text size="sm" mb="md" ta="center" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            Current Time
                          </Text>
                          <CircularTimeIndicator />
                        </div>
                        
                        {/* Sunrise/Sunset Info (placeholder for now) */}
                        <div className="glass-card" style={{ padding: '1rem', width: '100%' }}>
                          <Stack gap="xs">
                            <Group justify="space-between">
                              <Text size="sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                Sunrise
                              </Text>
                              <Text size="sm" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                                06:45
                              </Text>
                            </Group>
                            <Group justify="space-between">
                              <Text size="sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                Sunset
                              </Text>
                              <Text size="sm" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                                19:30
                              </Text>
                            </Group>
                          </Stack>
                        </div>
                      </Stack>
                    </Grid.Col>
                  </Grid>
                </Tabs.Panel>

                <Tabs.Panel value="schedule" pt="xl">
                  <Grid>
                    <Grid.Col span={12}>
                      <Stack>
                        <Group gap="xs">
                          <IconMoon size={20} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                          <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                            Schedule configuration coming soon...
                          </Text>
                        </Group>
                        <Text size="sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                          Set up automatic temperature and brightness changes based on time of day.
                        </Text>
                      </Stack>
                    </Grid.Col>
                  </Grid>
                </Tabs.Panel>

                <Tabs.Panel value="settings" pt="xl">
                  <Stack gap="lg">
                    <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      Settings coming soon...
                    </Text>
                    <Text size="sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                      Configure startup behavior, keyboard shortcuts, and more.
                    </Text>
                  </Stack>
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

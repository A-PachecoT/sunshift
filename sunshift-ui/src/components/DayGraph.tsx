import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useMemo } from 'react';

interface SchedulePoint {
  hour: number;
  temperature: number;
  brightness: number;
}

export function DayGraph() {
  const currentHour = new Date().getHours() + new Date().getMinutes() / 60;
  
  // Generate sample data for 24 hours
  const data = useMemo(() => {
    const points: SchedulePoint[] = [];
    
    for (let hour = 0; hour < 24; hour++) {
      // Simulate natural temperature curve
      let temperature: number;
      let brightness: number;
      
      if (hour >= 6 && hour < 9) {
        // Morning transition
        temperature = 3000 + (hour - 6) * 1166;
        brightness = 0.6 + (hour - 6) * 0.133;
      } else if (hour >= 9 && hour < 17) {
        // Daytime
        temperature = 6500;
        brightness = 1.0;
      } else if (hour >= 17 && hour < 21) {
        // Evening transition
        temperature = 6500 - (hour - 17) * 875;
        brightness = 1.0 - (hour - 17) * 0.1;
      } else {
        // Night
        temperature = 3000;
        brightness = 0.6;
      }
      
      points.push({ hour, temperature, brightness });
    }
    
    return points;
  }, []);
  
  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };
  
  return (
    <div style={{ width: '100%', height: '300px' }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="rgba(255, 255, 255, 0.1)" 
          />
          <XAxis 
            dataKey="hour"
            tickFormatter={formatHour}
            stroke="rgba(255, 255, 255, 0.5)"
            tick={{ fontSize: 12 }}
            ticks={[0, 6, 12, 18, 24]}
          />
          <YAxis 
            yAxisId="left"
            domain={[0, 100]}
            stroke="rgba(255, 255, 255, 0.5)"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${value}%`}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            domain={[2000, 6500]}
            stroke="rgba(255, 255, 255, 0.5)"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${value}K`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
            }}
            labelFormatter={(hour) => formatHour(hour as number)}
            formatter={(value: any, name: string) => {
              if (name === 'temperature') return [`${value}K`, 'Temperature'];
              return [`${Math.round(value * 100)}%`, 'Brightness'];
            }}
          />
          <ReferenceLine 
            x={currentHour} 
            stroke="rgba(255, 255, 255, 0.8)"
            strokeDasharray="5 5"
            label={{ 
              value: "Now", 
              position: "top",
              fill: "rgba(255, 255, 255, 0.8)",
              fontSize: 12
            }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="temperature"
            stroke="rgba(255, 165, 0, 0.8)"
            strokeWidth={2}
            dot={false}
            name="temperature"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey={(point) => point.brightness * 100}
            stroke="rgba(100, 200, 255, 0.8)"
            strokeWidth={2}
            dot={false}
            name="brightness"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 
import { createContext, useContext } from 'react';
import { ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/utils/cn';

const ChartContext = createContext({});
const useChart = () => useContext(ChartContext);

function ChartContainer({ config = {}, className, children }) {
  const cssVars = Object.fromEntries(
    Object.entries(config).map(([key, val]) => [`--color-${key}`, val.color])
  );

  return (
    <ChartContext.Provider value={{ config }}>
      <div className={cn('w-full', className)} style={cssVars}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

function ChartTooltip({ content, ...props }) {
  return (
    <Tooltip
      contentStyle={{
        background: 'oklch(0.21 0.006 285.885)',
        border: '1px solid oklch(1 0 0 / 0.1)',
        borderRadius: '8px',
        color: '#fafafa',
        fontSize: '11px',
        padding: '8px 12px',
      }}
      labelStyle={{ color: '#9f9fa9', marginBottom: '4px' }}
      cursor={{ stroke: 'oklch(1 0 0 / 0.1)', strokeWidth: 1 }}
      {...props}
    />
  );
}

export { ChartContainer, ChartTooltip, useChart };

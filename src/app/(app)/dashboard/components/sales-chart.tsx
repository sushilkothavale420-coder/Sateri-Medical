'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

const chartConfig = {
  total: {
    label: 'Sales',
    color: 'hsl(var(--chart-1))',
  },
};

type SalesChartProps = {
  data: { month: string; total: number }[];
};

export function SalesChart({ data }: SalesChartProps) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} aria-label="Sales chart">
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <YAxis 
            tickFormatter={(value) => {
                if (typeof value === 'number') {
                    return `₹${value / 1000}k`;
                }
                return value;
            }}
          />
          <Tooltip 
            cursor={false}
            content={<ChartTooltipContent 
                formatter={(value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value as number)}
                indicator='dot' 
            />}
          />
          <Bar dataKey="total" fill="var(--color-total)" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

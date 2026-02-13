"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { monthlySalesData } from "@/lib/placeholder-data";

const chartConfig = {
  "Paracetamol 500mg": {
    label: "Paracetamol",
    color: "hsl(var(--chart-1))",
  },
  "Ibuprofen 200mg": {
    label: "Ibuprofen",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function SalesChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={monthlySalesData}>
            <CartesianGrid vertical={false} />
            <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis />
            <Tooltip content={<ChartTooltipContent />} />
            <Bar dataKey="Paracetamol 500mg" fill="var(--color-Paracetamol 500mg)" radius={4} />
            <Bar dataKey="Ibuprofen 200mg" fill="var(--color-Ibuprofen 200mg)" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

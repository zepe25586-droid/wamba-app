
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import type { Projet } from '@/lib/types';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';

interface ProjetChartProps {
  projets: Projet[];
}

const chartConfig = {
  total: {
    label: 'Total',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function ProjetChart({ projets }: ProjetChartProps) {
  const data = projets.reduce((acc, projet) => {
    if(projet.status !== 'Payé') return acc;
    const month = new Date(projet.date).toLocaleString('fr-FR', { month: 'short' });
    const existingMonth = acc.find((item) => item.month === month);

    if (existingMonth) {
      existingMonth.total += projet.amount;
    } else {
      acc.push({ month, total: projet.amount });
    }
    return acc;
  }, [] as { month: string; total: number }[]);

  const monthOrder = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  data.sort((a, b) => monthOrder.indexOf(a.month.replace('.','')) - monthOrder.indexOf(b.month.replace('.','')));


  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <XAxis
            dataKey="month"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value.toLocaleString('fr-FR')} FCFA`}
          />
          <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
          />
          <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

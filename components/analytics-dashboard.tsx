'use client';

import { useAppContext } from '@/context/app-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, LineChart, PieChart } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
);

export function AnalyticsDashboard() {
  const { spending, moods, milestones } = useAppContext();

  // Spending data for charts
  const spendingLabels = spending.map((s) => new Date(s.timestamp).toLocaleDateString());
  const spendingData = {
    labels: spendingLabels,
    datasets: [
      {
        label: 'Spending ($)',
        data: spending.map((s) => s.amount),
        backgroundColor: 'rgba(107, 155, 140, 0.6)',
        borderColor: 'rgba(107, 155, 140, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Mood data for charts
  const moodLabels = moods.map((m) => new Date(m.timestamp).toLocaleDateString());
  const moodData = {
    labels: moodLabels,
    datasets: [
      {
        label: 'Mood Score (1-5)',
        data: moods.map((m) => {
          switch (m.mood) {
            case 'terrible':
              return 1;
            case 'bad':
              return 2;
            case 'okay':
              return 3;
            case 'good':
              return 4;
            case 'great':
              return 5;
            default:
              return 0;
          }
        }),
        fill: false,
        borderColor: 'rgba(107, 155, 140, 1)',
        tension: 0.1,
      },
    ],
  };

  // Spending by commodity
  const spendingByCommodity = spending.reduce(
    (acc, s) => {
      acc[s.category] = (acc[s.category] || 0) + s.amount;
      return acc;
    },
    {} as Record<string, number>,
  );

  const pieData = {
    labels: Object.keys(spendingByCommodity),
    datasets: [
      {
        label: 'Spending by Category',
        data: Object.values(spendingByCommodity),
        backgroundColor: [
          'rgba(107, 155, 140, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
        ],
        borderColor: [
          'rgba(107, 155, 140, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart />
            Weekly Spending
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Bar data={spendingData} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart />
            Mood Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Line data={moodData} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart />
            Spending Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Pie data={pieData} />
        </CardContent>
      </Card>
    </div>
  );
}

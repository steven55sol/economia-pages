import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

import {
  CAPITALIZATION,
  TIME_UNITS,
  formatCompactMoney,
  formatMoney,
  formatNumber,
  formatPercent,
  periodsToTime,
} from './compound-interest.js';

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

const INK = '#10231c';
const BLUE = '#0369a1';
const BLUE_SOFT = 'rgba(3, 105, 161, 0.55)';
const OCHRE = '#b7791f';
const MUTED = '#64748b';
const GRID = 'rgba(16, 35, 28, 0.08)';
const reducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

let defaultsApplied = false;

function applyDefaults() {
  if (defaultsApplied) return;
  Chart.defaults.color = '#475569';
  Chart.defaults.font.family =
    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  Chart.defaults.font.size = 11;
  Chart.defaults.borderColor = GRID;
  defaultsApplied = true;
}

function tooltipStyle() {
  return {
    backgroundColor: INK,
    titleColor: '#f8fafc',
    bodyColor: '#e2e8f0',
    padding: 10,
    cornerRadius: 8,
    displayColors: false,
    titleFont: { size: 12, weight: '600' },
    bodyFont: { size: 12 },
  };
}

function axisTitles(xTitle, yTitle) {
  return {
    x: {
      display: Boolean(xTitle),
      text: xTitle,
      color: MUTED,
      font: { size: 10, weight: '500' },
      padding: { top: 6 },
    },
    y: {
      display: Boolean(yTitle),
      text: yTitle,
      color: MUTED,
      font: { size: 10, weight: '500' },
      padding: { bottom: 4 },
    },
  };
}

function baseOptions({ xTitle = '', yTitle = '', tooltipLabel, tooltipTitle }) {
  const titles = axisTitles(xTitle, yTitle);

  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: reducedMotion ? false : { duration: 350 },
    layout: { padding: { top: 8, right: 8, bottom: 0, left: 0 } },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        ...tooltipStyle(),
        callbacks: {
          ...(tooltipTitle ? { title: tooltipTitle } : {}),
          label: tooltipLabel,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: MUTED, font: { size: 11 }, maxRotation: 0 },
        title: titles.x,
      },
      y: {
        beginAtZero: true,
        grid: { color: GRID },
        border: { display: false },
        ticks: {
          color: MUTED,
          font: { size: 11 },
          callback: (value) => formatCompactMoney(value),
        },
        title: titles.y,
      },
    },
  };
}

function compositionOptions() {
  return baseOptions({
    yTitle: 'Monto',
    tooltipLabel: (context) => `Monto: ${formatMoney(context.parsed.y)}`,
  });
}

function growthOptions() {
  return baseOptions({
    xTitle: 'Tiempo',
    yTitle: 'Monto final',
    tooltipTitle: (items) =>
      `Tiempo: ${items[0].label} ${items[0].chart.$timeUnit ?? ''}`.trim(),
    tooltipLabel: (context) =>
      `Monto final: ${formatMoney(context.parsed.y)}`,
  });
}

function ratesOptions() {
  return baseOptions({
    xTitle: 'Tasa efectiva anual',
    yTitle: 'Monto final',
    tooltipTitle: (items) => `Tasa efectiva anual: ${items[0].label}`,
    tooltipLabel: (context) =>
      `Monto final: ${formatMoney(context.parsed.y)}`,
  });
}

function buildGrowthData(result) {
  const { capital } = result.summary;
  const { nPeriods, periodicPercent } = result.conversions;
  const { timeUnit, periodsPerYear, yearDays } = result;
  const intervals = 10;
  const labels = [];
  const values = [];
  const periodLabels = [];

  for (let index = 0; index <= intervals; index += 1) {
    const periods = (nPeriods * index) / intervals;
    const timeValue = periodsToTime(
      periods,
      timeUnit,
      periodsPerYear,
      yearDays
    );

    labels.push(formatNumber(timeValue, 2));
    periodLabels.push(formatNumber(periods, 2));
    values.push(capital * Math.pow(1 + periodicPercent / 100, periods));
  }

  return {
    labels,
    periodLabels,
    values,
    unit: TIME_UNITS[timeUnit].label,
    periodUnit: CAPITALIZATION[result.frequency].periodSingular,
  };
}

function buildRatesData(result) {
  const { capital } = result.summary;
  const { nPeriods, periodicPercent } = result.conversions;
  const currentPeriodic = periodicPercent / 100;
  const factors = [0.5, 0.75, 1, 1.25, 1.5];
  const periodicRates = factors.map((factor) => currentPeriodic * factor);
  const m = result.periodsPerYear;

  return {
    labels: periodicRates.map((rate) =>
      formatPercent((Math.pow(1 + rate, m) - 1) * 100, 2)
    ),
    values: periodicRates.map(
      (rate) => capital * Math.pow(1 + rate, nPeriods)
    ),
    colors: periodicRates.map((_, index) =>
      index === 2 ? OCHRE : BLUE_SOFT
    ),
    currentIndex: 2,
  };
}

export function buildCompoundChartData(result) {
  if (!result?.ok) return null;

  return {
    composition: {
      labels: ['Capital', 'Interés', 'Monto final'],
      values: [
        result.summary.capital,
        result.summary.interest,
        result.summary.total,
      ],
      colors: [BLUE, OCHRE, INK],
    },
    growth: buildGrowthData(result),
    rates: buildRatesData(result),
  };
}

export function createCompoundCharts({ composition, growth, rates }, result) {
  applyDefaults();

  const charts = {
    composition: new Chart(composition, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [],
            borderRadius: 4,
            borderSkipped: false,
            maxBarThickness: 72,
          },
        ],
      },
      options: compositionOptions(),
    }),
    growth: new Chart(growth, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Monto final',
            data: [],
            borderColor: BLUE,
            backgroundColor: 'rgba(3, 105, 161, 0.1)',
            fill: true,
            tension: 0.2,
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: BLUE,
            pointBorderColor: '#ffffff',
            pointBorderWidth: 1,
          },
        ],
      },
      options: growthOptions(),
    }),
    rates: new Chart(rates, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [],
            borderRadius: 4,
            borderSkipped: false,
            maxBarThickness: 64,
          },
        ],
      },
      options: ratesOptions(),
    }),
  };

  updateCompoundCharts(charts, result);
  return charts;
}

export function updateCompoundCharts(charts, result) {
  const data = buildCompoundChartData(result);
  if (!data) return;

  charts.composition.data.labels = data.composition.labels;
  charts.composition.data.datasets[0].data = data.composition.values;
  charts.composition.data.datasets[0].backgroundColor =
    data.composition.colors;
  charts.composition.update();

  charts.growth.data.labels = data.growth.labels;
  charts.growth.data.datasets[0].data = data.growth.values;
  charts.growth.options.scales.x.title.text = `Tiempo (${data.growth.unit})`;
  charts.growth.$timeUnit = data.growth.unit;
  charts.growth.update();

  charts.rates.data.labels = data.rates.labels;
  charts.rates.data.datasets[0].data = data.rates.values;
  charts.rates.data.datasets[0].backgroundColor = data.rates.colors;
  charts.rates.update();
}

export function resizeCompoundCharts(charts) {
  if (!charts) return;
  Object.values(charts).forEach((chart) => chart.resize());
}

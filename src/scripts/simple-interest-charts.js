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
  RATE_TYPES,
  TIME_UNITS,
  formatCompactMoney,
  formatMoney,
  formatNumber,
  formatPercent,
  rateFactor,
  timeToYears,
} from './simple-interest.js';

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
const OCHRE = '#b7791f';
const EMERALD = '#059669';
const MUTED = '#64748b';
const GRID = 'rgba(16, 35, 28, 0.08)';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    yTitle: 'Interés acumulado',
    tooltipTitle: (items) =>
      `Tiempo: ${items[0].label} ${items[0].chart.$timeUnit ?? ''}`.trim(),
    tooltipLabel: (context) =>
      `Interés acumulado: ${formatMoney(context.parsed.y)}`,
  });
}

function ratesOptions() {
  return baseOptions({
    xTitle: 'Tasa',
    yTitle: 'Interés',
    tooltipTitle: (items) =>
      `Tasa ${items[0].chart.$rateTypeLabel ?? 'anual'}: ${items[0].label}`,
    tooltipLabel: (context) => `Interés: ${formatMoney(context.parsed.y)}`,
  });
}

function buildGrowthData(result) {
  const { capital } = result.summary;
  const { iAnnual, nYears } = result.conversions;
  const { timeUnit, yearDays } = result;
  const nValue = result.values.n;
  const intervals = 10;
  const labels = [];
  const values = [];

  for (let index = 0; index <= intervals; index += 1) {
    const value = (nValue * index) / intervals;
    const years = timeToYears(value, timeUnit, yearDays);

    labels.push(formatNumber(value, 2));
    values.push(capital * iAnnual * years);
  }

  return {
    labels,
    values,
    unit: TIME_UNITS[timeUnit].label,
    totalYears: nYears,
  };
}

function buildRatesData(result) {
  const { capital } = result.summary;
  const { nYears } = result.conversions;
  const rateType = result.rateType;
  const factor = rateFactor(rateType);
  const currentPercent = result.values.i;
  const factors = [0.5, 0.75, 1, 1.25, 1.5];
  const rates =
    currentPercent > 0
      ? factors.map((multiplier) => currentPercent * multiplier)
      : [5, 10, 15, 20, 25];

  return {
    rates,
    labels: rates.map((rate) =>
      formatPercent(rate, result.target === 'i' ? 1 : 2)
    ),
    values: rates.map(
      (rate) => capital * ((rate / 100) * factor) * nYears
    ),
    colors: rates.map((_, index) =>
      index === 2 ? OCHRE : 'rgba(5, 150, 105, 0.55)'
    ),
    currentIndex: currentPercent > 0 ? 2 : null,
    rateType,
  };
}

export function buildChartData(result) {
  if (!result?.ok) return null;

  return {
    composition: {
      labels: ['Capital', 'Interés', 'Monto total'],
      values: [
        result.summary.capital,
        result.summary.interest,
        result.summary.total,
      ],
      colors: [EMERALD, OCHRE, INK],
    },
    growth: buildGrowthData(result),
    rates: buildRatesData(result),
  };
}

export function createCharts({ composition, growth, rates }, result) {
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
            label: 'Interés acumulado',
            data: [],
            borderColor: OCHRE,
            backgroundColor: 'rgba(183, 121, 31, 0.1)',
            fill: true,
            tension: 0,
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: OCHRE,
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

  updateCharts(charts, result);
  return charts;
}

export function updateCharts(charts, result) {
  const data = buildChartData(result);
  if (!data) return;

  charts.composition.data.labels = data.composition.labels;
  charts.composition.data.datasets[0].data = data.composition.values;
  charts.composition.data.datasets[0].backgroundColor = data.composition.colors;
  charts.composition.update();

  charts.growth.data.labels = data.growth.labels;
  charts.growth.data.datasets[0].data = data.growth.values;
  charts.growth.options.scales.x.title.text = `Tiempo (${data.growth.unit})`;
  charts.growth.$timeUnit = data.growth.unit;
  charts.growth.update();

  charts.rates.data.labels = data.rates.labels;
  charts.rates.data.datasets[0].data = data.rates.values;
  charts.rates.data.datasets[0].backgroundColor = data.rates.colors;
  charts.rates.$rateTypeLabel = RATE_TYPES[data.rates.rateType].label;
  charts.rates.options.scales.x.title.text = `Tasa ${charts.rates.$rateTypeLabel}`;
  charts.rates.update();
}

export function resizeCharts(charts) {
  if (!charts) return;
  Object.values(charts).forEach((chart) => chart.resize());
}

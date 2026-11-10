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
  TIME_UNITS,
  formatCompactMoney,
  formatMoney,
  formatNumber,
  yearsToTime,
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
const SKY = '#0369a1';
const SKY_SOFT = 'rgba(3, 105, 161, 0.35)';
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

function comparisonOptions() {
  return baseOptions({
    yTitle: 'Descuento',
    tooltipLabel: (context) => `Descuento: ${formatMoney(context.parsed.y)}`,
  });
}

function termOptions() {
  return baseOptions({
    xTitle: 'Tiempo',
    yTitle: 'Descuento',
    tooltipTitle: (items) =>
      `Tiempo: ${items[0].label} ${items[0].chart.$timeUnitLabel ?? ''}`.trim(),
    tooltipLabel: (context) => `Descuento: ${formatMoney(context.parsed.y)}`,
  });
}

function buildComparison(result) {
  const { nominal, discount } = result.summary;
  const rateAnnual = result.conversions.rateAnnual;
  const nYears = result.conversions.nYears;

  if (
    !Number.isFinite(rateAnnual) ||
    rateAnnual <= 0 ||
    !Number.isFinite(nYears) ||
    nYears <= 0
  ) {
    return {
      labels: [],
      values: [],
      currentIndex: 0,
      available: false,
    };
  }

  let commercial;
  let rational;

  if (result.criterion === 'comercial') {
    commercial = discount;
    const equivalentRate = rateAnnual / (1 - rateAnnual * nYears);
    rational = nominal - nominal / (1 + equivalentRate * nYears);
  } else {
    rational = discount;
    const equivalentRate = rateAnnual / (1 + rateAnnual * nYears);
    commercial = nominal * equivalentRate * nYears;
  }

  return {
    labels: ['Comercial', 'Racional'],
    values: [commercial, rational],
    currentIndex: result.criterion === 'comercial' ? 0 : 1,
    available: true,
  };
}

function buildTermData(result) {
  const { nominal } = result.summary;
  const rateAnnual = result.conversions.rateAnnual;
  const nYears = result.conversions.nYears;
  const { timeUnit, yearDays } = result;

  if (
    !Number.isFinite(rateAnnual) ||
    rateAnnual <= 0 ||
    !Number.isFinite(nYears) ||
    nYears <= 0
  ) {
    return {
      labels: [],
      values: [],
      unit: TIME_UNITS[timeUnit].label,
      available: false,
    };
  }

  const intervals = 10;

  let maxYears = Math.max(nYears * 1.5, nYears + 0.25);
  if (result.criterion === 'comercial' && rateAnnual > 0) {
    maxYears = Math.min(maxYears, 0.9 / rateAnnual);
  }

  const labels = [];
  const values = [];

  for (let index = 0; index <= intervals; index += 1) {
    const years = (maxYears * index) / intervals;
    const discount =
      result.criterion === 'comercial'
        ? nominal * rateAnnual * years
        : nominal - nominal / (1 + rateAnnual * years);

    labels.push(formatNumber(yearsToTime(years, timeUnit, yearDays), 2));
    values.push(discount);
  }

  return { labels, values, unit: TIME_UNITS[timeUnit].label, available: true };
}

export function buildDiscountChartData(result) {
  if (!result?.ok) return null;

  return {
    composition: {
      labels: ['Valor efectivo', 'Descuento', 'Valor nominal'],
      values: [
        result.summary.effective,
        result.summary.discount,
        result.summary.nominal,
      ],
      colors: [SKY, OCHRE, INK],
    },
    comparison: buildComparison(result),
    term: buildTermData(result),
  };
}

export function createDiscountCharts({ composition, comparison, term }, result) {
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
    comparison: new Chart(comparison, {
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
      options: comparisonOptions(),
    }),
    term: new Chart(term, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Descuento',
            data: [],
            borderColor: SKY,
            backgroundColor: 'rgba(3, 105, 161, 0.08)',
            fill: true,
            tension: 0,
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: SKY,
            pointBorderColor: '#ffffff',
            pointBorderWidth: 1,
          },
        ],
      },
      options: termOptions(),
    }),
  };

  updateDiscountCharts(charts, result);
  return charts;
}

export function updateDiscountCharts(charts, result) {
  const data = buildDiscountChartData(result);
  if (!data) return;

  charts.composition.data.labels = data.composition.labels;
  charts.composition.data.datasets[0].data = data.composition.values;
  charts.composition.data.datasets[0].backgroundColor =
    data.composition.colors;
  charts.composition.update();

  charts.comparison.data.labels = data.comparison.labels;
  charts.comparison.data.datasets[0].data = data.comparison.values;
  charts.comparison.data.datasets[0].backgroundColor =
    data.comparison.values.map((_, index) =>
      index === data.comparison.currentIndex ? SKY : SKY_SOFT
    );
  charts.comparison.update();

  charts.term.$timeUnitLabel = data.term.unit;
  charts.term.data.labels = data.term.labels;
  charts.term.data.datasets[0].data = data.term.values;
  charts.term.update();}

export function resizeDiscountCharts(charts) {
  if (!charts) return;
  Object.values(charts).forEach((chart) => chart?.resize());
}

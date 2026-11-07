export const TIME_UNITS = {
  dias: { label: 'días', singular: 'día', axis: 'días' },
  meses: { label: 'meses', singular: 'mes', axis: 'meses' },
  anios: { label: 'años', singular: 'año', axis: 'años' },
};

export const RATE_TYPES = {
  anual: { label: 'anual' },
  mensual: { label: 'mensual' },
  semanal: { label: 'semanal' },
};

export const TARGETS = {
  I: { label: 'Interés', field: 'I' },
  C: { label: 'Capital inicial', field: 'C' },
  i: { label: 'Tasa de interés', field: 'i' },
  n: { label: 'Tiempo', field: 'n' },
};

const numberFormatter = (maximumFractionDigits, minimumFractionDigits = 0) =>
  new Intl.NumberFormat('es-AR', {
    maximumFractionDigits,
    minimumFractionDigits,
    useGrouping: true,
  });

const inputFormatters = new Map();

function getInputFormatter(minimumFractionDigits, maximumFractionDigits) {
  const key = `${minimumFractionDigits}:${maximumFractionDigits}`;

  if (!inputFormatters.has(key)) {
    inputFormatters.set(
      key,
      new Intl.NumberFormat('es-AR', {
        minimumFractionDigits,
        maximumFractionDigits,
        useGrouping: true,
      })
    );
  }

  return inputFormatters.get(key);
}

const plainFormatter = new Intl.NumberFormat('es-AR', {
  maximumFractionDigits: 6,
  useGrouping: false,
});

const moneyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'USD',
  currencyDisplay: 'symbol',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function parseNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
  if (value === null || value === undefined) return NaN;

  let raw = String(value).trim().replace(/\s/g, '');
  if (!raw) return NaN;

  if (raw.includes(',')) {
    raw = raw.replace(/\./g, '').replace(',', '.');
  } else if (/^\d{1,3}(\.\d{3})+$/.test(raw)) {
    raw = raw.replace(/\./g, '');
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : NaN;
}

export function normalizeYearDays(value) {
  return Number(value) === 365 ? 365 : 360;
}

export function rateFactor(rateType) {
  switch (rateType) {
    case 'semanal':
      return 52;
    case 'mensual':
      return 12;
    default:
      return 1;
  }
}

export function timeToYears(value, timeUnit, yearDays) {
  const base = normalizeYearDays(yearDays);

  if (timeUnit === 'dias') return value / base;
  if (timeUnit === 'meses') return value / 12;
  return value;
}

export function yearsToTime(years, timeUnit, yearDays) {
  const base = normalizeYearDays(yearDays);

  if (timeUnit === 'dias') return years * base;
  if (timeUnit === 'meses') return years * 12;
  return years;
}

export function toAnnualRate(percent, rateType, yearDays) {
  return (percent / 100) * rateFactor(rateType);
}

export function fromAnnualRate(annualDecimal, rateType, yearDays) {
  return (annualDecimal / rateFactor(rateType)) * 100;
}

export function formatNumber(value, maximumFractionDigits = 2) {
  if (!Number.isFinite(value)) return '—';
  return numberFormatter(maximumFractionDigits).format(value);
}

export function formatMoney(value) {
  if (!Number.isFinite(value)) return '—';
  return moneyFormatter.format(value);
}

export function formatPercent(value, maximumFractionDigits = 2) {
  if (!Number.isFinite(value)) return '—';
  return `${formatNumber(value, maximumFractionDigits)}%`;
}

export function formatInputNumber(
  value,
  { minimumFractionDigits = 0, maximumFractionDigits = 6 } = {}
) {
  if (!Number.isFinite(value)) return '';
  return getInputFormatter(minimumFractionDigits, maximumFractionDigits).format(
    value
  );
}

export function formatPlainNumber(value) {
  if (!Number.isFinite(value)) return '';
  return plainFormatter.format(value);
}

export function formatCompactMoney(value) {
  if (!Number.isFinite(value)) return '—';

  const absolute = Math.abs(value);
  if (absolute >= 1_000_000) return `$${formatNumber(value / 1_000_000, 1)} M`;

  if (absolute >= 1_000) {
    const thousands = value / 1_000;
    return `$${formatNumber(thousands, Math.abs(thousands) >= 10 ? 0 : 1)} k`;
  }

  return `$${formatNumber(value, 0)}`;
}

function buildFormula({
  target,
  I,
  C,
  iAnnual,
  nYears,
  iPercent,
  nValue,
  rateType,
  timeUnit,
}) {
  const iAnnualText = formatNumber(iAnnual, 8);
  const nYearsText = formatNumber(nYears, 8);
  const rateLabel = RATE_TYPES[rateType].label;
  const timeLabel = TIME_UNITS[timeUnit].label;

  if (target === 'C') {
    return {
      expression: 'C = I / (i × n)',
      substitution: `C = ${formatMoney(I)} / (${iAnnualText} × ${nYearsText})`,
    };
  }

  if (target === 'i') {
    return {
      expression: 'i = I / (C × n)',
      substitution: `i anual = ${formatMoney(I)} / (${formatMoney(C)} × ${nYearsText}) = ${iAnnualText}`,
      resultLine: `i ${rateLabel} = ${formatPercent(iPercent, 2)}`,
    };
  }

  if (target === 'n') {
    return {
      expression: 'n = I / (C × i)',
      substitution: `n = ${formatMoney(I)} / (${formatMoney(C)} × ${iAnnualText}) = ${nYearsText} años`,
      resultLine: `n = ${formatNumber(nValue, 4)} ${timeLabel}`,
    };
  }

  return {
    expression: 'I = C × i × n',
    substitution: `I = ${formatMoney(C)} × ${iAnnualText} × ${nYearsText}`,
  };
}

function buildSteps({
  target,
  targetLabel,
  resultFormatted,
  formula,
  I,
  C,
  iAnnual,
  iPercent,
  nYears,
  nValue,
  nDays,
  nCalendarDays,
  rateType,
  timeUnit,
  yearDays,
}) {
  const rateLabel = RATE_TYPES[rateType].label;
  const timeLabel = TIME_UNITS[timeUnit].label;
  const steps = [];

  const rateLine = `Tasa: ${formatPercent(iPercent, 2)} ${rateLabel} = ${formatNumber(iAnnual, 8)} anual.`;
  let timeLine = `Tiempo: ${formatNumber(nValue, 4)} ${timeLabel} = ${formatNumber(nYears, 8)} años = ${formatNumber(nDays, 4)} días (base ${yearDays}).`;
  if (yearDays === 360) {
    timeLine += ` Equivalencia calendario: ${formatNumber(nCalendarDays, 2)} días.`;
  }

  if (target === 'i') {
    steps.push(timeLine);
    steps.push(`Fórmula: ${formula.expression}.`);
    steps.push(`Sustitución: ${formula.substitution}.`);
    steps.push(`Conversión: ${formatNumber(iAnnual, 8)} anual = ${formatPercent(iPercent, 2)} ${rateLabel}.`);
  } else if (target === 'n') {
    steps.push(rateLine);
    steps.push(`Fórmula: ${formula.expression}.`);
    steps.push(`Sustitución: ${formula.substitution}.`);
    steps.push(`Conversión: ${formatNumber(nYears, 8)} años = ${formatNumber(nValue, 4)} ${timeLabel} = ${formatNumber(nDays, 4)} días (base ${yearDays}).`);
  } else {
    steps.push(rateLine);
    steps.push(timeLine);
    steps.push(`Fórmula: ${formula.expression}.`);
    steps.push(`Sustitución: ${formula.substitution}.`);
  }

  steps.push(`Resultado: ${targetLabel} = ${resultFormatted}.`);
  steps.push(`Monto total: ${formatMoney(C)} + ${formatMoney(I)} = ${formatMoney(C + I)}.`);

  return steps;
}

export function solveExercise(input) {
  const target = TARGETS[input.target] ? input.target : 'I';
  const yearDays = normalizeYearDays(input.yearDays);
  const timeUnit = TIME_UNITS[input.timeUnit] ? input.timeUnit : 'meses';
  const rateType = RATE_TYPES[input.rateType] ? input.rateType : 'anual';

  const rawValues = {
    I: parseNumber(input.I),
    C: parseNumber(input.C),
    i: parseNumber(input.i),
    n: parseNumber(input.n),
  };

  const errors = {};
  const positive = (field) => Number.isFinite(rawValues[field]) && rawValues[field] > 0;

  const requireFields = (fields) => {
    fields.forEach((field) => {
      if (positive(field)) return;

      if (field === 'I') errors[field] = 'Ingresá un interés mayor que cero.';
      if (field === 'C') errors[field] = 'Ingresá un capital mayor que cero.';
      if (field === 'i') errors[field] = 'Ingresá una tasa mayor que cero.';
      if (field === 'n') errors[field] = 'Ingresá un tiempo mayor que cero.';
    });
  };

  if (target === 'I') requireFields(['C', 'i', 'n']);
  if (target === 'C') requireFields(['I', 'i', 'n']);
  if (target === 'i') requireFields(['I', 'C', 'n']);
  if (target === 'n') requireFields(['I', 'C', 'i']);

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors, target, timeUnit, rateType, yearDays };
  }

  let iAnnual = target === 'i' ? null : toAnnualRate(rawValues.i, rateType, yearDays);
  let nYears = target === 'n' ? null : timeToYears(rawValues.n, timeUnit, yearDays);
  let iPercent = rawValues.i;
  let nValue = rawValues.n;
  let C = rawValues.C;
  let I = rawValues.I;

  if (target === 'i') {
    iAnnual = rawValues.I / (rawValues.C * nYears);
    iPercent = fromAnnualRate(iAnnual, rateType, yearDays);
  }

  if (target === 'n') {
    nYears = rawValues.I / (rawValues.C * iAnnual);
    nValue = yearsToTime(nYears, timeUnit, yearDays);
  }

  if (target === 'C') {
    C = rawValues.I / (iAnnual * nYears);
  }

  if (target === 'I') {
    I = C * iAnnual * nYears;
  }

  const nDays = nYears * yearDays;
  const nCalendarDays = nYears * 365;
  const total = C + I;
  const resultValue = target === 'I' ? I : target === 'C' ? C : target === 'i' ? iPercent : nValue;
  const resultUnit =
    target === 'i' ? '%' : target === 'n' ? TIME_UNITS[timeUnit].label : 'money';
  const resultFormatted =
    target === 'i'
      ? formatPercent(iPercent, 2)
      : target === 'n'
        ? `${formatNumber(nValue, 4)} ${TIME_UNITS[timeUnit].label}`
        : formatMoney(resultValue);

  const numericChecks = [I, C, iPercent, nValue, iAnnual, nYears, total];
  if (numericChecks.some((value) => !Number.isFinite(value) || value < 0)) {
    return {
      ok: false,
      errors: { general: 'No se pudo resolver el ejercicio con esos datos.' },
      target,
      timeUnit,
      rateType,
      yearDays,
    };
  }

  const targetLabel = TARGETS[target].label;
  const formula = buildFormula({
    target,
    I,
    C,
    iAnnual,
    nYears,
    iPercent,
    nValue,
    rateType,
    timeUnit,
  });
  const steps = buildSteps({
    target,
    targetLabel,
    resultFormatted,
    formula,
    I,
    C,
    iAnnual,
    iPercent,
    nYears,
    nValue,
    nDays,
    nCalendarDays,
    rateType,
    timeUnit,
    yearDays,
  });

  return {
    ok: true,
    target,
    targetLabel,
    timeUnit,
    rateType,
    yearDays,
    values: { I, C, i: iPercent, n: nValue },
    inputValues: rawValues,
    conversions: {
      iAnnual,
      iPeriodDecimal: iPercent / 100,
      rateFactor: rateFactor(rateType),
      nYears,
      nDays,
      nCalendarDays,
    },
    result: {
      value: resultValue,
      formatted: resultFormatted,
      unit: resultUnit,
      label: targetLabel,
    },
    summary: { interest: I, capital: C, total },
    formula,
    steps,
  };
}

// Motor de cálculo para el módulo de INTERÉS COMPUESTO.
// No contiene fórmulas de interés simple.
//
// Convenciones:
// - La tasa nominal anual se divide por la frecuencia de capitalización.
// - La tasa efectiva anual se convierte a la tasa del período con
//   i = (1 + TEA)^(1/m) - 1.
// - La tasa efectiva por período se usa tal como se ingresa.
// - El tiempo se convierte a períodos según la frecuencia y la base de días.

export const TIME_UNITS = {
  dias: { label: 'días', singular: 'día' },
  semanas: { label: 'semanas', singular: 'semana' },
  meses: { label: 'meses', singular: 'mes' },
  anios: { label: 'años', singular: 'año' },
};

export const CAPITALIZATION = {
  anual: {
    label: 'anual',
    periodLabel: 'años',
    periodSingular: 'año',
    perYear: () => 1,
  },
  semestral: {
    label: 'semestral',
    periodLabel: 'semestres',
    periodSingular: 'semestre',
    perYear: () => 2,
  },
  bimestral: {
    label: 'bimestral',
    periodLabel: 'bimestres',
    periodSingular: 'bimestre',
    perYear: () => 6,
  },
  trimestral: {
    label: 'trimestral',
    periodLabel: 'trimestres',
    periodSingular: 'trimestre',
    perYear: () => 4,
  },
  mensual: {
    label: 'mensual',
    periodLabel: 'meses',
    periodSingular: 'mes',
    perYear: () => 12,
  },
  semanal: {
    label: 'semanal',
    periodLabel: 'semanas',
    periodSingular: 'semana',
    perYear: () => 52,
  },
  diaria: {
    label: 'diaria',
    periodLabel: 'días',
    periodSingular: 'día',
    perYear: (yearDays) => normalizeYearDays(yearDays),
  },
};

export const RATE_BASES = {
  efectiva_anual: { label: 'efectiva anual', short: 'EA' },
  nominal_anual: { label: 'nominal anual', short: 'NA' },
  efectiva_periodo: { label: 'efectiva por período', short: 'EP' },
};

export const TARGETS = {
  M: { label: 'Monto final' },
  C: { label: 'Capital inicial' },
  I: { label: 'Interés generado' },
  i: { label: 'Tasa de interés' },
  n: { label: 'Tiempo' },
};

export const MOVEMENT_TYPES = {
  obligacion: {
    label: 'Obligación',
    side: 'A',
    sideLabel: 'Obligaciones e inversiones',
  },
  inversion: {
    label: 'Inversión',
    side: 'A',
    sideLabel: 'Obligaciones e inversiones',
  },
  pago: {
    label: 'Pago',
    side: 'B',
    sideLabel: 'Pagos y recepciones',
  },
  recepcion: {
    label: 'Recepción',
    side: 'B',
    sideLabel: 'Pagos y recepciones',
  },
};

const moneyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'USD',
  currencyDisplay: 'symbol',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatters = new Map();
const inputFormatters = new Map();

function getNumberFormatter(maximumFractionDigits, minimumFractionDigits = 0) {
  const key = `${minimumFractionDigits}:${maximumFractionDigits}`;
  if (!numberFormatters.has(key)) {
    numberFormatters.set(
      key,
      new Intl.NumberFormat('es-AR', {
        minimumFractionDigits,
        maximumFractionDigits,
        useGrouping: true,
      })
    );
  }
  return numberFormatters.get(key);
}

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
  maximumFractionDigits: 8,
  useGrouping: false,
});

const dateFormatter = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
});

const shortDateFormatter = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
  timeZone: 'UTC',
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

export function periodsPerYear(frequency, yearDays) {
  const config = CAPITALIZATION[frequency] ?? CAPITALIZATION.anual;
  return config.perYear(yearDays);
}

export function periodLabel(frequency) {
  return (CAPITALIZATION[frequency] ?? CAPITALIZATION.anual).periodLabel;
}

export function periodicRate(ratePercent, rateBasis, periodsPerYearValue) {
  const rate = (Number(ratePercent) || 0) / 100;
  const m = periodsPerYearValue;

  if (rateBasis === 'nominal_anual') return rate / m;
  if (rateBasis === 'efectiva_periodo') return rate;
  return Math.pow(1 + rate, 1 / m) - 1;
}

export function basisFromPeriodic(periodic, rateBasis, periodsPerYearValue) {
  const m = periodsPerYearValue;

  if (rateBasis === 'nominal_anual') return periodic * m * 100;
  if (rateBasis === 'efectiva_periodo') return periodic * 100;
  return (Math.pow(1 + periodic, m) - 1) * 100;
}

export function timeToPeriods(value, timeUnit, periodsPerYearValue, yearDays) {
  const m = periodsPerYearValue;
  const base = normalizeYearDays(yearDays);

  if (timeUnit === 'dias') return (value * m) / base;
  if (timeUnit === 'semanas') return (value * m) / 52;
  if (timeUnit === 'meses') return (value * m) / 12;
  return value * m;
}

export function periodsToTime(periods, timeUnit, periodsPerYearValue, yearDays) {
  const m = periodsPerYearValue;
  const base = normalizeYearDays(yearDays);

  if (timeUnit === 'dias') return (periods * base) / m;
  if (timeUnit === 'semanas') return (periods * 52) / m;
  if (timeUnit === 'meses') return (periods * 12) / m;
  return periods / m;
}

export function formatMoney(value) {
  if (!Number.isFinite(value)) return '—';
  return moneyFormatter.format(value);
}

export function formatNumber(value, maximumFractionDigits = 2) {
  if (!Number.isFinite(value)) return '—';
  return getNumberFormatter(maximumFractionDigits).format(value);
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
  return getInputFormatter(
    minimumFractionDigits,
    maximumFractionDigits
  ).format(value);
}

export function formatPlainNumber(value) {
  if (!Number.isFinite(value)) return '';
  return plainFormatter.format(value);
}

export function formatCompactMoney(value) {
  if (!Number.isFinite(value)) return '—';

  const absolute = Math.abs(value);
  if (absolute >= 1_000_000) {
    return `$${formatNumber(value / 1_000_000, 1)} M`;
  }

  if (absolute >= 1_000) {
    const thousands = value / 1_000;
    return `$${formatNumber(thousands, Math.abs(thousands) >= 10 ? 0 : 1)} k`;
  }

  return `$${formatNumber(value, 0)}`;
}

export function parseDateInput(value) {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value).trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

export function formatDate(value) {
  const date = value instanceof Date ? value : parseDateInput(value);
  if (!date) return '—';
  return dateFormatter.format(date);
}

export function formatShortDate(value) {
  const date = value instanceof Date ? value : parseDateInput(value);
  if (!date) return '—';
  return shortDateFormatter.format(date);
}

export function dateToIso(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export function daysBetween(from, to) {
  if (!(from instanceof Date) || !(to instanceof Date)) return NaN;
  return (to.getTime() - from.getTime()) / 86_400_000;
}

function signedPeriodsText(value) {
  return formatNumber(Math.abs(value), 4);
}

function rateLineFor({
  ratePercent,
  rateBasis,
  periodicPercent,
  frequency,
  periodsPerYear: m,
}) {
  const frequencyLabel = CAPITALIZATION[frequency].label;
  const basisLabel = RATE_BASES[rateBasis].label;
  const periodSingular = CAPITALIZATION[frequency].periodSingular;
  const rateDecimal = formatNumber(periodicPercent / 100, 8);
  const rateInput = formatPercent(ratePercent, 4);

  if (rateBasis === 'nominal_anual') {
    return `Tasa: ${rateInput} ${basisLabel} con capitalización ${frequencyLabel} (m = ${m}) → i = ${formatNumber(ratePercent / 100, 8)} ÷ ${m} = ${rateDecimal} = ${formatPercent(periodicPercent, 4)} por ${periodSingular}.`;
  }

  if (rateBasis === 'efectiva_periodo') {
    return `Tasa: ${rateInput} ${basisLabel} (${frequencyLabel}) → i = ${rateDecimal} por ${periodSingular}.`;
  }

  return `Tasa: ${rateInput} ${basisLabel} con capitalización ${frequencyLabel} (m = ${m}) → i = (1 + ${formatNumber(ratePercent / 100, 8)})^(1/${m}) − 1 = ${rateDecimal} = ${formatPercent(periodicPercent, 4)} por ${periodSingular}.`;
}

function buildNormalFormula({
  target,
  C,
  M,
  I,
  iPeriodic,
  nPeriods,
  interestMode,
}) {
  const iP = formatNumber(iPeriodic, 8);
  const nP = formatNumber(nPeriods, 8);
  const factor = Math.pow(1 + iPeriodic, nPeriods);
  const factorText = formatNumber(factor, 8);

  if (target === 'M') {
    return {
      expression: 'M = C · (1 + i)ⁿ',
      substitution: `M = ${formatMoney(C)} · (1 + ${iP})^${nP}`,
      operation: `(1 + ${iP})^${nP} = ${factorText}; M = ${formatMoney(C)} · ${factorText} = ${formatMoney(M)}.`,
    };
  }

  if (target === 'C') {
    return {
      expression: 'C = M / (1 + i)ⁿ',
      substitution: `C = ${formatMoney(M)} / (1 + ${iP})^${nP}`,
      operation: `(1 + ${iP})^${nP} = ${factorText}; C = ${formatMoney(M)} / ${factorText} = ${formatMoney(C)}.`,
    };
  }

  if (target === 'I' && interestMode === 'difference') {
    return {
      expression: 'I = M − C',
      substitution: `I = ${formatMoney(M)} − ${formatMoney(C)}`,
      operation: `I = ${formatMoney(M)} − ${formatMoney(C)} = ${formatMoney(I)}.`,
    };
  }

  if (target === 'I') {
    return {
      expression: 'I = C · [(1 + i)ⁿ − 1]',
      substitution: `I = ${formatMoney(C)} · [(1 + ${iP})^${nP} − 1]`,
      operation: `(1 + ${iP})^${nP} = ${factorText}; I = ${formatMoney(C)} · (${factorText} − 1) = ${formatMoney(I)}.`,
    };
  }

  if (target === 'i') {
    const ratio = M / C;
    const root = Math.pow(ratio, 1 / nPeriods);
    return {
      expression: 'i = (M / C)^(1/n) − 1',
      substitution: `i = (${formatMoney(M)} / ${formatMoney(C)})^(1/${nP}) − 1`,
      operation: `M / C = ${formatNumber(ratio, 10)}; (${formatNumber(ratio, 10)})^(1/${nP}) = ${formatNumber(root, 10)}; i = ${formatNumber(root, 10)} − 1 = ${iP}.`,
    };
  }

  const ratio = M / C;
  const lnRatio = Math.log(ratio);
  const lnFactor = Math.log(1 + iPeriodic);
  return {
    expression: 'n = ln(M / C) / ln(1 + i)',
    substitution: `n = ln(${formatMoney(M)} / ${formatMoney(C)}) / ln(1 + ${iP})`,
    operation: `ln(M / C) = ${formatNumber(lnRatio, 10)}; ln(1 + i) = ${formatNumber(lnFactor, 10)}; n = ${formatNumber(lnRatio, 10)} / ${formatNumber(lnFactor, 10)} = ${nP} períodos.`,
  };
}

function buildNormalSteps({
  target,
  targetLabel,
  resultFormatted,
  label,
  labelWithUnit,
  formula,
  C,
  M,
  I,
  ratePercent,
  rateBasis,
  periodicPercent,
  frequency,
  periodsPerYear: m,
  nValue,
  timeUnit,
  nPeriods,
  nYears,
  nDays,
  yearDays,
  interestMode,
}) {
  const steps = [];
  const basisLabel = RATE_BASES[rateBasis].label;
  const frequencyLabel = CAPITALIZATION[frequency].label;
  const timeLabel = TIME_UNITS[timeUnit].label;
  const periodSingular = CAPITALIZATION[frequency].periodSingular;
  const rateInput = `${formatPercent(ratePercent, 4)} ${basisLabel}`;
  const timeInput = `${formatNumber(nValue, 4)} ${timeLabel}`;

  if (target === 'M') {
    steps.push(
      `Datos: C = ${formatMoney(C)}, i = ${rateInput}, n = ${timeInput}.`
    );
  } else if (target === 'C') {
    steps.push(
      `Datos: M = ${formatMoney(M)}, i = ${rateInput}, n = ${timeInput}.`
    );
  } else if (target === 'I' && interestMode === 'difference') {
    steps.push(`Datos: C = ${formatMoney(C)}, M = ${formatMoney(M)}.`);
  } else if (target === 'I') {
    steps.push(
      `Datos: C = ${formatMoney(C)}, i = ${rateInput}, n = ${timeInput}.`
    );
  } else if (target === 'i') {
    steps.push(
      `Datos: C = ${formatMoney(C)}, M = ${formatMoney(M)}, n = ${timeInput}.`
    );
  } else {
    steps.push(
      `Datos: C = ${formatMoney(C)}, M = ${formatMoney(M)}, i = ${rateInput}.`
    );
  }

  steps.push(`Incógnita: ${targetLabel}.`);

  if (!(target === 'I' && interestMode === 'difference')) {
    if (target === 'i') {
      steps.push(
        `Tasa calculada: i = ${formatPercent(periodicPercent, 4)} por ${periodSingular} = ${rateInput} (${frequencyLabel}).`
      );
    } else {
      steps.push(
        rateLineFor({
          ratePercent,
          rateBasis,
          periodicPercent,
          frequency,
          periodsPerYear: m,
        })
      );
    }
  }

  if (target === 'n') {
    steps.push(`Tiempo: incógnita. Se expresará en ${timeLabel}.`);
  } else if (!(target === 'I' && interestMode === 'difference')) {
    steps.push(
      `Tiempo: ${timeInput} = ${formatNumber(nPeriods, 6)} períodos ${frequencyLabel} = ${formatNumber(nYears, 6)} años = ${formatNumber(nDays, 4)} días base ${yearDays}.`
    );
  }

  steps.push(`Fórmula: ${formula.expression}.`);
  steps.push(`Sustitución: ${formula.substitution}.`);
  steps.push(`Operación: ${formula.operation}`);

  if (target === 'i') {
    const annualEffective =
      (Math.pow(1 + periodicPercent / 100, m) - 1) * 100;
    steps.push(
      `Conversión de la tasa: ${formatPercent(periodicPercent, 4)} por ${periodSingular} = ${rateInput}. Tasa efectiva anual equivalente: ${formatPercent(annualEffective, 4)}.`
    );
  }

  if (target === 'n') {
    steps.push(
      `Conversión del tiempo: ${formatNumber(nPeriods, 6)} períodos ${frequencyLabel} = ${labelWithUnit}.`
    );
  }

  steps.push(`Resultado: ${label} = ${resultFormatted}.`);

  if (!(target === 'I' && interestMode === 'difference')) {
    steps.push(
      `Interés generado: I = M − C = ${formatMoney(M)} − ${formatMoney(C)} = ${formatMoney(I)}.`
    );
    const factor = Math.pow(1 + periodicPercent / 100, nPeriods);
    steps.push(
      `Comprobación: C · (1 + i)ⁿ = ${formatMoney(C)} · ${formatNumber(factor, 8)} = ${formatMoney(M)}.`
    );
  } else {
    steps.push(
      `Monto final: M = C + I = ${formatMoney(C)} + ${formatMoney(I)} = ${formatMoney(M)}.`
    );
  }

  return steps;
}

export function solveCompound(input) {
  const yearDays = normalizeYearDays(input.yearDays);
  const frequency = CAPITALIZATION[input.frequency]
    ? input.frequency
    : 'anual';
  const rateBasis = RATE_BASES[input.rateBasis]
    ? input.rateBasis
    : 'efectiva_anual';
  const timeUnit = TIME_UNITS[input.timeUnit] ? input.timeUnit : 'anios';
  const target = TARGETS[input.target] ? input.target : 'M';
  const m = periodsPerYear(frequency, yearDays);

  const raw = {
    M: parseNumber(input.M),
    C: parseNumber(input.C),
    I: parseNumber(input.I),
    i: parseNumber(input.i),
    n: parseNumber(input.n),
  };

  const positive = (value) => Number.isFinite(value) && value > 0;
  const errors = {};

  const requireField = (field) => {
    if (positive(raw[field])) return;

    if (field === 'M') errors.M = 'Ingresá un monto final mayor que cero.';
    if (field === 'C') errors.C = 'Ingresá un capital mayor que cero.';
    if (field === 'I') errors.I = 'Ingresá un interés mayor que cero.';
    if (field === 'i') errors.i = 'Ingresá una tasa mayor que cero.';
    if (field === 'n') errors.n = 'Ingresá un tiempo mayor que cero.';
  };

  let interestMode = 'compound';

  if (target === 'M') {
    requireField('C');
    requireField('i');
    requireField('n');
  } else if (target === 'C') {
    requireField('M');
    requireField('i');
    requireField('n');
  } else if (target === 'I') {
    if (positive(raw.C) && positive(raw.M) && raw.M > raw.C) {
      interestMode = 'difference';
    } else {
      requireField('C');
      requireField('i');
      requireField('n');
    }
  } else if (target === 'i') {
    requireField('M');
    requireField('C');
    requireField('n');
    if (positive(raw.M) && positive(raw.C) && raw.M <= raw.C) {
      errors.M = 'El monto final debe ser mayor que el capital.';
    }
  } else if (target === 'n') {
    requireField('M');
    requireField('C');
    requireField('i');
    if (positive(raw.M) && positive(raw.C) && raw.M <= raw.C) {
      errors.M = 'El monto final debe ser mayor que el capital.';
    }
  }

  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      errors,
      target,
      frequency,
      rateBasis,
      timeUnit,
      yearDays,
      periodsPerYear: m,
    };
  }

  let C = raw.C;
  let M = raw.M;
  let I = raw.I;
  let ratePercent = raw.i;
  let nValue = raw.n;

  let iPeriodic = periodicRate(ratePercent, rateBasis, m);
  let nPeriods = timeToPeriods(nValue, timeUnit, m, yearDays);

  if (target === 'M') {
    M = C * Math.pow(1 + iPeriodic, nPeriods);
  } else if (target === 'C') {
    C = M / Math.pow(1 + iPeriodic, nPeriods);
  } else if (target === 'I') {
    if (interestMode === 'difference') {
      I = M - C;
    } else {
      M = C * Math.pow(1 + iPeriodic, nPeriods);
      I = M - C;
    }
  } else if (target === 'i') {
    iPeriodic = Math.pow(M / C, 1 / nPeriods) - 1;
    ratePercent = basisFromPeriodic(iPeriodic, rateBasis, m);
  } else if (target === 'n') {
    nPeriods = Math.log(M / C) / Math.log(1 + iPeriodic);
    nValue = periodsToTime(nPeriods, timeUnit, m, yearDays);
  }

  I = M - C;

  const periodicPercent = iPeriodic * 100;
  const annualEffective =
    (Math.pow(1 + iPeriodic, m) - 1) * 100;
  const annualNominal = iPeriodic * m * 100;
  const nYears = nPeriods / m;
  const nDays = nYears * yearDays;
  const nCalendarDays = nYears * 365;

  const numericChecks = [C, M, I, ratePercent, nValue, iPeriodic, nPeriods];
  if (
    numericChecks.some(
      (value) => !Number.isFinite(value) || value < 0
    ) ||
    !Number.isFinite(annualEffective)
  ) {
    return {
      ok: false,
      errors: {
        general: 'No se pudo resolver el ejercicio con esos datos.',
      },
      target,
      frequency,
      rateBasis,
      timeUnit,
      yearDays,
      periodsPerYear: m,
    };
  }

  const targetLabel = TARGETS[target].label;
  const resultValue =
    target === 'M'
      ? M
      : target === 'C'
        ? C
        : target === 'I'
          ? I
          : target === 'i'
            ? ratePercent
            : nValue;

  const resultFormatted =
    target === 'i'
      ? `${formatPercent(ratePercent, 4)} ${RATE_BASES[rateBasis].label}`
      : target === 'n'
        ? `${formatNumber(nValue, 4)} ${TIME_UNITS[timeUnit].label}`
        : formatMoney(resultValue);

  const labelWithUnit =
    target === 'i'
      ? `${formatPercent(ratePercent, 4)} ${RATE_BASES[rateBasis].label}`
      : target === 'n'
        ? `${formatNumber(nValue, 4)} ${TIME_UNITS[timeUnit].label}`
        : formatMoney(resultValue);

  const formula = buildNormalFormula({
    target,
    C,
    M,
    I,
    iPeriodic,
    nPeriods,
    interestMode,
  });

  const steps = buildNormalSteps({
    target,
    targetLabel,
    resultFormatted,
    label: targetLabel,
    labelWithUnit,
    formula,
    C,
    M,
    I,
    ratePercent,
    rateBasis,
    periodicPercent,
    frequency,
    periodsPerYear: m,
    nValue,
    timeUnit,
    nPeriods,
    nYears,
    nDays,
    yearDays,
    interestMode,
  });

  return {
    ok: true,
    mode: 'normal',
    target,
    targetLabel,
    frequency,
    rateBasis,
    timeUnit,
    yearDays,
    periodsPerYear: m,
    values: {
      M,
      C,
      I,
      i: ratePercent,
      n: nValue,
      nPeriods,
      iPeriodic,
    },
    inputValues: raw,
    summary: { capital: C, interest: I, total: M },
    conversions: {
      periodicPercent,
      annualEffective,
      annualNominal,
      nPeriods,
      nYears,
      nMonths: nYears * 12,
      nDays,
      nCalendarDays,
    },
    result: {
      value: resultValue,
      formatted: resultFormatted,
      label: targetLabel,
      unit:
        target === 'i' ? '%' : target === 'n' ? TIME_UNITS[timeUnit].label : 'money',
    },
    formula,
    steps,
  };
}

// ---------------------------------------------------------------------------
// Fecha focal
// ---------------------------------------------------------------------------

export function buildFocalTimeline(input) {
  const focal = parseDateInput(input.focalDate);
  if (!focal) {
    return {
      ok: false,
      message: 'Ingresá una fecha focal válida para ver la línea de tiempo.',
    };
  }

  const movements = (Array.isArray(input.movements) ? input.movements : []).map(
    (movement, index) => {
      const type = MOVEMENT_TYPES[movement.type]
        ? movement.type
        : 'obligacion';
      const date = parseDateInput(movement.date);
      const unknown = Boolean(movement.unknown);
      const amount = parseNumber(movement.amount);

      return {
        id: movement.id ?? `mov-${index}`,
        description: String(movement.description ?? '').trim(),
        type,
        typeLabel: MOVEMENT_TYPES[type].label,
        side: MOVEMENT_TYPES[type].side,
        sideLabel: MOVEMENT_TYPES[type].sideLabel,
        unknown,
        date,
        dateIso: movement.date ?? '',
        dateLabel: date ? formatDate(date) : '',
        amount,
        amountLabel: unknown
          ? 'X'
          : Number.isFinite(amount)
            ? formatMoney(amount)
            : '—',
        validDate: Boolean(date),
      };
    }
  );

  const validDates = movements
    .filter((movement) => movement.date)
    .map((movement) => movement.date);

  const allDates = [...validDates, focal];
  const start = new Date(Math.min(...allDates.map((date) => date.getTime())));
  const end = new Date(Math.max(...allDates.map((date) => date.getTime())));
  const totalDays = daysBetween(start, end);

  movements.forEach((movement) => {
    if (!movement.date) {
      movement.daysFromFocal = null;
      movement.daysFromStart = null;
      return;
    }

    movement.daysFromFocal = daysBetween(movement.date, focal);
    movement.daysFromStart = daysBetween(start, movement.date);
  });

  const uniqueDates = [];
  const seen = new Set();
  [...validDates, focal]
    .sort((a, b) => a.getTime() - b.getTime())
    .forEach((date) => {
      const iso = dateToIso(date);
      if (seen.has(iso)) return;
      seen.add(iso);
      uniqueDates.push({ date, iso, label: formatShortDate(date) });
    });

  return {
    ok: true,
    focal,
    focalLabel: formatDate(focal),
    start,
    end,
    totalDays,
    movements,
    uniqueDates,
  };
}

function movementTerm(movement, iPeriodic) {
  const amountText = movement.unknown ? 'X' : formatMoney(movement.amount);
  const periods = movement.periods;
  const iP = formatNumber(iPeriodic, 8);
  const pText = signedPeriodsText(periods);

  if (Math.abs(periods) < 1e-9) return amountText;
  if (periods > 0) return `${amountText} × (1 + ${iP})^${pText}`;
  return `${amountText} ÷ (1 + ${iP})^${pText}`;
}

function directionLabel(daysFromFocal) {
  if (daysFromFocal > 0.000001) return 'capitalización';
  if (daysFromFocal < -0.000001) return 'descuento';
  return 'sin traslado';
}

export function solveFocalDate(input) {
  const timeline = buildFocalTimeline(input);

  if (!timeline.ok) {
    return {
      ok: false,
      errors: { general: timeline.message },
      mode: 'focal',
      timeline,
    };
  }

  const yearDays = normalizeYearDays(input.yearDays);
  const frequency = CAPITALIZATION[input.frequency]
    ? input.frequency
    : 'anual';
  const rateBasis = RATE_BASES[input.rateBasis]
    ? input.rateBasis
    : 'efectiva_anual';
  const m = periodsPerYear(frequency, yearDays);
  const ratePercent = parseNumber(input.rate);
  const errors = {};
  const movements = timeline.movements;

  if (!(Number.isFinite(ratePercent) && ratePercent > 0)) {
    errors.rate = 'Ingresá una tasa mayor que cero.';
  }

  if (!(Number.isFinite(timeline.totalDays) && timeline.totalDays >= 0)) {
    errors.focalDate = 'La fecha focal no es válida.';
  }

  if (movements.length === 0) {
    errors.movements = 'Agregá al menos un movimiento.';
  }

  const unknownMovements = movements.filter((movement) => movement.unknown);
  if (unknownMovements.length > 1) {
    errors.movements =
      'Solo puede haber una incógnita por ecuación de valor.';
  }

  movements.forEach((movement, index) => {
    if (!movement.validDate) {
      errors[`movement-${index}`] = 'Revisá la fecha del movimiento.';
      return;
    }

    if (!movement.unknown && !(Number.isFinite(movement.amount) && movement.amount > 0)) {
      errors[`movement-${index}`] = 'Ingresá un valor mayor que cero.';
    }
  });

  const sideA = movements.filter((movement) => movement.side === 'A');
  const sideB = movements.filter((movement) => movement.side === 'B');

  if (movements.length > 0 && (sideA.length === 0 || sideB.length === 0)) {
    errors.movements =
      'Agregá movimientos en ambos lados: obligaciones o inversiones, y pagos o recepciones.';
  }

  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      errors,
      mode: 'focal',
      timeline,
      frequency,
      rateBasis,
      yearDays,
      periodsPerYear: m,
      ratePercent,
    };
  }

  const iPeriodic = periodicRate(ratePercent, rateBasis, m);
  if (!(Number.isFinite(iPeriodic) && iPeriodic > 0)) {
    return {
      ok: false,
      errors: { general: 'La tasa no produce un interés periódico válido.' },
      mode: 'focal',
      timeline,
      frequency,
      rateBasis,
      yearDays,
      periodsPerYear: m,
      ratePercent,
    };
  }

  const periodDays = yearDays / m;
  const enriched = movements.map((movement) => {
    const periods = movement.daysFromFocal / periodDays;
    const factor = Math.pow(1 + iPeriodic, periods);
    const valueAtFocal = movement.unknown
      ? null
      : movement.amount * factor;

    return {
      ...movement,
      periods,
      factor,
      valueAtFocal,
      direction: directionLabel(movement.daysFromFocal),
      directionLabel: directionLabel(movement.daysFromFocal),
    };
  });

  const sumA = enriched
    .filter((movement) => movement.side === 'A' && !movement.unknown)
    .reduce((sum, movement) => sum + movement.valueAtFocal, 0);
  const sumB = enriched
    .filter((movement) => movement.side === 'B' && !movement.unknown)
    .reduce((sum, movement) => sum + movement.valueAtFocal, 0);

  const unknown = enriched.find((movement) => movement.unknown);
  let unknownAtFocal = null;
  let unknownAmount = null;
  let totalA = sumA;
  let totalB = sumB;

  if (unknown) {
    const otherSide = unknown.side === 'A' ? sumB : sumA;
    const sameSide = unknown.side === 'A' ? sumA : sumB;
    unknownAtFocal = otherSide - sameSide;

    if (!(Number.isFinite(unknownAtFocal) && unknownAtFocal > 0)) {
      return {
        ok: false,
        errors: {
          general:
            'Con estos datos la incógnita resulta negativa o cero. Revisá los valores, los tipos de movimiento o la fecha focal.',
        },
        mode: 'focal',
        timeline,
        frequency,
        rateBasis,
        yearDays,
        periodsPerYear: m,
        ratePercent,
      };
    }

    unknownAmount = unknownAtFocal / unknown.factor;

    if (!(Number.isFinite(unknownAmount) && unknownAmount > 0)) {
      return {
        ok: false,
        errors: {
          general: 'No se pudo obtener un valor válido para la incógnita.',
        },
        mode: 'focal',
        timeline,
        frequency,
        rateBasis,
        yearDays,
        periodsPerYear: m,
        ratePercent,
      };
    }

    unknown.valueAtFocal = unknownAtFocal;
    unknown.amount = unknownAmount;

    if (unknown.side === 'A') totalA += unknownAtFocal;
    else totalB += unknownAtFocal;
  }

  const difference = totalB - totalA;
  const balanced = Math.abs(difference) < 0.005;

  const termsA = enriched
    .filter((movement) => movement.side === 'A')
    .map((movement) => movementTerm(movement, iPeriodic));
  const termsB = enriched
    .filter((movement) => movement.side === 'B')
    .map((movement) => movementTerm(movement, iPeriodic));

  const valuesA = enriched
    .filter((movement) => movement.side === 'A')
    .map((movement) => formatMoney(movement.valueAtFocal));
  const valuesB = enriched
    .filter((movement) => movement.side === 'B')
    .map((movement) => formatMoney(movement.valueAtFocal));

  const equation = `${termsA.join(' + ') || '0'} = ${
    termsB.join(' + ') || '0'
  }`;
  const equationValues = `${valuesA.join(' + ') || '0'} = ${
    valuesB.join(' + ') || '0'
  }`;

  const development = [];
  if (unknown) {
    development.push(`Ecuación: ${equation}.`);
    development.push(`Valores en la fecha focal: ${equationValues}.`);
    development.push(
      `Valor de la incógnita en la fecha focal: X_focal = ${formatMoney(
        unknownAtFocal
      )}.`
    );
    development.push(
      `Valor de la incógnita en su fecha (${unknown.dateLabel}): X = X_focal / ${formatNumber(
        unknown.factor,
        8
      )} = ${formatMoney(unknownAmount)}.`
    );
  } else {
    development.push(`Ecuación: ${equation}.`);
    development.push(`Valores en la fecha focal: ${equationValues}.`);
    development.push(
      `Diferencia (pagos − obligaciones): ${formatMoney(
        totalB
      )} − ${formatMoney(totalA)} = ${formatMoney(difference)}.`
    );
  }

  const steps = [];
  steps.push(
    rateLineFor({
      ratePercent,
      rateBasis,
      periodicPercent: iPeriodic * 100,
      frequency,
      periodsPerYear: m,
    })
  );
  steps.push(`Fecha focal: ${timeline.focalLabel}.`);

  enriched.forEach((movement) => {
    const typeLabel = MOVEMENT_TYPES[movement.type].label;
    const amountText = movement.unknown
      ? 'X'
      : formatMoney(movement.amount);
    const absPeriods = formatNumber(Math.abs(movement.periods), 4);
    const absDays = formatNumber(Math.abs(movement.daysFromFocal), 2);
    const direction = movement.directionLabel;

    if (Math.abs(movement.periods) < 1e-9) {
      steps.push(
        `${typeLabel} del ${movement.dateLabel} por ${amountText}: está en la fecha focal, no requiere traslado. Valor equivalente = ${formatMoney(
          movement.valueAtFocal
        )}.`
      );
      return;
    }

    const formulaText =
      movement.periods > 0
        ? `VF = ${amountText} × (1 + ${formatNumber(iPeriodic, 8)})^${absPeriods}`
        : `VP = ${amountText} ÷ (1 + ${formatNumber(iPeriodic, 8)})^${absPeriods}`;

    steps.push(
      `${typeLabel} del ${movement.dateLabel} por ${amountText}: k = ${absDays} días ÷ ${formatNumber(
        periodDays,
        4
      )} días/período = ${absPeriods} períodos → ${direction} (${formulaText}) = ${formatMoney(
        movement.valueAtFocal
      )}.`
    );
  });

  steps.push(`Ecuación de valor: ${equation}.`);
  steps.push(`Valores equivalentes en la fecha focal: ${equationValues}.`);

  if (unknown) {
    steps.push(
      `Incógnita en la fecha focal: X_focal = ${formatMoney(
        unknownAtFocal
      )}.`
    );
    steps.push(
      `Incógnita en su fecha (${unknown.dateLabel}): X = ${formatMoney(
        unknownAmount
      )}.`
    );
  } else {
    steps.push(
      `Diferencia en la fecha focal: ${formatMoney(
        totalB
      )} − ${formatMoney(totalA)} = ${formatMoney(difference)}.`
    );
  }

  let result;
  if (unknown) {
    result = {
      label: 'Valor de la incógnita',
      value: unknownAmount,
      formatted: formatMoney(unknownAmount),
      note: `Equivale a ${formatMoney(
        unknownAtFocal
      )} en la fecha focal (${timeline.focalLabel}).`,
    };
  } else if (balanced) {
    result = {
      label: 'Ecuación equilibrada',
      value: 0,
      formatted: formatMoney(0),
      note: 'Los dos lados de la ecuación son equivalentes en la fecha focal.',
    };
  } else {
    result = {
      label: 'Diferencia en la fecha focal',
      value: difference,
      formatted: formatMoney(difference),
      note: 'Diferencia entre pagos y obligaciones. Ajustá los valores para equilibrar la ecuación.',
    };
  }

  steps.push(`Resultado: ${result.label} = ${result.formatted}.`);

  return {
    ok: true,
    mode: 'focal',
    frequency,
    rateBasis,
    timeUnit: 'dias',
    yearDays,
    periodsPerYear: m,
    periodDays,
    ratePercent,
    iPeriodic,
    periodicPercent: iPeriodic * 100,
    annualEffective:
      (Math.pow(1 + iPeriodic, m) - 1) * 100,
    annualNominal: iPeriodic * m * 100,
    values: {
      i: ratePercent,
      iPeriodic,
    },
    summary: {
      sideA: totalA,
      sideB: totalB,
      difference,
      balanced,
      unknownAmount,
      unknownAtFocal,
      unknownDate: unknown?.dateLabel ?? null,
    },
    result,
    equation,
    equationValues,
    development,
    movements: enriched,
    timeline: {
      ...timeline,
      movements: enriched,
      focalLabel: timeline.focalLabel,
    },
    steps,
  };
}

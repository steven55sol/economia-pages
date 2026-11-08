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
  M: { label: 'Monto final', field: 'M' },
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
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
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

const moneyPreciseFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'USD',
  currencyDisplay: 'symbol',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatMoneyPrecise(value) {
  if (!Number.isFinite(value)) return '—';
  return moneyPreciseFormatter.format(value);
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
  M,
  iAnnual,
  nYears,
  iPercent,
  nValue,
  rateType,
  timeUnit,
  capitalFromMount,
}) {
  const iAnnualText = formatNumber(iAnnual, 8);
  const nYearsText = formatNumber(nYears, 8);
  const rateLabel = RATE_TYPES[rateType].label;
  const timeLabel = TIME_UNITS[timeUnit].label;

  if (target === 'C') {
    if (capitalFromMount) {
      return {
        expression: 'C = M / (1 + i × n)',
        substitution: `C = ${formatMoney(M)} / (1 + ${iAnnualText} × ${nYearsText})`,
      };
    }

    return {
      expression: 'C = I / (i × n)',
      substitution: `C = ${formatMoney(I)} / (${iAnnualText} × ${nYearsText})`,
    };
  }

  if (target === 'M') {
    return {
      expression: 'M = C × (1 + i × n)',
      substitution: `M = ${formatMoney(C)} × (1 + ${iAnnualText} × ${nYearsText})`,
    };
  }

  if (target === 'i') {
    return {
      expression: 'i = I / (C × n)',
      substitution: `i anual = ${formatMoney(I)} / (${formatMoney(C)} × ${nYearsText}) = ${iAnnualText}`,
      resultLine: `i ${rateLabel} = ${formatPercent(iPercent, 1)}`,
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
  M,
  iAnnual,
  iPercent,
  nYears,
  nValue,
  nDays,
  nCalendarDays,
  rateType,
  timeUnit,
  yearDays,
  capitalFromMount,
}) {
  const rateLabel = RATE_TYPES[rateType].label;
  const timeLabel = TIME_UNITS[timeUnit].label;
  const rateDecimals = target === 'i' ? 1 : 2;
  const steps = [];

  const rateLine = `Tasa: ${formatPercent(iPercent, rateDecimals)} ${rateLabel} = ${formatNumber(iAnnual, 8)} anual.`;
  let timeLine = `Tiempo: ${formatNumber(nValue, 4)} ${timeLabel} = ${formatNumber(nYears, 8)} años = ${formatNumber(nDays, 4)} días (base ${yearDays}).`;
  if (yearDays === 360) {
    timeLine += ` Equivalencia calendario: ${formatNumber(nCalendarDays, 2)} días.`;
  }

  if (target === 'i') {
    steps.push(timeLine);
    steps.push(`Fórmula: ${formula.expression}.`);
    steps.push(`Sustitución: ${formula.substitution}.`);
    steps.push(`Conversión: ${formatNumber(iAnnual, 8)} anual = ${formatPercent(iPercent, 1)} ${rateLabel}.`);
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

  if (target === 'C' && capitalFromMount) {
    steps.push(
      `Interés generado: I = M − C = ${formatMoney(M)} − ${formatMoney(C)} = ${formatMoney(I)}.`
    );
  }

  steps.push(`Monto total: ${formatMoney(C)} + ${formatMoney(I)} = ${formatMoney(M)}.`);

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
    M: parseNumber(input.M),
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
      if (field === 'M') errors[field] = 'Ingresá un monto final mayor que cero.';
      if (field === 'i') errors[field] = 'Ingresá una tasa mayor que cero.';
      if (field === 'n') errors[field] = 'Ingresá un tiempo mayor que cero.';
    });
  };

  if (target === 'I') requireFields(['C', 'i', 'n']);
  if (target === 'M') requireFields(['C', 'i', 'n']);
  if (target === 'C') {
    if (positive('M')) requireFields(['M', 'i', 'n']);
    else requireFields(['I', 'i', 'n']);
  }
  if (target === 'i') requireFields(['I', 'C', 'n']);
  if (target === 'n') requireFields(['I', 'C', 'i']);

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors, target, timeUnit, rateType, yearDays };
  }

  const capitalFromMount = target === 'C' && positive('M');

  let iAnnual = target === 'i' ? null : toAnnualRate(rawValues.i, rateType, yearDays);
  let nYears = target === 'n' ? null : timeToYears(rawValues.n, timeUnit, yearDays);
  let iPercent = rawValues.i;
  let nValue = rawValues.n;
  let C = rawValues.C;
  let I = rawValues.I;
  let M = rawValues.M;

  if (target === 'i') {
    iAnnual = rawValues.I / (rawValues.C * nYears);
    iPercent = fromAnnualRate(iAnnual, rateType, yearDays);
  }

  if (target === 'n') {
    nYears = rawValues.I / (rawValues.C * iAnnual);
    nValue = yearsToTime(nYears, timeUnit, yearDays);
  }

  if (target === 'C') {
    C = capitalFromMount
      ? M / (1 + iAnnual * nYears)
      : I / (iAnnual * nYears);
  }

  if (target === 'I') {
    I = C * iAnnual * nYears;
  }

  if (target === 'M') {
    M = C * (1 + iAnnual * nYears);
  }

  if (target === 'M' || capitalFromMount) {
    I = M - C;
  } else {
    M = C + I;
  }

  const nDays = nYears * yearDays;
  const nCalendarDays = nYears * 365;
  const total = M;
  const resultValue =
    target === 'I'
      ? I
      : target === 'C'
        ? C
        : target === 'M'
          ? M
          : target === 'i'
            ? iPercent
            : nValue;
  const resultUnit =
    target === 'i' ? '%' : target === 'n' ? TIME_UNITS[timeUnit].label : 'money';
  const resultFormatted =
    target === 'i'
      ? formatPercent(iPercent, 1)
      : target === 'n'
        ? `${formatNumber(nValue, 4)} ${TIME_UNITS[timeUnit].label}`
        : formatMoney(resultValue);

  const numericChecks = [I, C, M, iPercent, nValue, iAnnual, nYears, total];
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
    M,
    iAnnual,
    nYears,
    iPercent,
    nValue,
    rateType,
    timeUnit,
    capitalFromMount,
  });
  const steps = buildSteps({
    target,
    targetLabel,
    resultFormatted,
    formula,
    I,
    C,
    M,
    iAnnual,
    iPercent,
    nYears,
    nValue,
    nDays,
    nCalendarDays,
    rateType,
    timeUnit,
    yearDays,
    capitalFromMount,
  });

  return {
    ok: true,
    target,
    targetLabel,
    timeUnit,
    rateType,
    yearDays,
    values: { I, C, M, i: iPercent, n: nValue },
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

// ---------------------------------------------------------------------------
// Fecha focal con interés simple
// ---------------------------------------------------------------------------

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

function directionFromDays(daysFromFocal) {
  if (daysFromFocal > 0.000001) return 'futuro';
  if (daysFromFocal < -0.000001) return 'pasado';
  return 'focal';
}

export function buildSimpleTimeline(input) {
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
      const amount = parseNumber(movement.amount);
      const unknown = Boolean(movement.unknown);

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
            ? formatMoneyPrecise(amount)
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
      movement.direction = 'focal';
      movement.distanceLabel = '';
      return;
    }

    const daysFromFocal = daysBetween(movement.date, focal);
    movement.daysFromFocal = daysFromFocal;
    movement.daysFromStart = daysBetween(start, movement.date);
    movement.direction = directionFromDays(daysFromFocal);
    movement.distanceLabel = `${formatNumber(
      Math.abs(daysFromFocal),
      Math.abs(daysFromFocal) >= 100 ? 0 : 1
    )} días`;
  });

  return {
    ok: true,
    focal,
    focalLabel: formatDate(focal),
    start,
    end,
    totalDays,
    movements,
  };
}

export function solveFocalSimple(input) {
  const timeline = buildSimpleTimeline(input);

  if (!timeline.ok) {
    return {
      ok: false,
      errors: { general: timeline.message },
      mode: 'focal',
      timeline,
    };
  }

  const yearDays = normalizeYearDays(input.yearDays);
  const rateType = RATE_TYPES[input.rateType] ? input.rateType : 'anual';
  const ratePercent = parseNumber(input.rate);
  const errors = {};
  const movements = timeline.movements;

  if (!(Number.isFinite(ratePercent) && ratePercent > 0)) {
    errors.rate = 'Ingresá una tasa mayor que cero.';
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

    if (
      !movement.unknown &&
      !(Number.isFinite(movement.amount) && movement.amount > 0)
    ) {
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
      rateType,
      yearDays,
      ratePercent,
    };
  }

  const iAnnual = toAnnualRate(ratePercent, rateType, yearDays);
  if (!(Number.isFinite(iAnnual) && iAnnual > 0)) {
    return {
      ok: false,
      errors: { general: 'La tasa no produce un interés anual válido.' },
      mode: 'focal',
      timeline,
      rateType,
      yearDays,
      ratePercent,
    };
  }

  const enriched = movements.map((movement) => {
    const yearsFromFocal = movement.daysFromFocal / yearDays;
    const years = Math.abs(yearsFromFocal);
    const factor = 1 + iAnnual * years;

    let valueAtFocal;
    if (movement.direction === 'futuro') {
      valueAtFocal = movement.unknown
        ? null
        : movement.amount * factor;
    } else if (movement.direction === 'pasado') {
      valueAtFocal = movement.unknown
        ? null
        : movement.amount / factor;
    } else {
      valueAtFocal = movement.unknown ? null : movement.amount;
    }

    return {
      ...movement,
      yearsFromFocal,
      years,
      factor,
      valueAtFocal,
      valueLabel: Number.isFinite(valueAtFocal)
        ? formatMoneyPrecise(valueAtFocal)
        : null,
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
        rateType,
        yearDays,
        ratePercent,
      };
    }

    if (unknown.direction === 'futuro') {
      unknownAmount = unknownAtFocal / unknown.factor;
    } else if (unknown.direction === 'pasado') {
      unknownAmount = unknownAtFocal * unknown.factor;
    } else {
      unknownAmount = unknownAtFocal;
    }

    if (!(Number.isFinite(unknownAmount) && unknownAmount > 0)) {
      return {
        ok: false,
        errors: {
          general: 'No se pudo obtener un valor válido para la incógnita.',
        },
        mode: 'focal',
        timeline,
        rateType,
        yearDays,
        ratePercent,
      };
    }

    unknown.amount = unknownAmount;
    unknown.amountLabel = 'X';
    unknown.valueAtFocal = unknownAtFocal;
    unknown.valueLabel = formatMoneyPrecise(unknownAtFocal);

    if (unknown.side === 'A') totalA += unknownAtFocal;
    else totalB += unknownAtFocal;
  }

  const difference = totalB - totalA;
  const balanced = Math.abs(difference) < 0.005;

  const termFor = (movement) => {
    const amountText = movement.unknown
      ? 'X'
      : formatMoneyPrecise(movement.amount);
    const nText = formatNumber(movement.years, 6);
    const iText = formatNumber(iAnnual, 8);

    if (movement.direction === 'focal') return amountText;
    if (movement.direction === 'futuro') {
      return `${amountText} × (1 + ${iText} × ${nText})`;
    }
    return `${amountText} ÷ (1 + ${iText} × ${nText})`;
  };

  const termsA = enriched
    .filter((movement) => movement.side === 'A')
    .map(termFor);
  const termsB = enriched
    .filter((movement) => movement.side === 'B')
    .map(termFor);

  const valuesA = enriched
    .filter((movement) => movement.side === 'A')
    .map((movement) => formatMoneyPrecise(movement.valueAtFocal));
  const valuesB = enriched
    .filter((movement) => movement.side === 'B')
    .map((movement) => formatMoneyPrecise(movement.valueAtFocal));

  const equation = `${termsA.join(' + ') || '0'} = ${
    termsB.join(' + ') || '0'
  }`;
  const equationValues = `${valuesA.join(' + ') || '0'} = ${
    valuesB.join(' + ') || '0'
  }`;

  const development = [];
  development.push(`Ecuación: ${equation}.`);
  development.push(`Valores en la fecha focal: ${equationValues}.`);

  if (unknown) {
    development.push(
      `Valor de la incógnita en la fecha focal: X_focal = ${formatMoneyPrecise(
        unknownAtFocal
      )}.`
    );
    development.push(
      `Valor de la incógnita en su fecha (${unknown.dateLabel}): X = ${formatMoneyPrecise(
        unknownAmount
      )}.`
    );
  } else {
    development.push(
      `Diferencia (pagos − obligaciones): ${formatMoneyPrecise(
        totalB
      )} − ${formatMoneyPrecise(totalA)} = ${formatMoneyPrecise(difference)}.`
    );
  }

  const steps = [];
  steps.push(
    `Tasa: ${formatPercent(ratePercent, 2)} ${RATE_TYPES[rateType].label} = ${formatNumber(iAnnual, 8)} anual.`
  );
  steps.push(`Fecha focal: ${timeline.focalLabel}.`);

  enriched.forEach((movement) => {
    const amountText = movement.unknown
      ? 'X'
      : formatMoneyPrecise(movement.amount);
    const nText = formatNumber(movement.years, 6);
    const iText = formatNumber(iAnnual, 8);
    const daysText = formatNumber(Math.abs(movement.daysFromFocal), 2);
    const yearsWord =
      Math.abs(Math.abs(movement.years) - 1) < 1e-9 ? 'año' : 'años';

    if (movement.direction === 'focal') {
      steps.push(
        `${movement.typeLabel} del ${movement.dateLabel} por ${amountText}: está en la fecha focal, no requiere traslado. Valor equivalente = ${formatMoneyPrecise(
          movement.valueAtFocal
        )}.`
      );
      return;
    }

    const formulaText =
      movement.direction === 'futuro'
        ? `VF = ${amountText} × (1 + ${iText} × ${nText})`
        : `VP = ${amountText} ÷ (1 + ${iText} × ${nText})`;

    steps.push(
      `${movement.typeLabel} del ${movement.dateLabel} por ${amountText}: n = ${daysText} días ÷ ${yearDays} = ${nText} ${yearsWord} → ${
        movement.direction === 'futuro' ? 'capitalización' : 'descuento'
      } (${formulaText}) = ${formatMoneyPrecise(movement.valueAtFocal)}.`
    );
  });

  steps.push(`Ecuación de valor: ${equation}.`);
  steps.push(`Valores equivalentes en la fecha focal: ${equationValues}.`);

  if (unknown) {
    steps.push(
      `Incógnita en la fecha focal: X_focal = ${formatMoneyPrecise(
        unknownAtFocal
      )}.`
    );
    steps.push(
      `Incógnita en su fecha (${unknown.dateLabel}): X = ${formatMoneyPrecise(
        unknownAmount
      )}.`
    );
  } else {
    steps.push(
      `Diferencia en la fecha focal: ${formatMoneyPrecise(
        totalB
      )} − ${formatMoneyPrecise(totalA)} = ${formatMoneyPrecise(difference)}.`
    );
  }

  let result;
  if (unknown) {
    result = {
      label: 'Valor de la incógnita',
      value: unknownAmount,
      formatted: formatMoneyPrecise(unknownAmount),
      note: `Equivale a ${formatMoneyPrecise(
        unknownAtFocal
      )} en la fecha focal (${timeline.focalLabel}).`,
    };
  } else if (balanced) {
    result = {
      label: 'Ecuación equilibrada',
      value: 0,
      formatted: formatMoneyPrecise(0),
      note: 'Los dos lados de la ecuación son equivalentes en la fecha focal.',
    };
  } else {
    result = {
      label: 'Diferencia en la fecha focal',
      value: difference,
      formatted: formatMoneyPrecise(difference),
      note: 'Diferencia entre pagos y obligaciones. Ajustá los valores para equilibrar la ecuación.',
    };
  }

  steps.push(`Resultado: ${result.label} = ${result.formatted}.`);

  return {
    ok: true,
    mode: 'focal',
    rateType,
    yearDays,
    ratePercent,
    iAnnual,
    values: { i: ratePercent },
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
    },
    steps,
  };
}

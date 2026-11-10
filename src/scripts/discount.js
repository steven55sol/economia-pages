// Motor de cálculo para el módulo de DESCUENTO SIMPLE.
//
// Convenciones:
// - Descuento comercial: se calcula sobre el valor nominal.
//   D = M · d · n; C = M · (1 - d · n).
// - Descuento racional: se calcula sobre el valor efectivo.
//   D = M - C; C = M / (1 + i · n).
// - La tasa se ingresa anual, mensual o semanal y se convierte a anual.
// - El tiempo se ingresa en días, meses o años y se convierte a años.

import {
  RATE_TYPES,
  TIME_UNITS,
  formatMoney,
  formatNumber,
  formatPercent,
  fromAnnualRate,
  normalizeYearDays,
  parseNumber,
  rateFactor,
  timeToYears,
  toAnnualRate,
  yearsToTime,
} from './simple-interest.js';

export {
  RATE_TYPES,
  TIME_UNITS,
  formatInputNumber,
  formatMoney,
  formatNumber,
  formatPercent,
  fromAnnualRate,
  normalizeYearDays,
  parseNumber,
  timeToYears,
  toAnnualRate,
} from './simple-interest.js';

export const CRITERIA = {
  comercial: {
    label: 'Comercial',
    longLabel: 'Descuento comercial',
    rateLabel: 'Tasa de descuento',
    rateSymbol: 'd',
    basis: 'se calcula sobre el valor nominal',
  },
  racional: {
    label: 'Racional',
    longLabel: 'Descuento racional',
    rateLabel: 'Tasa de interés',
    rateSymbol: 'i',
    basis: 'se calcula sobre el valor efectivo',
  },
};

export const TARGETS = {
  D: { label: 'Descuento', field: 'D' },
  C: { label: 'Valor efectivo', field: 'C' },
  M: { label: 'Valor nominal', field: 'M' },
  rate: { label: 'Tasa', field: 'rate' },
  n: { label: 'Tiempo', field: 'n' },
};

function isPositive(value) {
  return Number.isFinite(value) && value > 0;
}

function targetLabelFor(target, criterion) {
  if (target === 'C') {
    return criterion === 'comercial' ? 'Valor efectivo' : 'Valor actual';
  }
  if (target === 'rate') return CRITERIA[criterion].rateLabel;
  return TARGETS[target].label;
}

function formatTime(value, timeUnit) {
  const unit = TIME_UNITS[timeUnit];
  const label = value === 1 ? unit.singular : unit.label;
  return `${formatNumber(value, 4)} ${label}`;
}

function buildFormula({
  target,
  criterion,
  D,
  C,
  M,
  rateAnnual,
  nYears,
  capitalFromDiscount,
  nominalFromParts,
  nominalFromDiscount,
}) {
  const r = formatNumber(rateAnnual, 8);
  const n = formatNumber(nYears, 8);

  if (criterion === 'comercial') {
    if (target === 'D') {
      return {
        expression: 'D = M · d · n',
        substitution: `D = ${formatMoney(M)} · ${r} · ${n}`,
      };
    }

    if (target === 'C') {
      if (capitalFromDiscount) {
        return {
          expression: 'C = M − D',
          substitution: `C = ${formatMoney(M)} − ${formatMoney(D)}`,
        };
      }

      return {
        expression: 'C = M · (1 − d · n)',
        substitution: `C = ${formatMoney(M)} · (1 − ${r} · ${n})`,
      };
    }

    if (target === 'M') {
      if (nominalFromParts) {
        return {
          expression: 'M = C + D',
          substitution: `M = ${formatMoney(C)} + ${formatMoney(D)}`,
        };
      }

      if (nominalFromDiscount) {
        return {
          expression: 'M = D ÷ (d · n)',
          substitution: `M = ${formatMoney(D)} ÷ (${r} · ${n})`,
        };
      }

      return {
        expression: 'M = C ÷ (1 − d · n)',
        substitution: `M = ${formatMoney(C)} ÷ (1 − ${r} · ${n})`,
      };
    }

    if (target === 'rate') {
      return {
        expression: 'd = D ÷ (M · n)',
        substitution: `d = ${formatMoney(D)} ÷ (${formatMoney(M)} · ${n})`,
      };
    }

    return {
      expression: 'n = D ÷ (M · d)',
      substitution: `n = ${formatMoney(D)} ÷ (${formatMoney(M)} · ${r})`,
    };
  }

  if (target === 'D') {
    return {
      expression: 'D = M · i · n ÷ (1 + i · n)',
      substitution: `D = ${formatMoney(M)} · ${r} · ${n} ÷ (1 + ${r} · ${n})`,
    };
  }

  if (target === 'C') {
    if (capitalFromDiscount) {
      return {
        expression: 'C = M − D',
        substitution: `C = ${formatMoney(M)} − ${formatMoney(D)}`,
      };
    }

    return {
      expression: 'C = M ÷ (1 + i · n)',
      substitution: `C = ${formatMoney(M)} ÷ (1 + ${r} · ${n})`,
    };
  }

  if (target === 'M') {
    if (nominalFromParts) {
      return {
        expression: 'M = C + D',
        substitution: `M = ${formatMoney(C)} + ${formatMoney(D)}`,
      };
    }

    if (nominalFromDiscount) {
      return {
        expression: 'M = D · (1 + i · n) ÷ (i · n)',
        substitution: `M = ${formatMoney(D)} · (1 + ${r} · ${n}) ÷ (${r} · ${n})`,
      };
    }

    return {
      expression: 'M = C · (1 + i · n)',
      substitution: `M = ${formatMoney(C)} · (1 + ${r} · ${n})`,
    };
  }

  if (target === 'rate') {
    return {
      expression: 'i = D ÷ (C · n)',
      substitution: `i = ${formatMoney(D)} ÷ (${formatMoney(C)} · ${n})`,
    };
  }

  return {
    expression: 'n = D ÷ (C · i)',
    substitution: `n = ${formatMoney(D)} ÷ (${formatMoney(C)} · ${r})`,
  };
}

export function solveDiscount(input = {}) {
  const criterion = CRITERIA[input.criterion] ? input.criterion : 'comercial';
  const target = TARGETS[input.target] ? input.target : 'D';
  const yearDays = normalizeYearDays(input.yearDays);
  const timeUnit = TIME_UNITS[input.timeUnit] ? input.timeUnit : 'meses';
  const rateType = RATE_TYPES[input.rateType] ? input.rateType : 'anual';

  const raw = {
    D: parseNumber(input.D),
    C: parseNumber(input.C),
    M: parseNumber(input.M),
    rate: parseNumber(input.rate),
    n: parseNumber(input.n),
  };

  const errors = {};
  const positive = (field) => isPositive(raw[field]);

  const errorFor = (field) => {
    if (field === 'D') return 'Ingresá un descuento mayor que cero.';
    if (field === 'C') return 'Ingresá un valor efectivo mayor que cero.';
    if (field === 'M') return 'Ingresá un valor nominal mayor que cero.';
    if (field === 'rate') return 'Ingresá una tasa mayor que cero.';
    return 'Ingresá un tiempo mayor que cero.';
  };

  const requireFields = (fields) => {
    fields.forEach((field) => {
      if (!positive(field)) errors[field] = errorFor(field);
    });
  };

  if (target === 'D') {
    requireFields(['M', 'rate', 'n']);
  }

  if (target === 'C') {
    if (positive('M') && positive('D')) {
      requireFields(['M', 'D']);
    } else {
      requireFields(['M', 'rate', 'n']);
    }
  }

  if (target === 'M') {
    if (positive('C') && positive('D')) {
      requireFields(['C', 'D']);
    } else if (positive('C')) {
      requireFields(['C', 'rate', 'n']);
    } else if (positive('D')) {
      requireFields(['D', 'rate', 'n']);
    } else {
      errors.C = 'Ingresá el valor efectivo o el descuento.';
    }
  }

  if (target === 'rate') {
    requireFields(['D', 'n']);
    if (!positive('M') && !positive('C')) {
      errors.M = 'Ingresá el valor nominal o el valor efectivo para calcular la tasa.';
    }
  }

  if (target === 'n') {
    requireFields(['D', 'rate']);
    if (!positive('M') && !positive('C')) {
      errors.M = 'Ingresá el valor nominal o el valor efectivo para calcular el tiempo.';
    }
  }

  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      errors,
      target,
      criterion,
      timeUnit,
      rateType,
      yearDays,
    };
  }

  const capitalFromDiscount = target === 'C' && positive('D');
  const nominalFromParts = target === 'M' && positive('C') && positive('D');
  const nominalFromDiscount =
    target === 'M' && !positive('C') && positive('D');

  let rateAnnual =
    target === 'rate' ? null : toAnnualRate(raw.rate, rateType, yearDays);
  let nYears = target === 'n' ? null : timeToYears(raw.n, timeUnit, yearDays);
  let ratePercent = raw.rate;
  let nValue = raw.n;
  let D = raw.D;
  let C = raw.C;
  let M = raw.M;

  if (target === 'rate') {
    if (!isPositive(M) && isPositive(C)) M = C + D;
    if (!isPositive(C) && isPositive(M)) C = M - D;

    rateAnnual =
      criterion === 'comercial' ? D / (M * nYears) : D / (C * nYears);
    ratePercent = fromAnnualRate(rateAnnual, rateType, yearDays);
  }

  if (target === 'n') {
    if (!isPositive(M) && isPositive(C)) M = C + D;
    if (!isPositive(C) && isPositive(M)) C = M - D;

    nYears =
      criterion === 'comercial' ? D / (M * rateAnnual) : D / (C * rateAnnual);
    nValue = yearsToTime(nYears, timeUnit, yearDays);
  }

  if (target === 'D') {
    D =
      criterion === 'comercial'
        ? M * rateAnnual * nYears
        : M - M / (1 + rateAnnual * nYears);
    C = M - D;
  }

  if (target === 'C') {
    if (capitalFromDiscount) {
      C = M - D;
    } else if (criterion === 'comercial') {
      C = M * (1 - rateAnnual * nYears);
    } else {
      C = M / (1 + rateAnnual * nYears);
    }
    D = M - C;
  }

  if (target === 'M') {
    if (nominalFromParts) {
      M = C + D;
    } else if (isPositive(C)) {
      M =
        criterion === 'comercial'
          ? C / (1 - rateAnnual * nYears)
          : C * (1 + rateAnnual * nYears);
    } else if (criterion === 'comercial') {
      M = D / (rateAnnual * nYears);
    } else {
      M = (D * (1 + rateAnnual * nYears)) / (rateAnnual * nYears);
    }
    if (isPositive(C)) D = M - C;
  }

  if (!isPositive(C) && isPositive(M) && isPositive(D)) C = M - D;
  if (!isPositive(M) && isPositive(C) && isPositive(D)) M = C + D;
  if (!isPositive(D) && isPositive(M) && isPositive(C)) D = M - C;

  const nDays = nYears * yearDays;
  const nCalendarDays = nYears * 365;

  if (
    criterion === 'comercial' &&
    Number.isFinite(rateAnnual) &&
    Number.isFinite(nYears) &&
    rateAnnual * nYears >= 1
  ) {
    return {
      ok: false,
      errors: {
        rate: 'La tasa por el plazo no puede ser igual o mayor que 100%.',
      },
      target,
      criterion,
      timeUnit,
      rateType,
      yearDays,
    };
  }

  const rateIndependent =
    (target === 'C' && capitalFromDiscount) ||
    (target === 'M' && nominalFromParts);

  const numericChecks = [D, C, M];
  if (!rateIndependent) numericChecks.push(rateAnnual, nYears, nDays);

  if (numericChecks.some((value) => !Number.isFinite(value) || value <= 0)) {
    return {
      ok: false,
      errors: { general: 'No se pudo resolver el ejercicio con esos datos.' },
      target,
      criterion,
      timeUnit,
      rateType,
      yearDays,
    };
  }

  const targetLabel = targetLabelFor(target, criterion);
  const resultValue =
    target === 'D'
      ? D
      : target === 'C'
        ? C
        : target === 'M'
          ? M
          : target === 'rate'
            ? ratePercent
            : nValue;
  const resultFormatted =
    target === 'rate'
      ? formatPercent(ratePercent, 2)
      : target === 'n'
        ? formatTime(nValue, timeUnit)
        : formatMoney(resultValue);

  const formula = buildFormula({
    target,
    criterion,
    D,
    C,
    M,
    rateAnnual,
    nYears,
    capitalFromDiscount,
    nominalFromParts,
    nominalFromDiscount,
  });

  const criterionInfo = CRITERIA[criterion];
  const rateTypeLabel = RATE_TYPES[rateType].label;
  const steps = [];

  steps.push(
    `Criterio: ${criterionInfo.longLabel} (${criterionInfo.basis}).`
  );

  if (target === 'rate') {
    steps.push(
      `Conversión de la tasa: ${formatNumber(rateAnnual, 8)} anual = ${formatPercent(ratePercent, 2)} ${rateTypeLabel}.`
    );
  } else if (!rateIndependent) {
    steps.push(
      `Tasa: ${formatPercent(ratePercent, 4)} ${rateTypeLabel} = ${formatNumber(rateAnnual, 8)} anual.`
    );
  }

  if (target === 'n') {
    steps.push(
      `Conversión del tiempo: ${formatTime(nYears, 'anios')} = ${formatTime(nValue, timeUnit)} = ${formatNumber(nDays, 4)} días (base ${yearDays}).`
    );
  } else if (!rateIndependent) {
    steps.push(
      `Tiempo: ${formatTime(nValue, timeUnit)} = ${formatTime(nYears, 'anios')} = ${formatNumber(nDays, 4)} días (base ${yearDays}).`
    );
  }

  steps.push(`Fórmula: ${formula.expression}.`);
  steps.push(`Sustitución: ${formula.substitution}.`);
  steps.push(`Resultado: ${targetLabel} = ${resultFormatted}.`);
  steps.push(
    `Valor efectivo: C = M − D = ${formatMoney(M)} − ${formatMoney(D)} = ${formatMoney(C)}.`
  );
  steps.push(
    `Valor nominal: M = C + D = ${formatMoney(C)} + ${formatMoney(D)} = ${formatMoney(M)}.`
  );

  if (rateIndependent) {
    steps.push(
      `Comprobación: C + D = ${formatMoney(C)} + ${formatMoney(D)} = ${formatMoney(M)}.`
    );
  } else if (criterion === 'comercial') {
    steps.push(
      `Comprobación: C ÷ (1 − d · n) = ${formatMoney(C)} ÷ ${formatNumber(1 - rateAnnual * nYears, 8)} = ${formatMoney(M)}.`
    );
  } else {
    steps.push(
      `Comprobación: C · (1 + i · n) = ${formatMoney(C)} · ${formatNumber(1 + rateAnnual * nYears, 8)} = ${formatMoney(M)}.`
    );
  }

  return {
    ok: true,
    target,
    targetLabel,
    criterion,
    criterionInfo,
    timeUnit,
    rateType,
    yearDays,
    values: { D, C, M, rate: ratePercent, n: nValue },
    inputValues: raw,
    conversions: {
      rateAnnual,
      rateFactor: rateFactor(rateType),
      nYears,
      nDays,
      nCalendarDays,
    },
    result: {
      value: resultValue,
      formatted: resultFormatted,
      unit:
        target === 'rate'
          ? '%'
          : target === 'n'
            ? TIME_UNITS[timeUnit].label
            : 'money',
      label: targetLabel,
    },
    summary: { discount: D, effective: C, nominal: M },
    formula,
    steps,
  };
}

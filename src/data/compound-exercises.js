export const compoundInterestExercises = [
  {
    id: 'ejercicio-1',
    title: 'Ejercicio 1',
    mode: 'normal',
    statement:
      'Encontrar el valor presente, al 6% de interés simple, de $1.500 con vencimiento en 9 meses.',
    note: 'El enunciado original indica interés simple. En este módulo se resuelve con descuento compuesto al 6% efectivo anual: C = M / (1 + i)ⁿ.',
    yearDays: 360,
    target: 'C',
    data: {
      M: 1500,
      C: null,
      I: null,
      i: 6,
      n: 9,
      timeUnit: 'meses',
      rateBasis: 'efectiva_anual',
      frequency: 'anual',
    },
  },
];

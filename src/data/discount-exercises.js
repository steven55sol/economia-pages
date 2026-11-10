export const discountExercises = [
  {
    id: 'ejercicio-1',
    title: 'Ejercicio 1',
    statement:
      'Un chulquero ofrece en préstamo $30.000 por un período de 8 meses y cobra una tasa de interés del 35% por anticipado. a) ¿Cuál es el descuento realizado? b) ¿Cuál es el capital líquido que recibe el prestatario?',
    note: 'Descuento comercial: el 35% es anual y se aplica sobre el valor nominal durante 8 meses (8/12 de año). D = 30.000 × 0,35 × 8/12 = $7.000; el prestatario recibe $23.000.',
    target: 'D',
    criterion: 'comercial',
    yearDays: 360,
    currency: 'USD',
    data: {
      D: null,
      M: 30000,
      C: null,
      rate: 35,
      n: 8,
      timeUnit: 'meses',
      rateType: 'anual',
    },
  },
  {
    id: 'ejercicio-2',
    title: 'Ejercicio 2',
    statement:
      'Se pagarán $1.100 dentro de un año. La tasa de interés simple es del 10% anual. ¿Cuál es el valor actual?',
    note: 'Descuento racional: se actualiza el monto con interés simple. C = 1.100 ÷ (1 + 0,10 × 1) = $1.000; el descuento es $100.',
    target: 'C',
    criterion: 'racional',
    yearDays: 360,
    currency: 'USD',
    data: {
      D: null,
      M: 1100,
      C: null,
      rate: 10,
      n: 1,
      timeUnit: 'anios',
      rateType: 'anual',
    },
  },
];

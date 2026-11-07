export const topicContent = {
  'interes-simple': {
    lead: 'Cada período suma la misma cantidad sobre el capital inicial. Por eso, el monto crece en línea recta.',
    whatIs: [
      'El interés simple es la ganancia que produce un capital durante un tiempo determinado. Se calcula siempre sobre el capital original: los intereses no se suman al capital para generar nuevos intereses.',
      'Por eso, si el capital y la tasa se mantienen, cada período genera exactamente el mismo interés. El monto total crece de forma constante, sin acelerarse.',
    ],
    example: '$1.000 al 10% anual generan $100 de interés cada año.',
    formula: {
      expression: 'I = C · i · n',
      note: 'El interés se calcula una sola vez sobre el capital inicial, sin reinvertir los intereses de períodos anteriores.',
    },
    symbols: [
      {
        symbol: 'I',
        name: 'Interés',
        description: 'La ganancia que produce el capital durante el tiempo indicado.',
      },
      {
        symbol: 'C',
        name: 'Capital inicial',
        description: 'El dinero que se invierte o se presta al comienzo de la operación.',
      },
      {
        symbol: 'i',
        name: 'Tasa de interés',
        description: 'El porcentaje que se aplica en cada período, expresado en decimal. Por ejemplo, 10% = 0,10.',
      },
      {
        symbol: 'n',
        name: 'Tiempo',
        description: 'La cantidad de períodos de la operación. La tasa y el tiempo deben expresarse en la misma unidad.',
      },
    ],
  },
};

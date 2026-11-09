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
    formulas: [
      {
        title: 'Interés',
        expression: 'I = C · i · n',
        note: 'Multiplicá el capital inicial por la tasa del período y por la cantidad de períodos.',
      },
      {
        title: 'Monto final',
        expression: 'M = C + I = C · (1 + i · n)',
        note: 'El monto es el capital inicial más los intereses generados durante toda la operación.',
      },
      {
        title: 'Capital inicial',
        expression: 'C = I ÷ (i · n)',
        note: 'Se despeja el capital cuando se conocen el interés, la tasa y el tiempo.',
      },
      {
        title: 'Tasa de interés',
        expression: 'i = I ÷ (C · n)',
        note: 'La tasa queda expresada por período. Si el tiempo está en meses, la tasa también será mensual.',
      },
      {
        title: 'Tiempo',
        expression: 'n = I ÷ (C · i)',
        note: 'El tiempo se obtiene en la misma unidad en la que está expresada la tasa de interés.',
      },
    ],
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
        symbol: 'M',
        name: 'Monto final',
        description: 'El capital inicial más todos los intereses generados al final de la operación. También se escribe M = C + I.',
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
    figureLabel: 'El monto crece en línea recta a medida que pasa el tiempo',
    illustration: 'linear',
  },
  'interes-compuesto': {
    lead: 'Los intereses se suman al capital y generan nuevos intereses. Por eso, el monto crece cada vez más rápido.',
    whatIs: [
      'El interés compuesto es la ganancia que produce un capital cuando los intereses de cada período se suman al capital. Así, el nuevo monto también genera intereses en los períodos siguientes.',
      'Este proceso se llama capitalización. A diferencia del interés simple, el monto no crece en línea recta: se acelera con el tiempo, porque cada período se calcula sobre un capital mayor.',
    ],
    example: '$1.000 al 10% anual se convierten en $1.100 al año, $1.210 a los dos años y $1.331 a los tres.',
    formula: {
      expression: 'M = C · (1 + i)ⁿ',
      note: 'Cada período los intereses se incorporan al capital, por eso la tasa se aplica sobre un monto cada vez mayor.',
    },
    formulas: [
      {
        title: 'Monto final',
        expression: 'M = C · (1 + i)ⁿ',
        note: 'El capital se multiplica por el factor de capitalización (1 + i) en cada uno de los n períodos.',
      },
      {
        title: 'Monto con tasa nominal',
        expression: 'M = C · (1 + j/m)^(m · t)',
        note: 'Si la tasa es nominal anual (j) y capitaliza m veces por año, se usa la tasa del período j/m durante m · t períodos.',
      },
      {
        title: 'Capital inicial',
        expression: 'C = M ÷ (1 + i)ⁿ = M · (1 + i)⁻ⁿ',
        note: 'Es el valor presente: se descuenta el monto final n períodos hacia atrás.',
      },
      {
        title: 'Interés compuesto',
        expression: 'I = M − C = C · [(1 + i)ⁿ − 1]',
        note: 'Es la diferencia entre el monto final y el capital inicial. También se obtiene multiplicando el capital por el factor de capitalización menos uno.',
      },
      {
        title: 'Tasa de interés por período',
        expression: 'i = (M ÷ C)^(1/n) − 1',
        note: 'Se despeja la tasa del período a partir de la relación entre el monto final y el capital inicial.',
      },
      {
        title: 'Número de períodos',
        expression: 'n = log(M ÷ C) ÷ log(1 + i)',
        note: 'Se despeja la cantidad de períodos usando logaritmos. El resultado queda en la misma unidad que la tasa.',
      },
      {
        title: 'Tasa nominal anual',
        expression: 'j = i · m',
        note: 'La tasa nominal anual es la tasa del período multiplicada por la cantidad de capitalizaciones del año. No incluye el efecto de la capitalización.',
      },
      {
        title: 'Tasa efectiva anual',
        expression: 'TEA = (1 + i)^m − 1 = (1 + j/m)^m − 1',
        note: 'Es la tasa que refleja el efecto real de capitalizar m veces por año.',
      },
      {
        title: 'Tasa del período desde la TEA',
        expression: 'i = (1 + TEA)^(1/m) − 1',
        note: 'Convierte una tasa efectiva anual en la tasa equivalente de cada período de capitalización.',
      },
    ],
    symbols: [
      {
        symbol: 'M',
        name: 'Monto final',
        description: 'El capital inicial más todos los intereses acumulados al final de la operación. También se escribe M = C + I.',
      },
      {
        symbol: 'C',
        name: 'Capital inicial',
        description: 'El dinero que se invierte o se presta al comienzo de la operación.',
      },
      {
        symbol: 'I',
        name: 'Interés compuesto',
        description: 'La ganancia acumulada durante toda la operación. Es la diferencia entre el monto final y el capital inicial: I = M − C.',
      },
      {
        symbol: 'i',
        name: 'Tasa de interés por período',
        description: 'El porcentaje que se aplica en cada período de capitalización, expresado en decimal. Por ejemplo, 10% = 0,10.',
      },
      {
        symbol: 'n',
        name: 'Períodos',
        description: 'La cantidad de períodos de capitalización. Se relaciona con el tiempo en años mediante n = m · t.',
      },
      {
        symbol: 'j',
        name: 'Tasa nominal anual',
        description: 'La tasa anual expresada sin considerar la capitalización. Se divide entre m para obtener la tasa de cada período: j/m.',
      },
      {
        symbol: 'm',
        name: 'Capitalizaciones por año',
        description: 'La cantidad de veces que los intereses se incorporan al capital en un año: 1 anual, 2 semestral, 4 trimestral, 6 bimestral, 12 mensual, 52 semanal o 360/365 diaria.',
      },
      {
        symbol: 'TEA',
        name: 'Tasa efectiva anual',
        description: 'La tasa anual real, que incluye el efecto de capitalizar los intereses m veces por año.',
      },
      {
        symbol: 't',
        name: 'Tiempo en años',
        description: 'La duración de la operación expresada en años. Se usa junto con la tasa nominal: n = m · t.',
      },
    ],
    figureLabel: 'El monto crece de forma acelerada porque los intereses se capitalizan',
    illustration: 'compound',
  },
};

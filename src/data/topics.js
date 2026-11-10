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
        title: 'Capital',
        expression: 'C = I ÷ (i · n)',
        note: 'Se despeja del interés. Si se conoce el monto final, se usa C = M ÷ (1 + i · n).',
      },
      {
        title: 'Monto',
        expression: 'M = C · (1 + i · n)',
        note: 'El monto es el capital inicial más los intereses generados durante toda la operación.',
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
        title: 'Monto o valor futuro',
        expression: 'M = C · (1 + i)ⁿ',
        note: 'El capital se multiplica por el factor de capitalización (1 + i) en cada uno de los n períodos.',
      },
      {
        title: 'Capital inicial',
        expression: 'C = M ÷ (1 + i)ⁿ',
        note: 'Es el valor presente: se descuenta el monto final n períodos hacia atrás.',
      },
      {
        title: 'Tasa de interés',
        expression: 'i = (M ÷ C)^(1/n) − 1',
        note: 'Se obtiene a partir de la relación entre el monto final y el capital inicial, para n períodos.',
      },
      {
        title: 'Tiempo',
        expression: 'n = log(M ÷ C) ÷ log(1 + i)',
        note: 'Se despeja con logaritmos. El resultado queda en la misma unidad que la tasa.',
      },
      {
        title: 'Interés generado',
        expression: 'I = M − C = C · [(1 + i)ⁿ − 1]',
        note: 'Es la diferencia entre el monto final y el capital inicial, es decir, la ganancia acumulada.',
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
  'descuento-simple': {
    lead: 'Adelantás el cobro de un documento y recibís menos que su valor nominal. Esa diferencia es el descuento.',
    whatIs: [
      'El descuento simple es la operación con la que se cobra antes del vencimiento un documento que representa una deuda futura, como un pagaré, una letra de cambio o una factura. Quien adelanta el dinero retiene una parte del importe: el descuento. Por eso, el valor que se recibe es menor que el valor nominal del documento.',
      'El valor nominal (M o VN) es lo que el documento vale al vencimiento; el valor efectivo o valor actual (C) es el dinero que se cobra anticipadamente; y el descuento (D) es la diferencia entre ambos, D = M − C. Hay dos criterios: el descuento comercial, que se calcula sobre el valor nominal, y el descuento racional, que se calcula sobre el valor efectivo.',
    ],
    example:
      'Un pagaré de $10.000 con vencimiento en 6 meses se descuenta al 12% anual. Con descuento comercial: D = 10.000 × 0,12 × 0,5 = $600 y el valor efectivo es $9.400. Con descuento racional: D = $566,04 y el valor actual es $9.433,96.',
    formulas: [
      {
        title: 'Descuento',
        expression: 'D = M · d · n',
        note: 'Criterio comercial: se calcula sobre el valor nominal. También se define como D = M − C.',
      },
      {
        title: 'Valor nominal',
        expression: 'M = C ÷ (1 − d · n)',
        note: 'Criterio comercial. En el criterio racional se usa M = C · (1 + i · n).',
      },
      {
        title: 'Valor presente',
        expression: 'C = M · (1 − d · n)',
        note: 'Criterio comercial. En el criterio racional se usa C = M ÷ (1 + i · n).',
      },
      {
        title: 'Tasa de descuento',
        expression: 'd = D ÷ (M · n)',
        note: 'Queda expresada en la misma unidad de tiempo que n. Si n está en meses, d es mensual.',
      },
      {
        title: 'Tiempo',
        expression: 'n = D ÷ (M · d)',
        note: 'Es el tiempo que falta hasta el vencimiento. En el criterio racional se usa n = D ÷ (C · i).',
      },
    ],
    symbols: [
      {
        symbol: 'D',
        name: 'Descuento',
        description: 'La diferencia entre el valor nominal y el valor efectivo: D = M − C. Es la retribución de quien adelanta el dinero.',
      },
      {
        symbol: 'M',
        name: 'Valor nominal',
        description: 'El importe que el documento vale al vencimiento. También se escribe VN. Es la base del descuento comercial.',
      },
      {
        symbol: 'C',
        name: 'Valor efectivo o actual',
        description: 'El dinero que se recibe al descontar el documento antes de su vencimiento. También se llama valor líquido o valor presente.',
      },
      {
        symbol: 'd',
        name: 'Tasa de descuento',
        description: 'El porcentaje que se aplica al valor nominal en cada período para calcular el descuento comercial. Por ejemplo, 12% = 0,12.',
      },
      {
        symbol: 'i',
        name: 'Tasa de interés',
        description: 'La tasa que se aplica sobre el valor efectivo en el descuento racional. Representa la rentabilidad de quien adelanta el dinero.',
      },
      {
        symbol: 'n',
        name: 'Tiempo',
        description: 'El tiempo que falta hasta el vencimiento, expresado en la misma unidad que la tasa. Para días se usa base 360 o 365.',
      },
    ],
    figureLabel: 'El valor efectivo es menor que el valor nominal; la diferencia es el descuento',
    illustration: 'discount',
  },
};

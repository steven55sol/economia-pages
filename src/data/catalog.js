export const units = [
  {
    id: '1',
    label: 'Unidad 1',
    slug: 'unidad-1',
    cards: [
      {
        slug: 'interes-simple',
        title: 'Interés simple',
        description: 'El interés se calcula siempre sobre el capital inicial.',
        icon: 'percent',
        accent: 'ochre',
      },
      {
        slug: 'interes-compuesto',
        title: 'Interés compuesto',
        description: 'El interés se suma al capital y genera nuevos intereses.',
        icon: 'trend',
        accent: 'emerald',
      },
      {
        slug: 'descuento-simple',
        title: 'Descuento simple',
        description: 'Se calcula sobre el valor nominal para obtener el valor actual.',
        icon: 'tag',
        accent: 'sky',
      },
    ],
  },
  { id: '2', label: 'Unidad 2', slug: 'unidad-2', cards: [] },
  { id: '3', label: 'Unidad 3', slug: 'unidad-3', cards: [] },
];

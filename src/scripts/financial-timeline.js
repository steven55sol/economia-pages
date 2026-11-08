// Renderizador compartido de líneas de tiempo financieras.
// Se usa tanto en interés simple como en interés compuesto con fecha focal.

const COLORS = {
  a: '#0369a1',
  b: '#b7791f',
  ink: '#10231c',
  muted: '#64748b',
  line: '#cbd5e1',
  grid: 'rgba(16, 35, 28, 0.08)',
};

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatShortDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    timeZone: 'UTC',
  }).format(date);
}

function uniqueDates(model) {
  const dates = [];
  const seen = new Set();

  model.movements.forEach((movement) => {
    if (!(movement.date instanceof Date)) return;
    const key = movement.date.toISOString().slice(0, 10);
    if (seen.has(key)) return;
    seen.add(key);
    dates.push({ date: movement.date, isFocal: false });
  });

  const focalKey = model.focal.toISOString().slice(0, 10);
  const focalEntry = dates.find(
    (entry) => entry.date.toISOString().slice(0, 10) === focalKey
  );

  if (focalEntry) {
    focalEntry.isFocal = true;
  } else {
    dates.push({ date: model.focal, isFocal: true });
  }

  return dates.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function renderFinancialTimeline(container, model) {
  if (!container) return;

  if (!model?.ok || !(model.focal instanceof Date)) {
    container.innerHTML = `
      <div class="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center text-sm text-slate-500">
        Ingresá una fecha focal y al menos un movimiento para ver la línea de tiempo.
      </div>
    `;
    return;
  }

  const movements = model.movements.filter(
    (movement) => movement.date instanceof Date
  );

  if (movements.length === 0) {
    container.innerHTML = `
      <div class="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center text-sm text-slate-500">
        Agregá movimientos con fecha para ver la línea de tiempo.
      </div>
    `;
    return;
  }

  const sideA = movements.filter((movement) => movement.side === 'A');
  const sideB = movements.filter((movement) => movement.side === 'B');
  const lanesA = Math.max(sideA.length, 1);
  const lanesB = Math.max(sideB.length, 1);
  const laneHeight = 58;
  const axisY = 92 + lanesA * laneHeight;
  const height = axisY + 66 + lanesB * laneHeight + 32;
  const width = 1000;
  const xStart = 76;
  const xEnd = 924;

  const totalDays =
    Number.isFinite(model.totalDays) && model.totalDays > 0
      ? model.totalDays
      : 1;

  const xForDate = (date) => {
    if (!(date instanceof Date)) return width / 2;
    const daysFromStart =
      (date.getTime() - model.start.getTime()) / 86_400_000;
    return xStart + (daysFromStart / totalDays) * (xEnd - xStart);
  };

  const focalX = xForDate(model.focal);
  const focalLabel = escapeXml(
    model.focalLabel ?? formatShortDate(model.focal)
  );

  const laneIndexA = new Map();
  sideA.forEach((movement, index) => laneIndexA.set(movement, index));
  const laneIndexB = new Map();
  sideB.forEach((movement, index) => laneIndexB.set(movement, index));

  const markers = [];
  const arrows = [];
  const stems = [];
  const labels = [];
  const arrowLabels = [];

  movements.forEach((movement) => {
    const x = xForDate(movement.date);
    const isA = movement.side === 'A';
    const lane = isA ? laneIndexA.get(movement) : laneIndexB.get(movement);
    const markerY = isA
      ? axisY - 38 - lane * laneHeight
      : axisY + 38 + lane * laneHeight;
    const color = isA ? COLORS.a : COLORS.b;
    const dateLabel = escapeXml(
      movement.dateLabel ?? formatShortDate(movement.date)
    );
    const typeLabel = escapeXml(movement.typeLabel ?? (isA ? 'Obligación' : 'Pago'));
    const amountLabel = escapeXml(movement.amountLabel ?? '—');
    const valueLabel = movement.valueLabel
      ? escapeXml(movement.valueLabel)
      : null;

    stems.push(
      `<line x1="${x.toFixed(1)}" y1="${axisY}" x2="${x.toFixed(1)}" y2="${markerY.toFixed(
        1
      )}" stroke="${color}" stroke-opacity="0.35" stroke-width="1.2" />`
    );

    markers.push(
      `<circle cx="${x.toFixed(1)}" cy="${markerY.toFixed(
        1
      )}" r="5.5" fill="${color}" stroke="#ffffff" stroke-width="1.5" />`
    );

    const line1Y = isA ? markerY - 13 : markerY + 23;
    const line2Y = isA ? markerY - 28 : markerY + 38;
    const line3Y = isA ? markerY - 43 : markerY + 53;

    labels.push(
      `<text x="${x.toFixed(1)}" y="${line1Y.toFixed(
        1
      )}" text-anchor="middle" font-size="12" font-weight="700" fill="${
        movement.unknown ? COLORS.b : COLORS.ink
      }">${amountLabel}</text>`
    );
    labels.push(
      `<text x="${x.toFixed(1)}" y="${line2Y.toFixed(
        1
      )}" text-anchor="middle" font-size="10" fill="${COLORS.muted}">${typeLabel} · ${dateLabel}</text>`
    );
    if (valueLabel) {
      labels.push(
        `<text x="${x.toFixed(1)}" y="${line3Y.toFixed(
          1
        )}" text-anchor="middle" font-size="10" font-weight="600" fill="${color}">${valueLabel}</text>`
      );
    }

    const direction = movement.direction;
    if (direction === 'futuro' || direction === 'pasado') {
      const forward = direction === 'futuro';
      const x1 = forward ? x + 12 : x - 12;
      const x2 = forward ? focalX - 12 : focalX + 12;
      const length = forward ? x2 - x1 : x1 - x2;

      if (length > 6) {
        const dash = forward ? '' : ' stroke-dasharray="5 4"';
        arrows.push(
          `<line x1="${x1.toFixed(1)}" y1="${markerY.toFixed(
            1
          )}" x2="${x2.toFixed(1)}" y2="${markerY.toFixed(
            1
          )}" stroke="${color}" stroke-width="1.6"${dash} marker-end="url(#arrow-${
            isA ? 'a' : 'b'
          })" />`
        );

        const midX = (x1 + x2) / 2;
        const labelY = isA ? markerY + 14 : markerY - 8;
        arrowLabels.push(
          `<text x="${midX.toFixed(1)}" y="${labelY.toFixed(
            1
          )}" text-anchor="middle" font-size="9.5" fill="${COLORS.muted}">${escapeXml(
            movement.distanceLabel ?? ''
          )}</text>`
        );
      }
    }
  });

  const dates = uniqueDates(model);
  const rotate = dates.length > 6;
  const dateLabels = dates
    .map((entry) => {
      const x = xForDate(entry.date);
      const label = escapeXml(formatShortDate(entry.date));
      const fill = entry.isFocal ? COLORS.ink : COLORS.muted;
      const weight = entry.isFocal ? '700' : '400';
      const y = height - (rotate ? 12 : 14);

      if (rotate) {
        return `<text x="${x.toFixed(1)}" y="${y}" text-anchor="end" font-size="10" font-weight="${weight}" fill="${fill}" transform="rotate(-35 ${x.toFixed(
          1
        )} ${y})">${label}</text>`;
      }

      return `<text x="${x.toFixed(1)}" y="${y}" text-anchor="middle" font-size="10" font-weight="${weight}" fill="${fill}">${label}</text>`;
    })
    .join('');

  const legend = `
    <g font-size="10.5" fill="${COLORS.muted}">
      <circle cx="86" cy="24" r="4.5" fill="${COLORS.a}" />
      <text x="96" y="27.5">Obligaciones e inversiones</text>
      <circle cx="248" cy="24" r="4.5" fill="${COLORS.b}" />
      <text x="258" y="27.5">Pagos y recepciones</text>
      <line x1="410" y1="24" x2="432" y2="24" stroke="${COLORS.ink}" stroke-width="1.6" stroke-dasharray="4 4" />
      <text x="440" y="27.5">Fecha focal</text>
    </g>
  `;

  const svg = `
    <svg viewBox="0 0 ${width} ${height}" class="block h-auto w-full min-w-[680px]" role="img" aria-label="Línea de tiempo financiera con fecha focal ${focalLabel}">
      <defs>
        <marker id="arrow-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="${COLORS.a}" />
        </marker>
        <marker id="arrow-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="${COLORS.b}" />
        </marker>
      </defs>

      ${legend}

      <line x1="${focalX.toFixed(1)}" y1="52" x2="${focalX.toFixed(
        1
      )}" y2="${height - 38}" stroke="${COLORS.ink}" stroke-opacity="0.45" stroke-width="1.4" stroke-dasharray="5 5" />
      <text x="${focalX.toFixed(1)}" y="46" text-anchor="middle" font-size="11" font-weight="700" fill="${COLORS.ink}">Fecha focal</text>
      <text x="${focalX.toFixed(1)}" y="62" text-anchor="middle" font-size="10" fill="${COLORS.muted}">${focalLabel}</text>

      <line x1="${xStart}" y1="${axisY}" x2="${xEnd}" y2="${axisY}" stroke="${COLORS.line}" stroke-width="1.6" />
      <path d="M ${xEnd} ${axisY} l -10 -4.5 v 9 z" fill="${COLORS.line}" />
      <text x="${xEnd + 4}" y="${axisY - 10}" text-anchor="end" font-size="10" fill="${COLORS.muted}">Tiempo</text>

      ${stems.join('')}
      ${arrows.join('')}
      ${markers.join('')}
      ${labels.join('')}
      ${arrowLabels.join('')}
      ${dateLabels}
    </svg>
  `;

  container.innerHTML = `<div class="overflow-x-auto">${svg}</div>`;
}

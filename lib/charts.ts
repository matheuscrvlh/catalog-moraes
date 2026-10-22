export function niceTicks(max: number, count = 4) {
  if (max <= 0) return [0, 1];
  const raw = max / count;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((factor) => factor * magnitude).find((candidate) => candidate >= raw) ?? raw;
  const ticks: number[] = [];
  for (let value = 0; value <= max + step * 0.001 || ticks.length <= 1; value += step) ticks.push(value);
  if (ticks[ticks.length - 1] < max) ticks.push(ticks[ticks.length - 1] + step);
  return ticks;
}

export function delta(current: number, previous: number) {
  if (!previous) return current ? 1 : 0;
  return (current - previous) / previous;
}

export function sparkPath(values: number[], width: number, height: number) {
  if (values.length < 2) return "";
  const max = Math.max(...values, 1);
  const step = width / (values.length - 1);
  return values
    .map(
      (value, index) =>
        `${index ? "L" : "M"}${(index * step).toFixed(1)},${(height - (value / max) * height).toFixed(1)}`,
    )
    .join(" ");
}

export const WINE_RAMP = ["#f7e6ea", "#efc3cd", "#e094a6", "#c95c78", "#a62d4c", "#6d1631"];

// Read-only stars, e.g. 3.6 shows as ★★★★☆ (rounded)
export default function Stars({ value }) {
  const filled = Math.round(value);
  return (
    <span className="stars" aria-label={`${value.toFixed(1)} out of 5`}>
      {"★".repeat(filled)}
      {"☆".repeat(5 - filled)}
    </span>
  );
}

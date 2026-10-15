import type { CategoryId } from '@/types';

/**
 * Illustrated placeholder used when an item has no photo.
 * Keeps mock data fully offline while still reading as "clothing".
 */
const SHAPES: Record<CategoryId, JSX.Element> = {
  tops: <path d="M30 22 42 17q8 9 16 0l12 5 14 15-10 10-6-6v41H32V41l-6 6-10-10z" />,
  outerwear: (
    <>
      <path d="M33 25q17-20 34 0l13 6 9 44-11 2-8-30v38H30V47l-8 30-11-2 9-44z" />
      <path d="M42 25q8 12 16 0M50 33v51M38 66h24" fill="none" />
    </>
  ),
  bottoms: (
    <>
      <path d="M31 13h38l5 74H57l-7-46-7 46H26z" />
      <path d="M31 21h38" fill="none" />
    </>
  ),
  shoes: (
    <>
      <path d="M12 62q0-15 13-17l18-2q8 11 21 13l19 4q8 2 7 10v4H12z" />
      <path d="M12 70h78M30 47l4 8M38 46l4 8" fill="none" />
    </>
  ),
  headwear: (
    <>
      <path d="M22 62q0-32 28-32t28 32z" />
      <path d="M62 60q24-3 30 6-14 5-30 1z" />
      <circle cx="50" cy="29" r="3" />
    </>
  ),
  accessories: (
    <>
      <circle cx="33" cy="52" r="14" fillOpacity={0.55} />
      <circle cx="67" cy="52" r="14" fillOpacity={0.55} />
      <path d="M47 50q3-4 6 0M19 48 8 40M81 48l11-8" fill="none" />
    </>
  ),
};

interface GarmentArtProps {
  category: CategoryId;
  color: string;
}

export function GarmentArt({ category, color }: GarmentArtProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label={`${category} illustration`}
      style={{ width: '100%', height: '100%', background: `color-mix(in srgb, ${color} 16%, #fff)` }}
    >
      <g
        transform="translate(15 15) scale(0.7)"
        fill={color}
        stroke="rgba(28,26,23,0.55)"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {SHAPES[category]}
      </g>
    </svg>
  );
}

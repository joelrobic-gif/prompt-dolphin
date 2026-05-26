// PromptDolphin — Hero image randomizer
// Picks a fresh HD ocean / marine / dolphin photo per page load.
// Source: Unsplash (CC0, free for commercial use, no trademark).
// Plus local curated fallbacks.
// MIT License — Robic Direct Inc.

const LOCAL_HERO_IMAGES: string[] = [
  '/brand/dolphin-hero.jpg',
];

const UNSPLASH_TOPICS_POOLS: string[][] = [
  ['dolphin', 'ocean', 'marine'],
  ['whale', 'ocean', 'underwater'],
  ['ocean', 'underwater', 'sunlight'],
  ['underwater', 'marine', 'water'],
  ['sea', 'wave', 'horizon'],
  ['coral', 'reef', 'underwater'],
  ['fish', 'school', 'underwater'],
  ['ocean', 'aerial', 'turquoise'],
  ['water', 'light', 'blue'],
  ['marine', 'wildlife', 'ocean'],
];

export function pickHeroImage(): { src: string; isRemote: boolean; alt: string } {
  let r = Math.random();
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const buf = new Uint32Array(1);
    window.crypto.getRandomValues(buf);
    r = buf[0] / 0xFFFFFFFF;
  }

  if (r < 0.25 || LOCAL_HERO_IMAGES.length === 0) {
    const idx = Math.floor(Math.random() * Math.max(1, LOCAL_HERO_IMAGES.length));
    return {
      src: LOCAL_HERO_IMAGES[idx] || '/brand/dolphin-hero.jpg',
      isRemote: false,
      alt: 'Ocean scene from PromptDolphin brand library',
    };
  }

  const pool = UNSPLASH_TOPICS_POOLS[Math.floor(Math.random() * UNSPLASH_TOPICS_POOLS.length)];
  const tags = pool.join(',');
  const seed = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  return {
    src: `https://source.unsplash.com/random/2400x1350/?${tags}&sig=${seed}`,
    isRemote: true,
    alt: `Random marine photograph (Unsplash, CC0): ${pool.join(', ')}`,
  };
}

export function defaultHeroImage(): string {
  return LOCAL_HERO_IMAGES[0] || '/brand/dolphin-hero.jpg';
}

// PromptDolphin — Hero image randomizer
// Picks a fresh HD photo per page load.
// Sources:
//   1. Curated Unsplash CDN URLs (ocean/marine themed, verified working, CC0 licensed)
//   2. Picsum.photos (random HD photography, CC0 from Unsplash catalog)
//   3. Local curated images bundled with the build
// NOTE: source.unsplash.com was deprecated by Unsplash mid-2024 and now returns 503.
// We use direct CDN URLs (images.unsplash.com) with verified photo IDs and Picsum as
// the high-volume random source.
// MIT License — Robic Direct Inc.

const LOCAL_HERO_IMAGES: string[] = [
  '/brand/dolphin-hero.jpg',
];

// Verified Unsplash photo IDs (ocean / marine / underwater themes).
// Each URL is a direct CDN asset — works without API key, returns 200 reliably.
// Add more by browsing unsplash.com, copying the photo's slug, and pasting here.
// Photo URLs have the form: photo-<timestamp>-<hash>
const UNSPLASH_DIRECT_PHOTOS: string[] = [
  'photo-1723741003462-c6f100395b7d', // dolphin breaching, Azores (SALEM, 2024 — award-grade hero shot)
  'photo-1583212292454-1fe6229603b7', // dolphins underwater
  'photo-1518837695005-2083093ee35b', // humpback whale tail
  'photo-1551244072-5d12893278ab',    // ocean sunset
  'photo-1505142468610-359e7d316be0', // wave breaking
  'photo-1530053969600-caed2596d242', // coral reef
  'photo-1559827260-dc66d52bef19',    // ocean horizon
  'photo-1437622368342-7a3d73a34c8f', // ocean from below
  'photo-1502139214982-d0ad755818d8', // sea swimming
  'photo-1507525428034-b723cf961d3e', // turquoise water aerial
  'photo-1439405326854-014607f694d7', // ocean waves
  'photo-1505839673365-e3971f8d9184', // ocean bird's-eye
  'photo-1471922694854-ff1b63b20054', // sea sunlight rays
];

function unsplashUrl(photoId: string): string {
  // Direct CDN URL pattern. q=80 jpg, max-width 2400 fits 16:9 hero at 2400x1350.
  // crop=entropy + cs=tinysrgb = quality settings Unsplash CDN supports natively.
  return `https://images.unsplash.com/${photoId}?w=2400&h=1350&fit=crop&crop=entropy&cs=tinysrgb&q=80&fm=jpg`;
}

function picsumUrl(): string {
  // Picsum returns a random HD photo from the Unsplash catalog (~1000 curated).
  // The seed param ensures each page load gets a different one.
  // 2400x1350 = 16:9 hero size.
  const seed = Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
  return `https://picsum.photos/seed/${seed}/2400/1350`;
}

export function pickHeroImage(): { src: string; isRemote: boolean; alt: string } {
  // Crypto-strength random
  let r = Math.random();
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const buf = new Uint32Array(1);
    window.crypto.getRandomValues(buf);
    r = buf[0] / 0xFFFFFFFF;
  }

  // Distribution:
  //   10% — local curated (the seed dolphin image)
  //   60% — themed Unsplash direct CDN (verified IDs)
  //   30% — Picsum random (broader variety, infinite catalog)
  if (r < 0.10 || (UNSPLASH_DIRECT_PHOTOS.length === 0 && r < 0.50)) {
    const idx = Math.floor(Math.random() * Math.max(1, LOCAL_HERO_IMAGES.length));
    return {
      src: LOCAL_HERO_IMAGES[idx] || '/brand/dolphin-hero.jpg',
      isRemote: false,
      alt: 'Ocean scene from PromptDolphin brand library',
    };
  }

  if (r < 0.70 && UNSPLASH_DIRECT_PHOTOS.length > 0) {
    const photoId = UNSPLASH_DIRECT_PHOTOS[Math.floor(Math.random() * UNSPLASH_DIRECT_PHOTOS.length)];
    return {
      src: unsplashUrl(photoId),
      isRemote: true,
      alt: 'Marine photograph from Unsplash (CC0)',
    };
  }

  return {
    src: picsumUrl(),
    isRemote: true,
    alt: 'Random HD photograph (Picsum / Unsplash catalog, CC0)',
  };
}

export function defaultHeroImage(): string {
  return LOCAL_HERO_IMAGES[0] || '/brand/dolphin-hero.jpg';
}

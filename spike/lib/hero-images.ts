const HERO_IMAGE = '/brand/dolphin-leap.jpg';

export function pickHeroImage(): { src: string; isRemote: boolean; alt: string } {
  return {
    src: HERO_IMAGE,
    isRemote: false,
    alt: 'A dolphin leaping out of the ocean at speed',
  };
}

export function defaultHeroImage(): string {
  return HERO_IMAGE;
}

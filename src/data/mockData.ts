import type { CategoryId, Item, User } from '@/types';

export const CURRENT_USER_ID = 'u-me';

export const MOCK_USERS: User[] = [
  {
    id: CURRENT_USER_ID,
    handle: 'you',
    name: 'Your Name',
    title: 'Building my rack, one piece at a time',
    bio: 'Neutral basics, loud sneakers. Tap “Edit profile” to make this yours.',
    accent: '#FF5A36',
    styles: ['streetwear', 'minimal'],
    followers: 128,
    following: 96,
  },
  {
    id: 'u-maya',
    handle: 'maya.thrifts',
    name: 'Maya Okafor',
    title: 'Vintage hunter · Brooklyn',
    bio: 'Every piece has a past life. 90s denim, faded band tees, and too many cardigans.',
    accent: '#7C5CFF',
    styles: ['vintage', 'y2k', 'thrift'],
    followers: 12400,
    following: 310,
  },
  {
    id: 'u-jun',
    handle: 'jun.fits',
    name: 'Jun Park',
    title: 'Techwear & quiet layers',
    bio: 'Function first. Black, olive, and the occasional pop of orange.',
    accent: '#1FB57A',
    styles: ['techwear', 'gorpcore', 'minimal'],
    followers: 8300,
    following: 140,
  },
  {
    id: 'u-sol',
    handle: 'solstyle',
    name: 'Sol Reyes',
    title: 'Color is a personality',
    bio: 'Mixing prints since 2009. If it clashes, it probably works.',
    accent: '#FFB020',
    styles: ['maximalist', 'colorful', 'prints'],
    followers: 21900,
    following: 512,
  },
  {
    id: 'u-ari',
    handle: 'ari.archive',
    name: 'Ari Novak',
    title: 'Archive pieces & tailoring',
    bio: 'Slow fashion. Wool, linen, leather — bought once, worn forever.',
    accent: '#2E8BFF',
    styles: ['tailored', 'classic', 'minimal'],
    followers: 5100,
    following: 88,
  },
  {
    id: 'u-dee',
    handle: 'deesneaks',
    name: 'Dee Carter',
    title: 'Sneakerhead · 140 pairs deep',
    bio: 'Shoes first, outfit second. Trades open — slide in.',
    accent: '#FF4F9A',
    styles: ['sneakers', 'streetwear', 'hype'],
    followers: 33200,
    following: 701,
  },
];

type Seed = [name: string, brand: string, category: CategoryId, color: string, styles: string[]];

const SEEDS: Record<string, Seed[]> = {
  [CURRENT_USER_ID]: [
    ['Heavyweight Tee', 'Uniqlo U', 'tops', '#F2EEE6', ['minimal']],
    ['Zip Hoodie', 'Champion', 'outerwear', '#9AA3AE', ['streetwear']],
    ['Wide Cargo Pants', 'Carhartt WIP', 'bottoms', '#6B6A4E', ['streetwear']],
    ['Court Sneakers', 'Nike', 'shoes', '#FF5A36', ['streetwear']],
    ['Six-Panel Cap', 'New Era', 'headwear', '#1F2430', ['streetwear']],
  ],
  'u-maya': [
    ['Faded Band Tee', 'Vintage', 'tops', '#3B3B44', ['vintage']],
    ['Mohair Cardigan', 'Thrifted', 'outerwear', '#E8A5C0', ['vintage', 'y2k']],
    ['90s Straight Jeans', "Levi's", 'bottoms', '#6C8DB5', ['vintage']],
    ['Platform Mary Janes', 'Dr. Martens', 'shoes', '#1C1C22', ['y2k']],
    ['Butterfly Clip Set', 'Thrifted', 'accessories', '#B79CFF', ['y2k']],
    ['Baby Tee', 'Thrifted', 'tops', '#BDE3C7', ['y2k']],
    ['Suede Jacket', 'Vintage', 'outerwear', '#A8673A', ['vintage']],
    ['Oval Sunnies', 'Thrifted', 'accessories', '#C9A227', ['vintage']],
  ],
  'u-jun': [
    ['Shell Jacket', "Arc'teryx", 'outerwear', '#2D3A2E', ['techwear', 'gorpcore']],
    ['Merino Base Tee', 'Smartwool', 'tops', '#1D1F22', ['techwear']],
    ['Articulated Cargos', 'Acronym', 'bottoms', '#22252A', ['techwear']],
    ['Trail Runners', 'Salomon', 'shoes', '#7A8B6F', ['gorpcore']],
    ['Bucket Hat', 'Goldwin', 'headwear', '#56634C', ['gorpcore']],
    ['Fleece Half-Zip', 'Patagonia', 'outerwear', '#F08A3C', ['gorpcore']],
    ['Sport Shades', 'Oakley', 'accessories', '#3E4A57', ['techwear']],
  ],
  'u-sol': [
    ['Silk Print Shirt', 'Vintage', 'tops', '#FF7A59', ['prints', 'maximalist']],
    ['Patchwork Jacket', 'Bode', 'outerwear', '#5BC0BE', ['maximalist']],
    ['Flared Trousers', 'Zara', 'bottoms', '#FFC145', ['colorful']],
    ['Color-Block Loafers', 'Gucci', 'shoes', '#4361EE', ['colorful']],
    ['Knit Beanie', 'Handmade', 'headwear', '#F15BB5', ['colorful']],
    ['Cat-Eye Frames', 'Le Specs', 'accessories', '#9B5DE5', ['maximalist']],
    ['Mesh Long Sleeve', 'Collina Strada', 'tops', '#00BBF9', ['prints']],
    ['Velvet Skirt', 'Thrifted', 'bottoms', '#8338EC', ['maximalist']],
    ['Chunky Sneakers', 'Balenciaga', 'shoes', '#FEE440', ['colorful']],
  ],
  'u-ari': [
    ['Oxford Shirt', 'Brooks Brothers', 'tops', '#DCE6F2', ['classic']],
    ['Wool Overcoat', 'Margaret Howell', 'outerwear', '#8C7B6B', ['tailored']],
    ['Pleated Trousers', 'Auralee', 'bottoms', '#C8BBA6', ['tailored']],
    ['Derby Shoes', "Church's", 'shoes', '#4A2E22', ['classic']],
    ['Round Frames', 'Moscot', 'accessories', '#2B2B2B', ['classic']],
    ['Linen Camp Shirt', 'Our Legacy', 'tops', '#EFE8DA', ['minimal']],
  ],
  'u-dee': [
    ['Jordan 1 High', 'Nike', 'shoes', '#D7263D', ['sneakers', 'hype']],
    ['990v6', 'New Balance', 'shoes', '#A0A4AB', ['sneakers']],
    ['Samba OG', 'Adidas', 'shoes', '#F4F1EA', ['sneakers']],
    ['Box Logo Hoodie', 'Supreme', 'outerwear', '#C1121F', ['hype']],
    ['Varsity Jacket', 'Stüssy', 'outerwear', '#14213D', ['streetwear']],
    ['Graphic Tee', 'Palace', 'tops', '#FFFFFF', ['streetwear']],
    ['Baggy Denim', 'Evisu', 'bottoms', '#2F4B7C', ['streetwear']],
    ['Fitted Cap', 'New Era', 'headwear', '#0B6E4F', ['hype']],
    ['Dunk Low Panda', 'Nike', 'shoes', '#222222', ['sneakers', 'hype']],
  ],
};

// Spread mock items across the past few weeks so "fresh" sorting looks natural.
const BASE_TIME = Date.parse('2026-10-14T18:00:00Z');
let counter = 0;

export const MOCK_ITEMS: Item[] = Object.entries(SEEDS).flatMap(([ownerId, seeds]) =>
  seeds.map(([name, brand, category, color, styles]) => {
    counter += 1;
    return {
      id: `i-${counter}`,
      ownerId,
      name,
      brand,
      category,
      color,
      styles,
      createdAt: new Date(BASE_TIME - ((counter * 37) % 60) * 3.6e6 * 7).toISOString(),
    };
  }),
);

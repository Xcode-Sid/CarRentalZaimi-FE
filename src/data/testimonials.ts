export interface Testimonial {
  id: string;
  authorName: string;
  authorAvatar: string;
  rating: number;
  quote: string;
}

export const testimonials: Testimonial[] = [
  {
    id: 't1',
    authorName: 'Artan Hoxha',
    authorAvatar: 'AH',
    rating: 5,
    quote: 'Shërbimi më i mirë i qirasë së makinave në Shqipëri!',
  },
  {
    id: 't2',
    authorName: 'Elona Kushi',
    authorAvatar: 'EK',
    rating: 5,
    quote: 'Procesi i blerjes ishte shumë i thjeshtë dhe transparent.',
  },
  {
    id: 't3',
    authorName: 'Dritan Leka',
    authorAvatar: 'DL',
    rating: 4,
    quote: 'Makina luksoze me çmime konkurruese. Rekomandoj!',
  },
  {
    id: 't4',
    authorName: 'Blerina Topi',
    authorAvatar: 'BT',
    rating: 5,
    quote: 'Përvoja perfekte për pushimet tona verore.',
  },
  {
    id: 't5',
    authorName: 'Gentian Muka',
    authorAvatar: 'GM',
    rating: 4,
    quote: 'Flota e gjerë dhe staf i kujdesshëm. Do ta përdor sërish!',
  },
];

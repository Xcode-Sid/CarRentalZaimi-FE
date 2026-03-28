export interface Review {
  id: string;
  vehicleId: number;
  authorName: string;
  authorAvatar: string;
  rating: number;
  text: string;
  date: string;
  helpfulCount: number;
  notHelpfulCount: number;
}

export const reviews: Review[] = [
  {
    id: 'r1',
    vehicleId: 1,
    authorName: 'Artan Hoxha',
    authorAvatar: 'AH',
    rating: 5,
    text: 'Makinë fantastike, komoditet i jashtëzakonshëm. Ia vlen çdo cent!',
    date: '2026-02-15',
    helpfulCount: 12,
    notHelpfulCount: 1,
  },
  {
    id: 'r2',
    vehicleId: 2,
    authorName: 'Elona Kushi',
    authorAvatar: 'EK',
    rating: 4,
    text: 'Eksperiencë shumë e mirë me qiranë. Makina ishte e pastër dhe e mirëmbajtur.',
    date: '2026-02-20',
    helpfulCount: 8,
    notHelpfulCount: 0,
  },
  {
    id: 'r3',
    vehicleId: 3,
    authorName: 'Dritan Leka',
    authorAvatar: 'DL',
    rating: 5,
    text: 'E ardhmja e makinave! Performancë e shkëlqyer dhe zero emetime.',
    date: '2026-01-10',
    helpfulCount: 15,
    notHelpfulCount: 2,
  },
  {
    id: 'r4',
    vehicleId: 4,
    authorName: 'Blerina Topi',
    authorAvatar: 'BT',
    rating: 4,
    text: 'Çmim i arsyeshëm për cilësinë që ofron. Shumë e rehatshme për udhëtime.',
    date: '2026-03-01',
    helpfulCount: 6,
    notHelpfulCount: 1,
  },
  {
    id: 'r5',
    vehicleId: 2,
    authorName: 'Gentian Muka',
    authorAvatar: 'GM',
    rating: 3,
    text: 'Makina e mirë por kishte disa gërvishtje që nuk ishin raportuar.',
    date: '2026-03-05',
    helpfulCount: 4,
    notHelpfulCount: 3,
  },
  {
    id: 'r6',
    vehicleId: 6,
    authorName: 'Artan Hoxha',
    authorAvatar: 'AH',
    rating: 5,
    text: 'Eksperiencë premium! Stafi shumë profesional dhe i sjellshëm.',
    date: '2026-02-12',
    helpfulCount: 10,
    notHelpfulCount: 0,
  },
];

export interface Ad {
  id: string;
  title: string;
  imageUrl: string;
  videoUrl?: string;
  linkUrl: string;
  position: 'top' | 'bottom';
  isActive: boolean;
}

export const ads: Ad[] = [
  {
    id: 'ad-1',
    title: 'Summer Special - 30% Off SUV Rentals',
    imageUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&h=400&auto=format&fit=crop',
    videoUrl: 'https://assets.mixkit.co/videos/1599/1599-720.mp4',
    linkUrl: '/fleet',
    position: 'top',
    isActive: true,
  },
  {
    id: 'ad-2',
    title: 'Luxury Weekend Getaway Package',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&h=400&auto=format&fit=crop',
    videoUrl: 'https://assets.mixkit.co/videos/24481/24481-720.mp4',
    linkUrl: '/fleet',
    position: 'bottom',
    isActive: true,
  },
];

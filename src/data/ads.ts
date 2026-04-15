import { toImagePath } from "../utils/general";

export interface Ad {
  id: string;
  title: string;
  imageUrl: string;
  imageName: string;
  videoName: string;
  videoUrl?: string;
  linkUrl: string;
  position: 'top' | 'bottom';
  isActive: boolean;
}

export function mapToAd(raw: any): Ad {
  return {
    id: raw.id ?? '',
    title: raw.title ?? '',
    imageUrl: toImagePath(raw.imageUrl) ?? '',
    imageName: raw.imageName ?? '',
    videoUrl: toImagePath(raw.videoUrl),
    videoName: raw.videoName ?? '',
    linkUrl: raw.linkUrl ?? '',
    position: raw.position === 'top' || raw.position === 'bottom' ? raw.position : 'top',
    isActive: raw.isActive ?? false,
  };
}

export type CarReview = {
  id: string;
  createdOn: string;
  modifiedOn?: string;
  rating: number;
  comment: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    username?: string;
    email?: string;
    image: {
      imageName: string;
      imageData: string;
    } | null;
  };
};

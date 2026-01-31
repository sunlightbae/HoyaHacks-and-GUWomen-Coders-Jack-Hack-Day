
export enum Category {
  SAFETY = 'Safety',
  URGENT = 'Urgent Help',
  GIVEAWAY = 'Giveaway',
  SOCIAL_IMPACT = 'Social Impact',
  GENERAL = 'General'
}

export interface Reply {
  id: string;
  author: string;
  content: string;
  timestamp: number;
}

export interface Post {
  id: string;
  content: string;
  category: Category;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  media?: {
    url: string;
    type: 'image' | 'video';
  };
  replies: Reply[];
  timestamp: number;
  authorAlias: string;
  isSolved?: boolean;
}

export interface AppState {
  posts: Post[];
  seenPostIds: string[];
  myAliases: string[];
}

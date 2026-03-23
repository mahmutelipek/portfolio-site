export interface ContentBlock {
  id: string;
  type: 'text' | 'image';
  title?: string; // Section title (e.g. Overview)
  value: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  date: string;
  cover_image_url: string;
  gallery?: string[];
  content_body?: string;
  roles: string[];
  industries?: string;
  link?: string;
  sort_order?: number;
  content_blocks?: ContentBlock[]; // New flexible content
}

export interface Logo {
  id: string;
  url: string;
  name: string;
  website_url?: string;
  sort_order?: number;
}

export interface AboutImage {
  id: string;
  url: string;
  alt?: string;
  sort_order: number;
}

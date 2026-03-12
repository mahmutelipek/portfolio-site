export interface Project {
  id: string;
  title: string;
  slug: string;
  client: string;
  date: string;
  cover_image_url: string;
  gallery: string[];
  content_body: string;
  roles: string[];
  sort_order?: number;
}
export interface Logo {
  id: string;
  name: string;
  url: string;
  website_url?: string;
  sort_order?: number;
  created_at?: string;
}

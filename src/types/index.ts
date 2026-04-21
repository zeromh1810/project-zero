export interface Project {
  id: string;
  title: string;
  category: string;
  year: number;
  type: string;
  description: string;
  tags: string[];
  cover_url: string;
  image_urls: string[];
  project_url: string;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface SocialLinks {
  linkedin?: string;
  github?: string;
  behance?: string;
  dribbble?: string;
  email?: string;
  twitter?: string;
  instagram?: string;
  website?: string;
}

export interface AboutData {
  id: string;
  full_name: string;
  role_title: string;
  bio_short: string;
  bio_long: string;
  photo_url: string;
  skills: string[];
  years_exp: number;
  projects_count: number;
  cv_url: string;
  social_links: SocialLinks;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

export type Theme = 'light' | 'dark';

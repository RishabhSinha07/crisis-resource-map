export type ResourceType = 'shelter' | 'water' | 'food' | 'medical' | 'wifi' | 'transport';

export interface Resource {
  id: string;
  type: ResourceType;
  title: string;
  description: string | null;
  lat: number;
  lng: number;
  upvotes: number;
  downvotes: number;
  status: string;
  contact_info: string | null;
  created_at: string;
  source: string;
  source_id: string | null;
  updated_at: string;
}

export interface Vote {
  id: string;
  resource_id: string;
  vote_type: 'up' | 'down';
  voter_fingerprint: string;
}

export interface NewResource {
  type: ResourceType;
  title: string;
  description?: string;
  lat: number;
  lng: number;
  contact_info?: string;
}

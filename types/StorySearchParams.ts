/**
 * Interface for story search parameters
 */
export interface StorySearchParams {
  query?: string;
  category?: string;
  country?: string;
  tag?: string;
  author?: string;
  fromDate?: Date;
  toDate?: Date;
  featured?: boolean;
  editorsPick?: boolean;
}

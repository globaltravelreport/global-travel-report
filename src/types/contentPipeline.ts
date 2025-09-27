// Type definitions for the enhanced content pipeline
import type { Story } from './Story';

export enum ProcessingMode {
  FULL = 'full',
  PARTIAL = 'partial',
  DRY_RUN = 'dry-run',
  EMERGENCY = 'emergency',
}

export enum QualityThreshold {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum PublicationMode {
  IMMEDIATE = 'immediate',
  SCHEDULED = 'scheduled',
}

export enum ContentState {
  DRAFT = 'draft',
  REVIEW = 'review',
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export interface PipelineConfig {
  processingMode: ProcessingMode;
  qualityThreshold: QualityThreshold;
  publicationMode: PublicationMode;
  storyCount: number;
  categories: string[];
  [key: string]: any;
}

export interface IRSSFeedService {
  fetchStories(options: any): Promise<Story[]>;
}

export interface IStoryRewriter {
  rewrite(story: Story, options?: any): Promise<Story>;
}

export interface IContentQualityService {
  score(story: Story): Promise<QualityScore>;
  suggestImprovements(story: Story): Promise<string[]>;
}

export interface IImageService {
  findImage(story: Story, options?: any): Promise<string>;
}

export interface IStoryScheduler {
  schedule(story: Story, options?: any): Promise<PublicationSchedule>;
}

export interface IStoryPersister {
  save(story: Story, options?: any): Promise<ServiceResult>;
}

export interface QualityScore {
  score: number;
  breakdown: Record<string, number>;
  suggestions: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
  qualityScore?: QualityScore;
}

export interface ProcessingResult {
  success: boolean;
  errors?: string[];
  results?: ServiceResult[];
  stats?: ProcessingStats;
}

export interface ServiceResult {
  service: string;
  success: boolean;
  data?: any;
  error?: string;
}

export interface PublicationSchedule {
  scheduledTime: string;
  priority: number;
  status: ContentState;
}

export interface ContentMetrics {
  views: number;
  shares: number;
  engagement: number;
  [key: string]: any;
}

export interface PipelineError {
  code: string;
  message: string;
  service?: string;
  recoverable?: boolean;
}

export interface ProcessingStats {
  total: number;
  success: number;
  failed: number;
  durationMs: number;
  [key: string]: any;
}

export interface ServiceHealth {
  service: string;
  status: 'ok' | 'degraded' | 'down';
  lastChecked: string;
  details?: any;
}

export interface RSSFeedConfig {
  url: string;
  category: string;
  priority: number;
  updateFrequencyMinutes: number;
}

export interface RewritingOptions {
  preserveTags?: boolean;
  maintainTone?: boolean;
  keepKeywords?: boolean;
}

export interface SchedulingOptions {
  intervalMinutes?: number;
  embargoUntil?: string;
}

export interface QualityOptions {
  minScore?: number;
  enforceBrand?: boolean;
}

export interface WebhookConfig {
  url: string;
  events: string[];
}

export interface SocialMediaConfig {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
}

export interface SEOConfig {
  keywords: string[];
  metaDescription: string;
}

export interface ContentFingerprint {
  hash: string;
  similarity: number;
}

export interface ProcessingContext {
  requestId: string;
  user?: string;
  options?: any;
}

export interface PipelineEvent {
  type: string;
  timestamp: string;
  data?: any;
}

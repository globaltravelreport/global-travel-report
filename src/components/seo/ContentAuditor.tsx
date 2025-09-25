'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ContentAuditResult {
  url: string;
  title: string;
  issues: string[];
  score: number;
  wordCount: number;
  readabilityScore: number;
  seoScore: number;
  suggestions: string[];
  duplicateContent?: {
    similarUrl: string;
    similarity: number;
  };
}

interface ContentAuditorProps {
  urls: string[];
  onAuditComplete?: (results: ContentAuditResult[]) => void;
  autoAudit?: boolean;
  auditInterval?: number;
}

export function useContentAuditor(urls: string[]) {
  const [results, setResults] = useState<ContentAuditResult[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [progress, setProgress] = useState(0);

  const auditContent = async (url: string): Promise<ContentAuditResult> => {
    // Simulate content fetching and analysis
    const mockContent = await fetchMockContent(url);
    const mockIssues = generateMockIssues();
    const mockSuggestions = generateMockSuggestions();

    const wordCount = mockContent.split(' ').length;
    const readabilityScore = calculateReadabilityScore(mockContent);
    const seoScore = calculateSEOScore(mockContent, url);

    const result: ContentAuditResult = {
      url,
      title: extractTitleFromUrl(url),
      issues: mockIssues,
      score: Math.round((readabilityScore + seoScore) / 2),
      wordCount,
      readabilityScore: Math.round(readabilityScore),
      seoScore: Math.round(seoScore),
      suggestions: mockSuggestions,
      duplicateContent: Math.random() > 0.7 ? {
        similarUrl: urls[Math.floor(Math.random() * urls.length)],
        similarity: Math.random() * 30 + 70,
      } : undefined,
    };

    return result;
  };

  const runFullAudit = async () => {
    setIsAuditing(true);
    setProgress(0);
    const auditResults: ContentAuditResult[] = [];

    for (let i = 0; i < urls.length; i++) {
      const result = await auditContent(urls[i]);
      auditResults.push(result);
      setProgress(((i + 1) / urls.length) * 100);
    }

    setResults(auditResults);
    setIsAuditing(false);
    setProgress(100);

    return auditResults;
  };

  const getAuditSummary = () => {
    if (results.length === 0) return null;

    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
    const duplicateCount = results.filter(r => r.duplicateContent).length;

    return {
      totalPages: results.length,
      averageScore: Math.round(avgScore),
      totalIssues,
      duplicateCount,
      highPerforming: results.filter(r => r.score >= 80).length,
      needsImprovement: results.filter(r => r.score < 60).length,
    };
  };

  return {
    results,
    isAuditing,
    progress,
    runFullAudit,
    getAuditSummary,
  };
}

// Mock content fetching
const fetchMockContent = async (url: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return `This is mock content for ${url}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;
};

// Generate mock issues
const generateMockIssues = (): string[] => {
  const possibleIssues = [
    'Title is too short',
    'Missing meta description',
    'Low keyword density',
    'No H1 tag found',
    'Images missing alt text',
    'Content is too short',
    'No internal links',
    'Missing schema markup',
    'Page load time is slow',
    'Mobile unfriendly',
  ];

  const issueCount = Math.floor(Math.random() * 4);
  const shuffled = possibleIssues.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, issueCount);
};

// Generate mock suggestions
const generateMockSuggestions = (): string[] => {
  const possibleSuggestions = [
    'Add more relevant keywords',
    'Include internal links to related content',
    'Add schema markup for better SEO',
    'Optimize images for faster loading',
    'Improve mobile responsiveness',
    'Add more engaging headlines',
    'Include call-to-action buttons',
    'Add social sharing buttons',
    'Improve content structure with headings',
    'Add more visual elements',
  ];

  const suggestionCount = Math.floor(Math.random() * 3) + 2;
  const shuffled = possibleSuggestions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, suggestionCount);
};

// Calculate readability score
const calculateReadabilityScore = (content: string): number => {
  const words = content.split(' ').length;
  const sentences = content.split(/[.!?]+/).length;
  const syllables = countSyllables(content);

  const avgWordsPerSentence = words / sentences;
  const avgSyllablesPerWord = syllables / words;

  // Simplified Flesch Reading Ease formula
  const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);

  return Math.max(0, Math.min(100, score));
};

// Count syllables (simplified)
const countSyllables = (text: string): number => {
  return text.split(' ').reduce((count, word) => {
    return count + Math.max(1, word.replace(/[^aeiouy]/gi, '').length);
  }, 0);
};

// Calculate SEO score
const calculateSEOScore = (content: string, url: string): number => {
  let score = 0;

  // Title optimization
  const title = extractTitleFromUrl(url);
  if (title.length >= 30 && title.length <= 60) score += 20;

  // Content length
  const wordCount = content.split(' ').length;
  if (wordCount >= 300) score += 20;

  // Keyword presence
  const keywords = extractKeywordsFromUrl(url);
  const keywordCount = keywords.reduce((count, keyword) => {
    return count + (content.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
  }, 0);
  if (keywordCount > 0) score += 15;

  // Structure
  if (content.includes('<h1>') || content.includes('# ')) score += 10;
  if (content.includes('<h2>') || content.includes('## ')) score += 10;

  // Links
  if (content.includes('http') || content.includes('href')) score += 10;

  // Images
  if (content.includes('<img') || content.includes('![')) score += 10;

  return Math.min(100, score);
};

// Extract title from URL
const extractTitleFromUrl = (url: string): string => {
  const path = url.split('/').pop() || '';
  return path.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Extract keywords from URL
const extractKeywordsFromUrl = (url: string): string[] => {
  const path = url.split('/').pop() || '';
  return path.split('-').filter(word => word.length > 2);
};

export function ContentAuditor({
  urls,
  onAuditComplete,
  autoAudit = false,
  auditInterval = 300000, // 5 minutes
}: ContentAuditorProps) {
  const { results, isAuditing, progress, runFullAudit, getAuditSummary } = useContentAuditor(urls);
  const [selectedResult, setSelectedResult] = useState<ContentAuditResult | null>(null);

  useEffect(() => {
    if (autoAudit && urls.length > 0) {
      runFullAudit();
      const interval = setInterval(runFullAudit, auditInterval);
      return () => clearInterval(interval);
    }
  }, [autoAudit, urls, auditInterval, runFullAudit]);

  useEffect(() => {
    if (onAuditComplete && results.length > 0) {
      onAuditComplete(results);
    }
  }, [results, onAuditComplete]);

  const summary = getAuditSummary();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Improvement';
    return 'Poor';
  };

  return (
    <div className="content-auditor bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Content Audit</h3>
          <button
            onClick={runFullAudit}
            disabled={isAuditing}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isAuditing ? 'Auditing...' : 'Run Audit'}
          </button>
        </div>

        {isAuditing && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Auditing pages...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {summary && (
        <div className="p-6 border-b">
          <h4 className="font-medium mb-4">Audit Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-blue-600">{summary.totalPages}</div>
              <div className="text-xs text-gray-600">Total Pages</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className={`text-2xl font-bold px-2 py-1 rounded ${getScoreColor(summary.averageScore)}`}>
                {summary.averageScore}
              </div>
              <div className="text-xs text-gray-600">Avg Score</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-orange-600">{summary.totalIssues}</div>
              <div className="text-xs text-gray-600">Issues Found</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-purple-600">{summary.duplicateCount}</div>
              <div className="text-xs text-gray-600">Duplicates</div>
            </div>
          </div>
        </div>
      )}

      <div className="divide-y">
        {results.map((result, index) => (
          <motion.div
            key={result.url}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => setSelectedResult(result)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h5 className="font-medium text-gray-900">{result.title}</h5>
                <p className="text-sm text-gray-600 truncate">{result.url}</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-2 py-1 rounded text-sm font-medium ${getScoreColor(result.score)}`}>
                  {result.score}/100
                </span>
                <span className="text-sm text-gray-500">{result.wordCount} words</span>
              </div>
            </div>

            {result.issues.length > 0 && (
              <div className="mt-2">
                <div className="flex flex-wrap gap-1">
                  {result.issues.slice(0, 3).map((issue, i) => (
                    <span key={i} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                      {issue}
                    </span>
                  ))}
                  {result.issues.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{result.issues.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Detailed View Modal */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">{selectedResult.title}</h3>
                <button
                  onClick={() => setSelectedResult(null)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  {selectedResult.issues.length > 0 && (
                    <div>
                      <h4 className="font-medium text-red-600 mb-2">Issues Found</h4>
                      <ul className="space-y-1">
                        {selectedResult.issues.map((issue, i) => (
                          <li key={i} className="text-sm text-red-600 flex items-start">
                            <span className="mr-2">•</span>
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedResult.suggestions.length > 0 && (
                    <div>
                      <h4 className="font-medium text-blue-600 mb-2">Suggestions</h4>
                      <ul className="space-y-1">
                        {selectedResult.suggestions.map((suggestion, i) => (
                          <li key={i} className="text-sm text-blue-600 flex items-start">
                            <span className="mr-2">•</span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedResult.duplicateContent && (
                    <div>
                      <h4 className="font-medium text-orange-600 mb-2">Duplicate Content Detected</h4>
                      <div className="p-3 bg-orange-50 rounded">
                        <p className="text-sm text-orange-800">
                          Similar content found on: <strong>{selectedResult.duplicateContent.similarUrl}</strong>
                        </p>
                        <p className="text-sm text-orange-600 mt-1">
                          Similarity: {selectedResult.duplicateContent.similarity.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded">
                    <h5 className="font-medium mb-3">Content Metrics</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Overall Score:</span>
                        <span className={`font-medium ${getScoreColor(selectedResult.score)}`}>
                          {selectedResult.score}/100
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Readability:</span>
                        <span className={`font-medium ${getScoreColor(selectedResult.readabilityScore)}`}>
                          {selectedResult.readabilityScore}/100
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>SEO Score:</span>
                        <span className={`font-medium ${getScoreColor(selectedResult.seoScore)}`}>
                          {selectedResult.seoScore}/100
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Word Count:</span>
                        <span className="font-medium">{selectedResult.wordCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
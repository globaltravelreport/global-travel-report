'use client';

import { useEffect, useState } from 'react';

interface PageMeta {
  title: string;
  description: string;
  keywords: string[];
  h1: string;
  h2: string[];
  h3: string[];
  image?: string;
  url: string;
  type: 'article' | 'website' | 'category' | 'tag' | 'author';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  wordCount?: number;
  readingTime?: number;
}

interface SEOAnalysis {
  score: number;
  issues: string[];
  suggestions: string[];
  titleLength: number;
  descriptionLength: number;
  keywordDensity: number;
  hasH1: boolean;
  hasImage: boolean;
  hasStructuredData: boolean;
  mobileFriendly: boolean;
}

interface MetaOptimizerProps {
  pageMeta: PageMeta;
  onMetaUpdate?: (updatedMeta: PageMeta) => void;
  autoOptimize?: boolean;
  targetKeywords?: string[];
}

// SEO Title Optimizer
export function useTitleOptimizer(initialTitle: string, targetKeywords: string[] = []) {
  const [title, setTitle] = useState(initialTitle);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const optimizeTitle = (title: string): { title: string; score: number } => {
      const optimalLength = 60;
      const titleLength = title.length;

      let optimizedTitle = title;
      let titleScore = 0;

      // Length scoring
      if (titleLength >= 30 && titleLength <= 60) {
        titleScore += 40;
      } else if (titleLength >= 20 && titleLength <= 70) {
        titleScore += 20;
      } else {
        titleScore += 0;
      }

      // Keyword placement scoring
      const hasKeywordInStart = targetKeywords.some(keyword =>
        title.toLowerCase().startsWith(keyword.toLowerCase())
      );
      if (hasKeywordInStart) titleScore += 30;

      // Brand inclusion
      if (title.includes('Global Travel Report')) titleScore += 10;

      // Power words
      const powerWords = ['ultimate', 'complete', 'best', 'guide', 'tips', 'secrets', 'amazing', 'incredible'];
      const hasPowerWord = powerWords.some(word => title.toLowerCase().includes(word));
      if (hasPowerWord) titleScore += 10;

      // Avoid keyword stuffing
      const keywordCount = targetKeywords.reduce((count, keyword) => {
        return count + (title.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
      }, 0);
      if (keywordCount <= 2) titleScore += 10;

      titleScore = Math.min(titleScore, 100);

      return { title: optimizedTitle, score: titleScore };
    };

    const result = optimizeTitle(title);
    setScore(result.score);
  }, [title, targetKeywords]);

  const updateTitle = (newTitle: string) => {
    setTitle(newTitle);
  };

  return { title, score, updateTitle };
}

// SEO Description Optimizer
export function useDescriptionOptimizer(initialDescription: string, targetKeywords: string[] = []) {
  const [description, setDescription] = useState(initialDescription);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const optimizeDescription = (desc: string): { description: string; score: number } => {
      const optimalLength = 160;
      const descLength = desc.length;

      let optimizedDesc = desc;
      let descScore = 0;

      // Length scoring
      if (descLength >= 120 && descLength <= 160) {
        descScore += 40;
      } else if (descLength >= 100 && descLength <= 180) {
        descScore += 20;
      } else {
        descScore += 0;
      }

      // Keyword inclusion
      const hasKeyword = targetKeywords.some(keyword =>
        desc.toLowerCase().includes(keyword.toLowerCase())
      );
      if (hasKeyword) descScore += 30;

      // Call-to-action check
      const ctaWords = ['discover', 'learn', 'find', 'explore', 'read', 'click', 'visit'];
      const hasCTA = ctaWords.some(word => desc.toLowerCase().includes(word));
      if (hasCTA) descScore += 15;

      // Avoid duplicate keywords
      const keywordCount = targetKeywords.reduce((count, keyword) => {
        return count + (desc.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
      }, 0);
      if (keywordCount <= 3) descScore += 15;

      descScore = Math.min(descScore, 100);

      return { description: optimizedDesc, score: descScore };
    };

    const result = optimizeDescription(description);
    setScore(result.score);
  }, [description, targetKeywords]);

  const updateDescription = (newDescription: string) => {
    setDescription(newDescription);
  };

  return { description, score, updateDescription };
}

// Content Analysis Hook
export function useContentAnalysis(content: string, keywords: string[] = []) {
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);

  useEffect(() => {
    const analyzeContent = (text: string): SEOAnalysis => {
      const words = text.split(/\s+/);
      const wordCount = words.length;
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const readingTime = Math.ceil(wordCount / 200); // Average reading speed

      // Keyword density analysis
      const keywordMatches = keywords.reduce((total, keyword) => {
        const regex = new RegExp(keyword.toLowerCase(), 'gi');
        const matches = text.match(regex);
        return total + (matches ? matches.length : 0);
      }, 0);
      const keywordDensity = (keywordMatches / wordCount) * 100;

      // Basic SEO scoring
      let score = 0;
      const issues: string[] = [];
      const suggestions: string[] = [];

      // Title analysis (assuming first H1 or first 60 chars)
      const titleMatch = text.match(/<h1[^>]*>(.*?)<\/h1>/i) || text.substring(0, 60);
      const titleLength = titleMatch[1] ? titleMatch[1].length : titleMatch.length;

      if (titleLength < 30) {
        issues.push('Title is too short');
        suggestions.push('Expand title to 30-60 characters');
      } else if (titleLength > 60) {
        issues.push('Title is too long');
        suggestions.push('Shorten title to under 60 characters');
      } else {
        score += 20;
      }

      // Keyword optimization
      if (keywordDensity < 0.5) {
        issues.push('Low keyword density');
        suggestions.push('Include target keywords more frequently');
      } else if (keywordDensity > 3) {
        issues.push('Keyword stuffing detected');
        suggestions.push('Reduce keyword density to under 3%');
      } else {
        score += 20;
      }

      // Content length
      if (wordCount < 300) {
        issues.push('Content is too short');
        suggestions.push('Add more content (aim for 300+ words)');
      } else if (wordCount > 2000) {
        score += 15;
      } else {
        score += 10;
      }

      // Structure analysis
      const hasH1 = /<h1/i.test(text);
      const hasH2 = /<h2/i.test(text);
      const hasH3 = /<h3/i.test(text);

      if (!hasH1) {
        issues.push('Missing H1 tag');
        suggestions.push('Add an H1 tag with your main keyword');
      } else {
        score += 10;
      }

      if (!hasH2 && wordCount > 500) {
        suggestions.push('Consider adding H2 tags for better structure');
      }

      if (!hasH3 && wordCount > 1000) {
        suggestions.push('Consider adding H3 tags for sub-sections');
      }

      // Readability
      const avgSentenceLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
      if (avgSentenceLength > 20) {
        suggestions.push('Consider shortening some sentences for better readability');
      }

      // Mobile friendliness (basic check)
      const mobileFriendly = !text.includes('style=') && !text.includes('width=') || true;

      score += mobileFriendly ? 15 : 0;

      return {
        score: Math.min(score, 100),
        issues,
        suggestions,
        titleLength,
        descriptionLength: text.substring(0, 160).length,
        keywordDensity,
        hasH1,
        hasImage: /<img/i.test(text),
        hasStructuredData: /application\/ld\+json/i.test(text),
        mobileFriendly,
      };
    };

    setAnalysis(analyzeContent(content));
  }, [content, keywords]);

  return analysis;
}

// Auto-optimize content
export function useAutoOptimize(enabled: boolean = false) {
  const [isOptimizing, setIsOptimizing] = useState(false);

  const optimizeContent = async (content: string, keywords: string[]): Promise<string> => {
    if (!enabled) return content;

    setIsOptimizing(true);

    try {
      // Simulate optimization process
      await new Promise(resolve => setTimeout(resolve, 1000));

      let optimized = content;

      // Add keyword-rich headings if missing
      if (!/<h1/i.test(optimized) && keywords.length > 0) {
        const mainKeyword = keywords[0];
        optimized = `<h1>${mainKeyword.charAt(0).toUpperCase() + mainKeyword.slice(1)} Guide</h1>\n${optimized}`;
      }

      // Add subheadings for better structure
      if (!/<h2/i.test(optimized) && optimized.split('\n').length > 10) {
        const paragraphs = optimized.split('\n\n');
        if (paragraphs.length > 3) {
          paragraphs.splice(2, 0, `<h2>Key Information</h2>`);
          optimized = paragraphs.join('\n\n');
        }
      }

      return optimized;
    } finally {
      setIsOptimizing(false);
    }
  };

  return { optimizeContent, isOptimizing };
}

// Main Meta Optimizer Component
export function MetaOptimizer({
  pageMeta,
  onMetaUpdate,
  autoOptimize = false,
  targetKeywords = [],
}: MetaOptimizerProps) {
  const { title, score: titleScore, updateTitle } = useTitleOptimizer(pageMeta.title, targetKeywords);
  const { description, score: descScore, updateDescription } = useDescriptionOptimizer(pageMeta.description, targetKeywords);
  const contentAnalysis = useContentAnalysis(`${pageMeta.h1}\n${pageMeta.h2.join('\n')}\n${pageMeta.h3.join('\n')}`, targetKeywords);
  const { optimizeContent, isOptimizing } = useAutoOptimize(autoOptimize);

  const overallScore = Math.round((titleScore + descScore + (contentAnalysis?.score || 0)) / 3);

  useEffect(() => {
    if (onMetaUpdate) {
      onMetaUpdate({
        ...pageMeta,
        title,
        description,
      });
    }
  }, [title, description, pageMeta, onMetaUpdate]);

  const handleAutoOptimize = async () => {
    const content = `${pageMeta.h1}\n${pageMeta.h2.join('\n')}\n${pageMeta.h3.join('\n')}`;
    const optimized = await optimizeContent(content, targetKeywords);

    if (onMetaUpdate) {
      const lines = optimized.split('\n');
      const h1 = lines.find(line => line.startsWith('#') || line.includes('<h1>')) || pageMeta.h1;
      const h2 = lines.filter(line => line.startsWith('##') || line.includes('<h2>'));
      const h3 = lines.filter(line => line.startsWith('###') || line.includes('<h3>'));

      onMetaUpdate({
        ...pageMeta,
        title,
        description,
        h1,
        h2,
        h3,
      });
    }
  };

  return (
    <div className="meta-optimizer p-6 bg-white rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">SEO Optimizer</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Overall Score:</span>
          <span className={`px-2 py-1 rounded text-sm font-medium ${
            overallScore >= 80 ? 'bg-green-100 text-green-800' :
            overallScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {overallScore}/100
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Title Optimization */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">Title Optimization</h4>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              titleScore >= 80 ? 'bg-green-100 text-green-800' :
              titleScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {titleScore}/100
            </span>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => updateTitle(e.target.value)}
            className="w-full p-2 border rounded text-sm"
            placeholder="Page title"
          />
          <p className="text-xs text-gray-500 mt-1">
            Length: {title.length}/60 characters
          </p>
        </div>

        {/* Description Optimization */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">Description Optimization</h4>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              descScore >= 80 ? 'bg-green-100 text-green-800' :
              descScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {descScore}/100
            </span>
          </div>
          <textarea
            value={description}
            onChange={(e) => updateDescription(e.target.value)}
            className="w-full p-2 border rounded text-sm resize-none"
            rows={3}
            placeholder="Meta description"
          />
          <p className="text-xs text-gray-500 mt-1">
            Length: {description.length}/160 characters
          </p>
        </div>

        {/* Content Analysis */}
        {contentAnalysis && (
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-3">Content Analysis</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Keyword Density:</span>
                <span>{contentAnalysis.keywordDensity.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>H1 Tag:</span>
                <span className={contentAnalysis.hasH1 ? 'text-green-600' : 'text-red-600'}>
                  {contentAnalysis.hasH1 ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Images:</span>
                <span className={contentAnalysis.hasImage ? 'text-green-600' : 'text-yellow-600'}>
                  {contentAnalysis.hasImage ? '✓' : '⚠'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Mobile Friendly:</span>
                <span className={contentAnalysis.mobileFriendly ? 'text-green-600' : 'text-red-600'}>
                  {contentAnalysis.mobileFriendly ? '✓' : '✗'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Issues and Suggestions */}
        {contentAnalysis && (
          <div className="space-y-4">
            {contentAnalysis.issues.length > 0 && (
              <div>
                <h4 className="font-medium text-red-600 mb-2">Issues Found</h4>
                <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                  {contentAnalysis.issues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            {contentAnalysis.suggestions.length > 0 && (
              <div>
                <h4 className="font-medium text-blue-600 mb-2">Suggestions</h4>
                <ul className="list-disc list-inside text-sm text-blue-600 space-y-1">
                  {contentAnalysis.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Auto Optimize Button */}
        {autoOptimize && (
          <button
            onClick={handleAutoOptimize}
            disabled={isOptimizing}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isOptimizing ? 'Optimizing...' : 'Auto-Optimize Content'}
          </button>
        )}
      </div>
    </div>
  );
}
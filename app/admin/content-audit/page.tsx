'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SafeSearchParamsProvider } from '../../../src/components/ui/SearchParamsProvider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../src/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../src/components/ui/tabs';
import { Button } from '../../../src/components/ui/button';
import { Badge } from '../../../src/components/ui/badge';
import { Input } from '../../../src/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../src/components/ui/table';
import { FreshnessIndicator } from '../../../src/components/ui/FreshnessIndicator';

interface ContentAuditReport {
  generatedAt: string;
  summary: {
    totalStories: number;
    freshness: {
      fresh: number;
      recent: number;
      outdated: number;
      unknown: number;
      percentOutdated: string;
    };
    scores: {
      averageQualityScore: string;
      averageSeoScore: string;
      averageTotalScore: string;
    };
  };
  topStories: Array<{
    slug: string;
    title: string;
    totalScore: number;
  }>;
  needsUpdate: Array<{
    slug: string;
    title: string;
    daysSinceLastUpdate: number;
    totalScore: number;
  }>;
  needsImprovement: Array<{
    slug: string;
    title: string;
    qualityScore: number;
    seoScore: number;
    totalScore: number;
  }>;
  detailedAnalysis: Array<{
    slug: string;
    title: string;
    category: string;
    country: string;
    publishedAt: string;
    updatedAt: string;
    daysSinceLastUpdate: number;
    freshnessStatus: 'fresh' | 'recent' | 'outdated' | 'unknown';
    qualityScore: number;
    seoScore: number;
    totalScore: number;
    wordCount: number;
    hasTags: boolean;
    tagCount: number;
    hasImage: boolean;
    hasPhotographer: boolean;
    isFeatured: boolean;
    isEditorsPick: boolean;
  }>;
}

function ContentAuditContent() {
  const [report, setReport] = useState<ContentAuditReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('summary');

  // Load the report from local storage on mount
  useEffect(() => {
    try {
      const storedReport = localStorage.getItem('content-audit-report');
      if (storedReport) {
        setReport(JSON.parse(storedReport));
      }
      setLoading(false);
    } catch (_err) {
      setError('Failed to load content audit report');
      setLoading(false);
    }
  }, []);

  // Handle running the content audit
  const handleRunAudit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate running the audit (in a real implementation, this would call an API)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // For demo purposes, generate a sample report
      const sampleReport: ContentAuditReport = {
        generatedAt: new Date().toISOString(),
        summary: {
          totalStories: 153,
          freshness: {
            fresh: 42,
            recent: 78,
            outdated: 33,
            unknown: 0,
            percentOutdated: '21.57'
          },
          scores: {
            averageQualityScore: '68.45',
            averageSeoScore: '72.31',
            averageTotalScore: '140.76'
          }
        },
        topStories: Array.from({ length: 10 }, (_, i) => ({
          slug: `top-story-${i + 1}`,
          title: `Top Story ${i + 1}`,
          totalScore: 180 - i * 3
        })),
        needsUpdate: Array.from({ length: 20 }, (_, i) => ({
          slug: `outdated-story-${i + 1}`,
          title: `Outdated Story ${i + 1}`,
          daysSinceLastUpdate: 180 + i * 10,
          totalScore: 120 - i * 2
        })),
        needsImprovement: Array.from({ length: 20 }, (_, i) => ({
          slug: `improvement-story-${i + 1}`,
          title: `Needs Improvement Story ${i + 1}`,
          qualityScore: 30 - i,
          seoScore: 20 - i,
          totalScore: 50 - i * 2
        })),
        detailedAnalysis: Array.from({ length: 153 }, (_, i) => {
          const isFresh = i < 42;
          const isRecent = i >= 42 && i < 120;
          const _isOutdated = i >= 120;

          return {
            slug: `story-${i + 1}`,
            title: `Story ${i + 1}`,
            category: ['Travel', 'Adventure', 'Culture', 'Food & Wine', 'Cruise'][i % 5],
            country: ['Australia', 'Japan', 'Italy', 'France', 'United States'][i % 5],
            publishedAt: new Date(Date.now() - (isFresh ? 7 : isRecent ? 90 : 200) * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - (isFresh ? 7 : isRecent ? 90 : 200) * 24 * 60 * 60 * 1000).toISOString(),
            daysSinceLastUpdate: isFresh ? 7 : isRecent ? 90 : 200,
            freshnessStatus: isFresh ? 'fresh' : isRecent ? 'recent' : 'outdated',
            qualityScore: 70 - (i % 40),
            seoScore: 75 - (i % 30),
            totalScore: 145 - (i % 70),
            wordCount: 800 + (i % 1000),
            hasTags: i % 10 !== 0,
            tagCount: i % 10,
            hasImage: i % 20 !== 0,
            hasPhotographer: i % 30 !== 0,
            isFeatured: i % 15 === 0,
            isEditorsPick: i % 25 === 0
          };
        })
      };

      // Store the report in local storage
      localStorage.setItem('content-audit-report', JSON.stringify(sampleReport));

      // Update the state
      setReport(sampleReport);
      setLoading(false);
    } catch (_err) {
      setError('Failed to run content audit');
      setLoading(false);
    }
  };

  // Filter the detailed analysis based on the search term
  const filteredAnalysis = report?.detailedAnalysis.filter(story =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    story.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    story.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    story.country.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Get badge color for score
  const getScoreColor = (score: number) => {
    if (score >= 160) return 'bg-green-500 hover:bg-green-600';
    if (score >= 120) return 'bg-green-400 hover:bg-green-500';
    if (score >= 80) return 'bg-yellow-400 hover:bg-yellow-500';
    if (score >= 40) return 'bg-orange-400 hover:bg-orange-500';
    return 'bg-red-500 hover:bg-red-600';
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Content Audit</h1>
        <div className="flex gap-4">
          <Button onClick={handleRunAudit} disabled={loading}>
            {loading ? 'Running Audit...' : 'Run Audit'}
          </Button>
          <Link href="/admin">
            <Button variant="outline">Back to Admin</Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : report ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Audit Report</CardTitle>
              <CardDescription>
                Generated on {new Date(report.generatedAt).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="needs-update">Needs Update</TabsTrigger>
                  <TabsTrigger value="needs-improvement">Needs Improvement</TabsTrigger>
                  <TabsTrigger value="all-stories">All Stories</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Content Freshness</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Fresh</span>
                            <span className="font-semibold">{report.summary.freshness.fresh} ({(report.summary.freshness.fresh / report.summary.totalStories * 100).toFixed(1)}%)</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Recent</span>
                            <span className="font-semibold">{report.summary.freshness.recent} ({(report.summary.freshness.recent / report.summary.totalStories * 100).toFixed(1)}%)</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Outdated</span>
                            <span className="font-semibold">{report.summary.freshness.outdated} ({report.summary.freshness.percentOutdated}%)</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Average Scores</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Quality Score</span>
                            <span className="font-semibold">{report.summary.scores.averageQualityScore}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>SEO Score</span>
                            <span className="font-semibold">{report.summary.scores.averageSeoScore}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Score</span>
                            <span className="font-semibold">{report.summary.scores.averageTotalScore}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Top Stories</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {report.topStories.slice(0, 5).map((story, index) => (
                            <div key={index} className="flex justify-between">
                              <span className="truncate">{story.title}</span>
                              <Badge className={getScoreColor(story.totalScore)}>
                                {story.totalScore}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="needs-update">
                  <div className="mt-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Days Since Update</TableHead>
                          <TableHead>Total Score</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.needsUpdate.map((story, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{story.title}</TableCell>
                            <TableCell>{story.daysSinceLastUpdate}</TableCell>
                            <TableCell>
                              <Badge className={getScoreColor(story.totalScore)}>
                                {story.totalScore}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Link href={`/stories/${story.slug}`} target="_blank">
                                <Button variant="outline" size="sm">View</Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="needs-improvement">
                  <div className="mt-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Quality Score</TableHead>
                          <TableHead>SEO Score</TableHead>
                          <TableHead>Total Score</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.needsImprovement.map((story, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{story.title}</TableCell>
                            <TableCell>{story.qualityScore}</TableCell>
                            <TableCell>{story.seoScore}</TableCell>
                            <TableCell>
                              <Badge className={getScoreColor(story.totalScore)}>
                                {story.totalScore}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Link href={`/stories/${story.slug}`} target="_blank">
                                <Button variant="outline" size="sm">View</Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="all-stories">
                  <div className="mt-6">
                    <div className="mb-4">
                      <Input
                        placeholder="Search stories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-md"
                      />
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Country</TableHead>
                          <TableHead>Freshness</TableHead>
                          <TableHead>Quality</TableHead>
                          <TableHead>SEO</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAnalysis.slice(0, 50).map((story, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{story.title}</TableCell>
                            <TableCell>{story.category}</TableCell>
                            <TableCell>{story.country}</TableCell>
                            <TableCell>
                              <FreshnessIndicator
                                publishedDate={story.publishedAt}
                                updatedDate={story.updatedAt}
                                size="sm"
                              />
                            </TableCell>
                            <TableCell>{story.qualityScore}</TableCell>
                            <TableCell>{story.seoScore}</TableCell>
                            <TableCell>
                              <Badge className={getScoreColor(story.totalScore)}>
                                {story.totalScore}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Link href={`/stories/${story.slug}`} target="_blank">
                                <Button variant="outline" size="sm">View</Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {filteredAnalysis.length > 50 && (
                      <div className="text-center mt-4 text-gray-500">
                        Showing 50 of {filteredAnalysis.length} results. Refine your search to see more.
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="text-sm text-gray-500">
              Run the content audit regularly to keep track of content freshness and quality.
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">No Content Audit Report Available</h2>
          <p className="text-gray-600 mb-6">
            Run a content audit to generate a report on content freshness, quality, and SEO optimization.
          </p>
          <Button onClick={handleRunAudit}>Run Content Audit</Button>
        </div>
      )}
    </div>
  );
}

export default function ContentAuditPage() {
  return (
    <SafeSearchParamsProvider>
      <ContentAuditContent />
    </SafeSearchParamsProvider>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Eye, Upload } from 'lucide-react';

interface RewriteResult {
  title: string;
  content: string;
  excerpt: string;
  slug: string;
}

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
  'Bahrain', 'Bangladesh', 'Belarus', 'Belgium', 'Bolivia', 'Bosnia and Herzegovina', 'Brazil', 'Bulgaria',
  'Cambodia', 'Canada', 'Chile', 'China', 'Colombia', 'Croatia', 'Czech Republic',
  'Denmark', 'Ecuador', 'Egypt', 'Estonia', 'Ethiopia',
  'Finland', 'France', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Guatemala',
  'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
  'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kuwait',
  'Latvia', 'Lebanon', 'Lithuania', 'Luxembourg',
  'Malaysia', 'Mexico', 'Morocco', 'Nepal', 'Netherlands', 'New Zealand', 'Norway',
  'Pakistan', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Qatar', 'Romania', 'Russia',
  'Saudi Arabia', 'Singapore', 'Slovakia', 'Slovenia', 'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'Sweden', 'Switzerland',
  'Thailand', 'Turkey', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay',
  'Vietnam'
];

const CATEGORIES = [
  'Travel', 'Adventure', 'Culture', 'Food & Wine', 'Cruise', 'Luxury', 'Budget', 'Family', 'Solo Travel', 'Business Travel'
];

export default function StoryUploadPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    country: '',
    category: '',
    imageUrl: '',
    tags: '',
  });
  const [rewriteResult, setRewriteResult] = useState<RewriteResult | null>(null);
  const [isRewriting, setIsRewriting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/check-auth');
      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        router.push('/admin/login');
      }
    } catch (_error) {
      router.push('/admin/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const handleRewrite = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Please provide both title and content before rewriting.');
      return;
    }

    setIsRewriting(true);
    setError('');

    try {
      const response = await fetch('/api/admin/rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          category: formData.category || 'Travel',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setRewriteResult(data);
      } else {
        setError(data.error || 'Failed to rewrite story');
      }
    } catch (_error) {
      setError('Network error. Please try again.');
    } finally {
      setIsRewriting(false);
    }
  };

  const handlePublish = async () => {
    if (!rewriteResult) {
      setError('Please rewrite the story first before publishing.');
      return;
    }

    if (!formData.country || !formData.category) {
      setError('Please select both country and category before publishing.');
      return;
    }

    setIsPublishing(true);
    setError('');

    try {
      const response = await fetch('/api/admin/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...rewriteResult,
          country: formData.country,
          category: formData.category,
          imageUrl: formData.imageUrl,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Story "${rewriteResult.title}" published successfully!`);
        // Reset form
        setFormData({
          title: '',
          content: '',
          country: '',
          category: '',
          imageUrl: '',
          tags: '',
        });
        setRewriteResult(null);
      } else {
        setError(data.error || 'Failed to publish story');
      }
    } catch (_error) {
      setError('Network error. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Story Upload System</h1>
        <p className="mt-2 text-gray-600">Create and publish travel stories with AI enhancement</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <div className="h-4 w-4 text-green-600">✓</div>
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Story Input</CardTitle>
            <CardDescription>
              Enter your raw story content and metadata
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Story Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter story title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Raw Story Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Enter your raw story content here..."
                rows={12}
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Hero Image URL (Optional)</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                placeholder="https://lh6.googleusercontent.com/yH02Zr7IBwCGhl1vr6sZSOfFp1WDv1lvjau-3cloVGMtaXdh8uqpd_jolC_bGyP4F8pySYArgmEoXEGkJZ3-OOyZT2jpXpWqCq-4DYM2bOsssTzN2XOpwRd0RWhI7TI-7GKNX8jme1hFW_0-c7bM_enmUcREA4j1NQBa9dyA3NC82Lz9wdS1alq8sQ"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                placeholder="travel, adventure, culture"
              />
            </div>

            <Button
              onClick={handleRewrite}
              disabled={isRewriting || !formData.title.trim() || !formData.content.trim()}
              className="w-full"
            >
              {isRewriting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Rewriting with AI...
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Rewrite & Preview
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>AI-Enhanced Preview</CardTitle>
            <CardDescription>
              Review the AI-enhanced version before publishing
            </CardDescription>
          </CardHeader>
          <CardContent>
            {rewriteResult ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Enhanced Title</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <h3 className="font-semibold text-lg">{rewriteResult.title}</h3>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Excerpt</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <p className="text-gray-700">{rewriteResult.excerpt}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Enhanced Content</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md max-h-96 overflow-y-auto">
                    <div className="prose prose-sm max-w-none">
                      {rewriteResult.content.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-3 text-gray-700">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Generated Slug</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <code className="text-sm text-blue-600">{rewriteResult.slug}</code>
                  </div>
                </div>

                <Button
                  onClick={handlePublish}
                  disabled={isPublishing || !formData.country || !formData.category}
                  className="w-full"
                >
                  {isPublishing ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Publish Story
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Eye className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>Click "Rewrite & Preview" to see the AI-enhanced version</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';

interface BundleAnalysis {
  totalSize: number;
  files: Array<{
    name: string;
    size: number;
    type: 'js' | 'css' | 'image' | 'font' | 'other';
    isUsed: boolean;
    unusedExports?: string[];
    duplicateCode?: number;
  }>;
  recommendations: string[];
}

interface MinificationResult {
  originalSize: number;
  minifiedSize: number;
  compressionRatio: number;
  errors: string[];
  warnings: string[];
}

export function usePerformanceOptimizer() {
  const [bundleAnalysis, setBundleAnalysis] = useState<BundleAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [minificationResults, setMinificationResults] = useState<MinificationResult[]>([]);

  const analyzeBundle = async () => {
    setIsAnalyzing(true);

    try {
      // Simulate bundle analysis
      const mockAnalysis: BundleAnalysis = {
        totalSize: 2457600, // 2.4MB
        files: [
          {
            name: 'main.js',
            size: 1024000,
            type: 'js',
            isUsed: true,
            unusedExports: ['unusedFunction1', 'unusedFunction2'],
            duplicateCode: 51200,
          },
          {
            name: 'vendor.js',
            size: 768000,
            type: 'js',
            isUsed: true,
            unusedExports: ['lodash.chunk', 'moment.locale'],
            duplicateCode: 25600,
          },
          {
            name: 'styles.css',
            size: 512000,
            type: 'css',
            isUsed: true,
            unusedExports: ['.unused-class', '.old-styles'],
          },
          {
            name: 'hero-image.jpg',
            size: 204800,
            type: 'image',
            isUsed: true,
          },
          {
            name: 'unused-component.js',
            size: 128000,
            type: 'js',
            isUsed: false,
            unusedExports: ['entireFile'],
          },
          {
            name: 'old-styles.css',
            size: 64000,
            type: 'css',
            isUsed: false,
          },
        ],
        recommendations: [
          'Remove unused JavaScript exports',
          'Eliminate duplicate code blocks',
          'Compress and optimize images',
          'Remove unused CSS rules',
          'Implement code splitting',
          'Use tree shaking for better bundle size',
        ],
      };

      setBundleAnalysis(mockAnalysis);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const minifyJavaScript = async (code: string): Promise<MinificationResult> => {
    // Simulate JavaScript minification
    const originalSize = new Blob([code]).size;
    const minifiedCode = code
      .replace(/\/\/.*$/gm, '') // Remove comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/;\s*}/g, '}') // Remove unnecessary semicolons
      .replace(/,\s*}/g, '}') // Remove trailing commas
      .replace(/\s*([{}()[\].,;:+=*/-])\s*/g, '$1'); // Remove whitespace around operators

    const minifiedSize = new Blob([minifiedCode]).size;
    const compressionRatio = ((originalSize - minifiedSize) / originalSize) * 100;

    return {
      originalSize,
      minifiedSize,
      compressionRatio,
      errors: [],
      warnings: compressionRatio < 10 ? ['Low compression ratio - code may already be optimized'] : [],
    };
  };

  const minifyCSS = async (css: string): Promise<MinificationResult> => {
    // Simulate CSS minification
    const originalSize = new Blob([css]).size;
    const minifiedCSS = css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/\s*([{}:;,>+~])\s*/g, '$1') // Remove whitespace around selectors and properties
      .replace(/;}/g, '}') // Remove unnecessary semicolons
      .replace(/,\s+/g, ',') // Remove whitespace after commas
      .replace(/:\s+/g, ':') // Remove whitespace after colons
      .replace(/;\s*}/g, '}'); // Remove last semicolon in blocks

    const minifiedSize = new Blob([minifiedCSS]).size;
    const compressionRatio = ((originalSize - minifiedSize) / originalSize) * 100;

    return {
      originalSize,
      minifiedSize,
      compressionRatio,
      errors: [],
      warnings: compressionRatio < 20 ? ['Low compression ratio - CSS may already be optimized'] : [],
    };
  };

  const removeUnusedCode = async () => {
    if (!bundleAnalysis) return;

    const unusedFiles = bundleAnalysis.files.filter(file => !file.isUsed);
    const totalUnusedSize = unusedFiles.reduce((sum, file) => sum + file.size, 0);

    // Simulate code removal
    const updatedFiles = bundleAnalysis.files.filter(file => file.isUsed);
    const updatedTotalSize = bundleAnalysis.totalSize - totalUnusedSize;

    setBundleAnalysis({
      ...bundleAnalysis,
      files: updatedFiles,
      totalSize: updatedTotalSize,
      recommendations: [
        ...bundleAnalysis.recommendations,
        `Removed ${unusedFiles.length} unused files`,
        `Saved ${formatBytes(totalUnusedSize)} of space`,
      ],
    });
  };

  const optimizeImages = async () => {
    if (!bundleAnalysis) return;

    const imageFiles = bundleAnalysis.files.filter(file => file.type === 'image');
    const totalImageSize = imageFiles.reduce((sum, file) => sum + file.size, 0);
    const optimizedSize = Math.round(totalImageSize * 0.6); // Simulate 40% reduction
    const savedSize = totalImageSize - optimizedSize;

    setBundleAnalysis(prev => prev ? {
      ...prev,
      totalSize: prev.totalSize - savedSize,
      recommendations: [
        ...prev.recommendations,
        `Optimized ${imageFiles.length} images`,
        `Saved ${formatBytes(savedSize)} with image compression`,
      ],
    } : null);
  };

  const implementTreeShaking = async () => {
    if (!bundleAnalysis) return;

    const jsFiles = bundleAnalysis.files.filter(file => file.type === 'js' && file.unusedExports);
    const totalUnusedExports = jsFiles.reduce((sum, file) => sum + (file.unusedExports?.length || 0), 0);
    const estimatedSavings = 128000; // Estimated savings from tree shaking

    setBundleAnalysis(prev => prev ? {
      ...prev,
      totalSize: prev.totalSize - estimatedSavings,
      recommendations: [
        ...prev.recommendations,
        `Removed ${totalUnusedExports} unused exports via tree shaking`,
        `Saved ${formatBytes(estimatedSavings)} with dead code elimination`,
      ],
    } : null);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return {
    bundleAnalysis,
    isAnalyzing,
    minificationResults,
    analyzeBundle,
    minifyJavaScript,
    minifyCSS,
    removeUnusedCode,
    optimizeImages,
    implementTreeShaking,
    formatBytes,
  };
}

interface PerformanceOptimizerProps {
  onOptimizationComplete?: (savings: number) => void;
}

export function PerformanceOptimizer({ onOptimizationComplete }: PerformanceOptimizerProps) {
  const {
    bundleAnalysis,
    isAnalyzing,
    analyzeBundle,
    removeUnusedCode,
    optimizeImages,
    implementTreeShaking,
    formatBytes,
  } = usePerformanceOptimizer();

  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);

  const runFullOptimization = async () => {
    if (!bundleAnalysis) {
      await analyzeBundle();
      return;
    }

    setOptimizationProgress(0);
    let savings = 0;

    // Remove unused code
    await removeUnusedCode();
    setOptimizationProgress(25);

    // Optimize images
    await optimizeImages();
    setOptimizationProgress(50);

    // Implement tree shaking
    await implementTreeShaking();
    setOptimizationProgress(75);

    // Final optimization
    setOptimizationProgress(100);

    const finalSavings = bundleAnalysis.totalSize;
    setTotalSavings(finalSavings);
    onOptimizationComplete?.(finalSavings);
  };

  const getOptimizationScore = () => {
    if (!bundleAnalysis) return 0;

    const maxSize = 1048576; // 1MB target
    const currentSize = bundleAnalysis.totalSize;
    const score = Math.max(0, 100 - ((currentSize - maxSize) / maxSize) * 100);

    return Math.round(score);
  };

  return (
    <div className="performance-optimizer bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Performance Optimizer</h3>
          <button
            onClick={runFullOptimization}
            disabled={isAnalyzing}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {isAnalyzing ? 'Optimizing...' : 'Run Optimization'}
          </button>
        </div>

        {isAnalyzing && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Optimizing bundle...</span>
              <span>{optimizationProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${optimizationProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {bundleAnalysis && (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-blue-600">{formatBytes(bundleAnalysis.totalSize)}</div>
              <div className="text-sm text-gray-600">Current Bundle Size</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-green-600">{getOptimizationScore()}/100</div>
              <div className="text-sm text-gray-600">Optimization Score</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-purple-600">{bundleAnalysis.files.length}</div>
              <div className="text-sm text-gray-600">Total Files</div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Bundle Analysis</h4>

            <div className="space-y-2">
              {bundleAnalysis.files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      file.isUsed ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <div className="font-medium">{file.name}</div>
                      <div className="text-sm text-gray-600">{file.type.toUpperCase()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatBytes(file.size)}</div>
                    {!file.isUsed && (
                      <div className="text-sm text-red-600">Unused</div>
                    )}
                    {file.unusedExports && file.unusedExports.length > 0 && (
                      <div className="text-sm text-orange-600">
                        {file.unusedExports.length} unused exports
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h4 className="font-medium mb-3">Optimization Recommendations</h4>
              <div className="space-y-2">
                {bundleAnalysis.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-2 p-2 bg-blue-50 rounded">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <div className="text-sm text-blue-800">{rec}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 rounded">
              <h4 className="font-medium text-green-800 mb-2">Quick Actions</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={removeUnusedCode}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                >
                  Remove Unused Code
                </button>
                <button
                  onClick={optimizeImages}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                >
                  Optimize Images
                </button>
                <button
                  onClick={implementTreeShaking}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                >
                  Tree Shaking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!bundleAnalysis && !isAnalyzing && (
        <div className="p-6 text-center">
          <p className="text-gray-600 mb-4">No bundle analysis available</p>
          <button
            onClick={analyzeBundle}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Analyze Bundle
          </button>
        </div>
      )}
    </div>
  );
}
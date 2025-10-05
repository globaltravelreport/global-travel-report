'use client';

import React, { useState, useEffect } from 'react';
import { getStoredWebVitalsMetrics, clearStoredWebVitalsMetrics } from '@/utils/web-vitals';
import { getStoredErrorLogs, clearStoredErrorLogs, ErrorSeverity } from '@/utils/error-logger';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// import { Separator } from '@/components/ui/separator';

/**
 * Performance Monitor Component
 * 
 * This component displays Web Vitals metrics and error logs for admin users.
 */
export function PerformanceMonitor() {
  const [webVitals, setWebVitals] = useState<any[]>([]);
  const [errorLogs, setErrorLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('web-vitals');

  // Load Web Vitals metrics and error logs on mount
  useEffect(() => {
    setWebVitals(getStoredWebVitalsMetrics());
    setErrorLogs(getStoredErrorLogs());
  }, []);

  // Handle clearing Web Vitals metrics
  const handleClearWebVitals = () => {
    clearStoredWebVitalsMetrics();
    setWebVitals([]);
  };

  // Handle clearing error logs
  const handleClearErrorLogs = () => {
    clearStoredErrorLogs();
    setErrorLogs([]);
  };

  // Get badge color for Web Vitals rating
  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'bg-green-500 hover:bg-green-600';
      case 'needs-improvement':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'poor':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  // Get badge color for error severity
  const getSeverityColor = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.INFO:
        return 'bg-blue-500 hover:bg-blue-600';
      case ErrorSeverity.WARNING:
        return 'bg-yellow-500 hover:bg-yellow-600';
      case ErrorSeverity.ERROR:
        return 'bg-red-500 hover:bg-red-600';
      case ErrorSeverity.CRITICAL:
        return 'bg-purple-500 hover:bg-purple-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Performance Monitoring</CardTitle>
          <CardDescription>
            Monitor Web Vitals metrics and error logs for your website.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="web-vitals">Web Vitals</TabsTrigger>
              <TabsTrigger value="error-logs">Error Logs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="web-vitals" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Web Vitals Metrics</h3>
                <Button variant="outline" size="sm" onClick={handleClearWebVitals}>
                  Clear Metrics
                </Button>
              </div>
              
              {webVitals.length === 0 ? (
                <p className="text-gray-500">No Web Vitals metrics recorded yet.</p>
              ) : (
                <div className="space-y-4">
                  {webVitals.map((metric, index) => (
                    <Card key={index}>
                      <CardHeader className="py-3">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">{metric.name}</CardTitle>
                          <Badge className={getRatingColor(metric.rating)}>
                            {metric.rating}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="py-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-semibold">Value:</span> {metric.value.toFixed(2)}
                          </div>
                          <div>
                            <span className="font-semibold">Delta:</span> {metric.delta.toFixed(2)}
                          </div>
                          <div>
                            <span className="font-semibold">URL:</span> {metric.url}
                          </div>
                          <div>
                            <span className="font-semibold">Timestamp:</span> {new Date(metric.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="error-logs" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Error Logs</h3>
                <Button variant="outline" size="sm" onClick={handleClearErrorLogs}>
                  Clear Logs
                </Button>
              </div>
              
              {errorLogs.length === 0 ? (
                <p className="text-gray-500">No error logs recorded yet.</p>
              ) : (
                <div className="space-y-4">
                  {errorLogs.map((log, index) => (
                    <Card key={index}>
                      <CardHeader className="py-3">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base truncate">{log.message}</CardTitle>
                          <Badge className={getSeverityColor(log.severity)}>
                            {log.severity}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="py-2">
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-semibold">URL:</span> {log.url}
                          </div>
                          <div>
                            <span className="font-semibold">Timestamp:</span> {new Date(log.timestamp).toLocaleString()}
                          </div>
                          {log.stack && (
                            <div>
                              <span className="font-semibold">Stack:</span>
                              <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                                {log.stack}
                              </pre>
                            </div>
                          )}
                          {log.componentStack && (
                            <div>
                              <span className="font-semibold">Component Stack:</span>
                              <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                                {log.componentStack}
                              </pre>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="text-sm text-gray-500">
          Data is stored locally in your browser and is not sent to any server.
        </CardFooter>
      </Card>
    </div>
  );
}

export default PerformanceMonitor;

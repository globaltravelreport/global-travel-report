'use client';

import { useState, useEffect } from 'react';
import { UserSubmission } from '@/types/UserSubmission';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface SubmissionWithActions extends UserSubmission {
  canApprove: boolean;
  canReject: boolean;
}

export function SubmissionsManagementClient() {
  const [submissions, setSubmissions] = useState<SubmissionWithActions[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<UserSubmission | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/submissions');
      const data = await response.json();

      if (data.success) {
        const submissionsWithActions = data.submissions.map((submission: UserSubmission) => ({
          ...submission,
          canApprove: submission.status === 'pending',
          canReject: submission.status === 'pending',
        }));
        setSubmissions(submissionsWithActions);
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submissionId: string) => {
    try {
      setActionLoading(submissionId);
      const response = await fetch(`/api/submissions/${submissionId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        await loadSubmissions(); // Reload the list
      } else {
        console.error('Failed to approve submission');
      }
    } catch (error) {
      console.error('Error approving submission:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (submissionId: string, reason: string) => {
    try {
      setActionLoading(submissionId);
      const response = await fetch(`/api/submissions/${submissionId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        await loadSubmissions(); // Reload the list
        setSelectedSubmission(null);
        setRejectionReason('');
      } else {
        console.error('Failed to reject submission');
      }
    } catch (error) {
      console.error('Error rejecting submission:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'default',
      approved: 'secondary',
      rejected: 'destructive',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A14A]"></div>
        <span className="ml-3 text-gray-600">Loading submissions...</span>
      </div>
    );
  }

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const approvedSubmissions = submissions.filter(s => s.status === 'approved');
  const rejectedSubmissions = submissions.filter(s => s.status === 'rejected');

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingSubmissions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedSubmissions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedSubmissions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            Pending ({pendingSubmissions.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedSubmissions.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedSubmissions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No pending submissions</p>
            </div>
          ) : (
            pendingSubmissions.map((submission) => (
              <Card key={submission.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{submission.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        By {submission.name} ({submission.email}) • {formatDate(submission.createdAt)}
                      </p>
                    </div>
                    {getStatusBadge(submission.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Story Content</h4>
                      <div className="bg-gray-50 p-4 rounded-lg max-h-48 overflow-y-auto">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{submission.content}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Category:</span> {submission.category}
                      </div>
                      <div>
                        <span className="font-medium">Country:</span> {submission.country}
                      </div>
                      <div>
                        <span className="font-medium">Tags:</span> {submission.tags.join(', ')}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleApprove(submission.id)}
                        disabled={actionLoading === submission.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {actionLoading === submission.id ? 'Approving...' : 'Approve & Publish'}
                      </Button>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="bg-red-600 hover:bg-red-700 text-white">Reject</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reject Submission</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="rejection-reason">Reason for Rejection</Label>
                              <Textarea
                                id="rejection-reason"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Please provide a reason for rejecting this submission..."
                                rows={3}
                              />
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => handleReject(submission.id, rejectionReason)}
                                disabled={!rejectionReason.trim()}
                              >
                                Confirm Rejection
                              </Button>
                              <Button variant="outline" onClick={() => setRejectionReason('')}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedSubmissions.map((submission) => (
            <Card key={submission.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{submission.title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      By {submission.name} • Approved {submission.reviewedAt ? formatDate(submission.reviewedAt) : 'Unknown'}
                    </p>
                  </div>
                  {getStatusBadge(submission.status)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">
                  {submission.approvedStoryId ? (
                    <>✅ Published as story</>
                  ) : (
                    <>⏳ Approval processed</>
                  )}
                </p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedSubmissions.map((submission) => (
            <Card key={submission.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{submission.title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      By {submission.name} • Rejected {submission.reviewedAt ? formatDate(submission.reviewedAt) : 'Unknown'}
                    </p>
                  </div>
                  {getStatusBadge(submission.status)}
                </div>
              </CardHeader>
              <CardContent>
                {submission.rejectionReason && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Reason for Rejection:</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{submission.rejectionReason}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
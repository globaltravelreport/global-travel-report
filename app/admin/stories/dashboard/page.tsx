import { Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { StoryProcessingStats } from '@/components/admin/StoryProcessingStats'
import { StoryValidationLog } from '@/components/admin/StoryValidationLog'
import { StoryPublishingSchedule } from '@/components/admin/StoryPublishingSchedule'

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Story Dashboard</h1>
      <div className="space-y-8">
        <Suspense fallback={<LoadingCard>Loading processing stats...</LoadingCard>}>
          <StoryProcessingStats />
        </Suspense>

        <Suspense fallback={<LoadingCard>Loading validation log...</LoadingCard>}>
          <StoryValidationLog />
        </Suspense>

        <Suspense fallback={<LoadingCard>Loading publishing schedule...</LoadingCard>}>
          <StoryPublishingSchedule />
        </Suspense>
      </div>
    </div>
  )
}

function LoadingCard({ children }: { children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-gray-600">{children}</p>
      </CardContent>
    </Card>
  )
} 
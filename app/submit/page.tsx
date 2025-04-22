import StoryForm from '../components/StoryForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Submit a Story - Global Travel Report',
  description: 'Share your travel experiences with the world. Submit your story to Global Travel Report.'
}

export default function SubmitPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Submit a Story
        </h1>
        <p className="mt-3 text-xl text-gray-500 sm:mt-4">
          Share your travel experiences with the world
        </p>
      </div>
      <div className="mt-12">
        <StoryForm />
      </div>
    </div>
  )
} 
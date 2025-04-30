import { StoryForm } from "@/components/stories/StoryForm";

export const metadata = {
  title: "Submit Your Story - Global Travel Report",
  description: "Share your travel experiences with the world",
};

export default function SubmitPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Share Your Travel Story</h1>
        <p className="text-gray-600">
          Tell us about your adventures, discoveries, and experiences from around the world.
        </p>
      </div>

      <StoryForm />
    </div>
  );
} 
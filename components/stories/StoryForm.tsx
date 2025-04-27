"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

interface StoryFormProps {
  onSubmit: (data: {
    title: string;
    content: string;
    location: string;
    date: string;
  }) => void;
}

export function StoryForm({ onSubmit }: StoryFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    location: "",
    date: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Story Title</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter your story title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Where did this story take place?"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Your Story</Label>
          <Textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Share your travel story..."
            className="min-h-[200px]"
            required
          />
        </div>

        <Button type="submit" className="w-full">
          Share Your Story
        </Button>
      </form>
    </Card>
  );
} 
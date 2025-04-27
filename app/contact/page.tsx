import { ContactForm } from "@/components/ContactForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - Global Travel Report",
  description: "Get in touch with our team. We'd love to hear from you about your travel stories, suggestions, or any questions you might have.",
  openGraph: {
    title: "Contact Us - Global Travel Report",
    description: "Get in touch with our team. We'd love to hear from you about your travel stories, suggestions, or any questions you might have.",
  },
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Contact Us</h1>
      <ContactForm />
    </div>
  );
} 
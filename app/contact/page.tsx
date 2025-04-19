import PageLayout from '../components/PageLayout'
import ContactForm from '../components/ContactForm'

export default function ContactPage() {
  return (
    <PageLayout
      title="Contact Us"
      description="Get in touch with our team for inquiries, collaborations, or feedback."
      heroType="contact"
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ContactForm />
      </div>
    </PageLayout>
  )
} 
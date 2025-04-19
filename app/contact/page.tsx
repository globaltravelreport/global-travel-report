import ContactForm from '../components/ContactForm'
import PageLayout from '../components/PageLayout'

export default function ContactPage() {
  return (
    <PageLayout
      title="Contact Us"
      description="Get in touch with us. We'd love to hear from you!"
      heroImage="/images/contact-hero.jpg"
    >
      <div className="py-12">
        <ContactForm />
      </div>
    </PageLayout>
  )
} 
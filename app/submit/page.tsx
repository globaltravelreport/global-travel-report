import { Metadata } from 'next'
import SubmitFormClient from './SubmitFormClient'

export const metadata: Metadata = {
  title: 'Submit a Story - Global Travel Report',
  description: 'Submit your travel story to Global Travel Report.'
}

export default function SubmitPage() {
  return <SubmitFormClient />
} 
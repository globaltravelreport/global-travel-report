import { redirect } from 'next/navigation';

export default function StoriesPage() {
  // Redirect to the categories page
  redirect('/categories');
}

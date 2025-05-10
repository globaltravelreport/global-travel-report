import { redirect } from 'next/navigation';

export default function CategoryIndexPage() {
  // Redirect to the new categories page
  redirect('/categories');
}

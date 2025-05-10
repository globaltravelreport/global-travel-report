import { redirect } from 'next/navigation';

export default function CategoriesPage() {
  // Redirect to the main categories page
  redirect('/category-index');
}

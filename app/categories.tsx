import { redirect } from 'next/navigation';

export default function CategoriesRedirect() {
  redirect('/categories');
  return null;
}

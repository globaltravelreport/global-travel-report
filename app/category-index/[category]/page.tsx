import { redirect } from 'next/navigation';
import { normalizeCategorySlug } from '@/src/config/categories';

type CategoryPageProps = {
  params: Promise<{
    category: string;
  }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;

  // Redirect to the new categories page
  redirect(`/categories/${normalizeCategorySlug(category)}`);
}

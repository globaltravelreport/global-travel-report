import { redirect } from 'next/navigation';
import { normalizeCategorySlug } from '@/src/config/categories';

type CategoryPageProps = {
  params: {
    category: string;
  };
};

export default function CategoryPage({ params }: CategoryPageProps) {
  const { category } = params;

  // Redirect to the new categories page
  redirect(`/categories/${normalizeCategorySlug(category)}`);
}

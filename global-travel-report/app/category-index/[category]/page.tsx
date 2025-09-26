import { redirect } from 'next/navigation';

type CategoryPageProps = {
  params: {
    category: string;
  };
};

export default function CategoryPage({ params }: CategoryPageProps) {
  const { category } = params;

  // Redirect to the new categories page
  redirect(`/categories/${category}`);
}

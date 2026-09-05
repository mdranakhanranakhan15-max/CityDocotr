export const dynamic = 'force-dynamic';
export const revalidate = 0;

import CategoryPage from './category-client';

interface PageProps {
  params: { category: string };
}

export default function Page({ params }: PageProps) {
  return <CategoryPage params={params} />;
}

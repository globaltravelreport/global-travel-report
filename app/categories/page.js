export default function CategoriesPage() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Redirecting to Categories...</h1>
      <p>If you are not redirected automatically, please <a href="/category-index" className="text-blue-600 hover:underline">click here</a>.</p>
      <script dangerouslySetInnerHTML={{ __html: `window.location.href = "/category-index";` }} />
    </div>
  );
}

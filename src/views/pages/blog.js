import BlogTable from "../components/blog.js";

export default function BlogPage() {
  const mockPosts = [
    { id: 1, title: "First Post", author: "John Doe", date: "2025-08-10" },
    { id: 2, title: "Second Post", author: "Jane Smith", date: "2025-08-12" },
    { id: 3, title: "Third Post", author: "Alex Ray", date: "2025-08-14" }
  ];

  return {
    title: "Blog",
    content: `
      <section class="max-w-5xl mx-auto py-12 px-6">
        <h1 class="text-3xl font-bold mb-6">Blog Posts</h1>
        ${BlogTable({ posts: mockPosts })}
        <div class="mt-8 flex gap-4">
          <a href="/" class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Back Home</a>
        </div>
      </section>
    `
  };
}

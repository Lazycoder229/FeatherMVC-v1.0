// components/blog.js
export default function BlogTable({ posts }) {
  return `
    <div class="overflow-x-auto">
      <table class="min-w-full border border-gray-300 shadow rounded-lg overflow-hidden">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-6 py-3 border-b text-left text-gray-700 font-semibold">ID</th>
            <th class="px-6 py-3 border-b text-left text-gray-700 font-semibold">Title</th>
            <th class="px-6 py-3 border-b text-left text-gray-700 font-semibold">Author</th>
            <th class="px-6 py-3 border-b text-left text-gray-700 font-semibold">Date</th>
          </tr>
        </thead>
        <tbody>
          ${posts
            .map(
              post => `
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-3 border-b">${post.id}</td>
                <td class="px-6 py-3 border-b">${post.title}</td>
                <td class="px-6 py-3 border-b">${post.author}</td>
                <td class="px-6 py-3 border-b">${post.date}</td>
              </tr>
            `
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;
}

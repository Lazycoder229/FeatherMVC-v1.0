export default function FeatureCard({ title, description }) {
  return `
    <div class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition transform hover:-translate-y-1 text-center">
      <h3 class="text-xl font-bold text-gray-800 mb-2">${title}</h3>
      <p class="text-gray-600">${description}</p>
    </div>
  `;
}

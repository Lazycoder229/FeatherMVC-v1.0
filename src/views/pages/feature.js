import FeatureCard from "../components/FeatureCard.js";

export default function HomePage() {
  return {
    title: "Home",
    content: `
     <section class="max-w-5xl mx-auto py-12 px-6">
  <h1 class="text-4xl font-bold text-center mb-8">Our Features</h1>
  
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    ${FeatureCard({ title: "⚡ Fast", description: "Optimized for blazing speed with minimal overhead." })}
    ${FeatureCard({ title: "🪶 Lightweight", description: "Small footprint, easy to integrate, and efficient." })}
    ${FeatureCard({ title: "🎯 Easy-to-Use", description: "Minimal learning curve with clean, readable code." })}
  </div>

  <div class="mt-8 flex justify-center gap-4">
    <a href="/" class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Back Home</a>
    <a href="/blog" class="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">Go to Posts</a>
  </div>
</section>

    `
  };
}

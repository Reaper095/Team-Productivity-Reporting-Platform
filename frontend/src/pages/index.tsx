export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-4xl md:text-5xl font-bold text-blue-600 mb-4">
        🚀 Welcome to the Team Productivity App
      </h1>
      <p className="text-lg text-gray-700 text-center max-w-xl">
        Track your team’s velocity, bug rates, resolution times, and more — all in one powerful dashboard.
      </p>
      <div className="mt-6">
        <a
          href="/dashboard"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Go to Dashboard
        </a>
      </div>
    </main>
  );
}

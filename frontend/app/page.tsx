import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-20">
        {/* Hero */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            ORBIT
          </h1>
          <p className="text-2xl text-slate-700 mb-4">
            AI-Powered Team & Project Operations
          </p>
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
            Manage projects, tasks, teams, and communication in one place.
            Intelligent insights to keep your projects on track.
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition shadow-lg"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 rounded-lg bg-white text-slate-700 font-medium border border-slate-300 hover:bg-slate-50 transition shadow-lg"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto">
          <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Project Management
            </h3>
            <p className="text-sm text-slate-600">
              Organize projects with Kanban boards, tasks, and real-time
              tracking.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Real-time Chat
            </h3>
            <p className="text-sm text-slate-600">
              Collaborate with your team in real-time with instant messaging.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              AI Insights
            </h3>
            <p className="text-sm text-slate-600">
              Detect risks, analyze progress, and get smart recommendations.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
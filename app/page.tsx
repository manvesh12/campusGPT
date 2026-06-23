import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between p-6 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="text-2xl font-bold text-blue-600">StudySathi AI</div>
        <nav className="flex gap-4">
          <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2">Login</Link>
          <Link href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition">Sign Up</Link>
        </nav>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-blue-50 to-white">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 max-w-4xl tracking-tight">
          Turn class notes into exam confidence.
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl">
          Upload a PDF. Get Hinglish summaries, MCQs, important questions, and instant doubt help. Start studying smarter, not harder.
        </p>
        <Link href="/signup" className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-blue-700 hover:shadow-lg transition-all transform hover:-translate-y-1">
          Join the Beta
        </Link>
        
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl text-left">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-blue-600 text-2xl font-bold mb-4">01</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Upload your PDF</h3>
            <p className="text-gray-600">Select any text-based class note PDF (up to 10MB) and let StudySathi process it securely.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-blue-600 text-2xl font-bold mb-4">02</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Generate Study Tools</h3>
            <p className="text-gray-600">Instantly get Hinglish summaries, likely exam questions, and MCQs to test your knowledge.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-blue-600 text-2xl font-bold mb-4">03</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Chat with Notes</h3>
            <p className="text-gray-600">Ask any doubt in Hinglish and get precise answers with source page numbers from your PDF.</p>
          </div>
        </div>
      </main>

      <footer className="p-8 text-center text-gray-500 border-t border-gray-100 mt-auto bg-white">
        <p>© 2026 StudySathi AI. We respect your privacy.</p>
      </footer>
    </div>
  );
}

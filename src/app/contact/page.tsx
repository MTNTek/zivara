export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Contact Us</h1>
        <p className="text-gray-600 mb-8">
          Have a question or need help? We&apos;re here for you. Fill out the form below and our team will get back to you within 24 hours.
        </p>
        <form className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" id="name" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" id="email" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input type="text" id="subject" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea id="message" rows={5} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <button type="submit" className="bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors">
            Send Message
          </button>
        </form>
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="p-4">
            <div className="text-2xl mb-2">📧</div>
            <p className="font-medium text-gray-900">Email</p>
            <p className="text-sm text-gray-500">support@zivara.com</p>
          </div>
          <div className="p-4">
            <div className="text-2xl mb-2">📞</div>
            <p className="font-medium text-gray-900">Phone</p>
            <p className="text-sm text-gray-500">1-800-ZIVARA</p>
          </div>
          <div className="p-4">
            <div className="text-2xl mb-2">💬</div>
            <p className="font-medium text-gray-900">Live Chat</p>
            <p className="text-sm text-gray-500">Available 24/7</p>
          </div>
        </div>
      </div>
    </div>
  );
}

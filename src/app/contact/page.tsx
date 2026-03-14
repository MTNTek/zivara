import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us - Zivara',
  description: 'Get in touch with the Zivara team for support, questions, or feedback.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Contact Us</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Customer Support</h2>
            <p className="text-gray-600 mb-4">Need help with an order or have a question about a product?</p>
            <p className="text-sm text-gray-700">Email: support@zivara.com</p>
            <p className="text-sm text-gray-700">Hours: Mon-Fri, 9am-6pm EST</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">General Inquiries</h2>
            <p className="text-gray-600 mb-4">For partnerships, press, or other inquiries.</p>
            <p className="text-sm text-gray-700">Email: hello@zivara.com</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Send us a message</h2>
          <form className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" id="name" name="name" required
                  className="w-full px-4 py-3 min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F52BA] text-base" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" id="email" name="email" required
                  className="w-full px-4 py-3 min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F52BA] text-base" />
              </div>
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input type="text" id="subject" name="subject" required
                className="w-full px-4 py-3 min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F52BA] text-base" />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea id="message" name="message" rows={5} required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F52BA] text-base resize-y" />
            </div>
            <button type="submit" disabled
              className="bg-blue-800 text-white px-6 py-3 min-h-[44px] rounded-lg font-semibold hover:bg-blue-900 transition-colors disabled:opacity-50">
              Send Message
            </button>
            <p className="text-xs text-gray-500">Contact form is currently for display purposes. Please email us directly.</p>
          </form>
        </div>
      </div>
    </div>
  );
}

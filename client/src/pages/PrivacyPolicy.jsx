export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="space-y-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. What Data We Access</h2>
            <p className="mb-4">
              Job Tracker accesses the following information to provide our service:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Email Address</strong> - Your Google account email address for authentication and identification</li>
              <li><strong>Gmail Read-Only Access</strong> - We read your job-related emails to help you track job applications and opportunities</li>
              <li><strong>Email Metadata</strong> - Subject lines, sender information, and timestamps to organize and analyze your emails</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Why We Access This Data</h2>
            <p>
              We access your Gmail data solely to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Identify job application emails automatically</li>
              <li>Track your job search progress</li>
              <li>Provide analytics and insights about your applications</li>
              <li>Help you manage your job search timeline</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Data Security & Storage</h2>
            <p>
              All your data is stored securely in encrypted MongoDB databases. We only access your emails to provide the service and do not retain copies of your emails longer than necessary.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. We Do Not Sell Your Data</h2>
            <p>
              We <strong>never</strong> sell, trade, or share your personal information with third parties. Your data is yours alone.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Your Rights</h2>
            <p>
              You can:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Revoke Gmail access at any time through Google account settings</li>
              <li>Request deletion of your data</li>
              <li>Export your stored data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Contact Us</h2>
            <p>
              If you have questions about our privacy practices, please contact us:
            </p>
            <p className="mt-4 font-semibold">
              Email: <a href="mailto:mr.aadarshkumarsingh@gmail.com" className="text-blue-600 hover:underline">
                mr.aadarshkumarsingh@gmail.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.
            </p>
          </section>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Last updated: January 13, 2026
          </p>
        </div>
      </div>
    </div>
  );
}

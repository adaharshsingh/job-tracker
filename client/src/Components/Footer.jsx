export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-white font-semibold mb-4">Job Tracker</h3>
            <p className="text-sm">
              Track your job applications and opportunities with ease.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/privacy" className="hover:text-white transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-white transition">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <p className="text-sm">
              <a href="mailto:mr.aadarshkumarsingh@gmail.com" className="hover:text-white transition">
                mr.aadarshkumarsingh@gmail.com
              </a>
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8">
          <p className="text-sm text-center">
            &copy; {new Date().getFullYear()} Job Tracker. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

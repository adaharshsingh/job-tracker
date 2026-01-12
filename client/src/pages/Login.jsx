import { useEffect } from "react";
import api from "../api/client";
import { Mail, BarChart3, Clock, Search, Shield, Zap } from "lucide-react";

function Login() {
  // Redirect if already logged in
  useEffect(() => {
    let mounted = true;

    api.get("/me")
      .then(res => {
        if (mounted && res.data) {
          window.location.replace("/dashboard");
        }
      })
      .catch(() => {
        // user not logged in → do nothing
      });

    return () => {
      mounted = false;
    };
  }, []);

  const login = () => {
    const BACKEND_URL =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

    window.location.href = `${BACKEND_URL}/auth/google`;
  };

  const features = [
    {
      icon: Mail,
      title: "Auto-Track Applications",
      description: "Automatically identifies job application emails from your Gmail inbox"
    },
    {
      icon: BarChart3,
      title: "Smart Analytics",
      description: "See your application statistics, success rates, and trends at a glance"
    },
    {
      icon: Clock,
      title: "Timeline View",
      description: "Track every stage of your job search journey with timestamps"
    },
    {
      icon: Search,
      title: "Company Insights",
      description: "Organize and review job opportunities by company and position"
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your data is encrypted and secure. We never sell your information"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Real-time sync with your Gmail for instant updates"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto px-4 py-16 sm:py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-4">
            Job Tracker
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Your personal job search assistant. Track applications, analyze progress, and land your next opportunity.
          </p>
          <p className="text-gray-500 mb-12">
            Connect your Gmail to get started in seconds
          </p>

          {/* CTA Button */}
          <button
            onClick={login}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          What You Can Do
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white mt-16">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Sign In with Google
              </h3>
              <p className="text-gray-600">
                Connect your Google account safely and securely with OAuth 2.0
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                We Sync Your Gmail
              </h3>
              <p className="text-gray-600">
                We read your emails to find job applications automatically
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Analyze & Track
              </h3>
              <p className="text-gray-600">
                View insights, analytics, and manage your entire job search
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Transparency */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="bg-blue-50 rounded-lg p-8 border border-blue-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🔒 Your Privacy Matters
          </h2>
          <ul className="space-y-3 text-gray-700 mb-6">
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold mt-1">✓</span>
              <span><strong>Read-only access:</strong> We can only read your emails, never modify or delete them</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold mt-1">✓</span>
              <span><strong>Data encrypted:</strong> All your information is securely encrypted in transit and at rest</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold mt-1">✓</span>
              <span><strong>We don't sell data:</strong> Your data is yours alone. We never sell or share it with third parties</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold mt-1">✓</span>
              <span><strong>Revoke anytime:</strong> Disconnect from your Google account at any time through your account settings</span>
            </li>
          </ul>
          <div className="flex gap-4 text-sm">
            <a href="/privacy" className="text-blue-600 hover:underline font-medium">
              Privacy Policy
            </a>
            <span className="text-gray-400">•</span>
            <a href="/terms" className="text-blue-600 hover:underline font-medium">
              Terms of Service
            </a>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white mt-12">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Common Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Is my Gmail safe?
              </h3>
              <p className="text-gray-600 text-sm">
                Yes. We only request read-only access to job-related emails. Your emails are never stored on our servers, and you can revoke access anytime through Google Security settings.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                What emails do you read?
              </h3>
              <p className="text-gray-600 text-sm">
                We identify emails from companies, recruiters, and job boards. We use intelligent filters to find job applications, offers, and rejections.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Do you store my emails?
              </h3>
              <p className="text-gray-600 text-sm">
                No. We only extract metadata (subject, sender, date) to help you track your applications. The original emails stay in your Gmail inbox.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                How much does it cost?
              </h3>
              <p className="text-gray-600 text-sm">
                Job Tracker is free to use. No credit card required. Just sign in with your Google account and start tracking.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Master Your Job Search?
          </h2>
          <p className="text-blue-100 mb-8">
            Join hundreds of job seekers tracking their applications with confidence.
          </p>
          <button
            onClick={login}
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-blue-600 font-semibold py-3 px-8 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Get Started Free
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
import { useState } from "react";
import {
  FileText,
  Upload,
  Download,
  Folder,
  Search,
  Shield,
  ArrowRight,
} from "lucide-react";

export default function Homepage() {
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const features = [
    {
      icon: <FileText size={24} />,
      title: "Document Management",
      description:
        "Store and organize all your important documents in one place",
    },
    {
      icon: <Upload size={24} />,
      title: "Easy Upload",
      description: "Drag and drop files or use our quick upload tool",
    },
    {
      icon: <Download size={24} />,
      title: "Fast Download",
      description: "Access your files anytime, anywhere with quick downloads",
    },

    {
      icon: <Shield size={24} />,
      title: "Secure Storage",
      description: "Your files are protected with enterprise-grade security",
    },
    {
      icon: <Folder size={24} className="text-gray-800" />,
      title: "Folder Organization",
      description: "Create folders and subfolders to keep everything organized",
      style: "opacity-50 cursor-not-allowed", // Faint, disabled style
      soon: true,
    },
    {
      icon: <Search size={24} className="text-gray-800" />,
      title: "Smart Search",
      description: "Find any file instantly with our powerful search tools",
      style: "opacity-50 cursor-not-allowed",
      soon: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Folder className="text-blue-600 mr-2" size={28} />
            <h1 className="text-xl font-bold text-gray-800">FileVault</h1>
          </div>
          <div className="space-x-3">
            <button
              onClick={() => (window.location.href = "/login")}
              className="px-4 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition"
            >
              Login
            </button>
            <button
              onClick={() => (window.location.href = "/signup")}
              className="px-4 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg transition"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-10 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Manage your files with ease and security
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Store, organize, and access your important documents from anywhere.
            Our secure platform keeps your data protected while making file
            management simple.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition flex items-center justify-center">
              Get Started <ArrowRight size={18} className="ml-2" />
            </button>
            <button className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition">
              Learn More
            </button>
          </div>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-0 bg-blue-600 rounded-lg transform rotate-3"></div>
            <div className="relative bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Folder className="text-blue-600 mr-2" size={18} />
                  <span className="font-medium">My Files</span>
                </div>
                <Search size={18} className="text-gray-500" />
              </div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="flex items-center p-2 hover:bg-gray-50 rounded"
                  >
                    <FileText size={16} className="text-gray-500 mr-3" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Document-{item}.pdf</p>
                      <p className="text-xs text-gray-500">
                        Added May {item + 10}, 2025
                      </p>
                    </div>
                    <Download
                      size={16}
                      className="text-gray-400 hover:text-blue-600"
                    />
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition">
                View All Files
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything you need for file management
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition"
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div
                  className={`w-12 h-12 flex items-center justify-center rounded-full mb-4 ${
                    hoveredFeature === index
                      ? "bg-blue-600 text-white"
                      : "bg-blue-100 text-blue-600"
                  } transition-colors`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to start managing your files better?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied users who have simplified their document
            management process with our secure platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition">
              Sign Up Now
            </button>
            <button className="px-6 py-3 border border-blue-300 text-white font-medium rounded-lg hover:bg-blue-700 transition">
              View Pricing
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between mb-8">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center mb-4">
                <Folder className="text-blue-400 mr-2" size={24} />
                <h2 className="text-xl font-bold text-white">FileVault</h2>
              </div>
              <p className="text-sm text-gray-400 max-w-xs">
                Secure file management made simple. Store, organize and access
                your files from anywhere.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-white font-medium mb-4">Product</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#" className="hover:text-blue-400 transition">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-blue-400 transition">
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-blue-400 transition">
                      Security
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-blue-400 transition">
                      Enterprise
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-medium mb-4">Company</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#" className="hover:text-blue-400 transition">
                      About
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-blue-400 transition">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-blue-400 transition">
                      Careers
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-blue-400 transition">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-medium mb-4">Resources</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#" className="hover:text-blue-400 transition">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-blue-400 transition">
                      Documentation
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-blue-400 transition">
                      API
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-blue-400 transition">
                      Community
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-700 text-sm text-center text-gray-400">
            <p>© 2025 FileVault. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

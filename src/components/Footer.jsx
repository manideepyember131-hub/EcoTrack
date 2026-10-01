import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#10251c] text-white mt-16">

      <div className="max-w-7xl mx-auto px-6 py-12">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">

              <span className="material-symbols-outlined text-green-400 text-3xl">
                recycling
              </span>

              <h2 className="text-2xl font-bold">
                EcoTrack
              </h2>

            </div>

            <p className="text-gray-300 text-sm leading-6">
              A civic environmental platform that connects citizens,
              workers and communities to create cleaner and greener
              surroundings.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">
              Quick Links
            </h3>

            <div className="flex flex-col gap-3 text-gray-300">

              <Link to="/" className="hover:text-green-400">
                Home
              </Link>

              <Link to="/about" className="hover:text-green-400">
                About
              </Link>

              <Link to="/features" className="hover:text-green-400">
                Features
              </Link>

              <Link to="/services" className="hover:text-green-400">
                Services
              </Link>

            </div>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-bold text-lg mb-4">
              Community
            </h3>

            <div className="flex flex-col gap-3 text-gray-300">

              <Link to="/gallery" className="hover:text-green-400">
                Gallery
              </Link>

              <Link to="/careers" className="hover:text-green-400">
                Careers
              </Link>

              <Link to="/contact" className="hover:text-green-400">
                Contact Us
              </Link>

            </div>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-bold text-lg mb-4">
              Account
            </h3>

            <div className="flex flex-col gap-3 text-gray-300">

              <Link to="/login" className="hover:text-green-400">
                Login
              </Link>

              <Link to="/register" className="hover:text-green-400">
                Register
              </Link>

            </div>
          </div>

        </div>

        <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} EcoTrack. All rights reserved.
        </div>

      </div>

    </footer>
  );
};

export default Footer;
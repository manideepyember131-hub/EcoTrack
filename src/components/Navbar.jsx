import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">

        {/* Top Navbar */}
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-green-700 text-3xl">
              recycling
            </span>

            <span className="text-2xl font-bold text-green-700">
              EcoTrack
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">

            <Link
              to="/"
              className="text-gray-700 hover:text-green-700 font-medium"
            >
              Home
            </Link>

            <Link
              to="/about"
              className="text-gray-700 hover:text-green-700 font-medium"
            >
              About
            </Link>

            <Link
              to="/features"
              className="text-gray-700 hover:text-green-700 font-medium"
            >
              Features
            </Link>

            <Link
              to="/services"
              className="text-gray-700 hover:text-green-700 font-medium"
            >
              Services
            </Link>

            <Link
              to="/gallery"
              className="text-gray-700 hover:text-green-700 font-medium"
            >
              Gallery
            </Link>

            <Link
              to="/careers"
              className="text-gray-700 hover:text-green-700 font-medium"
            >
              Careers
            </Link>

            <Link
              to="/contact"
              className="text-gray-700 hover:text-green-700 font-medium"
            >
              Contact
            </Link>

          </div>

          {/* Desktop Login / Register */}
          <div className="hidden md:flex items-center gap-3">

            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 text-green-700 font-semibold hover:bg-green-50 rounded-lg"
            >
              Login
            </button>

            <button
              onClick={() => navigate("/register")}
              className="px-4 py-2 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800"
            >
              Register
            </button>

          </div>

          {/* Mobile Login / Register / Hamburger */}
          <div className="md:hidden flex items-center gap-2">

            {/* Login */}
            <button
              onClick={() => navigate("/login")}
              className="px-2 py-2 text-sm text-green-700 font-semibold rounded-lg hover:bg-green-50"
            >
              Login
            </button>

            {/* Register */}
            <button
              onClick={() => navigate("/register")}
              className="px-3 py-2 text-sm bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800"
            >
              Register
            </button>

            {/* Hamburger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-green-700 hover:bg-green-50"
              aria-label="Toggle navigation menu"
              aria-expanded={isMenuOpen}
            >
              <span className="material-symbols-outlined text-3xl">
                {isMenuOpen ? "close" : "menu"}
              </span>
            </button>

          </div>

        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 border-t border-gray-200 pt-4">

            <div className="flex flex-col gap-1">

              {/* Home */}
              <Link
                to="/"
                onClick={closeMenu}
                className="px-4 py-3 rounded-lg text-gray-700 font-medium hover:bg-green-50 hover:text-green-700"
              >
                Home
              </Link>

              {/* About */}
              <Link
                to="/about"
                onClick={closeMenu}
                className="px-4 py-3 rounded-lg text-gray-700 font-medium hover:bg-green-50 hover:text-green-700"
              >
                About
              </Link>

              {/* Features */}
              <Link
                to="/features"
                onClick={closeMenu}
                className="px-4 py-3 rounded-lg text-gray-700 font-medium hover:bg-green-50 hover:text-green-700"
              >
                Features
              </Link>

              {/* Services */}
              <Link
                to="/services"
                onClick={closeMenu}
                className="px-4 py-3 rounded-lg text-gray-700 font-medium hover:bg-green-50 hover:text-green-700"
              >
                Services
              </Link>

              {/* Gallery */}
              <Link
                to="/gallery"
                onClick={closeMenu}
                className="px-4 py-3 rounded-lg text-gray-700 font-medium hover:bg-green-50 hover:text-green-700"
              >
                Gallery
              </Link>

              {/* Careers */}
              <Link
                to="/careers"
                onClick={closeMenu}
                className="px-4 py-3 rounded-lg text-gray-700 font-medium hover:bg-green-50 hover:text-green-700"
              >
                Careers
              </Link>

              {/* Contact */}
              <Link
                to="/contact"
                onClick={closeMenu}
                className="px-4 py-3 rounded-lg text-gray-700 font-medium hover:bg-green-50 hover:text-green-700"
              >
                Contact
              </Link>

            </div>

          </div>
        )}

      </div>

    </nav>
  );
};

export default Navbar;
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const About = () => {
  return (
    <div className="min-h-screen">

      <Navbar />

      {/* PAGE HEADER */}
      <section
        className="relative bg-cover bg-center py-28"
        style={{
          backgroundImage: "url('/images/about-bg.png')",
        }}
      >

        <div className="absolute inset-0 bg-black/60"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">

          <p className="text-green-300 font-bold tracking-widest">
            ABOUT ECOTRACK
          </p>

          <h1 className="text-4xl md:text-6xl font-bold text-white mt-4">
            Creating Cleaner Communities
          </h1>

          <p className="max-w-2xl mx-auto text-white/90 mt-6 text-lg leading-8">
            EcoTrack brings citizens, environmental workers and
            communities together through technology.
          </p>

        </div>
      </section>


      {/* ABOUT CONTENT */}
      <section
        className="relative bg-cover bg-center py-20"
        style={{
          backgroundImage: "url('/images/home-bg.png')",
        }}
      >

        <div className="absolute inset-0 bg-white/85"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            <div className="bg-white/95 rounded-3xl p-8 shadow-xl">

              <span className="material-symbols-outlined text-green-700 text-5xl">
                public
              </span>

              <h2 className="text-3xl font-bold mt-5">
                Our Mission
              </h2>

              <p className="text-gray-600 mt-5 leading-8">
                Our mission is to make waste management more
                transparent, accessible and community-driven.
                EcoTrack provides digital tools that allow citizens
                to actively participate in maintaining cleaner
                surroundings.
              </p>

            </div>


            <div className="bg-white/95 rounded-3xl p-8 shadow-xl">

              <span className="material-symbols-outlined text-green-700 text-5xl">
                visibility
              </span>

              <h2 className="text-3xl font-bold mt-5">
                Our Vision
              </h2>

              <p className="text-gray-600 mt-5 leading-8">
                We envision communities where technology,
                responsible waste management and citizen
                participation work together to create healthier
                and more sustainable cities.
              </p>

            </div>

          </div>


          <div className="bg-white/95 rounded-3xl p-8 md:p-12 shadow-xl mt-8">

            <h2 className="text-3xl font-bold text-gray-900">
              Why EcoTrack?
            </h2>

            <p className="text-gray-600 mt-5 leading-8">
              Waste management requires cooperation between
              citizens, workers and local communities. EcoTrack
              provides a common digital platform where waste
              issues can be reported, activities can be discovered
              and environmental participation can be encouraged.
            </p>

          </div>

        </div>
      </section>


      {/* CTA */}
      <section className="bg-green-800 py-16">

        <div className="max-w-4xl mx-auto px-6 text-center">

          <h2 className="text-3xl font-bold text-white">
            Join the EcoTrack Community
          </h2>

          <p className="text-green-100 mt-4">
            Together we can make our communities cleaner.
          </p>

          <Link
            to="/register"
            className="inline-block mt-7 px-7 py-3 bg-white text-green-800 rounded-lg font-bold hover:bg-green-50 transition"
          >
            Get Started
          </Link>

        </div>

      </section>

      <Footer />

    </div>
  );
};

export default About;
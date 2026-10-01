import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const Home = () => {
  return (
    <div className="min-h-screen">

      <Navbar />

      {/* HERO */}
      <section
        className="relative min-h-[650px] bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/home-bg.png')",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/55"></div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 min-h-[650px] flex items-center">

          <div className="max-w-3xl">

            <p className="text-green-300 font-bold tracking-widest mb-5">
              SMARTER • CLEANER • GREENER
            </p>

            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              Building a Cleaner Community Together
            </h1>

            <p className="mt-6 text-lg md:text-xl text-white/90 leading-8">
              EcoTrack connects citizens, workers and communities
              to report waste, participate in environmental activities
              and contribute towards a cleaner environment.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">

              <Link
                to="/register"
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition"
              >
                Join EcoTrack
              </Link>

              <Link
                to="/about"
                className="px-6 py-3 border-2 border-white text-white rounded-lg font-bold hover:bg-white hover:text-green-700 transition"
              >
                Learn More
              </Link>

            </div>

          </div>

        </div>
      </section>


      {/* WHAT IS ECOTRACK */}
      <section
        className="relative bg-cover bg-center py-20"
        style={{
          backgroundImage: "url('/images/about-bg..png')",
        }}
      >

        <div className="absolute inset-0 bg-white/80"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">

          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-xl text-center">

            <span className="material-symbols-outlined text-green-700 text-6xl">
              eco
            </span>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4">
              What is EcoTrack?
            </h2>

            <p className="max-w-3xl mx-auto mt-5 text-gray-600 leading-8">
              EcoTrack is a digital civic environmental platform designed
              to help citizens report waste-related issues, discover
              recycling facilities and participate in community
              environmental activities.
            </p>

          </div>

        </div>
      </section>


      {/* HOW ECOTRACK HELPS */}
      <section
        className="relative bg-cover bg-center py-20"
        style={{
          backgroundImage: "url('/images/features-bg.png')",
        }}
      >

        <div className="absolute inset-0 bg-green-950/65"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">

          <h2 className="text-3xl md:text-4xl font-bold text-center text-white">
            How EcoTrack Helps
          </h2>

          <p className="text-center text-white/80 mt-4 max-w-2xl mx-auto">
            Technology and community participation working together
            for a cleaner environment.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">

            <div className="bg-white/95 rounded-2xl p-7 shadow-xl">

              <span className="material-symbols-outlined text-green-700 text-5xl">
                report
              </span>

              <h3 className="text-xl font-bold mt-5">
                Report Waste
              </h3>

              <p className="text-gray-600 mt-3 leading-7">
                Citizens can report waste-related problems
                and track their complaints.
              </p>

            </div>


            <div className="bg-white/95 rounded-2xl p-7 shadow-xl">

              <span className="material-symbols-outlined text-green-700 text-5xl">
                recycling
              </span>

              <h3 className="text-xl font-bold mt-5">
                Find Recycling Centers
              </h3>

              <p className="text-gray-600 mt-3 leading-7">
                Discover recycling centers and responsible
                waste disposal options.
              </p>

            </div>


            <div className="bg-white/95 rounded-2xl p-7 shadow-xl">

              <span className="material-symbols-outlined text-green-700 text-5xl">
                groups
              </span>

              <h3 className="text-xl font-bold mt-5">
                Join Community Activities
              </h3>

              <p className="text-gray-600 mt-3 leading-7">
                Participate in cleanup drives, tree planting
                and other environmental activities.
              </p>

            </div>

          </div>

        </div>
      </section>


      {/* CALL TO ACTION */}
      <section
        className="relative bg-cover bg-center py-20"
        style={{
          backgroundImage: "url('/images/gallery-bg.png')",
        }}
      >

        <div className="absolute inset-0 bg-black/60"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">

          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Be Part of a Cleaner Future
          </h2>

          <p className="text-white/90 mt-5 text-lg">
            Small actions from every citizen can create a
            cleaner and healthier community.
          </p>

          <Link
            to="/register"
            className="inline-block mt-8 px-7 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition"
          >
            Join EcoTrack
          </Link>

        </div>

      </section>

      <Footer />

    </div>
  );
};

export default Home;
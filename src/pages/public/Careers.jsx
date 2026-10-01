import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const Careers = () => {
  return (
    <div className="min-h-screen">

      <Navbar />

      {/* HEADER */}
      <section
        className="relative bg-cover bg-center py-28"
        style={{
          backgroundImage: "url('/images/careers-bg.png')",
        }}
      >

        <div className="absolute inset-0 bg-black/65"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">

          <p className="text-green-300 font-bold tracking-widest">
            CAREERS AT ECOTRACK
          </p>

          <h1 className="text-4xl md:text-6xl font-bold text-white mt-4">
            Work Towards a Cleaner Future
          </h1>

          <p className="max-w-2xl mx-auto text-white/90 mt-6 text-lg leading-8">
            Be part of a team working to improve communities
            through technology and environmental action.
          </p>

        </div>
      </section>


      {/* CONTENT */}
      <section
        className="relative bg-cover bg-center py-20"
        style={{
          backgroundImage: "url('/images/home-bg.png')",
        }}
      >

        <div className="absolute inset-0 bg-white/85"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">

          <div className="max-w-4xl mx-auto bg-white/95 rounded-3xl p-8 md:p-12 shadow-xl text-center">

            <span className="material-symbols-outlined text-green-700 text-7xl">
              diversity_3
            </span>

            <h2 className="text-3xl font-bold mt-5">
              Build a Better Community
            </h2>

            <p className="text-gray-600 mt-5 leading-8">
              EcoTrack brings together people who care about
              technology, environmental sustainability and
              community development.
            </p>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-7 mt-10">

            <div className="bg-white/95 rounded-2xl p-7 shadow-xl">

              <span className="material-symbols-outlined text-green-700 text-5xl">
                engineering
              </span>

              <h3 className="text-xl font-bold mt-5">
                Technology
              </h3>

              <p className="text-gray-600 mt-3 leading-7">
                Build digital solutions that support better
                environmental management.
              </p>

            </div>


            <div className="bg-white/95 rounded-2xl p-7 shadow-xl">

              <span className="material-symbols-outlined text-green-700 text-5xl">
                volunteer_activism
              </span>

              <h3 className="text-xl font-bold mt-5">
                Community
              </h3>

              <p className="text-gray-600 mt-3 leading-7">
                Help communities participate in environmental
                activities and initiatives.
              </p>

            </div>


            <div className="bg-white/95 rounded-2xl p-7 shadow-xl">

              <span className="material-symbols-outlined text-green-700 text-5xl">
                eco
              </span>

              <h3 className="text-xl font-bold mt-5">
                Sustainability
              </h3>

              <p className="text-gray-600 mt-3 leading-7">
                Contribute to projects focused on cleaner and
                healthier communities.
              </p>

            </div>

          </div>

        </div>
      </section>


      {/* CTA */}
      <section className="bg-green-800 py-16">

        <div className="max-w-4xl mx-auto px-6 text-center">

          <h2 className="text-3xl font-bold text-white">
            Interested in EcoTrack?
          </h2>

          <p className="text-green-100 mt-4">
            Stay connected with our environmental community.
          </p>

          <Link
            to="/contact"
            className="inline-block mt-7 px-7 py-3 bg-white text-green-800 rounded-lg font-bold hover:bg-green-50"
          >
            Contact Us
          </Link>

        </div>

      </section>

      <Footer />

    </div>
  );
};

export default Careers;
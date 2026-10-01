import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const Features = () => {
  const features = [
    {
      icon: "report",
      title: "Easy Waste Reporting",
      description:
        "Citizens can quickly report waste problems and provide useful information about the issue.",
    },
    {
      icon: "location_on",
      title: "Location Based Reporting",
      description:
        "Waste reports can be associated with locations so problems can be identified more easily.",
    },
    {
      icon: "track_changes",
      title: "Track Complaints",
      description:
        "Users can follow the progress of their reported waste-related issues.",
    },
    {
      icon: "recycling",
      title: "Recycling Information",
      description:
        "Find useful information about recycling centers and responsible disposal.",
    },
    {
      icon: "event",
      title: "Environmental Events",
      description:
        "Discover community activities such as cleanup campaigns and tree planting.",
    },
    {
      icon: "groups",
      title: "Community Participation",
      description:
        "Encourage citizens to actively participate in environmental improvement.",
    },
  ];

  return (
    <div className="min-h-screen">

      <Navbar />

      {/* HEADER */}
      <section
        className="relative bg-cover bg-center py-28"
        style={{
          backgroundImage: "url('/images/features-bg.png')",
        }}
      >

        <div className="absolute inset-0 bg-black/65"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">

          <p className="text-green-300 font-bold tracking-widest">
            ECOTRACK FEATURES
          </p>

          <h1 className="text-4xl md:text-6xl font-bold text-white mt-4">
            Technology for Better Waste Management
          </h1>

          <p className="max-w-2xl mx-auto text-white/90 mt-6 text-lg leading-8">
            Simple digital tools that make environmental
            participation easier.
          </p>

        </div>
      </section>


      {/* FEATURES */}
      <section
        className="relative bg-cover bg-center py-20"
        style={{
          backgroundImage: "url('/images/features-bg.png')",
        }}
      >

        <div className="absolute inset-0 bg-white/80"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">

            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/95 rounded-2xl p-7 shadow-xl"
              >

                <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center">

                  <span className="material-symbols-outlined text-green-700 text-3xl">
                    {feature.icon}
                  </span>

                </div>

                <h2 className="text-xl font-bold mt-5">
                  {feature.title}
                </h2>

                <p className="text-gray-600 mt-3 leading-7">
                  {feature.description}
                </p>

              </div>
            ))}

          </div>

        </div>
      </section>


      {/* CTA */}
      <section className="bg-green-800 py-16">

        <div className="max-w-4xl mx-auto px-6 text-center">

          <h2 className="text-3xl font-bold text-white">
            Start Making a Difference
          </h2>

          <p className="text-green-100 mt-4">
            Become part of the EcoTrack community.
          </p>

          <Link
            to="/register"
            className="inline-block mt-7 px-7 py-3 bg-white text-green-800 rounded-lg font-bold hover:bg-green-50"
          >
            Get Started
          </Link>

        </div>

      </section>

      <Footer />

    </div>
  );
};

export default Features;
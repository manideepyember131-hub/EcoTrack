import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const Gallery = () => {
  const galleryItems = [
    {
      icon: "cleaning_services",
      title: "Community Cleanups",
      description:
        "Citizens working together to improve public spaces.",
    },
    {
      icon: "recycling",
      title: "Recycling Activities",
      description:
        "Promoting responsible recycling and waste segregation.",
    },
    {
      icon: "local_shipping",
      title: "Waste Collection",
      description:
        "Organized collection activities supporting cleaner streets.",
    },
    {
      icon: "park",
      title: "Green Initiatives",
      description:
        "Activities that encourage greener and healthier communities.",
    },
    {
      icon: "groups",
      title: "Community Participation",
      description:
        "People coming together to support environmental programs.",
    },
    {
      icon: "eco",
      title: "A Greener Future",
      description:
        "Building awareness and sustainable habits for the future.",
    },
  ];

  return (
    <div className="min-h-screen">

      <Navbar />

      {/* HEADER */}
      <section
        className="relative bg-cover bg-center py-28"
        style={{
          backgroundImage: "url('/images/gallery-bg.png')",
        }}
      >

        <div className="absolute inset-0 bg-black/65"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">

          <p className="text-green-300 font-bold tracking-widest">
            ECOTRACK GALLERY
          </p>

          <h1 className="text-4xl md:text-6xl font-bold text-white mt-4">
            Together for a Greener Community
          </h1>

          <p className="max-w-2xl mx-auto text-white/90 mt-6 text-lg leading-8">
            Explore the different ways citizens and communities
            can contribute to a cleaner environment.
          </p>

        </div>
      </section>


      {/* GALLERY */}
      <section
        className="relative bg-cover bg-center py-20"
        style={{
          backgroundImage: "url('/images/about-bg.png')",
        }}
      >

        <div className="absolute inset-0 bg-green-950/65"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">

            {galleryItems.map((item, index) => (
              <div
                key={index}
                className="bg-white/95 rounded-3xl overflow-hidden shadow-xl"
              >

                <div className="h-52 bg-green-100 flex items-center justify-center">

                  <span className="material-symbols-outlined text-green-700 text-8xl">
                    {item.icon}
                  </span>

                </div>

                <div className="p-7">

                  <h2 className="text-xl font-bold">
                    {item.title}
                  </h2>

                  <p className="text-gray-600 mt-3 leading-7">
                    {item.description}
                  </p>

                </div>

              </div>
            ))}

          </div>

        </div>
      </section>


      {/* CTA */}
      <section className="bg-green-800 py-16">

        <div className="max-w-4xl mx-auto px-6 text-center">

          <h2 className="text-3xl font-bold text-white">
            Be Part of the Change
          </h2>

          <p className="text-green-100 mt-4">
            Your participation can help create a cleaner community.
          </p>

          <Link
            to="/register"
            className="inline-block mt-7 px-7 py-3 bg-white text-green-800 rounded-lg font-bold hover:bg-green-50"
          >
            Join EcoTrack
          </Link>

        </div>

      </section>

      <Footer />

    </div>
  );
};

export default Gallery;
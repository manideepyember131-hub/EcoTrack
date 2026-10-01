import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const Services = () => {
  const services = [
    {
      icon: "report",
      title: "Waste Reporting",
      description:
        "Report waste-related problems in your community and help authorities identify areas that need attention.",
    },
    {
      icon: "local_shipping",
      title: "Collection Tracking",
      description:
        "Support better waste collection through organized tasks and improved coordination.",
    },
    {
      icon: "recycling",
      title: "Recycling Centers",
      description:
        "Discover recycling facilities and learn about responsible waste disposal.",
    },
    {
      icon: "groups",
      title: "Community Activities",
      description:
        "Discover and participate in cleanup drives, tree planting and environmental programs.",
    },
    {
      icon: "notifications",
      title: "Environmental Updates",
      description:
        "Stay informed about environmental activities and important community announcements.",
    },
    {
      icon: "task_alt",
      title: "Smart Task Management",
      description:
        "Help waste-management workers receive and manage assigned collection tasks efficiently.",
    },
  ];

  return (
    <div className="min-h-screen">

      <Navbar />

      {/* HEADER */}
      <section
        className="relative bg-cover bg-center py-28"
        style={{
          backgroundImage: "url('/images/services-bg.png')",
        }}
      >

        <div className="absolute inset-0 bg-black/65"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">

          <p className="text-green-300 font-bold tracking-widest">
            ECOTRACK SERVICES
          </p>

          <h1 className="text-4xl md:text-6xl font-bold text-white mt-4">
            Services for a Cleaner Community
          </h1>

          <p className="max-w-2xl mx-auto text-white/90 mt-6 text-lg leading-8">
            Digital services designed to connect citizens,
            workers and communities.
          </p>

        </div>
      </section>


      {/* SERVICES */}
      <section
        className="relative bg-cover bg-center py-20"
        style={{
          backgroundImage: "url('/images/services-bg.png')",
        }}
      >

        <div className="absolute inset-0 bg-green-950/70"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">

            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white/95 rounded-2xl p-7 shadow-xl hover:-translate-y-1 transition"
              >

                <span className="material-symbols-outlined text-green-700 text-5xl">
                  {service.icon}
                </span>

                <h2 className="text-xl font-bold mt-5">
                  {service.title}
                </h2>

                <p className="text-gray-600 mt-3 leading-7">
                  {service.description}
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
            Ready to Make a Difference?
          </h2>

          <p className="text-green-100 mt-4">
            Join EcoTrack and participate in creating cleaner communities.
          </p>

          <Link
            to="/register"
            className="inline-block mt-7 px-7 py-3 bg-white text-green-800 rounded-lg font-bold hover:bg-green-50 transition"
          >
            Join EcoTrack
          </Link>

        </div>

      </section>

      <Footer />

    </div>
  );
};

export default Services;
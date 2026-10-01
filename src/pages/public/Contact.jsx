import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const Contact = () => {
  return (
    <div className="min-h-screen">

      <Navbar />

      {/* HEADER */}
      <section
        className="relative bg-cover bg-center py-28"
        style={{
          backgroundImage: "url('/images/contact-bg.png')",
        }}
      >

        <div className="absolute inset-0 bg-black/65"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">

          <p className="text-green-300 font-bold tracking-widest">
            CONTACT ECOTRACK
          </p>

          <h1 className="text-4xl md:text-6xl font-bold text-white mt-4">
            We Would Love to Hear From You
          </h1>

          <p className="max-w-2xl mx-auto text-white/90 mt-6 text-lg leading-8">
            Have a question, suggestion or environmental concern?
            Get in touch with the EcoTrack team.
          </p>

        </div>
      </section>


      {/* CONTACT SECTION */}
      <section
        className="relative bg-cover bg-center py-20"
        style={{
          backgroundImage: "url('/images/home-bg.png')",
        }}
      >

        <div className="absolute inset-0 bg-white/85"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* CONTACT INFO */}
            <div className="bg-white/95 rounded-3xl p-8 shadow-xl">

              <h2 className="text-3xl font-bold">
                Get in Touch
              </h2>

              <p className="text-gray-600 mt-4 leading-7">
                Contact us for questions, suggestions or information
                about EcoTrack.
              </p>


              <div className="space-y-6 mt-8">

                <div className="flex items-start gap-4">

                  <span className="material-symbols-outlined text-green-700 text-3xl">
                    location_on
                  </span>

                  <div>
                    <h3 className="font-bold">
                      Location
                    </h3>

                    <p className="text-gray-600 mt-1">
                      EcoTrack Community Office
                    </p>
                  </div>

                </div>


                <div className="flex items-start gap-4">

                  <span className="material-symbols-outlined text-green-700 text-3xl">
                    mail
                  </span>

                  <div>
                    <h3 className="font-bold">
                      Email
                    </h3>

                    <p className="text-gray-600 mt-1">
                      maniyember25@gmail.com
                    </p>
                  </div>

                </div>


                <div className="flex items-start gap-4">

                  <span className="material-symbols-outlined text-green-700 text-3xl">
                    phone
                  </span>

                  <div>
                    <h3 className="font-bold">
                      Phone
                    </h3>

                    <p className="text-gray-600 mt-1">
                      +91 9032838923
                    </p>
                  </div>

                </div>

              </div>

            </div>


            {/* CONTACT FORM */}
            <div className="bg-white/95 rounded-3xl p-8 shadow-xl">

              <h2 className="text-3xl font-bold">
                Send Us a Message
              </h2>

              <form className="mt-7 space-y-5">

                <div>

                  <label className="block font-semibold text-gray-700 mb-2">
                    Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />

                </div>


                <div>

                  <label className="block font-semibold text-gray-700 mb-2">
                    Email
                  </label>

                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />

                </div>


                <div>

                  <label className="block font-semibold text-gray-700 mb-2">
                    Message
                  </label>

                  <textarea
                    rows="5"
                    placeholder="Write your message"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  ></textarea>

                </div>


                <button
                  type="submit"
                  className="w-full py-3 bg-green-700 text-white rounded-lg font-bold hover:bg-green-800 transition"
                >
                  Send Message
                </button>

              </form>

            </div>

          </div>

        </div>
      </section>

      <Footer />

    </div>
  );
};

export default Contact;
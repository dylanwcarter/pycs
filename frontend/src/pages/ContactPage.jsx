import LandingTopbar from '../components/LandingTopbar';

function ContactPage() {
  return (
    <div className="w-full min-h-screen bg-black">
      <header className="sticky top-0 z-20 bg-black/90 backdrop-blur-sm">
        <LandingTopbar />
        <hr className="border-t border-white/20" />
      </header>

      <main className="mx-auto max-w-4xl px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-white md:text-5xl mb-12">
          Contact Us
        </h1>

        <section className="space-y-6 text-white">
          <h2 className="text-3xl font-semibold">
            Lead Developer: Dylan Carter
          </h2>
          <div className="space-y-2">
            <p className="text-xl">
              <span className="font-medium">Email:</span>{' '}
              <a
                href="mailto:dylancarter580@gmail.com"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                dylancarter580@gmail.com
              </a>
            </p>
          </div>
        </section>

        <section className="space-y-6 mt-10 text-white">
          <h2 className="text-3xl font-semibold">
            Advisor: Dr. Jonathan Vance
          </h2>
          <div className="space-y-2">
            <p className="text-xl">
              <span className="font-medium">Email:</span>{' '}
              <a
                href="mailto:jmvance@uga.edu"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                jmvance@uga.edu
              </a>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default ContactPage;

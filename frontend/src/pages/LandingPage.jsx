import LandingTopbar from '../components/LandingTopbar';
import animationVideo from '../assets/animations/pycs-animation.mp4';

function LandingPage() {
  return (
    <div className="relative w-full h-screen bg-black">
      {/* Video Background */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={animationVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Topbar Section */}
      <div className="absolute top-0 left-0 w-full z-20">
        <LandingTopbar />
        <hr className="border-t border-white/20" />
      </div>

      {/* Text Content - Positioned below topbar */}
      <div className="absolute left-0 w-full z-20 mt-[8rem] px-4">
        {' '}
        {/* Adjust mt value as needed */}
        <div className="max-w-7xl mx-auto text-center text-white">
          <h1 className="text-4xl font-bold mb-4 sm:text-5xl md:text-6xl">
            Revolutionize Your Crop Management
          </h1>
          <p className="text-lg md:text-2xl max-w-2xl mx-auto">
            Train custom prediction models and get real-time yield forecasts
          </p>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;

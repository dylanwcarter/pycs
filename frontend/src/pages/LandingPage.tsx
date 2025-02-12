import GetStartedButton from '../components/buttons/GetStartedButton';
import LandingTopbar from '../components/LandingTopbar';
import animationVideo from '../assets/animations/pycs-animation.mp4';

function LandingPage() {
  return (
    <div className="relative w-full h-screen bg-black">
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

      <div className="absolute inset-0 bg-black/30"></div>

      <div className="absolute top-0 left-0 w-full z-20">
        <LandingTopbar />
        <hr className="border-t border-white w-full" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center text-center h-full">
        <h1 className="text-gray-100 text-5xl mt-40">
          Revolutionize Your Crop Management
        </h1>
        <p className="text-gray-300 text-2xl mt-4">
          Train custom prediction models and get real-time yield forecasts all
          in one easy-to-use platform.
        </p>
        <GetStartedButton />
      </div>
    </div>
  );
}

export default LandingPage;

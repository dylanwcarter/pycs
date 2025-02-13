import LandingTopbar from '../components/LandingTopbar';
import animationVideo from '../assets/animations/pycs-animation.mp4';
import RevolutionizeImage from '../assets/images/revolutionize-crop.png';
import TrainModelsImage from '../assets/images/train-models.png';
import EasyPlatformImage from '../assets/images/easy-platform.png';

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

      <div className="relative z-10 flex flex-col items-center text-center h-full pt-30">
        <img src={RevolutionizeImage} className="h-10"></img>
        <img src={TrainModelsImage} className="h-10 pt-5"></img>
        <img src={EasyPlatformImage} className="h-10 pt-5"></img>
      </div>
    </div>
  );
}

export default LandingPage;

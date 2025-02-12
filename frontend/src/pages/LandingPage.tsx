import GetStartedButton from '../components/buttons/GetStartedButton';
import LandingTopbar from '../components/LandingTopbar';

function LandingPage() {
  return (
    <div className="bg-black h-screen">
      <LandingTopbar></LandingTopbar>
      <div className="flex flex-col items-center text-center py-20 font-[Geist]">
        <h1 className="text-gray-100 text-5xl">
          Revolutionize Your Crop Management
        </h1>
        <br></br>
        <p className="text-gray-300 text-2xl mt-4">
          Train custom prediction models and get real-time yield forecasts all
          in one easy-to-use platform
        </p>
        <GetStartedButton></GetStartedButton>
      </div>
    </div>
  );
}

export default LandingPage;

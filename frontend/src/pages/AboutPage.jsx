import LandingTopbar from '../components/LandingTopbar';
import UgaLogo from '../assets/images/uga.png';
import PYCSLogo from '../assets/images/pycs-image.jpeg';

function AboutPage() {
  return (
    <div className="relative w-full h-screen bg-black flex flex-col">
      {/* Topbar */}
      <div className="absolute top-0 left-0 w-full z-20">
        <LandingTopbar />
        <hr className="border-t border-white w-full" />
      </div>

      {/* Content Section */}
      <div className="relative z-10 flex flex-row justify-center items-center mt-20 px-8 gap-12">
        {/* Left Column */}
        <div className="flex-1 text-left">
          <h1 className="text-gray-100 text-5xl">Predict Your Crops (PYCS)</h1>
          <p className="text-gray-300 text-2xl mt-10 max-w-3xl">
            This project was led by Dr. Jonathan Vance from The University of
            Georgia and is based on his PhD research on the prediction of
            alfalfa crop yields using machine learning and a synthetic data
            pipeline. Links to each of his papers can be viewed below:
          </p>
          <ul className="text-gray-300 text-2xl mt-10 max-w-3xl space-y-4">
            <li>
              <a
                href="https://www.researchgate.net/publication/366483625_Data_Synthesis_for_Alfalfa_Biomass_Yield_Estimation"
                className="text-blue-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Data Synthesis for Alfalfa Biomass Yield Estimation (May 2022)
              </a>
            </li>
            <li>
              <a
                href="https://www.researchgate.net/publication/364390863_Comparing_Machine_Learning_Techniques_for_Alfalfa_Biomass_Yield_Prediction"
                className="text-blue-400 hover:underline"
              >
                Comparing Machine Learning Techniques for Alfalfa Biomass Yield
                Prediction (Oct 2022)
              </a>
            </li>
            <li>
              <a
                href="https://www.researchgate.net/publication/349306527_Using_Machine_Learning_and_Feature_Selection_for_Alfalfa_Yield_Prediction"
                className="text-blue-400 hover:underline"
              >
                Using Machine Learning and Feature Selection for Alfalfa Yield
                Prediction (Feb 2021)
              </a>
            </li>
          </ul>
        </div>

        {/* Right Column */}
        <div className="flex-1 flex flex-col items-center">
          <img src={PYCSLogo} className="w-80 mt-10" alt="PYCS Image" />
          <img
            src={UgaLogo}
            className="w-80 mt-10"
            alt="University of Georgia Logo"
          />
        </div>
      </div>
    </div>
  );
}

export default AboutPage;

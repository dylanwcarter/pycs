import LandingTopbar from '../components/LandingTopbar';

function HowItWorksPage() {
  return (
    <div className="relative w-full h-screen bg-black flex flex-col">
      {/* Topbar */}
      <div className="absolute top-0 left-0 w-full z-20">
        <LandingTopbar />
        <hr className="border-t border-white w-full" />
      </div>

      {/* Content Section */}
      <div className="relative z-10 flex flex-col items-center text-center mt-20 px-8">
        <h1 className="text-gray-100 text-5xl">How It Works</h1>
        <ul className="text-gray-300 text-2xl mt-6 max-w-3xl space-y-4 text-left">
          <li>
            ✅ <strong>Upload your data:</strong> Start by uploading your
            historical crop yield and weather data.
          </li>
          <li>
            ⚙️ <strong>Train your model:</strong> Select your training
            preferences and let our backend run advanced algorithms to generate
            a custom prediction model.
          </li>
          <li>
            📊 <strong>Get Real-Time Predictions:</strong> With your model in
            place, simply upload your latest crop data to receive immediate
            yield predictions, helping you plan and optimize your harvest.
          </li>
          <li>
            📈 <strong>Review and Act:</strong> View comprehensive reports and
            visualizations that detail prediction accuracy and performance,
            enabling you to refine your strategy.
          </li>
        </ul>
      </div>
    </div>
  );
}

export default HowItWorksPage;

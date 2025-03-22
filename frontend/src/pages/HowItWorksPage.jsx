import LandingTopbar from '../components/LandingTopbar';

function HowItWorksPage() {
  return (
    <div className="w-full min-h-screen bg-black">
      <header className="sticky top-0 z-20 bg-black/90 backdrop-blur-sm">
        <LandingTopbar />
        <hr className="border-t border-white/20" />
      </header>

      <main className="mx-auto max-w-4xl px-6 lg:px-8 py-12 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white md:text-5xl">
            Streamline Your Crop Predictions
          </h1>
          <p className="text-xl text-gray-300">
            Three simple steps to agricultural insights
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Predict Section */}
          <div className="bg-gray-900 p-6 rounded-xl space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold text-white">Predict</h2>
            </div>
            <ol className="space-y-3 text-gray-300">
              <li>1. Select trained model from dashboard</li>
              <li>2. Upload weather data CSV</li>
              <li>3. View instant yield predictions</li>
            </ol>
            <p className="text-sm text-gray-400 mt-2">
              Supports: XGBoost, Random Forest, Linear Regression
            </p>
          </div>

          {/* Train Section */}
          <div className="bg-gray-900 p-6 rounded-xl space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold text-white">Train</h2>
            </div>
            <ol className="space-y-3 text-gray-300">
              <li>1. Upload historical crop data</li>
              <li>2. Choose algorithm type</li>
              <li>3. Track training progress</li>
            </ol>
          </div>

          {/* Test Section */}
          <div className="bg-gray-900 p-6 rounded-xl space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold text-white">Test</h2>
            </div>
            <ol className="space-y-3 text-gray-300">
              <li>1. Upload validation datasets</li>
              <li>2. Run model evaluation</li>
              <li>3. Analyze performance metrics</li>
            </ol>
            <p className="text-sm text-gray-400 mt-2">
              Tracks MAE, R², Correlation
            </p>
          </div>
        </div>

        {/* Key Features */}
        <div className="border-t border-gray-800 pt-12 space-y-6">
          <h3 className="text-2xl font-semibold text-white text-center">
            Key Features
          </h3>
          <div className="grid gap-4 text-gray-300">
            <div className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg">
              <span className="flex-shrink-0">📈</span>
              <span>Interactive yield prediction charts</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg">
              <span className="flex-shrink-0">📁</span>
              <span>Cloud storage for all models and results</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg">
              <span className="flex-shrink-0">⏳</span>
              <span>Historical prediction tracking</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default HowItWorksPage;

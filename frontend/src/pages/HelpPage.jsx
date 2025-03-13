import UserTopbar from '../components/UserTopbar';

function HelpPage() {
  return (
    <div className="w-full min-h-screen bg-black">
      <header className="sticky top-0 z-20 bg-black/90 backdrop-blur-sm">
        <UserTopbar />
        <hr className="border-t border-white/20" />
      </header>

      <main className="mx-auto max-w-4xl px-6 lg:px-8 py-12 space-y-12">
        <h1 className="text-4xl font-bold text-white md:text-5xl mb-8">
          How Predict Your Crops Works
        </h1>

        {/* Predict Yield Section */}
        <section className="space-y-4">
          <h2 className="text-3xl font-semibold text-white">Predict Yields</h2>
          <p className="text-xl text-gray-300 leading-relaxed max-w-3xl">
            Get a quick estimate of your crop yield based on your data. This is
            the easiest way to get started with Predict Your Crops!
          </p>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-200">Steps:</h3>
            <ol className="list-decimal list-inside text-gray-300 space-y-1">
              <li>
                <strong>Select a Model:</strong> Choose a model type (like
                XGBoost, Random Forest, or Linear Regression) from the dropdown.
                If you have previously trained a model, you can also select it
                from the "Select Model" list.
              </li>
              <li>
                <strong>Upload Data:</strong> Upload a file containing your test
                data. This should be in CSV or Excel format, with columns for
                weather data (radiation, rain, avg_max_temp, avg_min_temp).
              </li>
              <li>
                <strong>Get Prediction:</strong> Click the "Get Prediction"
                button.
              </li>
              <li>
                <strong>View Results:</strong> Your data will be displayed with
                a new "Predicted Yield" column.
              </li>
              <li>
                <strong>Download:</strong> Download your data with the predicted
                yield.
              </li>
            </ol>
          </div>
        </section>

        {/* Train a Custom Model Section */}
        <section className="space-y-4">
          <h2 className="text-3xl font-semibold text-white">
            Train a Custom Model
          </h2>
          <p className="text-xl text-gray-300 leading-relaxed max-w-3xl">
            Improve accuracy by training a model specifically for your data.
            This will take some time, but the results are well worth it!
          </p>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-200">Steps:</h3>
            <ol className="list-decimal list-inside text-gray-300 space-y-1">
              <li>
                <strong>Select a Model Type:</strong> Choose a model type that
                you want to train (XGBoost, Random Forest, or Linear
                Regression).
              </li>
              <li>
                <strong>Upload Training Data:</strong> Upload a file containing
                your historical training data in CSV or Excel format.
              </li>
              <li>
                <strong>Train Model:</strong> Click the "Train Model" button.
              </li>
              <li>
                <strong>Wait for Completion:</strong> A progress bar will show
                you the model training progress.
              </li>
              <li>
                <strong>Use Your Model:</strong> Once completed, your new model
                will be available in the "Predict Yield" section.
              </li>
            </ol>
          </div>
        </section>

        {/* Evaluate Model Performance Section */}
        <section className="space-y-4">
          <h2 className="text-3xl font-semibold text-white">
            Evaluate Model Performance
          </h2>
          <p className="text-xl text-gray-300 leading-relaxed max-w-3xl">
            Get deep insights into how well your model performs on a given data
            set.
          </p>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-200">Steps:</h3>
            <ol className="list-decimal list-inside text-gray-300 space-y-1">
              <li>
                <strong>Upload Data Files:</strong> Upload the five required
                data files: "Boost File," "All Years File," "Final Year File,"
                "Target File," and "Target Year File." Make sure that all of
                these files are in the correct format.
              </li>
              <li>
                <strong>Evaluate:</strong> Click the "Evaluate Model" button.
              </li>
              <li>
                <strong>View Results:</strong> A table of key metrics (like
                Average MAE, Average R-squared, Test MAE, and Correlation) will
                be shown.
              </li>
              <li>
                <strong>View Plot:</strong> A plot will show how well the model
                predicts over time, along with actual data for comparison.
              </li>
            </ol>
          </div>
        </section>
      </main>
    </div>
  );
}

export default HelpPage;

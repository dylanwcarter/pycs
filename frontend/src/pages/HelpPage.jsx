import UserTopbar from '../components/UserTopbar';

function HelpPage() {
  return (
    <div className="w-full min-h-screen bg-black text-gray-300">
      <header className="sticky top-0 z-20 bg-black/90 backdrop-blur-sm">
        <UserTopbar />
        <hr className="border-t border-white/20" />
      </header>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white md:text-5xl">
            How to Use the Yield Prediction Tool
          </h1>
          <p className="text-lg text-gray-400">
            Follow these steps to train models, make predictions, and test the
            pipeline.
          </p>
        </div>

        {/* Training Section */}
        <section className="space-y-6 p-6 bg-gray-900 rounded-xl border border-gray-700">
          <h2 className="text-3xl font-semibold text-white border-b border-gray-700 pb-2">
            1. Train a Prediction Model
          </h2>
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-white">Goal:</h3>
            <p>
              Create a reusable machine learning model (.pkl file) based on your
              historical weather and yield data. This model can later be used
              for predictions.
            </p>

            <h3 className="text-xl font-medium text-white">Steps:</h3>
            <ol className="list-decimal list-inside space-y-2 pl-4">
              <li>
                Navigate to the{' '}
                <span className="font-semibold text-blue-400">Train Page</span>.
              </li>
              <li>
                Enter a unique and descriptive{' '}
                <span className="font-semibold">Model Name</span> (use hyphens
                or spaces, no underscores).
              </li>
              <li>
                Click <span className="font-semibold">"Select File"</span> and
                upload your{' '}
                <span className="font-semibold">Training Data File</span> (must
                be .csv or .xlsx format).
              </li>
              <li>
                Select the <span className="font-semibold">Model Type</span>{' '}
                (XGBoost, Random Forest, or Decision Tree) you want to train.
              </li>
              <li>
                Click the{' '}
                <span className="font-semibold text-blue-500">
                  "Train Model"
                </span>{' '}
                button.
              </li>
              <li>
                Wait for the training process to complete. Upon success, the
                model file will be automatically saved to your account's
                storage, and a download link may appear.
              </li>
            </ol>

            <h3 className="text-xl font-medium text-white">Required File:</h3>
            <p>
              <span className="font-semibold">Training Data File</span> (.csv or
              .xlsx)
            </p>

            <h3 className="text-xl font-medium text-white">
              File Format (Training Data):
            </h3>
            <p>
              Your file <span className="font-semibold">must</span> contain the
              following columns with these exact names:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4 pt-2 font-mono text-sm bg-gray-800 p-4 rounded">
              <li>
                <code>Total Radiation</code>: Numerical value representing solar
                radiation.
              </li>
              <li>
                <code>Total Rainfall</code>: Numerical value representing
                rainfall amount.
              </li>
              <li>
                <code>Avg Max Temperature</code>: Numerical value for average
                maximum temperature.
              </li>
              <li>
                <code>Avg Min Temperature</code>: Numerical value for average
                minimum temperature.
              </li>
              <li>
                <code>Yield (tons/acre)</code>: Numerical value for the
                corresponding crop yield (this is the target variable).
              </li>
            </ul>
            <p className="text-sm text-gray-400 italic">
              Note: The order of columns does not matter, but the names must
              match exactly. Extra columns will be ignored.
            </p>
          </div>
        </section>

        {/* Prediction Section */}
        <section className="space-y-6 p-6 bg-gray-900 rounded-xl border border-gray-700">
          <h2 className="text-3xl font-semibold text-white border-b border-gray-700 pb-2">
            2. Make Predictions
          </h2>
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-white">Goal:</h3>
            <p>
              Use a previously trained model (.pkl file) to predict crop yield
              based on new weather data (where the actual yield is unknown).
            </p>

            <h3 className="text-xl font-medium text-white">Steps:</h3>
            <ol className="list-decimal list-inside space-y-2 pl-4">
              <li>
                Navigate to the{' '}
                <span className="font-semibold text-blue-400">
                  Predict Page
                </span>{' '}
                (or Dashboard where models are listed).
              </li>
              <li>
                Select the <span className="font-semibold">Trained Model</span>{' '}
                you want to use from your saved models.
              </li>
              <li>
                Upload your{' '}
                <span className="font-semibold">Weather Data File</span>{' '}
                containing the future or current weather data for which you want
                predictions (must be .csv or .xlsx format).
              </li>
              <li>
                Click the{' '}
                <span className="font-semibold text-blue-500">"Predict"</span>{' '}
                button.
              </li>
              <li>
                View the generated yield predictions, usually presented in a
                table or chart.
              </li>
            </ol>

            <h3 className="text-xl font-medium text-white">Required Files:</h3>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li>
                A <span className="font-semibold">Trained Model</span> (.pkl
                file selected from your saved models).
              </li>
              <li>
                <span className="font-semibold">Weather Data File</span> (.csv
                or .xlsx) containing data for the prediction period.
              </li>
            </ul>

            <h3 className="text-xl font-medium text-white">
              File Format (Weather Data for Prediction):
            </h3>
            <p>
              Your file <span className="font-semibold">must</span> contain the
              following columns with these exact names (the same weather
              features used for training):
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4 pt-2 font-mono text-sm bg-gray-800 p-4 rounded">
              <li>
                <code>Total Radiation</code>: Numerical weather data for the
                prediction period.
              </li>
              <li>
                <code>Total Rainfall</code>: Numerical weather data for the
                prediction period.
              </li>
              <li>
                <code>Avg Max Temperature</code>: Numerical weather data for the
                prediction period.
              </li>
              <li>
                <code>Avg Min Temperature</code>: Numerical weather data for the
                prediction period.
              </li>
            </ul>
            <p className="text-sm text-gray-400 italic">
              Note: This file should <span className="font-semibold">not</span>{' '}
              contain the 'Yield (tons/acre)' column, as that is what the model
              will predict.
            </p>
          </div>
        </section>

        {/* Testing Section */}
        <section className="space-y-6 p-6 bg-gray-900 rounded-xl border border-gray-700">
          <h2 className="text-3xl font-semibold text-white border-b border-gray-700 pb-2">
            3. Test the End-to-End Pipeline
          </h2>
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-white">Goal:</h3>
            <p>
              Evaluate the performance of the entire ML pipeline (data
              synthesis, cross-validated training, prediction, adjustment) on a
              specific set of your data. This helps understand how well the
              *process* works for a given scenario, rather than just using one
              pre-trained model.
            </p>

            <h3 className="text-xl font-medium text-white">Steps:</h3>
            <ol className="list-decimal list-inside space-y-2 pl-4">
              <li>
                Navigate to the{' '}
                <span className="font-semibold text-blue-400">Test Page</span>.
              </li>
              <li>
                Enter a unique and descriptive{' '}
                <span className="font-semibold">Test Name</span>.
              </li>
              <li>
                Click <span className="font-semibold">"Select Files"</span> and
                upload{' '}
                <span className="font-semibold">
                  all 5 required dataset files
                </span>{' '}
                (details below). Ensure each file is correctly associated with
                its type (e.g., the file named `boost_file.csv` is selected for
                the "boost_file" slot).
              </li>
              <li>
                Click the{' '}
                <span className="font-semibold text-blue-500">
                  "Upload Files"
                </span>{' '}
                button.
              </li>
              <li>
                Wait for the pipeline to run. View the resulting performance
                metrics (MAE, R², Correlation) and the comparison chart. The
                results are automatically saved to your test history.
              </li>
            </ol>

            <h3 className="text-xl font-medium text-white">
              Required Files (5):
            </h3>
            <p>You need 5 separate files (.csv or .xlsx) for this test:</p>
            <ol className="list-decimal list-inside space-y-2 pl-4">
              <li>
                <code>boost_file</code>: Data used for training within the test
                pipeline.
              </li>
              <li>
                <code>all_years_file</code>: Complete historical yield data for
                plotting context.
              </li>
              <li>
                <code>final_year_file</code>: Data from the last year *before*
                the target prediction year, used for adjustment.
              </li>
              <li>
                <code>target_file</code>: Weather data for the specific
                year/period you want to test predictions on.
              </li>
              <li>
                <code>target_year_file</code>: Actual yield data for the
                specific year/period being tested (ground truth).
              </li>
            </ol>

            <h3 className="text-xl font-medium text-white">
              File Formats (Testing Files):
            </h3>
            <div className="space-y-3">
              <p>
                <span className="font-semibold">1. boost_file:</span>
              </p>
              <ul className="list-disc list-inside space-y-1 pl-6 pt-1 font-mono text-sm bg-gray-800 p-4 rounded">
                <li>
                  <code>Total Radiation</code>
                </li>
                <li>
                  <code>Total Rainfall</code>
                </li>
                <li>
                  <code>Avg Max Temperature</code>
                </li>
                <li>
                  <code>Avg Min Temperature</code>
                </li>
                <li>
                  <code>Yield (tons/acre)</code>
                </li>
                <li>
                  (Optional) <code>class</code>: Categorical column if you want
                  to enable data synthesis based on classes.
                </li>
              </ul>

              <p>
                <span className="font-semibold">2. all_years_file:</span>
              </p>
              <ul className="list-disc list-inside space-y-1 pl-6 pt-1 font-mono text-sm bg-gray-800 p-4 rounded">
                <li>
                  <code>Date</code> or <code>Time Period</code>: A column
                  representing the time index (e.g., Year).
                </li>
                <li>
                  <code>Yield (tons/acre)</code>: Historical yield data.
                </li>
              </ul>

              <p>
                <span className="font-semibold">3. final_year_file:</span>
              </p>
              <ul className="list-disc list-inside space-y-1 pl-6 pt-1 font-mono text-sm bg-gray-800 p-4 rounded">
                <li>
                  <code>Date</code> or <code>Time Period</code>
                </li>
                <li>
                  <code>Yield (tons/acre)</code>: Should contain at least the
                  last data point before the target year.
                </li>
              </ul>

              <p>
                <span className="font-semibold">4. target_file:</span>
              </p>
              <ul className="list-disc list-inside space-y-1 pl-6 pt-1 font-mono text-sm bg-gray-800 p-4 rounded">
                <li>
                  <code>Total Radiation</code>
                </li>
                <li>
                  <code>Total Rainfall</code>
                </li>
                <li>
                  <code>Avg Max Temperature</code>
                </li>
                <li>
                  <code>Avg Min Temperature</code>
                </li>
                <li>
                  (Optional) <code>Date</code> or <code>Time Period</code>: For
                  alignment, if needed.
                </li>
              </ul>
              <p className="text-sm text-gray-400 italic pl-6">
                Note: This file contains only the weather features for the
                period being tested.
              </p>

              <p>
                <span className="font-semibold">5. target_year_file:</span>
              </p>
              <ul className="list-disc list-inside space-y-1 pl-6 pt-1 font-mono text-sm bg-gray-800 p-4 rounded">
                <li>
                  <code>Date</code> or <code>Time Period</code>
                </li>
                <li>
                  <code>Yield (tons/acre)</code>: The actual, known yield for
                  the period covered by `target_file`.
                </li>
              </ul>
              <p className="text-sm text-gray-400 italic pl-6">
                Note: Ensure the rows/time periods in `target_file` and
                `target_year_file` correspond correctly.
              </p>
            </div>
          </div>
        </section>

        <footer className="text-center text-gray-500 pt-8 border-t border-gray-800">
          Need more help? Contact support.
        </footer>
      </main>
    </div>
  );
}

export default HelpPage;

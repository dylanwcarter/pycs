import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import UserTopbar from '../components/UserTopbar';
import supabase from '../util/supabase';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

function convertTimestampToDate(timestampStr) {
  const timestamp = Number(timestampStr);
  if (isNaN(timestamp)) return 'Invalid Date';
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

function PredictPage() {
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedTestFile, setSelectedTestFile] = useState(null);
  const [predictionName, setPredictionName] = useState('');
  const [userModels, setUserModels] = useState([]);
  const [predictions, setPredictions] = useState(null);
  const [error, setError] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [session, setSession] = useState(null);

  useEffect(() => {
    const fetchSessionAndModels = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(session);

        if (session) {
          const { data, error } = await supabase
            .from('Training Data')
            .select('model_file, model_type')
            .eq('user_id', session.user.id);

          if (error) throw error;

          setUserModels(
            data.map((model) => {
              const parts = model.model_file.split('_');
              if (parts.length < 4) {
                console.error('Invalid filename format:', model.model_file);
                return {
                  ...model,
                  displayName: `${model.model_type.toUpperCase()} - Invalid Date`,
                };
              }

              const timestampStr = parts[parts.length - 2];
              const modelType = parts[parts.length - 1].replace('.pkl', '');
              const modelName = parts.slice(0, parts.length - 3).join(' ');

              return {
                ...model,
                displayName: `${modelName} - ${modelType.toUpperCase()} - ${convertTimestampToDate(timestampStr)}`,
              };
            }),
          );
        }
      } catch (error) {
        console.error('Error fetching models:', error);
        setError('Failed to load models');
      }
    };

    fetchSessionAndModels();
  }, []);

  const handleModelSelect = (event) => {
    const selectedValue = event.target.value;
    if (!selectedValue) {
      setSelectedModel(null);
      return;
    }
    setSelectedModel(JSON.parse(selectedValue));
  };

  const handleTestFileSelect = (event) => {
    setSelectedTestFile(event.target.files[0]);
  };

  const clearAll = () => {
    setSelectedModel(null);
    setSelectedTestFile(null);
    setPredictionName('');
    setPredictions(null);
    setError(null);
    setUploadStatus('idle');
  };

  const handlePredict = async () => {
    if (!selectedModel || !selectedTestFile) {
      setError('Please select both a model and test file');
      return;
    }

    if (!predictionName.trim()) {
      setError('Please enter a name for this prediction');
      return;
    }

    setUploadStatus('loading');
    setError(null);

    try {
      const { data: modelBlob, error: downloadError } = await supabase.storage
        .from('model-files')
        .download(selectedModel.model_file);

      if (downloadError) throw downloadError;

      const formData = new FormData();
      formData.append('model_file', modelBlob, selectedModel.model_file);
      formData.append('test_file', selectedTestFile);

      const parts = selectedModel.model_file.split('_');
      const modelType = parts[parts.length - 1].replace('.pkl', '');

      const response = await fetch(
        `${import.meta.env.VITE_EXPRESS_URL}/ml/predict?model_type=${modelType}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Prediction failed');
      }

      const predictionData = await response.json();
      setPredictions(predictionData.predictions);

      const { error: storageError } = await supabase
        .from('Predict Data')
        .insert([
          {
            user_id: session.user.id,
            name: predictionName.trim(),
            predictions: predictionData.predictions,
            created_at: new Date().toISOString(),
          },
        ]);

      if (storageError) {
        console.error('Prediction storage failed:', storageError);
        throw new Error('Failed to save prediction results');
      }

      setUploadStatus('success');
    } catch (error) {
      console.error('Prediction error:', error);
      setError(error.message);
      setUploadStatus('error');
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#e5e7eb',
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: '#374151',
        },
        ticks: {
          color: '#e5e7eb',
        },
      },
      y: {
        grid: {
          color: '#374151',
        },
        ticks: {
          color: '#e5e7eb',
        },
      },
    },
  };

  const chartData = {
    labels: predictions?.map((_, index) => `Entry ${index + 1}`) || [],
    datasets: [
      {
        label: 'Predicted Yield',
        data: predictions?.map((p) => p['Predicted Yield']) || [],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-black">
      <UserTopbar />
      <div className="p-6 max-w-7xl mx-auto text-gray-200">
        <h1 className="text-3xl font-bold mb-8">Yield Prediction</h1>

        {/* Prediction Name Input */}
        <div className="mb-4 p-4 border border-gray-700 rounded-lg">
          <label className="block text-sm font-medium mb-2">
            Prediction Name
          </label>
          <input
            type="text"
            value={predictionName}
            onChange={(e) => setPredictionName(e.target.value)}
            className="w-full bg-gray-800 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter prediction name (e.g. Summer Corn Forecast)"
            maxLength={100}
          />
        </div>

        {/* Model Selection Section */}
        <div className="mb-8 p-4 border border-gray-700 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Trained Model
            </label>
            <select
              className="w-full bg-gray-800 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={handleModelSelect}
              value={selectedModel ? JSON.stringify(selectedModel) : ''}
            >
              <option value="">Select a model...</option>
              {userModels.map((model) => (
                <option key={model.model_file} value={JSON.stringify(model)}>
                  {model.displayName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Test Data (CSV)
            </label>
            <div className="flex items-center gap-4">
              <label className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors">
                Select Test File
                <input
                  type="file"
                  onChange={handleTestFileSelect}
                  className="hidden"
                  accept=".csv"
                />
              </label>
              <span className="text-sm text-gray-400">
                {selectedTestFile?.name || 'No file selected'}
              </span>
              {selectedTestFile && (
                <button
                  onClick={() => setSelectedTestFile(null)}
                  className="text-red-500 hover:text-red-400"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handlePredict}
              disabled={
                uploadStatus === 'loading' ||
                !selectedModel ||
                !selectedTestFile ||
                !predictionName.trim()
              }
              className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploadStatus === 'loading' ? 'Predicting...' : 'Run Prediction'}
            </button>
            <button
              onClick={clearAll}
              className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Error Messages */}
        {error && (
          <div className="p-4 mb-8 bg-red-900 text-red-200 rounded-lg">
            Error: {error}
          </div>
        )}

        {/* Results Section */}
        {predictions && (
          <div className="space-y-8">
            {/* Chart */}
            <div className="p-4 bg-gray-900 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Yield Predictions</h2>
              <div className="h-96">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>

            {/* Predictions Table */}
            <div className="p-4 bg-gray-900 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">
                Detailed Predictions
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4">Entry</th>
                      <th className="text-left py-3 px-4">Radiation</th>
                      <th className="text-left py-3 px-4">Rain</th>
                      <th className="text-left py-3 px-4">Max Temp</th>
                      <th className="text-left py-3 px-4">Min Temp</th>
                      <th className="text-left py-3 px-4">Yield</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictions.map((prediction, index) => (
                      <tr key={index} className="border-b border-gray-800">
                        <td className="py-3 px-4">#{index + 1}</td>
                        <td className="py-3 px-4">
                          {prediction.radiation.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          {prediction.rain.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          {prediction.avg_max_temp.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          {prediction.avg_min_temp.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 font-semibold text-blue-400">
                          {prediction['Predicted Yield'].toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PredictPage;

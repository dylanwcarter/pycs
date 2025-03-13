import { useState } from 'react';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const dummyPredictions = [
  {
    radiation: 15.2,
    rain: 2.5,
    avg_max_temp: 28.5,
    avg_min_temp: 18.0,
    'Predicted Yield': 2.4,
  },
  {
    radiation: 14.8,
    rain: 2.7,
    avg_max_temp: 29.0,
    avg_min_temp: 18.5,
    'Predicted Yield': 2.5,
  },
  {
    radiation: 15.5,
    rain: 2.3,
    avg_max_temp: 28.0,
    avg_min_temp: 17.5,
    'Predicted Yield': 2.3,
  },
];

function PredictPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [error, setError] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle');

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const clearAll = () => {
    setSelectedFile(null);
    setPredictions(null);
    setError(null);
    setUploadStatus('idle');
  };

  const handlePredict = () => {
    if (!selectedFile) {
      setError('Please select a model file');
      return;
    }

    setUploadStatus('loading');
    setTimeout(() => {
      setPredictions(dummyPredictions);
      setError(null);
      setUploadStatus('success');
    }, 1500);
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

        {/* File Upload Section */}
        <div className="mb-8 p-4 border border-gray-700 rounded-lg">
          <div className="flex items-center gap-4 mb-4">
            <label className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors">
              Select Model File
              <input
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept=".pkl"
              />
            </label>
            <button
              onClick={handlePredict}
              disabled={uploadStatus === 'loading' || !selectedFile}
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

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">
              {selectedFile?.name || 'No file selected'}
            </span>
            {selectedFile && (
              <button
                onClick={() => setSelectedFile(null)}
                className="text-red-500 hover:text-red-400"
              >
                ×
              </button>
            )}
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
                        <td className="py-3 px-4">{prediction.radiation}</td>
                        <td className="py-3 px-4">{prediction.rain}</td>
                        <td className="py-3 px-4">{prediction.avg_max_temp}</td>
                        <td className="py-3 px-4">{prediction.avg_min_temp}</td>
                        <td className="py-3 px-4 font-semibold text-blue-400">
                          {prediction['Predicted Yield']}
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

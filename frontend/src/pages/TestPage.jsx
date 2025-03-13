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

const requiredFiles = [
  'boost_file',
  'all_years_file',
  'final_year_file',
  'target_file',
  'target_year_file',
];

// Dummy data generator
const generateDummyData = () => ({
  avg_mae: 0.245,
  avg_r2: 0.892,
  best_mae: 0.198,
  best_r2: 0.921,
  test_mae: 0.215,
  correlation: 0.934,
  plot_data: {
    all_years_index: Array.from({ length: 20 }, (_, i) => i + 1),
    all_years_yield: Array.from({ length: 20 }, () => Math.random() * 100),
    target_year_index: Array.from({ length: 5 }, (_, i) => i + 1),
    target_year_actual_yield: Array.from(
      { length: 5 },
      () => Math.random() * 100,
    ),
    adjusted_predictions: Array.from({ length: 5 }, () => Math.random() * 100),
  },
});

function TestPage() {
  const [files, setFiles] = useState({});
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const newFiles = { ...files };

    selectedFiles.forEach((file) => {
      const fileType = requiredFiles.find((type) => file.name.includes(type));
      if (fileType) newFiles[fileType] = file;
    });

    setFiles(newFiles);
  };

  const removeFile = (fileType) => {
    const newFiles = { ...files };
    delete newFiles[fileType];
    setFiles(newFiles);
  };

  const clearAll = () => {
    setFiles({});
    setChartData(null);
    setError(null);
    setUploadStatus('idle');
  };

  const handleUpload = () => {
    if (Object.keys(files).length !== requiredFiles.length) {
      setError('Please upload all required files');
      return;
    }

    setUploadStatus('loading');
    setTimeout(() => {
      if (Math.random() > 0.1) {
        // 90% success rate for demo
        setChartData(generateDummyData());
        setError(null);
      } else {
        setError('Simulated failure: Invalid CSV structure');
        setChartData(null);
      }
      setUploadStatus('idle');
    }, 1500);
  };

  const renderChart = () => {
    if (!chartData) return null;

    const data = {
      labels: chartData.plot_data.all_years_index,
      datasets: [
        {
          label: 'All Years Yield',
          data: chartData.plot_data.all_years_yield,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
        {
          label: 'Target Year Actual',
          data: chartData.plot_data.target_year_actual_yield,
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1,
        },
        {
          label: 'Adjusted Predictions',
          data: chartData.plot_data.adjusted_predictions,
          borderColor: 'rgb(54, 162, 235)',
          tension: 0.1,
        },
      ],
    };

    return <Line data={data} />;
  };

  return (
    <div className="min-h-screen bg-black">
      <UserTopbar />
      <div className="p-6 max-w-7xl mx-auto text-gray-200">
        <h1 className="text-3xl font-bold mb-8">Test Your Data</h1>

        {/* File Upload Section */}
        <div className="mb-8 p-4 border border-gray-700 rounded-lg">
          <div className="flex items-center gap-4 mb-4">
            <label className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors">
              Select Files
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept=".csv"
              />
            </label>
            <button
              onClick={handleUpload}
              disabled={
                uploadStatus === 'loading' ||
                Object.keys(files).length !== requiredFiles.length
              }
              className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploadStatus === 'loading' ? 'Uploading...' : 'Upload Files'}
            </button>
            <button
              onClick={clearAll}
              className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-2">
            {requiredFiles.map((fileType) => (
              <div
                key={fileType}
                className="flex items-center justify-between p-2 bg-gray-900 rounded"
              >
                <span className="capitalize">
                  {fileType.replace(/_/g, ' ')}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">
                    {files[fileType]?.name || 'No file selected'}
                  </span>
                  {files[fileType] && (
                    <button
                      onClick={() => removeFile(fileType)}
                      className="text-red-500 hover:text-red-400"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Results Section */}
        {error && (
          <div className="p-4 mb-8 bg-red-900 text-red-200 rounded-lg">
            Error: {error}
          </div>
        )}

        {chartData && (
          <div className="space-y-8">
            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-900 rounded-lg">
                <h3 className="text-sm text-gray-400">Average MAE</h3>
                <p className="text-xl">{chartData.avg_mae.toFixed(3)}</p>
              </div>
              <div className="p-4 bg-gray-900 rounded-lg">
                <h3 className="text-sm text-gray-400">Best R²</h3>
                <p className="text-xl">{chartData.best_r2.toFixed(3)}</p>
              </div>
              <div className="p-4 bg-gray-900 rounded-lg">
                <h3 className="text-sm text-gray-400">Correlation</h3>
                <p className="text-xl">
                  {chartData.correlation
                    ? chartData.correlation.toFixed(3)
                    : 'N/A'}
                </p>
              </div>
            </div>

            {/* Chart */}
            <div className="p-4 bg-gray-900 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Yield Comparison</h2>
              <div className="h-96">{renderChart()}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TestPage;

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
import supabase from '../util/supabase';
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

function TestPage() {
  const [files, setFiles] = useState({});
  const [testName, setTestName] = useState('');
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [chartData, setChartData] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [backendResponse, setBackendResponse] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { user },
          userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;

        const { data, sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        setUser(user);
        setSession(data.session);
      } catch (error) {
        setError(error.message);
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    setLoading(false);
  }, []);

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
    setTestName('');
    setChartData(null);
    setError(null);
    setUploadStatus('idle');
  };

  const handleUpload = async () => {
    if (Object.keys(files).length !== requiredFiles.length) {
      setError('Please upload all required files');
      return;
    }

    if (!testName.trim()) {
      setError('Please enter a name for this test');
      return;
    }

    setUploadStatus('loading');
    setError(null);

    try {
      const formData = new FormData();
      requiredFiles.forEach((fileType) => {
        formData.append(fileType, files[fileType]);
      });

      const response = await fetch(
        import.meta.env.VITE_EXPRESS_URL + '/ml/test',
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          method: 'POST',
          body: formData,
        },
      );

      const responseText = await response.text();

      try {
        const result = JSON.parse(responseText);
        if (!response.ok) {
          throw new Error(result.error || 'Backend request failed');
        }

        const { error } = await supabase.from('Test Data').insert([
          {
            user_id: session.user.id,
            name: testName.trim(),
            avg_mae: result.avg_mae,
            avg_r2: result.avg_r2,
            best_mae: result.best_mae,
            best_r2: result.best_r2,
            test_mae: result.test_mae,
            correlation: result.correlation,
            all_years_index: result.plot_data.all_years_index,
            all_years_yield: result.plot_data.all_years_yield,
            target_year_index: result.plot_data.target_year_index,
            target_year_yield: result.plot_data.target_year_actual_yield,
            adjusted_predictions: result.plot_data.adjusted_predictions,
            created_at: new Date().toISOString(),
          },
        ]);

        if (error) throw error;

        setBackendResponse(result);
      } catch (jsonError) {
        const errorMatch = responseText.match(/<pre>(.*?)<\/pre>/is);
        const errorMessage = errorMatch
          ? errorMatch[1]
          : 'Invalid server response';
        throw new Error(errorMessage);
      }

      setUploadStatus('idle');
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message);
      setUploadStatus('idle');
    }
  };

  const renderChart = () => {
    if (!backendResponse?.plot_data) return null;

    const plotData = backendResponse.plot_data;

    return (
      <Line
        data={{
          labels: plotData.all_years_index,
          datasets: [
            {
              label: 'All Years Yield',
              data: plotData.all_years_yield,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1,
            },
            {
              label: 'Target Year Actual',
              data: plotData.target_year_actual_yield,
              borderColor: 'rgb(255, 99, 132)',
              tension: 0.1,
            },
            {
              label: 'Adjusted Predictions',
              data: plotData.adjusted_predictions,
              borderColor: 'rgb(54, 162, 235)',
              tension: 0.1,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
        }}
      />
    );
  };

  return (
    <div className="min-h-screen bg-black">
      <UserTopbar />
      <div className="p-6 max-w-7xl mx-auto text-gray-200">
        <h1 className="text-3xl font-bold mb-8">Test Your Data</h1>

        {/* Test Name Input */}
        <div className="mb-4 p-4 border border-gray-700 rounded-lg">
          <label className="block text-sm font-medium mb-2">Test Name</label>
          <input
            type="text"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            className="w-full bg-gray-800 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter test name (e.g. Winter Wheat 2023)"
            maxLength={100}
          />
        </div>

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
                Object.keys(files).length !== requiredFiles.length ||
                !testName.trim()
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

        {/* Error Messages */}
        {error && (
          <div className="p-4 mb-8 bg-red-900 text-red-200 rounded-lg">
            Error: {error}
          </div>
        )}

        {/* Results Section */}
        {backendResponse && (
          <div className="space-y-8">
            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-900 rounded-lg">
                <h3 className="text-sm text-gray-400">Average MAE</h3>
                <p className="text-xl">{backendResponse.avg_mae.toFixed(3)}</p>
              </div>
              <div className="p-4 bg-gray-900 rounded-lg">
                <h3 className="text-sm text-gray-400">Best R²</h3>
                <p className="text-xl">{backendResponse.best_r2.toFixed(3)}</p>
              </div>
              <div className="p-4 bg-gray-900 rounded-lg">
                <h3 className="text-sm text-gray-400">Correlation</h3>
                <p className="text-xl">
                  {backendResponse.correlation?.toFixed(3) || 'N/A'}
                </p>
              </div>
            </div>

            {/* Chart */}
            <div className="p-4 bg-gray-900 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Yield Comparison</h2>
              <div className="h-96">
                {renderChart()}
                {!backendResponse.plot_data && (
                  <div className="text-gray-400 text-center mt-20">
                    Chart data loading...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TestPage;

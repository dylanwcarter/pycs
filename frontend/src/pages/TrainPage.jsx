import { useState } from 'react';
import UserTopbar from '../components/UserTopbar';

const MODEL_TYPES = ['xgb', 'random_forest', 'linear_regression'];

function TrainPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedModel, setSelectedModel] = useState('');
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [pklData, setPklData] = useState(null);

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleModelSelect = (model) => {
    setSelectedModel(model);
  };

  const clearAll = () => {
    setSelectedFile(null);
    setSelectedModel('');
    setPklData(null);
    setError(null);
    setUploadStatus('idle');
  };

  const handleUpload = () => {
    if (!selectedFile) {
      setError('Please select a training file');
      return;
    }
    if (!selectedModel) {
      setError('Please select a model type');
      return;
    }

    setUploadStatus('loading');
    setError(null);

    // Simulate API call
    setTimeout(() => {
      if (Math.random() > 0.1) {
        // 90% success rate
        // Create dummy PKL file
        const dummyContent = `Dummy PKL content for ${selectedModel} model`;
        const blob = new Blob([dummyContent], {
          type: 'application/octet-stream',
        });
        setPklData(URL.createObjectURL(blob));
        setUploadStatus('success');
      } else {
        setError('Training failed: Simulated error occurred');
        setUploadStatus('error');
      }
    }, 2000);
  };

  const getModelButtonStyle = (model) =>
    `px-4 py-2 rounded-lg transition-colors ${
      selectedModel === model
        ? 'bg-blue-600 hover:bg-blue-700'
        : 'bg-gray-800 hover:bg-gray-700'
    }`;

  return (
    <div className="min-h-screen bg-black">
      <UserTopbar />
      <div className="p-6 max-w-7xl mx-auto text-gray-200">
        <h1 className="text-3xl font-bold mb-8">Model Training</h1>

        {/* Training Section */}
        <div className="mb-8 p-4 border border-gray-700 rounded-lg">
          <div className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Training Data (CSV)
              </label>
              <div className="flex items-center gap-4">
                <label className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors">
                  Select File
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".csv"
                  />
                </label>
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

            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Model Type
              </label>
              <div className="flex gap-4">
                {MODEL_TYPES.map((model) => (
                  <button
                    key={model}
                    onClick={() => handleModelSelect(model)}
                    className={getModelButtonStyle(model)}
                  >
                    {model.replace(/_/g, ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleUpload}
                disabled={
                  uploadStatus === 'loading' || !selectedFile || !selectedModel
                }
                className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploadStatus === 'loading' ? 'Training...' : 'Train Model'}
              </button>
              <button
                onClick={clearAll}
                className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="p-4 mb-8 bg-red-900 text-red-200 rounded-lg">
            Error: {error}
          </div>
        )}

        {/* Results Section */}
        {pklData && (
          <div className="p-4 border border-gray-700 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Training Successful!</h2>
            <a
              href={pklData}
              download={`${selectedModel}_model.pkl`}
              className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              Download Model File
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrainPage;

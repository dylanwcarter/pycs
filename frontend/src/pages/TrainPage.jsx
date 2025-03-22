import { useState, useEffect } from 'react';
import UserTopbar from '../components/UserTopbar';
import supabase from '../util/supabase';

const MODEL_TYPES = ['xgb', 'random_forest', 'linear_regression'];

function TrainPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedModel, setSelectedModel] = useState('');
  const [modelName, setModelName] = useState('');
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [pklData, setPklData] = useState(null);
  const [error, setError] = useState(null);

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
    setSelectedFile(event.target.files[0]);
  };

  const handleModelSelect = (model) => {
    setSelectedModel(model);
  };

  const handleModelNameChange = (e) => {
    const value = e.target.value;
    // Remove special characters and replace spaces with hyphens
    const sanitized = value
      .replace(/[^a-zA-Z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    setModelName(sanitized);
  };

  const clearAll = () => {
    setSelectedFile(null);
    setSelectedModel('');
    setModelName('');
    setPklData(null);
    setError(null);
    setUploadStatus('idle');
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedModel || !modelName.trim()) {
      setError('Please select file, model type, and enter a model name');
      return;
    }

    if (modelName.includes('_')) {
      setError('Model name cannot contain underscores');
      return;
    }

    setUploadStatus('loading');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('training_data', selectedFile);
      formData.append('model_type', selectedModel);

      const response = await fetch(
        `${import.meta.env.VITE_EXPRESS_URL}/ml/train`,
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
        throw new Error(errorData.error || 'Training failed');
      }

      const contentDisposition = response.headers.get('Content-Disposition');
      const filename =
        contentDisposition?.split('filename=')[1].replace(/"/g, '') ||
        `${selectedModel}.pkl`;

      // Generate safe filename components
      const cleanModelName = modelName.trim().toLowerCase().replace(/-+/g, '-');
      const timestamp = Date.now();
      const userId = session.user.id;

      // New filename format: cleanModelName_userId_timestamp_modelType.pkl
      const fullFileName = `${cleanModelName}_${userId}_${timestamp}_${selectedModel}.pkl`;

      const blob = await response.blob();
      const file = new File([blob], filename, {
        type: 'application/octet-stream',
      });

      // Upload to Supabase
      const { data: storageData, error: storageError } = await supabase.storage
        .from('model-files')
        .upload(fullFileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (storageError) throw storageError;

      // Store metadata
      const { error: dbError } = await supabase.from('Training Data').insert({
        user_id: userId,
        model_type: selectedModel,
        model_file: fullFileName,
      });

      if (dbError) throw dbError;

      const url = window.URL.createObjectURL(blob);
      setPklData({ url, filename: fullFileName });
      setUploadStatus('success');
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message);
      setUploadStatus('error');
    }
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
            {/* Model Name Input */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Model Name (no underscores)
              </label>
              <input
                type="text"
                value={modelName}
                onChange={handleModelNameChange}
                className="w-full bg-gray-800 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter model name (e.g., corn-yield-2023)"
                maxLength={50}
                pattern="[^_]*"
                title="Underscores are not allowed in model names"
              />
              <p className="text-sm text-gray-400 mt-1">
                Use hyphens or spaces between words
              </p>
            </div>

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
                  uploadStatus === 'loading' ||
                  !selectedFile ||
                  !selectedModel ||
                  !modelName.trim() ||
                  modelName.includes('_')
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
              href={pklData.url}
              download={pklData.filename}
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

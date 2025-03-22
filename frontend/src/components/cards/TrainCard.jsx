import supabase from '../../util/supabase';

function TrainCard({ id, name, date, modelType, modelFile }) {
  const handleDownload = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('model-files')
        .download(modelFile);

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = modelFile;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-700 p-4 text-gray-200 rounded-lg w-64 flex-shrink-0">
      <div className="mb-4">
        <h3 className="text-sm text-gray-400">Model Name</h3>
        <p className="font-medium truncate">{name}</p>
      </div>
      <div className="mb-4">
        <h3 className="text-sm text-gray-400">Date</h3>
        <p className="text-sm">{date}</p>
      </div>
      <div className="mb-4">
        <h3 className="text-sm text-gray-400">Model Type</h3>
        <p className="text-sm capitalize">{modelType.replace(/_/g, ' ')}</p>
      </div>
      <button
        onClick={handleDownload}
        className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-sm"
      >
        Download Model
      </button>
    </div>
  );
}

export default TrainCard;

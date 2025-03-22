import { Link } from 'react-router-dom';

function PredictCard({ id, name, date }) {
  return (
    <div className="bg-gray-900 border border-gray-700 p-4 text-gray-200 rounded-lg w-64 flex-shrink-0">
      <div className="mb-4">
        <h3 className="text-sm text-gray-400">Prediction Name</h3>
        <p className="font-medium truncate">{name}</p>
      </div>
      <div className="mb-4">
        <h3 className="text-sm text-gray-400">Date</h3>
        <p className="text-sm">{date}</p>
      </div>
      <Link
        to={`/predictions/${id}`}
        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm block text-center"
      >
        View Data
      </Link>
    </div>
  );
}

export default PredictCard;

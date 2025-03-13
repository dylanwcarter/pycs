import UserTopbar from '../components/UserTopbar.jsx';
import PredictCard from '../components/cards/PredictCard.jsx';
import TrainCard from '../components/cards/TrainCard.jsx';
import TestCard from '../components/cards/TestCard.jsx';

function DashboardPage() {
  // Generate dummy data arrays
  const testCards = Array(10).fill({
    date: '2023-08-01',
    modelType: 'CNN',
    fileName: 'test_data.csv',
  });

  const trainCards = Array(10).fill({
    date: '2023-08-02',
    modelType: 'Random Forest',
    fileName: 'train_data.csv',
  });

  const predictCards = Array(10).fill({
    date: '2023-08-03',
    modelType: 'LSTM',
    fileName: 'predict_data.csv',
    predictedYield: '85%',
  });

  return (
    <div className="bg-black min-h-screen">
      <UserTopbar />
      <div className="p-5 space-y-8">
        {/* Tests Section */}
        <div>
          <h1 className="text-gray-200 mb-4 text-xl font-semibold">
            Recent Tests
          </h1>
          <div className="flex overflow-x-auto pb-4 space-x-4">
            {testCards.map((card, index) => (
              <TestCard key={index} {...card} />
            ))}
          </div>
        </div>

        {/* Training Runs Section */}
        <div>
          <h1 className="text-gray-200 mb-4 text-xl font-semibold">
            Recent Training Runs
          </h1>
          <div className="flex overflow-x-auto pb-4 space-x-4">
            {trainCards.map((card, index) => (
              <TrainCard key={index} {...card} />
            ))}
          </div>
        </div>

        {/* Predictions Section */}
        <div>
          <h1 className="text-gray-200 mb-4 text-xl font-semibold">
            Recent Predictions
          </h1>
          <div className="flex overflow-x-auto pb-4 space-x-4">
            {predictCards.map((card, index) => (
              <PredictCard key={index} {...card} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;

import { useState, useEffect } from 'react';
import UserTopbar from '../components/UserTopbar';
import PredictCard from '../components/cards/PredictCard';
import TrainCard from '../components/cards/TrainCard';
import TestCard from '../components/cards/TestCard';
import supabase from '../util/supabase';

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [testData, setTestData] = useState([]);
  const [trainData, setTrainData] = useState([]);
  const [predictData, setPredictData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (userError) throw userError;
        if (sessionError) throw sessionError;

        setUser(user);
        setSession(sessionData.session);

        if (sessionData.session) {
          // Fetch test data
          const { data: testResults, error: testError } = await supabase
            .from('Test Data')
            .select('id, name, created_at')
            .order('created_at', { ascending: false });

          if (testError) throw testError;
          setTestData(testResults);

          // Fetch training data
          const { data: trainResults, error: trainError } = await supabase
            .from('Training Data')
            .select('id, model_type, model_file');

          if (trainError) throw trainError;

          // Process training data to extract and format timestamps
          const processedTrainData = trainResults.map((train) => {
            const parts = train.model_file.split('_');
            const unixTimestamp = parseInt(parts[2], 10);

            if (isNaN(unixTimestamp)) {
              console.error('Invalid timestamp in filename:', train.model_file);
              return { ...train, created_at: new Date(0).toISOString() };
            }

            // Convert milliseconds to seconds by dividing by 1000
            const createdAt = new Date(unixTimestamp);

            return {
              ...train,
              created_at: createdAt.toISOString(),
              raw_timestamp: unixTimestamp,
            };
          });

          // Sort training data by timestamp descending
          processedTrainData.sort((a, b) => b.raw_timestamp - a.raw_timestamp);
          setTrainData(processedTrainData);

          // Fetch prediction data
          const { data: predictResults, error: predictError } = await supabase
            .from('Predict Data')
            .select('id, name, created_at')
            .order('created_at', { ascending: false });

          if (predictError) throw predictError;
          setPredictData(predictResults);
        }
      } catch (error) {
        setError(error.message);
        console.error('Error fetching data:', error);
        if (error.status === 401) window.location.href = '/login';
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <UserTopbar />
        <hr className="border-t border-white/20" />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen">
      <UserTopbar />
      <hr className="border-t border-white/20" />
      <div className="p-5 space-y-8">
        {/* Tests Section */}
        <div>
          <h1 className="text-gray-200 mb-4 text-xl font-semibold px-4">
            Recent Tests
          </h1>
          <div className="flex overflow-x-auto pb-4 space-x-4 px-4">
            {testData.map((test) => (
              <TestCard
                key={test.id}
                id={test.id}
                name={test.name}
                date={formatDate(test.created_at)}
              />
            ))}
          </div>
        </div>

        {/* Training Runs Section */}
        <div>
          <h1 className="text-gray-200 mb-4 text-xl font-semibold px-4">
            Recent Training Runs
          </h1>
          <div className="flex overflow-x-auto pb-4 space-x-4 px-4">
            {trainData.map((train) => (
              <TrainCard
                key={train.id}
                id={train.id}
                name={train.model_file.split('_')[0]}
                date={formatDate(train.created_at)}
                modelType={train.model_type}
                modelFile={train.model_file}
              />
            ))}
          </div>
        </div>

        {/* Predictions Section */}
        <div>
          <h1 className="text-gray-200 mb-4 text-xl font-semibold px-4">
            Recent Predictions
          </h1>
          <div className="flex overflow-x-auto pb-4 space-x-4 px-4">
            {predictData.map((prediction) => (
              <PredictCard
                key={prediction.id}
                id={prediction.id}
                name={prediction.name}
                date={formatDate(prediction.created_at)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;

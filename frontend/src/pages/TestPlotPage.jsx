import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

function TestPlotPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (userError || sessionError) throw userError || sessionError;

        setUser(user);
        setSession(sessionData.session);

        const { data, error } = await supabase
          .from('Test Data')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Test data not found');

        setTestData(data);
      } catch (error) {
        setError(error.message);
        console.error('Error fetching test data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const renderChart = () => {
    if (!testData) return null;

    return (
      <Line
        data={{
          labels: testData.all_years_index,
          datasets: [
            {
              label: 'All Years Yield',
              data: testData.all_years_yield,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1,
            },
            {
              label: 'Target Year Actual',
              data: testData.target_year_yield,
              borderColor: 'rgb(255, 99, 132)',
              tension: 0.1,
            },
            {
              label: 'Adjusted Predictions',
              data: testData.adjusted_predictions,
              borderColor: 'rgb(54, 162, 235)',
              tension: 0.1,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Yield Comparison',
            },
          },
        }}
      />
    );
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
    <div className="min-h-screen bg-black">
      <UserTopbar />
      <hr className="border-t border-white/20" />
      <div className="p-6 max-w-7xl mx-auto text-gray-200">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            {testData?.name || 'Test Plot'}
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="p-4 mb-8 bg-red-900 text-red-200 rounded-lg">
            Error: {error}
          </div>
        )}

        {testData && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-900 rounded-lg">
                <h3 className="text-sm text-gray-400">Average MAE</h3>
                <p className="text-xl">{testData.avg_mae?.toFixed(3)}</p>
              </div>
              <div className="p-4 bg-gray-900 rounded-lg">
                <h3 className="text-sm text-gray-400">Best R²</h3>
                <p className="text-xl">{testData.best_r2?.toFixed(3)}</p>
              </div>
              <div className="p-4 bg-gray-900 rounded-lg">
                <h3 className="text-sm text-gray-400">Correlation</h3>
                <p className="text-xl">
                  {testData.correlation?.toFixed(3) || 'N/A'}
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-900 rounded-lg">
              <div className="h-96">{renderChart()}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TestPlotPage;

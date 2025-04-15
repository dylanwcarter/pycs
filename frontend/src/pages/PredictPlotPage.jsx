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
import UserTopbar from '../components/UserTopbar';
import supabase from '../util/supabase';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

function PredictPlotPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [predictionData, setPredictionData] = useState(null);
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
          .from('Predict Data')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Prediction data not found');

        setPredictionData(data);
      } catch (error) {
        setError(error.message);
        console.error('Error fetching prediction data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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
    labels:
      predictionData?.predictions?.map((_, index) => `Entry ${index + 1}`) ||
      [],
    datasets: [
      {
        label: 'Predicted Yield',
        data:
          predictionData?.predictions?.map((p) => p['Predicted Yield']) || [],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.4,
      },
    ],
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
      <div className="p-6 max-w-7xl mx-auto text-gray-200">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            {predictionData?.name || 'Prediction Plot'}
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

        {predictionData && (
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
                    {predictionData.predictions?.map((prediction, index) => (
                      <tr key={index} className="border-b border-gray-800">
                        <td className="py-3 px-4">#{index + 1}</td>
                        <td className="py-3 px-4">
                          {prediction.radiation?.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          {prediction.rain?.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          {prediction.avg_max_temp?.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          {prediction.avg_min_temp?.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 font-semibold text-blue-400">
                          {prediction['Predicted Yield']?.toFixed(2)}
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

export default PredictPlotPage;

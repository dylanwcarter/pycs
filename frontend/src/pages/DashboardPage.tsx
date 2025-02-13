import LogoutButton from '../components/buttons/LogoutButton';
import Profile from '../components/Profile';

function DashboardPage() {
  return (
    <div>
      <LogoutButton></LogoutButton>
      <h1>Dashboard</h1>
      <Profile></Profile>
    </div>
  );
}

export default DashboardPage;

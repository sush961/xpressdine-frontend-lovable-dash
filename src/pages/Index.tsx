
import { Navigate } from 'react-router-dom';

// This page simply redirects to the dashboard
export default function Index() {
  return <Navigate to="/dashboard" replace />;
}

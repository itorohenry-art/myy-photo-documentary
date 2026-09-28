import { Navigate, useLocation } from 'react-router-dom';

export function ProtectedRoute({ user, role, children }) {
	const location = useLocation();

	if (!user) {
		return <Navigate to="/login" replace state={{ from: location }} />;
	}

	const userRole = user.role || 'client';
	if (role && userRole !== role) {
		return <Navigate to={userRole === 'admin' ? '/admin' : '/client'} replace />;
	}

	return children;
}
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
    module?: string;
    action?: string;
}

export function ProtectedRoute({ module, action }: ProtectedRouteProps) {
    const { user, loading, hasPermission } = useAuth();

    if (loading) {
        return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (module && action) {
        if (!hasPermission(module, action)) {
            // Optional: Redirect to unauthorized page or just dashboard
            return <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
                <p>You do not have permission to view this page.</p>
            </div>;
        }
    }

    return <Outlet />;
}

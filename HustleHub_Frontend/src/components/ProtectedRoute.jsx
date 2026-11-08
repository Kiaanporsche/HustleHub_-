import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function ProtectedRoute({ children, allowedRoles }) {
    const { user, isAuthenticated } = useAuth();

    // User must be logged in
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // If roles are specified, user must have the correct role
    if (
        allowedRoles &&
        !allowedRoles.includes(user.role)
    ) {
        return <Navigate to="/gigs" replace />;
    }

    return children;
}

export default ProtectedRoute;
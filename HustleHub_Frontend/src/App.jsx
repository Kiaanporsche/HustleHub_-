
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useLocation
} from "react-router-dom";

import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import BrowseGigsPage from "./pages/BrowseGigsPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import GigDetailsPage from "./pages/GigDetailsPage.jsx";
import ClientBookingsPage from "./pages/ClientBookingsPage.jsx";
import ClientTransactionsPage from "./pages/ClientTransactionsPage.jsx";
import FreelancerBookingsPage from "./pages/FreelancerBookingsPage.jsx";
import FreelancerIncomePage from "./pages/FreelancerIncomePage.jsx";
import Navbar from "./components/Navbar.jsx";
import MyGigsPage from "./pages/MyGigsPage.jsx";
import CreateGigPage from "./pages/CreateGigPage.jsx";
import EditGigPage from "./pages/EditGigPage.jsx";

// Controls whether the navigation sidebar is displayed.
function AppLayout() {
    const location = useLocation();

    // Login and registration pages should not display
    // the authenticated navigation sidebar.
    const isAuthPage =
        location.pathname === "/login" ||
        location.pathname === "/register";

    return (
        <>
            {!isAuthPage && <Navbar />}

            <Routes>
                <Route
                    path="/"
                    element={<Navigate to="/login" replace />}
                />

                <Route
                    path="/login"
                    element={<LoginPage />}
                />

                <Route
                    path="/register"
                    element={<RegisterPage />}
                />

                <Route
                    path="/gigs"
                    element={
                        <ProtectedRoute>
                            <BrowseGigsPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/gigs/:id"
                    element={
                        <ProtectedRoute>
                            <GigDetailsPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/bookings"
                    element={
                        <ProtectedRoute allowedRoles={["client"]}>
                            <ClientBookingsPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/transactions"
                    element={
                        <ProtectedRoute allowedRoles={["client"]}>
                            <ClientTransactionsPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/freelancer/bookings"
                    element={
                        <ProtectedRoute allowedRoles={["freelancer"]}>
                            <FreelancerBookingsPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/freelancer/income"
                    element={
                        <ProtectedRoute allowedRoles={["freelancer"]}>
                            <FreelancerIncomePage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/freelancer/gigs"
                    element={
                        <ProtectedRoute allowedRoles={["freelancer"]}>
                            <MyGigsPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/freelancer/gigs/create"
                    element={
                        <ProtectedRoute allowedRoles={["freelancer"]}>
                            <CreateGigPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/freelancer/gigs/:id/edit"
                    element={
                        <ProtectedRoute allowedRoles={["freelancer"]}>
                            <EditGigPage />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AppLayout />
        </BrowserRouter>
    );
}

export default App;

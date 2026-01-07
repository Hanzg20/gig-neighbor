import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MobileBottomNav from "./components/MobileBottomNav";
import Index from "./pages/Index";
import ServiceDetail from "./pages/ServiceDetail";
import PostGig from "./pages/PostGig";
import Profile from "./pages/Profile";
import CategoryListing from "./pages/CategoryListing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Chat from "./pages/Chat";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Cart from "./pages/Cart";
import Community from "./pages/Community";
import MyListings from "./pages/MyListings";
import ProviderDashboard from "./pages/ProviderDashboard";
import ReviewSubmission from "./pages/ReviewSubmission";
import ProviderProfile from "./pages/ProviderProfile";
import NotFound from "./pages/NotFound";
import { CommunityProvider } from "./context/CommunityContext";

const queryClient = new QueryClient();

const App = () => {
  // 🚀 App Initializing...
  // console.log('   - Supabase URL Set:', !!import.meta.env.VITE_SUPABASE_URL);
  // console.log('   - Use Mock Data:', import.meta.env.VITE_USE_MOCK_DATA);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <CommunityProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/service/:id" element={<ServiceDetail />} />
              <Route path="/post-gig" element={<PostGig />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/category/:type" element={<CategoryListing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/community" element={<Community />} />
              <Route path="/my-listings" element={<MyListings />} />
              <Route path="/provider/dashboard" element={<ProviderDashboard />} />
              <Route path="/provider/orders" element={<Orders />} />
              <Route path="/review/:id" element={<ReviewSubmission />} />
              <Route path="/provider/:providerId" element={<ProviderProfile />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <MobileBottomNav />
          </CommunityProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};


export default App;


import LoginForm from "@/components/LoginForm";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen felt-bg flex flex-col justify-center p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-snooker-red rounded-full mb-4"></div>
        <h1 className="text-3xl font-bold text-white">Snooker Club Manager</h1>
        <p className="text-gray-300">Manage your snooker tables and games efficiently</p>
      </div>
      <LoginForm />
    </div>
  );
};

export default Login;

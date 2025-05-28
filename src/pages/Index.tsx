
import { Navigate } from "react-router-dom";

const Index = () => {
  // This is just a redirect to the Dashboard page
  return <Navigate to="/" replace />;
};

export default Index;

import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const CreateProfile = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/profile", { replace: true });
  }, [navigate]);

  return null;
};

// Explicit default export
export default CreateProfile;
export { CreateProfile };

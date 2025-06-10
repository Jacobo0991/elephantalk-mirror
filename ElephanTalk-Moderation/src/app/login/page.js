"use client";

import React from "react";
import { LuEye } from "react-icons/lu";
import { signIn } from "next-auth/react";
import ClipLoader from "react-spinners/ClipLoader";
import { toast } from "react-toastify";

function LoginPage() {
  const [formData, setFormData] = React.useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = React.useState(false);

  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const error = searchParams.get("error");
    if (error === "CredentialsSignin") {
      toast.error("Credenciales incorrectas");
    }
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handlesubmit = (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      signIn("credentials", {
        username: formData.username,
        password: formData.password,
        redirect: true,
        callbackUrl: "/",
      });
    } catch (error) {
      console.log(error.message);
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-dark-login bg-cover">
      <div className="bg-white p-10 rounded-lg shadow-lg text-center w-full max-w-sm">
        <div className="mb-6">
          <img
            src="/assets/logo.webp"
            alt="ElephanTalk Logo"
            className="mx-auto"
          />
        </div>
        <form onSubmit={handlesubmit}>
          <div className="mb-4">
            <input
              type="text"
              name="username"
              required
              className="w-full px-4 py-2 bg-white border-gray-300 border text-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Username or Email"
              value={formData.username}
              onChange={handleChange}
            />
          </div>
          <div className="mb-6 relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              name="password"
              className="w-full px-4 py-2 bg-white text-gray-600 border-gray-300 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
            <LuEye
              onClick={togglePasswordVisibility}
              className={`absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer ${
                showPassword ? "text-primary" : "text-gray-400"
              }`}
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-darkprim transition duration-200"
            disabled={loading}
          >
            {!loading ? (
              "Sign In"
            ) : (
              <ClipLoader loading={true} color="white" size={16} />
            )}
          </button>
        </form>
      </div>
    </main>
  );
}

export default LoginPage;

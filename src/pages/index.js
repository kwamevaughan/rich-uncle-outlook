import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { Icon } from "@iconify/react";
import useLogin from "@/hooks/useLogin";
import SimpleModal from "@/components/SimpleModal";


const LoginPage = ({ mode = "light", toggleMode }) => {
  const router = useRouter();
  const {
    loginData,
    setLoginData,
    showPassword,
    togglePasswordVisibility,
    handleLogin,
    handleLoginChange,
    handleSocialLogin,
    showForgotPasswordModal,
    setShowForgotPasswordModal,
    handleForgotPassword,
  } = useLogin();
    const currentYear = new Date().getFullYear();


  useEffect(() => {
    if (router.isReady) {
      console.log("LoginPage: Current route:", router.pathname);
    }
  }, [router.isReady, router.pathname]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-login pt-0">
      <div className="w-full md:w-2/5 flex flex-col justify-between overflow-y-auto gap-10 bg-white/70 backdrop-blur-lg border border-white/30 shadow-xl">
        <div className="flex-grow flex flex-col justify-center items-center">
          <div className="w-full max-w-md">
            <div className="py-4 px-4 mb-4 shadow-lg hover:shadow-none transition-all duration-500 bg-white/80 rounded-lg">
              <p
                className={`text-4xl font-black text-center ${
                  mode === "dark" ? "text-white" : "text-blue-900"
                }`}
              >
                Rich Uncle Outlook
              </p>
            </div>
          </div>

          <div className="w-full max-w-md py-4">
            <div className="pb-6 space-y-2">
              <p className="text-3xl text-blue-800 font-bold">Welcome back!</p>
              <p className="text-blue-900">
                Access the store dashboard using your email and password.
              </p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="mb-8">
                <label className="hidden" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={loginData.email}
                    placeholder="Enter your email"
                    onChange={handleLoginChange}
                    className="w-full bg-white/80 text-blue-950 rounded-lg py-2.5 md:py-3 px-2 focus:outline-none focus:border-blue-500"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-950">
                    <Icon icon="heroicons:envelope" className="w-5 h-5" />
                  </span>
                </div>
              </div>

              <div className="mb-8">
                <label className="hidden" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={loginData.password}
                    placeholder="Enter your password"
                    onChange={handleLoginChange}
                    className="w-full bg-white/80 text-blue-950 rounded-lg py-2.5 md:py-3 px-2 focus:outline-none focus:border-blue-500"
                  />
                  <span
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-lue-950 cursor-pointer"
                  >
                    {showPassword ? (
                      <Icon icon="heroicons:eye-slash" className="w-5 h-5" />
                    ) : (
                      <Icon icon="heroicons:eye" className="w-5 h-5" />
                    )}
                  </span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between mb-8 space-y-2 md:space-y-0">
                <div className="flex items-center">
                  <div
                    onClick={() =>
                      setLoginData((prev) => ({
                        ...prev,
                        rememberMe: !prev.rememberMe,
                      }))
                    }
                    className={`w-5 h-5 flex items-center justify-center border-2 border-blue-950 rounded-full cursor-pointer transition-all duration-200 ease-in-out ${
                      loginData.rememberMe ? "bg-transparent" : "bg-transparent"
                    }`}
                  >
                    {loginData.rememberMe && (
                      <Icon
                        icon="ic:baseline-check"
                        className="w-4 h-4 text-blue-950"
                      />
                    )}
                  </div>

                  <label
                    className="ml-2 text-blue-950 font-light text-sm md:text-base cursor-pointer"
                    onClick={() =>
                      setLoginData((prev) => ({
                        ...prev,
                        rememberMe: !prev.rememberMe,
                      }))
                    }
                  >
                    Remember me on this device
                  </label>
                </div>

                <span>
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(true)}
                    className="text-blue-950 font-light text-sm md:text-base hover:underline hover:text-red-600"
                  >
                    Forgot Password?
                  </button>
                </span>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-900 text-white font-bold py-3 rounded-full transform transition-transform duration-700 ease-in-out hover:scale-105"
              >
                Access Dashboard
              </button>
            </form>
          </div>
          <span>Copyright © {currentYear}, All rights reserved.</span>
        </div>
      </div>

      <div className="hidden md:block w-full md:w-3/5 bg-blue-950/10"></div>

      <SimpleModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
        title="Reset Password"
        mode={mode}
        width="max-w-md"
      >
        <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
          <label htmlFor="reset-email" className="text-sm font-medium">
            Enter your email address to reset your password:
          </label>
          <input
            id="reset-email"
            name="reset-email"
            type="email"
            required
            placeholder="Email address"
            className="w-full bg-white/80 text-blue-950 rounded-lg py-2 px-3 focus:outline-none focus:border-blue-500 border border-gray-200"
            value={loginData.email}
            onChange={handleLoginChange}
          />
          <button
            type="submit"
            className="w-full bg-blue-900 text-white font-bold py-2 rounded-lg mt-2 hover:bg-blue-800 transition-all duration-200"
          >
            Send Reset Link
          </button>
        </form>
      </SimpleModal>
    </div>
  );
};

export default LoginPage;

import React, {useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router-dom";
import {setUser} from "../redux/userReducer";
import axiosInstance from "../api/axiosInstance";

function Login() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // checking if the user data present in the localstorage then navigate home page
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData !== null) {
      navigate("/");
    }
  }, [navigate]);

  // handling the emial if email sent succussfully then set state isOTp sent to true for show otp entering interface
  const handleEmailForm = async (event) => {
    event.preventDefault();
    try {
      const response = await axiosInstance.post("accounts/otp-request/", {
        email,
      });
      setMessage(response.data.message);
      setIsOtpSent(true);
      console.log(response.data);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setMessage(error.response.data.error);
      } else {
        setMessage("An error occurred");
      }
    }
  };

  // handling the entering otp checking it is a number if number then focusing on next array element
  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus on the next input
    if (element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  // if entered otp is correct in backend session then it will login to homepage
  const handleOtpForm = async (event) => {
    event.preventDefault();
    const enteredOtp = otp.join("");
    try {
      const response = await axiosInstance.post("/accounts/otp-verification/", {
        otp: enteredOtp,
      });

      const userData = response.data;
      dispatch(setUser(userData));
      console.log(response.data);
      navigate("/");
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.error);
      } else {
        setMessage("An error occurred");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="p-3" style={{width: "440px"}}>
        <div className="max-w-md w-full p-6 bg-white rounded">
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
            Login
          </h2>
          <div className="p-4">
            {!isOtpSent ? (
              <form onSubmit={handleEmailForm}>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your Email"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 focus:outline-none focus:border-violet-600"
                  required
                />
                {message && <p className="text-red-500 mb-4">{message}</p>}
                <button
                  type="submit"
                  className="w-full bg-violet-600 text-white py-2 px-4 rounded-md hover:bg-violet-800 transition duration-200"
                >
                  Send OTP
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpForm}>
                <label className="block text-sm text-gray-700 mb-2">
                  Enter OTP for verification
                </label>
                <div className="flex space-x-2 mb-4">
                  {otp.map((data, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      value={data}
                      onChange={(e) => handleOtpChange(e.target, index)}
                      className="w-12 h-12 border border-gray-300 rounded-md pl-4 py-3 focus:outline-none focus:border-violet-600"
                      required
                    />
                  ))}
                </div>
                {message && <p className="text-black mb-4">{message}</p>}
                <button
                  type="submit"
                  className="w-full bg-violet-600 text-white py-2 px-4 rounded-md hover:bg-violet-700 transition duration-200"
                >
                  Verify OTP
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

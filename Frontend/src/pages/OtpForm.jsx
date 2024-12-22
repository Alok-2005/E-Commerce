import { useState } from "react";
import { Key, Loader } from "lucide-react";

const OtpForm = ({ onSubmit, loading }) => {
  const [otp, setOtp] = useState("");

  const handleSubmit = async(e) => {
    e.preventDefault();
   await onSubmit(otp);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="otp" className="block text-sm font-medium text-gray-300">
          Enter OTP
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Key className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            id="otp"
            type="text"
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 
            rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 
            focus:border-emerald-500 sm:text-sm text-white"
            placeholder="Enter OTP"
            maxLength={6}
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent 
        rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 
        hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
        focus:ring-emerald-500 transition duration-150 ease-in-out disabled:opacity-50"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
            Verifying...
          </>
        ) : (
          <>
            <Key className="mr-2 h-5 w-5" aria-hidden="true" />
            Verify OTP
          </>
        )}
      </button>
    </form>
  );
};
export default OtpForm;
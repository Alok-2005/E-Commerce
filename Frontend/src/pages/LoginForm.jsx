import { useState } from "react";
import { Mail, Lock, LogIn, Loader } from "lucide-react";
import { Link } from "react-router-dom";

const LoginForm = ({ onSubmit, loading }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300">
          Email address
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 
            rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 
            focus:border-emerald-500 sm:text-sm text-white"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300">
          Password
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 
            rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 
            focus:border-emerald-500 sm:text-sm text-white"
            placeholder="••••••••"
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
            Loading...
          </>
        ) : (
          <>
            <LogIn className="mr-2 h-5 w-5" aria-hidden="true" />
            Login
          </>
        )}
      </button>

      <p className="mt-8 text-center text-sm text-gray-400">
        Don't have an account?{" "}
        <Link to="/signup" className="font-medium text-emerald-400 hover:text-emerald-300">
          Sign up here
        </Link>
      </p>
    </form>
  );
};
export default LoginForm;
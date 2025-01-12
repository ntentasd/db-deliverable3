import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { isAuthenticated, isAdmin, setAuthToken } = useAuth();

  const handleLogout = () => {
    setAuthToken(null);
  };

  return (
    <nav className="bg-black text-white py-4 shadow-md px-8 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          <Link to="/">🚗 DataDrive</Link>
        </h1>
        <ul className="flex space-x-6">
          {isAdmin ? (
            <>
              <li>
                <Link to="/cars" className="hover:text-gray-400">
                  Cars
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-gray-400">
                  Profile
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="hover:text-gray-400 focus:outline-none"
                >
                  Logout
                </button>
              </li>
            </>
          ) : isAuthenticated ? (
            <>
              <li>
                <Link to="/rent" className="hover:text-gray-400">
                  Rent
                </Link>
              </li>
              <li>
                <Link to="/trips" className="hover:text-gray-400">
                  Trips
                </Link>
              </li>
              <li>
                <Link to="/subscriptions" className="hover:text-gray-400">
                  Subscriptions
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-gray-400">
                  Profile
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="hover:text-gray-400 focus:outline-none"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/rent" className="hover:text-gray-400">
                  Rent
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-gray-400 focus:outline-none">
                  Login
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const isAuthenticated = !!localStorage.getItem("authToken");

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/auth");
  };
  return (
    <nav className="bg-blue-600 text-white py-4 shadow-md px-8">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          <Link to="/">🚗 DataDrive</Link>
        </h1>
        <ul className="flex space-x-6">
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
          {isAuthenticated ? (
            <li>
              <Link to="/profile" className="hover:text-gray-400">
                Profile
              </Link>
            </li>
          ) : (
            <></>
          )}
          <li>
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="hover:text-gray-400 focus:outline-none"
              >
                Logout
              </button>
            ) : (
              <Link to="/auth" className="hover:text-gray-400 focus:outline-none">
                Login
              </Link>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

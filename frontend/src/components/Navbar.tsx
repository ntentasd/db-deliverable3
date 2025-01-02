import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-blue-600 text-white py-4 shadow-md px-8">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          <Link to="/">🚗 DataDrive</Link>
        </h1>
        <ul className="flex space-x-6">
          <li>
            <Link to="/" className="hover:underline">
              Home
            </Link>
          </li>
          <li>
            <Link to="/cars" className="hover:underline">
              Cars
            </Link>
          </li>
          <li>
            <Link to="/trips" className="hover:underline">
              Trips
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

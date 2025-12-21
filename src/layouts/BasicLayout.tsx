import { Link, Outlet, useLocation } from "react-router-dom";

const BasicLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-blue-600">My App</h1>
            <nav>
              <ul className="flex space-x-6">
                <li>
                  <Link
                    to="/"
                    className={`hover:text-blue-600 transition-colors ${
                      location.pathname === "/"
                        ? "text-blue-600 font-medium"
                        : "text-gray-600"
                    }`}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className={`hover:text-blue-600 transition-colors ${
                      location.pathname === "/about"
                        ? "text-blue-600 font-medium"
                        : "text-gray-600"
                    }`}
                  >
                    About
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      <main className="grow container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t py-6">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>© 2025 My App. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default BasicLayout;
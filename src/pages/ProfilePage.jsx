import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fetch user on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch("https://new-grocery-backend-uwyb.onrender.com/api/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        const data = await res.json();
        setUser(data);
      })
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate]);

  // Open modal and set form fields with current user data
  const openModal = () => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
      address: user.address || "",
    });
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Handle form input changes
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Handle form submit - PATCH to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("https://new-grocery-backend-uwyb.onrender.com/api/users/me", {
        method: "PUT", // or PUT if your backend expects it
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to update profile");
      }

      const updatedUser = await res.json();
      setUser(updatedUser);
      setIsModalOpen(false); // close modal on success
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle sign out
  const handleSignOut = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!user) {
    // Add loader or spinner if you want here
    return null;
  }

  return (
    <div className="min-h-screen bg-yellow-50">
      <header className="bg-yellow-400 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center bg-green-400 px-2 py-1 rounded-lg">
            <h1 className="text-xl font-bold text-gray-800">Vegvendors</h1>
          </Link>
        </div>
        <div className="flex items-center space-x-3">
          <i
            className="fas fa-shopping-cart text-xl text-gray-800 cursor-pointer"
            onClick={() => navigate("/cart")}
          />
          <i className="fas fa-user text-xl text-gray-800"></i>
        </div>
      </header>

      <div className="px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {/* User info card */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center">
                <i className="fas fa-user text-3xl text-gray-800"></i>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{user.name || "John Doe"}</h2>
                <p className="text-gray-600">{user.email || "john.doe@email.com"}</p>
                <p className="text-sm text-gray-500">
                  Member since{" "}
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                      })
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Address section below user info */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-semibold text-gray-800 mb-1">Delivery Address</h4>
              {user.address ? (
                <p className="text-sm text-gray-600">{user.address}</p>
              ) : (
                <p className="text-sm text-gray-600 italic">No address set</p>
              )}
            </div>

            <button
              onClick={openModal}
              className="w-full bg-yellow-400 text-gray-800 px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors font-medium"
            >
              Edit Profile
            </button>
          </div>

          {/* My Order button */}
          <button
            onClick={() => navigate("/order")}
            className="w-full bg-green-400 text-gray-800 px-6 py-4 rounded-lg hover:bg-green-500 transition-colors font-semibold flex items-center justify-center space-x-2 mb-6"
          >
            <i className="fas fa-shopping-bag"></i>
            <span>My Order</span>
          </button>

          {/* Sign out button */}
          <button
            onClick={handleSignOut}
            className="w-full bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors font-semibold flex items-center justify-center space-x-2"
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()} // Prevent modal close on content click
          >
            <h3 className="text-xl font-semibold mb-4">Edit Profile</h3>

            {error && <p className="text-red-600 mb-2">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-yellow-400"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-yellow-400"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1" htmlFor="address">
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-yellow-400"
                  placeholder="Enter your delivery address"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-yellow-400 text-gray-800 rounded hover:bg-yellow-500 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="bg-gray-800 text-white px-4 py-8 mt-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-lg font-semibold mb-4 flex items-center">
                <i className="fas fa-shopping-cart mr-2"></i>FreshMart
              </h4>
              <p className="text-gray-300 text-sm">
                Your trusted partner for fresh groceries delivered fast to your doorstep.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Quick Links</h5>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <a href="#" className="hover:text-white">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Delivery Info
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Contact Info</h5>
              <div className="space-y-2 text-sm text-gray-300">
                <p>
                  <i className="fas fa-phone mr-2"></i>+1 (555) 123-4567
                </p>
                <p>
                  <i className="fas fa-envelope mr-2"></i>support@freshmart.com
                </p>
                <p>
                  <i className="fas fa-clock mr-2"></i>24/7 Support
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-6 pt-4 text-center text-sm text-gray-400">
            <p>&copy; 2025 FreshMart. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

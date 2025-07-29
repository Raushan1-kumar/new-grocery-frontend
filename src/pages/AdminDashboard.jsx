import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000");

const cardColors = [
  "bg-green-100 text-green-700 border-green-400",
  "bg-blue-100 text-blue-700 border-blue-400",
  "bg-blue-100 text-blue-700 border-blue-400",
  "bg-pink-100 text-pink-700 border-pink-400",
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("active");
  const [billOrder, setBillOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fetch orders function memoized
  const fetchOrders = useMemo(
    () => async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("admintoken");
        const res = await axios.get("http://localhost:5000/api/orders/admin", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      }
      setLoading(false);
    },
    []
  );

  useEffect(() => {
    socket.on("orderPlaced", fetchOrders);
    socket.on("orderUpdated", fetchOrders);
    return () => {
      socket.off("orderPlaced", fetchOrders);
      socket.off("orderUpdated", fetchOrders);
    };
  }, [fetchOrders]);

  useEffect(() => {
    const admintoken = localStorage.getItem("admintoken");
    if (!admintoken) navigate("/home");
    fetchOrders();
  }, [fetchOrders, navigate]);

  // Helper: Calculate subtotal for an order
  function orderTotal(order) {
    return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  // Helper: Calculate final total after discount
  function orderFinalTotal(order) {
    return orderTotal(order) - (order.totalDiscount || 0);
  }

  // Filtered order lists based on status
  const activeOrders = orders.filter(
    (order) => order.status === "Processing" || order.status === "Shipped"
  );
  const completedOrders = orders.filter(
    (order) => order.status === "Delivered" || order.status === "Cancelled"
  );

  // Dashboard stats
  const stats = {
    totalOrders: orders.length,
    revenue: orders.reduce((sum, order) => sum + orderFinalTotal(order), 0),
    products: 38, // TODO: replace with real product count
    pendingOrders: activeOrders.length,
  };

  // Remove item from order
  const handleRemoveItem = async (orderId, itemId) => {
    try {
      const token = localStorage.getItem("admintoken");
      await axios.delete(
        `http://localhost:5000/api/orders/admin/${orderId}/items/${itemId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders(); // Refresh orders after removing item
      setBillOrder(null); // Close modal
    } catch (err) {
      alert("Failed to remove item: " + err.message);
    }
  };

  // Update order status
  const markOrderAs = async (status) => {
    setUpdatingStatus(true);
    try {
      const token = localStorage.getItem("admintoken");
      await axios.patch(
        `http://localhost:5000/api/orders/admin/${billOrder._id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchOrders(); // Refresh orders after status change
      setBillOrder(null);
    } catch (err) {
      alert("Failed to update order status: " + err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-5 pb-10 px-2 sm:px-0 relative">
      {/* Header */}
      <div className="flex items-center mb-6 px-2 md:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Dashboard</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-8 mb-5 px-2 md:px-8">
        <div
          className={`${cardColors[0]} rounded-xl px-3 py-4 border flex flex-col items-center shadow-sm`}
        >
          <div className="text-lg font-bold">{stats.totalOrders}</div>
          <div className="text-xs opacity-80">Total Orders</div>
        </div>
        <div
          className={`${cardColors[1]} rounded-xl px-3 py-4 border flex flex-col items-center shadow-sm`}
        >
          <div className="text-lg font-bold">₹{stats.revenue.toFixed(2)}</div>
          <div className="text-xs opacity-80">Revenue</div>
        </div>
        <div
          className={`${cardColors[2]} rounded-xl px-3 py-4 border flex flex-col items-center shadow-sm`}
        >
          <div className="text-lg font-bold">{stats.products}</div>
          <div className="text-xs opacity-80">Products</div>
        </div>
        <div
          className={`${cardColors[3]} rounded-xl px-3 py-4 border flex flex-col items-center shadow-sm`}
        >
          <div className="text-lg font-bold">{stats.pendingOrders}</div>
          <div className="text-xs opacity-80">Pending Orders</div>
        </div>
      </div>

      {/* Tab Switch */}
      <div className="flex gap-2 md:gap-3 mb-4 mt-6 px-2 md:px-8">
        <button
          onClick={() => setTab("active")}
          className={`rounded-full px-4 py-1 text-base font-semibold border-none shadow ${
            tab === "active"
              ? "bg-blue-400 text-blue-900"
              : "bg-gray-200 text-gray-800 hover:bg-blue-200"
          }`}
        >
          Active Orders ({activeOrders.length})
        </button>
        <button
          onClick={() => setTab("completed")}
          className={`rounded-full px-4 py-1 text-base font-semibold border-none shadow ${
            tab === "completed"
              ? "bg-green-300 text-green-900"
              : "bg-gray-200 text-gray-800 hover:bg-green-100"
          }`}
        >
          Completed Orders ({completedOrders.length})
        </button>
      </div>

      {/* Order List */}
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-xl px-2 py-2 sm:px-4 sm:py-4 shadow">
          <p className="font-semibold text-md mb-2 text-gray-600 border-b pb-2">
            {tab === "active" ? "Active Orders" : "Completed Orders"}
          </p>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (tab === "active" ? activeOrders : completedOrders).length === 0 ? (
            <div className="text-gray-400 text-sm mt-5 text-center">
              No {tab === "active" ? "active" : "completed"} orders.
            </div>
          ) : (
            (tab === "active" ? activeOrders : completedOrders).map((order) => (
              <div
                key={order._id}
                className={`flex items-center py-2 px-1 rounded hover:bg-blue-50 cursor-pointer justify-between border-b last:border-none`}
                onClick={() => setBillOrder(order)}
                style={{ fontSize: "0.98rem" }}
              >
                <div className="flex items-center gap-2">
                  <span className="bg-blue-200 text-blue-700 p-2 rounded-full">
                    <i className="fas fa-receipt"></i>
                  </span>
                  <div>
                    <div className="font-bold text-gray-800">Order #{order._id.slice(-6)}</div>
                    <div className="text-xs text-gray-600">
                      {order.shop?.name
                        ? `${order.shop.name} (Shop)`
                        : order.user?.name || "Unknown User"}
                    </div>
                    <div className="text-xs text-gray-400">Items: {order.items.length}</div>
                  </div>
                </div>
                <div className="text-right min-w-[80px]">
                  <div
                    className={`font-bold text-lg ${
                      order.status === "Processing" || order.status === "Shipped"
                        ? "text-blue-600"
                        : "text-green-600"
                    }`}
                  >
                    ₹{orderFinalTotal(order).toFixed(2)}
                  </div>
                  {order.totalDiscount > 0 && (
                    <div className="text-xs text-green-700">
                      Discount: -₹{order.totalDiscount.toFixed(2)}
                    </div>
                  )}
                  <div className="flex items-center gap-1 justify-end mt-1">
                    <span className="text-xs font-medium">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    <span
                      className={`${
                        order.status === "Processing" || order.status === "Shipped"
                          ? "bg-blue-200 text-blue-700"
                          : "bg-green-200 text-green-800"
                      } px-2 py-0.5 rounded-full text-[11px] font-semibold ml-2`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Login as Customer Button */}
        <div>
          <button
            className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition"
            onClick={() => {
              localStorage.removeItem("admintoken");
              navigate("/login");
            }}
          >
            Login as Customer
          </button>
          <div className="flex flex-row w-full justify-between mt-1 gap-2">
            <button
              className="mt-4 w-full bg-blue-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition"
              onClick={() => navigate("/admin/offer-form")}
            >
              Add Offer
            </button>
            <button
              className="mt-4 w-full bg-red-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition"
              onClick={() => navigate("/admin/offer-management")}
            >
              See All Offers
            </button>
          </div>
        </div>
      </div>

      {/* Bill Modal */}
      {billOrder && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
          onClick={() => setBillOrder(null)}
        >
          <div
            className="bg-white w-[90vw] sm:w-[400px] rounded-lg shadow-lg p-5 relative animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute right-2 top-2 text-2xl text-gray-400 hover:text-red-400"
              onClick={() => setBillOrder(null)}
            >
              &times;
            </button>
            <h3 className="text-lg font-bold mb-4 text-gray-800 text-center">Order Bill</h3>
            <div className="bg-gray-50 rounded p-3 mb-4">
              <div className="font-semibold mb-1">Order #{billOrder._id.slice(-6)}</div>
              <div className="text-xs text-gray-600 mb-0.5">
                Date: {new Date(billOrder.createdAt).toLocaleDateString()}
              </div>
              <div className="text-xs text-gray-600">
                {billOrder.shop?.name ? "Ordered for Shop" : "Ordered by Customer"}:{" "}
                <span className="font-medium">
                  {billOrder.shop?.name || billOrder.user?.name || "Unknown User"}
                </span>
              </div>
              <div className="text-xs text-gray-600">
                Address:{" "}
                <span className="font-medium">
                  {billOrder.shop?.address || billOrder.user?.address || "Not specified"}
                </span>
              </div>
              {!billOrder.shop?.address && (
                <div className="text-xs text-gray-600">Phone: {billOrder.user?.number || "N/A"}</div>
              )}
            </div>
            <div>
              <div className="font-medium mb-1">Items:</div>
              {billOrder.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center mb-2 gap-2"
                >
                  <button
                    className="text-red-500 hover:text-red-700 text-xs mr-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveItem(billOrder._id, item._id);
                    }}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                  <div className="flex-1">
                    <div className="font-semibold">{item.productName}</div>
                    <span className="text-xs text-gray-500">
                      ₹{item.price} x {item.quantity}
                    </span>
                  </div>
                  <span className="font-semibold">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total, Discount, Final Total */}
            <div className="mt-3 pt-2 border-t space-y-1">
              <div className="flex justify-between items-center">
                <span className="">Subtotal:</span>
                <span>₹{orderTotal(billOrder).toFixed(2)}</span>
              </div>
              {billOrder.totalDiscount > 0 && (
                <div className="flex justify-between items-center text-green-700">
                  <span>Discount:</span>
                  <span>-₹{billOrder.totalDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center font-bold text-green-600">
                <span>Total:</span>
                <span>₹{orderFinalTotal(billOrder).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                className={`bg-green-600 hover:bg-green-700 text-white flex-1 py-2 rounded-lg font-semibold disabled:opacity-50 ${
                  billOrder.status === "Delivered" ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => markOrderAs("Delivered")}
                disabled={updatingStatus || billOrder.status === "Delivered"}
              >
                {updatingStatus ? "Updating..." : "Mark Completed"}
              </button>
              <button
                className="bg-blue-400 hover:bg-blue-500 text-blue-900 flex-1 py-2 rounded-lg font-semibold"
                onClick={() => setBillOrder(null)}
                disabled={updatingStatus}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top-right Buttons */}
      <div>
        <button
          className="absolute top-4 right-4 bg-red-600 text-white px-3 py-2 rounded-full shadow hover:bg-blue-500 transition-colors"
          onClick={() => navigate("/admin/add-product")}
          title="Add Product"
        >
          <i className="fas fa-plus"></i> Add Product
        </button>
      </div>
    </div>
  );
}

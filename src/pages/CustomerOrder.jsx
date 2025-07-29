"use client";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("https://new-grocery-backend-uwyb.onrender.com");

function OrderDetail() {
  const { orderId } = useParams(); // Get orderId from URL
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- Fetch order data ---
  useEffect(() => {
    socket.onAny((event, ...args) => {
      // Log for debugging
      console.log("Socket event received:", event, args);
    });
  }, []);

  async function fetchOrder() {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please log in.");
      const res = await fetch(`https://new-grocery-backend-uwyb.onrender.com/api/orders/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success && data.orders?.length) {
        // Find the order by orderId if provided, else pick latest
        let foundOrder;
        if (orderId && orderId !== "latest") {
          foundOrder = data.orders.find((o) => o._id === orderId);
        }
        if (!foundOrder) {
          const sorted = data.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          foundOrder = sorted[0];
        }
        setOrder(foundOrder || null);
      } else {
        setError("Order not found");
      }
    } catch (err) {
      setError(err.message || "Failed to fetch order");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    socket.on("orderPlaced", fetchOrder);
    socket.on("orderUpdated", fetchOrder);

    return () => {
      socket.off("orderPlaced", fetchOrder);
      socket.off("orderUpdated", fetchOrder);
    };
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line
  }, [orderId]);

  // --- Cancel Order Helper ---
  const cancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `https://new-grocery-backend-uwyb.onrender.com/api/orders/${order._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        alert("Order cancelled");
        navigate("/cart");
      } else {
        const data = await res.json();
        setError(data.message || "Failed to cancel order");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  // --- UI ---
  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (error) return <div className="p-4 text-red-500 text-center">{error}</div>;
  if (!order) {
    return (
      <div className="p-4 text-center">
        Order not found.{" "}
        <button
          onClick={() => navigate("/category/rice-daal")}
          className="text-blue-500 underline"
        >
          Shop More Product
        </button>
      </div>
    );
  }

  // --- Totals ---
  const totalPrice = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount = order.totalDiscount || 0;
  const finalTotal = totalPrice - discount;

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md my-6">
      <h2 className="text-lg font-bold mb-2">Order #{order._id}</h2>
      <p className="text-sm text-gray-500 mb-4">
        {new Date(order.createdAt).toLocaleString()}
      </p>
      <p className="mb-4">
        <span className="font-semibold">Status:</span> {order.status}
      </p>
      {order.shop && order.shop.name && (
        <div className="mb-2 text-xs text-gray-700">
          <span className="font-semibold">Shop:</span> {order.shop.name}
          {order.shop.address && (
            <> | <span className="font-semibold">Address:</span> {order.shop.address}</>
          )}
        </div>
      )}
      <div className="border-t border-gray-200 mb-4"></div>

      {/* TABLE */}
      <table className="w-full mb-4">
        <thead>
          <tr>
            <th className="text-left">Product</th>
            <th className="text-center">Qty</th>
            <th className="text-center">Price</th>
            <th className="text-center">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item._id} className="border-b border-gray-100">
              <td className="py-2 flex items-center">
                {/* If you want to show image, uncomment this */}
                {/* {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="w-10 h-10 rounded-lg object-cover mr-2"
                  />
                )} */}
                <span className="font-medium">{item.productName}</span>
                {item.size ? (
                  <span className="ml-2 text-xs text-gray-500">({item.size})</span>
                ) : null}
              </td>
              <td className="text-center py-2">{item.quantity}</td>
              <td className="text-center py-2">₹{item.price}</td>
              <td className="text-center py-2">
                ₹{(item.price * item.quantity).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="3" className="text-right font-semibold py-2">
              Subtotal:
            </td>
            <td className="text-center font-semibold py-2">
              ₹{totalPrice.toFixed(2)}
            </td>
          </tr>
          {discount > 0 && (
            <tr>
              <td colSpan="3" className="text-right font-semibold py-2 text-green-700">
                Discount:
              </td>
              <td className="text-center font-semibold py-2 text-green-700">
                -₹{discount.toFixed(2)}
              </td>
            </tr>
          )}
          <tr>
            <td colSpan="3" className="text-right font-semibold py-2">
              Grand Total:
            </td>
            <td className="text-center font-bold py-2 text-lg">
              ₹{finalTotal.toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Applied offers section */}
      {order.appliedOffers && order.appliedOffers.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-sm text-green-700 mb-1">Applied Offers:</h4>
          <ul className="ml-4 list-disc text-xs text-green-900">
            {order.appliedOffers.map((offer) => (
              <li key={offer.id}>
                {offer.discount}% off on <span className="font-medium">{offer.productName}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {order.status === "Processing" && (
        <button
          onClick={cancelOrder}
          className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
        >
          Cancel Order
        </button>
      )}
      <button
        onClick={() => navigate("/category/rice-daal")}
        className="mt-4 w-full bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400"
      >
        Shop more Product
      </button>
    </div>
  );
}

export default OrderDetail;

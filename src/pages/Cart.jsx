"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderMessage, setOrderMessage] = useState("");
  const [orderError, setOrderError] = useState("");
  const [showOffers, setShowOffers] = useState(false);
  const [appliedOffers, setAppliedOffers] = useState([]); // Array instead of single offer
  const [updateError, setUpdateError] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [updateQueue, setUpdateQueue] = useState([]);
  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [offersError, setOffersError] = useState("");
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const [disabledOfferIds, setDisabledOfferIds] = useState(() => {
    // Load disabled offers from localStorage or init empty
    const disabled = localStorage.getItem("disabledOffers");
    return disabled ? JSON.parse(disabled) : [];
  });

  // Fetch offers from backend
  useEffect(() => {
    async function fetchOffers() {
      setOffersLoading(true);
      setOffersError("");
      try {
        const response = await fetch("http://localhost:5000/api/offers");
        if (!response.ok) throw new Error("Failed to fetch offers");
        const data = await response.json();
        if (data.success && Array.isArray(data.offers)) {
          setOffers(
            data.offers
              .map((offer) => ({
                ...offer,
                id: offer._id || offer.id,
                productName: offer.product.productName || "",
                description: offer.description || "",
                minPurchase: parseFloat(offer.minPurchase) || 0,
                discount: parseFloat(offer.discount) || 0,
              }))
              .filter((offer) => !disabledOfferIds.includes(offer.id)) // Filter disabled offers
          );
        } else {
          setOffers([]);
          setOffersError("No offers available");
        }
      } catch (err) {
        setOffersError(err.message || "Error loading offers");
        setOffers([]);
      } finally {
        setOffersLoading(false);
      }
    }
    fetchOffers();
  }, [disabledOfferIds]);

  // Fetch initial cart from backend
  useEffect(() => {
    async function fetchCart() {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:5000/api/cart",
          {
            headers: {
              Authorization: "Bearer " + token,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        const cartItems = (data.cart?.items || []).map((item) => ({
          ...item,
          id: item._id,
          productId: item.productId?._id || item.productId,
          productName: item.productId?.productName || item.productName,
          imageUrl: item.productId?.imageUrl || item.imageUrl,
          size: item.size,
          price: parseFloat(item.price) || 0,
          image:
            item.productId?.imageUrl || item.imageUrl || "/placeholder.png",
          quantity: parseInt(item.quantity) || 1,
        }));
        setCartItems(cartItems);
      } catch (err) {
        setCartItems([]);
        setUpdateError("Failed to load cart.");
      } finally {
        setLoading(false);
      }
    }
    fetchCart();
  }, []);

  // Process update queue sequentially
  const processQueue = useCallback(async () => {
    if (updateQueue.length === 0 || isSyncing) return;
    setIsSyncing(true);
    const updates = [...updateQueue];
    setUpdateQueue([]);
    try {
      const token = localStorage.getItem("token");
      for (const update of updates) {
        await fetch(
          "http://localhost:5000/api/cart/update",
          {
            method: "PUT",
            headers: {
              Authorization: "Bearer " + token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              productId: update.productId,
              size: update.size,
              quantity: update.quantity,
            }),
          }
        );
      }
      // Fetch updated cart
      const response = await fetch(
        "http://localhost:5000/api/cart",
        {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      const updatedCartItems = (data.cart?.items || []).map((item) => ({
        ...item,
        id: item._id,
        productId: item.productId?._id || item.productId,
        productName: item.productId?.productName || item.productName,
        imageUrl: item.productId?.imageUrl || item.imageUrl,
        image: item.productId?.imageUrl || item.imageUrl || "/placeholder.png",
        price: parseFloat(item.price) || 0,
        quantity: parseInt(item.quantity) || 1,
      }));
      setCartItems(updatedCartItems);
      setUpdateError("");
    } catch (err) {
      setUpdateError("Failed to sync cart. Changes may not be saved.");
    } finally {
      setIsSyncing(false);
    }
  }, [updateQueue, isSyncing]);

  useEffect(() => {
    processQueue();
  }, [updateQueue, processQueue]);

  // Debounced quantity update
  const updateQuantity = (id, change) => {
    setUpdateError("");
    setCartItems((prevItems) => {
      const item = prevItems.find(
        (item) => item.id === id || item._id === id
      );
      if (!item) return prevItems;
      const newQuantity = (parseInt(item.quantity) || 1) + change;
      if (newQuantity <= 0) {
        removeItem(id);
        return prevItems;
      }
      const updatedItems = prevItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      );

      if (debounceTimeout) clearTimeout(debounceTimeout);

      const newTimeout = setTimeout(() => {
        setUpdateQueue((prev) => [
          ...prev.filter((u) => u.productId !== item.productId),
          {
            productId: item.productId,
            size: item.size,
            quantity: newQuantity,
          },
        ]);
      }, 500);

      setDebounceTimeout(newTimeout);
      return updatedItems;
    });
  };

  const removeItem = async (id) => {
    const item = cartItems.find((item) => item.id === id || item._id === id);
    if (!item) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await fetch(
        `http://localhost:5000/api/cart/remove/${item.productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
        }
      );
      const response = await fetch(
        "http://localhost:5000/api/cart",
        {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      const updatedCartItems = (data.cart?.items || []).map((item) => ({
        ...item,
        id: item._id,
        productId: item.productId?._id || item.productId,
        productName: item.productId?.productName || item.productName,
        imageUrl: item.productId?.imageUrl || item.imageUrl,
        image: item.productId?.imageUrl || item.imageUrl || "/placeholder.png",
        price: parseFloat(item.price) || 0,
        quantity: parseInt(item.quantity) || 1,
      }));
      setCartItems(updatedCartItems);
      setUpdateQueue([]);
      setAppliedOffers([]);
    } catch (err) {
      setUpdateError("Failed to remove item.");
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5000/api/cart/clear", {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      });
      setCartItems([]);
      setUpdateQueue([]);
      setAppliedOffers([]);
    } catch (err) {
      setUpdateError("Failed to clear cart.");
    } finally {
      setLoading(false);
    }
  };

  const getTotalItems = () =>
    cartItems.reduce(
      (total, item) => total + (parseInt(item.quantity) || 1),
      0
    );

  const getSubtotal = () =>
    cartItems.reduce(
      (total, item) =>
        total + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1),
      0
    );

  const getShipping = () => (getSubtotal() > 50 ? 0 : 5.99);

  // Calculate total discount from all applied offers
  const getDiscount = useCallback(() => {
    if (!appliedOffers.length) return 0;
    let totalDiscount = 0;
    appliedOffers.forEach((offer) => {
      cartItems.forEach((item) => {
        if (
          item.productName.toLowerCase() === offer.productName.toLowerCase() &&
          (parseFloat(item.price) * (parseInt(item.quantity) || 1)) >= parseFloat(offer.minPurchase)
        ) {
          const itemTotal = parseFloat(item.price) * (parseInt(item.quantity) || 1);
          totalDiscount += (itemTotal * parseFloat(offer.discount)) / 100;
        }
      });
    });
    return parseFloat(totalDiscount.toFixed(2));
  }, [cartItems, appliedOffers]);

  const getTotal = useCallback(() => {
    const total = getSubtotal() + getShipping() - getDiscount();
    return parseFloat(total.toFixed(2));
  }, [getSubtotal, getShipping, getDiscount]);

  // Apply an offer and disable it from next time
  const applyOffer = (offer) => {
    if (appliedOffers.find((o) => o.id === offer.id)) {
      // Offer already applied, do nothing
      return;
    }
    setAppliedOffers((prev) => [...prev, offer]);

    // Disable offer from next offer modal open - save to localStorage
    setDisabledOfferIds((prev) => {
      const newDisabled = [...prev, offer.id];
      localStorage.setItem("disabledOffers", JSON.stringify(newDisabled));
      return newDisabled;
    });

    setShowOffers(false);
  };


  const placeOrder = async () => {
    setLoading(true);
    setOrderMessage("");
    setOrderError("");

    if (cartItems.length === 0) {
      setOrderError("Your cart is empty.");
      setLoading(false);
      return;
    }

    if (updateQueue.length > 0) {
      setOrderError("Please wait for cart to sync before placing order.");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setOrderError("Please log in to place an order.");
        navigate("/login");
        return;
      }

      const orderItems = cartItems.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: parseInt(item.quantity) || 1,
        price: parseFloat(item.price) || 0,
        size: item.size || null,
        imageUrl: item.imageUrl || null,
      }));

      // Calculate total discount amount
      const totalDiscount = getDiscount();

      const orderData = {
        items: orderItems,
        appliedOffers: appliedOffers.length
          ? appliedOffers.map((offer) => ({
              id: offer.id,
              discount: parseFloat(offer.discount),
              productName: offer.productName,
            }))
          : null,
        totalDiscount: totalDiscount, // Send total discount amount only
      };

      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        setOrderMessage("Order placed successfully!");
        setAppliedOffers([]);
        setDisabledOfferIds([]); // Reset disabled offers if desired after order placed
        localStorage.removeItem("disabledOffers");
        navigate("/order");
      } else {
        const data = await response.json();
        setOrderError(data.message || "Failed to place order. Please try again.");
      }
    } catch (err) {
      setOrderError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => `₹${parseFloat(amount).toFixed(2)}`;

  if (loading && cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-green-600 font-bold text-lg">
          Loading cart...
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="flex items-center">
                  <h1 className="text-xl font-bold text-gray-800">Vegvendor</h1>
                </Link>
              </div>
            </div>
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-shopping-cart text-4xl text-gray-400"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-roboto">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link
              to="/category/rice-daal"
              className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors inline-flex items-center"
            >
              <i className="fas fa-shopping-bag mr-2"></i>
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-50">
      <header className="bg-yellow-400 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center bg-green-400 px-2 py-1 rounded-lg">
            <h1 className="text-xl font-bold text-gray-800">Vegvendor</h1>
          </Link>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <i className="fas fa-shopping-cart text-xl text-gray-800"></i>
            {getTotalItems() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getTotalItems()}
              </span>
            )}
          </div>
          <i
            className="fas fa-user text-xl text-gray-800"
            onClick={() => navigate("/profile")}
          ></i>
        </div>
      </header>

      <div className="px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Shopping Cart</h2>

          {orderMessage && (
            <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
              {orderMessage}
            </div>
          )}
          {orderError && (
            <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
              {orderError}
            </div>
          )}
          {updateError && (
            <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
              {updateError}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm"
                  >
                    <div className="flex items-start space-x-2">
                      <div className="w-12 h-12 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-800 mb-1">
                          {item.productName}
                        </h3>
                        <p className="text-gray-600 text-sm">Size: {item.size}</p>
                        <p className="text-sm font-bold text-green-600">
                          {formatCurrency(item.price)}
                        </p>
                      </div>
                      <div className="flex items-center mt-6">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="bg-red-500 text-white w-8 h-8 rounded-full hover:bg-red-600 transition-colors flex items-center justify-center"
                          disabled={isSyncing}
                        >
                          <i className="fas fa-minus text-sm"></i>
                        </button>
                        <span className="text-lg font-semibold text-gray-800 w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="bg-green-500 text-white w-8 h-8 rounded-full hover:bg-green-600 transition-colors flex items-center justify-center"
                          disabled={isSyncing}
                        >
                          <i className="fas fa-plus text-sm"></i>
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors flex items-center space-x-1 text-sm"
                        disabled={isSyncing}
                      >
                        <i className="fas fa-trash"></i>
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex justify-between items-center">
                <button
                  onClick={clearCart}
                  className="bg-red-500 text-sm text-white px-3 py-3 rounded-lg hover:bg-gray-600 transition-colors inline-flex items-center space-x-2"
                  disabled={isSyncing}
                >
                  <i className="fas fa-trash"></i>
                  <span>Clear Cart</span>
                </button>
                <div className="flex ml-2 space-x-2">
                  <Link
                    to="/category/rice-daal"
                    className="text-sm bg-green-400 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors inline-flex items-center space-x-2"
                  >
                    <i className="fas fa-arrow-left"></i>
                    <span>Continue Shopping</span>
                  </Link>
                </div>
              </div>

              <div className="flex justify-center mt-2 w-full">
                <button
                  onClick={() => setShowOffers(true)}
                  className="bg-blue-500 w-full flex justify-center text-sm text-white px-3 py-3 rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center space-x-2"
                  disabled={isSyncing}
                >
                  <i className="fas fa-tag"></i>
                  <span>Show Offers</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm sticky top-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h3>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({getTotalItems()} items)</span>
                    <span>{formatCurrency(getSubtotal())}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span>{formatCurrency(getShipping())}</span>
                  </div>
                  {appliedOffers.length > 0 && (
                    <>
                      {appliedOffers.map((offer) => (
                        <div
                          key={offer.id}
                          className="flex justify-between text-green-600"
                        >
                          {/* Only discount % shown, no description */}
                          <span>Discount ({parseFloat(offer.discount)}%)</span>
                          <span>
                            -{formatCurrency(
                              cartItems
                                .filter(
                                  (item) =>
                                    item.productName.toLowerCase() ===
                                      offer.productName.toLowerCase() &&
                                    parseFloat(item.price) *
                                      (parseInt(item.quantity) || 1) >=
                                      parseFloat(offer.minPurchase)
                                )
                                .reduce((sum, item) => {
                                  const itemTotal =
                                    parseFloat(item.price) *
                                    (parseInt(item.quantity) || 1);
                                  return (
                                    sum +
                                    (itemTotal * parseFloat(offer.discount)) / 100
                                  );
                                }, 0)
                            )}
                          </span>
                        </div>
                      ))}
                    </>
                  )}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-bold text-[#4CAF50]">
                      <span>Total</span>
                      <span>{formatCurrency(getTotal())}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={placeOrder}
                  disabled={loading || isSyncing}
                  className={`w-full ${
                    loading || isSyncing
                      ? "bg-yellow-300 cursor-not-allowed"
                      : "bg-yellow-400 hover:bg-yellow-500"
                  } text-gray-800 px-6 py-3 rounded-lg transition-colors font-semibold text-lg mb-3`}
                >
                  {loading || isSyncing ? "Processing..." : "Place Order"}
                </button>

                <div className="text-xs text-gray-500 text-center">
                  <p>Free delivery on orders above ₹50</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showOffers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Available Offers</h3>
              <button
                onClick={() => setShowOffers(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
            <div className="space-y-4">
              {offersLoading && <p className="text-gray-600">Loading offers...</p>}
              {offersError && <p className="text-red-500">{offersError}</p>}
              {!offersLoading && offers.length === 0 && (
                <p className="text-gray-600">No offers available at the moment.</p>
              )}
              {offers.map((offer) => {
                const isEligible = cartItems.some((item) => {
                  const itemTotal =
                    parseFloat(item.price) * (parseInt(item.quantity) || 1);
                  return (
                    item.productName.toLowerCase() === offer.productName.toLowerCase() &&
                    itemTotal >= parseFloat(offer.minPurchase)
                  );
                });
                const isApplied = appliedOffers.some((o) => o.id === offer.id);
                return (
                  <div
                    key={offer.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <h4 className="font-semibold text-gray-800">{offer.description}</h4>
                    <p className="text-sm text-gray-600">
                      For: {offer.productName}
                    </p>
                    <p className="text-sm text-gray-600">
                      Minimum purchase: {formatCurrency(parseFloat(offer.minPurchase))}
                    </p>
                    <p className="text-sm text-gray-600">
                      Discount: {parseFloat(offer.discount)}%
                    </p>
                    <button
                      onClick={() => applyOffer(offer)}
                      disabled={!isEligible || isApplied}
                      className={`mt-2 px-4 py-2 rounded-lg text-sm ${
                        isEligible && !isApplied
                          ? "bg-green-500 text-white hover:bg-green-600"
                          : "bg-gray-300 text-gray-600 cursor-not-allowed"
                      }`}
                    >
                      {isApplied ? "Already Applied" : isEligible ? "Apply Offer" : "Not Eligible"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
)}
      {/* <footer className="bg-gray-800 text-white px-4 py-8 mt-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-lg font-semibold mb-4 flex items-center">
                <i className="fas fa-shopping-cart mr-2"></i>
                FreshMart
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
      </div>
      </div>
      </footer> */}

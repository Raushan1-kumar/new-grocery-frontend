"use client";
import React, { useEffect, useState } from "react";

export default function OffersManagement() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editOfferId, setEditOfferId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    categoryName: "",
    productId: "",
    minPurchase: "",
    discount: "",
    description: "",
    createdBySeller: "",
  });
  const [productsByCategory, setProductsByCategory] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Utility: categories list as you provided earlier
  const categories = [
    { id: "fruits-vegetables", name: "Fruits/Vegetables" },
    { id: "rice-daal", name: "Rice/Daal" },
    { id: "oil-ghee", name: "Oil/Ghee" },
    { id: "sweets", name: "Sweets" },
    { id: "spices", name: "Spices" },
    { id: "cakes", name: "Cakes" },
    { id: "kurkure-chips", name: "Kurkure/Chips" },
    { id: "biscuits", name: "Biscuits" },
    { id: "munch", name: "Munch" },
    { id: "personal-care", name: "Personal Care" },
    { id: "household-cleaning", name: "Household/Cleaning" },
    { id: "beverages", name: "Beverages" },
    { id: "dry-fruits", name: "Dry Fruits" },
  ];

  useEffect(() => {
    fetchOffers();
  }, []);

  async function fetchOffers() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("https://new-grocery-backend-uwyb.onrender.com/api/offers");
      if (!response.ok) throw new Error("Failed to fetch offers");
      const data = await response.json();
      if (data.success && Array.isArray(data.offers)) {
        setOffers(data.offers);
      } else {
        setOffers([]);
      }
    } catch (err) {
      setError(err.message || "Error loading offers");
    } finally {
      setLoading(false);
    }
  }

  // Fetch products for a given category (for editing)
  const fetchProductsByCategory = async (categoryName) => {
    if (!categoryName) {
      setProductsByCategory([]);
      return;
    }
    setLoadingProducts(true);
    try {
      const response = await fetch(
        `https://grocery-backend-s1kk.onrender.com/api/products/${encodeURIComponent(
          categoryName
        )}`
      );
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProductsByCategory(data.products || []);
    } catch {
      setProductsByCategory([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Handle Edit button click: open edit form with offer details
  const handleEditClick = (offer) => {
    setEditOfferId(offer._id);
    setSuccessMessage("");
    setError("");
    setEditFormData({
      categoryName: offer.categoryName || "",
      productId: offer.product?._id || "",
      minPurchase: offer.minPurchase || "",
      discount: offer.discount || "",
      description: offer.description || "",
      createdBySeller: offer.createdBySeller || "",
    });
    fetchProductsByCategory(offer.categoryName);
  };

  // Handle Cancel Edit
  const handleCancelEdit = () => {
    setEditOfferId(null);
    setEditFormData({
      categoryName: "",
      productId: "",
      minPurchase: "",
      discount: "",
      description: "",
      createdBySeller: "",
    });
    setProductsByCategory([]);
    setError("");
    setSuccessMessage("");
  };

  // Handle input changes in edit form
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setEditFormData((prev) => {
      // If categoryName changes, reset productId and load new products
      if (name === "categoryName") {
        fetchProductsByCategory(value);
        return { ...prev, categoryName: value, productId: "" };
      }
      // Update description automatically when productId, minPurchase or discount changes
      if (["productId", "minPurchase", "discount"].includes(name)) {
        const newData = { ...prev, [name]: value };

        if (
          newData.productId &&
          newData.minPurchase &&
          newData.discount &&
          productsByCategory.length > 0
        ) {
          const productName =
            productsByCategory.find((p) => p._id === newData.productId)?.productName || "";
          newData.description = `Get ${newData.discount}% off on ${productName} when you spend ₹${newData.minPurchase} or more!`;
        }
        return newData;
      }
      return { ...prev, [name]: value };
    });
  };

  // Handle offer update form submission
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const {
      categoryName,
      productId,
      minPurchase,
      discount,
      description,
      createdBySeller,
    } = editFormData;

    if (
      !categoryName ||
      !productId ||
      minPurchase === "" ||
      discount === "" ||
      !description ||
      !createdBySeller
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (isNaN(minPurchase) || isNaN(discount)) {
      setError("Minimum purchase and discount must be valid numbers.");
      return;
    }

    setSubmitLoading(true);

    try {
      const token = localStorage.getItem("token"); // Adjust auth if needed
      const response = await fetch(
        `https://new-grocery-backend-uwyb.onrender.com/api/offers/${editOfferId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            categoryName,
            product: productId,
            minPurchase: Number(minPurchase),
            discount: Number(discount),
            description,
            createdBySeller,
          }),
        }
      );

      if (!response.ok) {
        const resData = await response.json();
        throw new Error(resData.message || "Failed to update offer.");
      }

      setSuccessMessage("Offer updated successfully.");
      setEditOfferId(null);
      setEditFormData({
        categoryName: "",
        productId: "",
        minPurchase: "",
        discount: "",
        description: "",
        createdBySeller: "",
      });
      setProductsByCategory([]);
      // Refresh offers list
      fetchOffers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle deleting an offer (with confirmation)
  const handleDeleteClick = async (offerId) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) return;
    setError("");
    setSuccessMessage("");
    try {
      const token = localStorage.getItem("token"); // Adjust auth if needed
      const response = await fetch(
        `https://new-grocery-backend-uwyb.onrender.com/api/offers/${offerId}`,
        {
          method: "DELETE",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      if (!response.ok) {
        const resData = await response.json();
        throw new Error(resData.message || "Failed to delete offer.");
      }
      setSuccessMessage("Offer deleted successfully.");
      // Refresh offers list
      fetchOffers();
      // Close edit form if deleting the offer currently being edited
      if (editOfferId === offerId) {
        handleCancelEdit();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p className="p-4">Loading offers...</p>;

  if (error) return <p className="p-4 text-red-600">Error: {error}</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Offers Management</h1>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">{successMessage}</div>
      )}

      {offers.length === 0 ? (
        <p>No offers found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2">Product</th>
                <th className="border border-gray-300 px-4 py-2">Category</th>
                <th className="border border-gray-300 px-4 py-2">Min Purchase ₹</th>
                <th className="border border-gray-300 px-4 py-2">Discount %</th>
                <th className="border border-gray-300 px-4 py-2">Description</th>
                <th className="border border-gray-300 px-4 py-2">Seller</th>
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer) => (
                <tr key={offer._id} className="text-center">
                  <td className="border border-gray-300 px-3 py-2">
                    {offer.product?.productName || "N/A"}
                  </td>
                  <td className="border border-gray-300 px-3 py-2">{offer.categoryName}</td>
                  <td className="border border-gray-300 px-3 py-2">{offer.minPurchase}</td>
                  <td className="border border-gray-300 px-3 py-2">{offer.discount}</td>
                  <td className="border border-gray-300 px-3 py-2">{offer.description}</td>
                  <td className="border border-gray-300 px-3 py-2">{offer.createdBySeller}</td>
                  <td className="border border-gray-300 px-3 py-2 space-x-1">
                    <button
                      onClick={() => handleEditClick(offer)}
                      className="bg-yellow-400 hover:bg-yellow-500 mb-6 w-20 px-2 py-1 rounded text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(offer._id)}
                      className="bg-red-500 hover:bg-red-600 w-20 px-2 py-1 rounded text-sm text-white"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Offer Form */}
      {editOfferId && (
        <div className="mt-8 p-6 border border-gray-300 rounded shadow-md max-w-md mx-auto bg-white">
          <h2 className="text-2xl font-semibold mb-4">Edit Offer</h2>
          {error && (
            <div className="mb-3 p-2 bg-red-100 text-red-700 rounded">{error}</div>
          )}
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div>
              <label className="block font-semibold mb-1" htmlFor="categoryName">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="categoryName"
                name="categoryName"
                value={editFormData.categoryName}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">-- Select Category --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1" htmlFor="productId">
                Product <span className="text-red-500">*</span>
              </label>
              {loadingProducts ? (
                <p>Loading products...</p>
              ) : productsByCategory.length > 0 ? (
                <select
                  id="productId"
                  name="productId"
                  value={editFormData.productId}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">-- Select Product --</option>
                  {productsByCategory.map((prod) => (
                    <option key={prod._id} value={prod._id}>
                      {prod.productName}
                    </option>
                  ))}
                </select>
              ) : (
                <p>No products found for this category.</p>
              )}
            </div>

            <div>
              <label className="block font-semibold mb-1" htmlFor="minPurchase">
                Minimum Purchase Amount (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="any"
                id="minPurchase"
                name="minPurchase"
                value={editFormData.minPurchase}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block font-semibold mb-1" htmlFor="discount">
                Discount (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="any"
                id="discount"
                name="discount"
                value={editFormData.discount}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block font-semibold mb-1" htmlFor="description">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={editFormData.description}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2 resize-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold mb-1" htmlFor="createdBySeller">
                Seller Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="createdBySeller"
                name="createdBySeller"
                value={editFormData.createdBySeller}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div className="flex space-x-3 justify-end">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                disabled={submitLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                disabled={submitLoading}
              >
                {submitLoading ? "Updating..." : "Update Offer"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

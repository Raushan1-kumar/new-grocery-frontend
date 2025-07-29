"use client";
import React, { useState, useEffect } from "react";

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

export default function AddOfferForm() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [minPurchase, setMinPurchase] = useState("");
  const [discount, setDiscount] = useState("");
  const [createdBySeller, setCreatedBySeller] = useState("");
  const [description, setDescription] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Fetch products based on selected category
  useEffect(() => {
    if (!selectedCategory) {
      setProducts([]);
      setSelectedProduct("");
      return;
    }

    async function fetchProducts() {
      setLoadingProducts(true);
      setProducts([]);
      setSelectedProduct("");
      setError(null);
      try {
        const response = await fetch(
        `http://localhost:5000/api/products/${encodeURIComponent(
          selectedCategory
        )}`
      );
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        console.log(data);
        setProducts(data.products || []); // assuming backend sends { products: [...] }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingProducts(false);
      }
    }

    fetchProducts();
  }, [selectedCategory]);

  // Auto-generate description based on product, minPurchase, discount
  useEffect(() => {
    if (
      selectedProduct &&
      discount &&
      minPurchase &&
      products.length > 0
    ) {
      const productName = products.find(
        (p) => p._id === selectedProduct
      )?.productName;
      if (productName) {
        setDescription(
          `Get ${discount}% off on ${productName} when you spend ₹${minPurchase} or more!`
        );
      }
    } else {
      setDescription("");
    }
  }, [selectedProduct, discount, minPurchase, products]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !selectedCategory ||
      !selectedProduct ||
      !minPurchase ||
      !discount ||
      !createdBySeller
    ) {
      setMessage(null);
      setError("Please fill in all required fields.");
      return;
    }

    if (isNaN(minPurchase) || isNaN(discount)) {
      setMessage(null);
      setError("Minimum purchase and discount must be valid numbers.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const offerData = {
        categoryName: selectedCategory,
        product: selectedProduct,
        minPurchase: Number(minPurchase),
        discount: Number(discount),
        description,
        createdBySeller,
      };

      const token = localStorage.getItem("token"); // Add auth token if needed

      const response = await fetch("http://localhost:5000/api/offers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(offerData),
      });

      if (!response.ok) {
        const resData = await response.json();
        throw new Error(resData.message || "Failed to add offer.");
      }

      setMessage("Offer added successfully!");
      // Reset form
      setSelectedCategory("");
      setProducts([]);
      setSelectedProduct("");
      setMinPurchase("");
      setDiscount("");
      setCreatedBySeller("");
      setDescription("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow-md">
      <h2 className="text-2xl font-bold mb-4">Add New Offer</h2>

      {message && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{message}</div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Select */}
        <div>
          <label className="block font-semibold mb-1" htmlFor="category">
            Select Category
            <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
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

        {/* Product Select */}
        <div>
          <label className="block font-semibold mb-1" htmlFor="product">
            Select Product
            <span className="text-red-500">*</span>
          </label>
          {loadingProducts ? (
            <p>Loading products...</p>
          ) : products.length > 0 ? (
            <select
              id="product"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">-- Select Product --</option>
              {products.map((prod) => (
                <option key={prod._id} value={prod._id}>
                  {prod.productName}
                </option>
              ))}
            </select>
          ) : (
            selectedCategory && <p className="text-gray-500">No products found in this category.</p>
          )}
        </div>

        {/* Minimum Purchase */}
        <div>
          <label className="block font-semibold mb-1" htmlFor="minPurchase">
            Minimum Purchase Amount (₹)
            <span className="text-red-500">*</span>
          </label>
          <input
            id="minPurchase"
            type="number"
            min="0"
            step="any"
            value={minPurchase}
            onChange={(e) => setMinPurchase(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="e.g. 1000"
            required
          />
        </div>

        {/* Discount */}
        <div>
          <label className="block font-semibold mb-1" htmlFor="discount">
            Discount (%)
            <span className="text-red-500">*</span>
          </label>
          <input
            id="discount"
            type="number"
            min="0"
            max="100"
            step="any"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="e.g. 60"
            required
          />
        </div>

        {/* Description (auto-generated but editable) */}
        <div>
          <label className="block font-semibold mb-1" htmlFor="description">
            Offer Description
            <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded px-3 py-2 resize-none"
            required
          />
        </div>

        {/* Seller Name */}
        <div>
          <label className="block font-semibold mb-1" htmlFor="createdBySeller">
            Seller Name
            <span className="text-red-500">*</span>
          </label>
          <input
            id="createdBySeller"
            type="text"
            value={createdBySeller}
            onChange={(e) => setCreatedBySeller(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Your name or seller ID"
            required
          />
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3 rounded font-semibold text-white ${
              submitting ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {submitting ? "Adding Offer..." : "Add Offer"}
          </button>
        </div>
      </form>
    </div>
  );
}

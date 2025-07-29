import React, { useEffect, useState } from 'react';
import axios from 'axios';

const yellow = "#FFD600";
const cardShadow = "0 2px 14px rgba(0,0,0,0.09)";
const bg = "#fffde7";

// ---- Modal for Add/Edit ----
function OfferModal({ show, offer, onClose, onSave, products }) {
  const initialForm = offer
    ? {
        productId: offer.productId?._id || offer.productId, // _id for populated, else id
        discountPercentage: offer.discountPercentage || '',
        startDate: offer.startDate ? offer.startDate.slice(0, 10) : '',
        endDate: offer.endDate ? offer.endDate.slice(0, 10) : '',
        isActive: offer.isActive || false,
      }
    : {
        productId: products && products[0]?._id || '',
        discountPercentage: '',
        startDate: '',
        endDate: '',
        isActive: true,
      };

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    setForm(initialForm);
    // eslint-disable-next-line
  }, [offer, show, products]);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div style={{
      position:'fixed', zIndex:1000, top:0, left:0, right:0, bottom:0,
      background:'rgba(0,0,0,0.17)', display:'flex', alignItems:'center', justifyContent:'center'
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          background: 'white',
          borderRadius: 11,
          padding: 34,
          minWidth: 340,
          boxShadow: "0 4px 32px rgba(0,0,0,0.13)",
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}
      >
        <h2 style={{ color: yellow, marginBottom: 12 }}>
          {offer ? "Edit Offer" : "Add Offer"}
        </h2>
        <label>
          Product <span style={{color:'#f44336'}}>*</span><br/>
          <select
            name="productId"
            value={form.productId}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: 8, margin: "6px 0" }}
            disabled={!!offer} // Can't change product when editing
          >
            {products && products.map(product => (
              <option value={product._id} key={product._id}>
                {product?.ProductName}
              </option>
            ))}
          </select>
        </label>
        <label>
          Discount Percentage <span style={{color:'#f44336'}}>*</span><br/>
          <input
            name="discountPercentage"
            type="number"
            min={1}
            max={100}
            required
            value={form.discountPercentage}
            onChange={handleChange}
            style={{ width: "100%", padding: 8, margin: "6px 0" }}
          />
        </label>
        <label>
          Start Date <span style={{color:'#f44336'}}>*</span><br/>
          <input
            name="startDate"
            type="date"
            required
            value={form.startDate}
            onChange={handleChange}
            style={{ width: "100%", padding: 8, margin: "6px 0" }}
          />
        </label>
        <label>
          End Date <span style={{color:'#f44336'}}>*</span><br/>
          <input
            name="endDate"
            type="date"
            required
            value={form.endDate}
            onChange={handleChange}
            style={{ width: "100%", padding: 8, margin: "6px 0" }}
          />
        </label>
        <label style={{margin:'8px 0'}}>
          <input
            name="isActive"
            type="checkbox"
            checked={form.isActive}
            onChange={handleChange}
            style={{ marginRight: 6 }}
          />
          Active
        </label>
        <div style={{ display: "flex", gap: 13, marginTop: 18 }}>
          <button type="submit"
            style={{
              background: yellow,
              border: "none",
              borderRadius: 6,
              padding: "10px 28px",
              fontWeight: "bold",
              cursor: "pointer"
            }}>Save</button>
          <button type="button" onClick={onClose}
            style={{
              background: "#757575",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "10px 18px",
              cursor: "pointer"
            }}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

// ---- Offer Card ----
function OfferCard({ offer, onEdit, onDelete }) {
  const { productId, discountPercentage, startDate, endDate, isActive } = offer;
  return (
    <div style={{
      background: yellow,
      borderRadius: '16px',
      padding: '22px',
      margin: '16px 0',
      boxShadow: cardShadow,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start'
    }}>
      <h2 style={{ margin: 0, color: '#333', fontWeight: 700, fontSize:'1.25em'}}>
        {productId?.name || "Product"}
      </h2>
      <p style={{ margin: '8px 0' }}><b>Discount:</b> {discountPercentage}%</p>
      <p><b>Start:</b> {startDate ? new Date(startDate).toLocaleDateString() : "-"}</p>
      <p><b>End:</b> {endDate ? new Date(endDate).toLocaleDateString() : "-"}</p>
      <p><b>Active:</b> {isActive ? 'Yes' : 'No'}</p>
      <div style={{ marginTop: '10px', display: 'flex', gap: '13px' }}>
        <button style={{
          background: '#fff700',
          color: '#000',
          border: 'none',
          padding: '7px 18px',
          borderRadius: '6px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 1px 8px rgba(0,0,0,0.06)'
        }} onClick={() => onEdit(offer)}>Edit</button>
        <button style={{
          background: '#ff7043',
          color: '#fff',
          border: 'none',
          padding: '7px 18px',
          borderRadius: '6px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 1px 8px rgba(0,0,0,0.06)'
        }} onClick={() => onDelete(offer._id)}>Delete</button>
      </div>
    </div>
  );
}

// ---- Main Offers Page ----
export default function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [products, setProducts] = useState([]); // For Add only
  const [error, setError] = useState('');

  // You may need to update this endpoint for your project
  const api = 'https://new-grocery-backend-uwyb.onrender.com/api/offers';
  const productApi = 'https://new-grocery-backend-uwyb.onrender.com/api/products/rice-daal'; // Assumes you have such an endpoint

  // Fetch offers
  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${api}/active`);
      setOffers(res.data);
      setError('');
    } catch (e) {
      setError('Failed to fetch offers.');
    }
    setLoading(false);
  };

  // Fetch products for Add form
  const fetchProducts = async () => {
    // If your product endpoint is named differently, update here
    try {
      const res = await axios.get(productApi);
      setProducts(res.data.products);
      console.log("Fetched products:", res.data);
    } catch (e) {
      setProducts([]);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;
    try {
      await axios.delete(`${api}/${id}`);
      fetchOffers();
    } catch {
      alert('Failed to delete.');
    }
  };

  // --- Edit logic ---
  const handleEdit = (offer) => {
    setSelectedOffer(offer);
    setShowEdit(true);
  };
  const handleEditSave = async (form) => {
    try {
      await axios.put(`${api}/${selectedOffer._id}`, form);
      setShowEdit(false);
      setSelectedOffer(null);
      fetchOffers();
    } catch (e) {
      alert(e.response?.data?.error || "Update failed");
    }
  };

  // --- Add logic ---
  const handleAdd = async () => {
    await fetchProducts();
    setShowAdd(true);
  };
  const handleAddSave = async (form) => {
    if (!form.productId) {
      alert("Select a product");
      return;
    }
    try {
      await axios.post(api, form);
      setShowAdd(false);
      fetchOffers();
    } catch (e) {
      alert(e.response?.data?.error || "Creation failed");
    }
  };

  // --- Render ----
  return (
    <div style={{
      minHeight: '100vh',
      background: bg,
      padding: '32px',
      fontFamily: 'Inter, Arial, sans-serif'
    }}>
      <h1 style={{ color: yellow, marginBottom: '32px' }}>All Offers</h1>
      {loading && <div>Loading...</div>}
      {!loading && error && <div style={{color:'#c62828'}}>{error}</div>}
      {!loading && offers.length===0 && !error && (
        <div style={{
          color:'#757575',
          background:'#fffde7',
          textAlign:'center',
          border: `1px solid #e7e6b0`,
          borderRadius: 9,
          padding: "35px 0",
          fontSize: '1.18em',
          fontWeight: 500
        }}>
          No offers to show.
        </div>
      )}
      {!loading && offers.length>0 && (
        <>
          {offers.map(offer => (
            <OfferCard
              key={offer._id}
              offer={offer}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </>
      )}

      {/* Add New Offer Button */}
      <button
        style={{
          display: 'block',
          margin: '40px auto 0 auto',
          background: yellow,
          color: '#333',
          border: 'none',
          padding: '14px 34px',
          borderRadius: '24px',
          fontSize: '1.15em',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 2px 18px rgba(255,214,0,0.14)'
        }}
        onClick={handleAdd}
      >
        Add New Offer
      </button>

      {/* Edit Modal */}
      <OfferModal
        show={showEdit}
        offer={selectedOffer}
        onClose={() => setShowEdit(false)}
        onSave={handleEditSave}
        products={products}
      />
      {/* Add Modal */}
      <OfferModal
        show={showAdd}
        offer={null}
        onClose={() => setShowAdd(false)}
        onSave={handleAddSave}
        products={products}
      />
    </div>
  );
}

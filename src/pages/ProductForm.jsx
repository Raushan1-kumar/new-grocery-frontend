import React, { useState } from 'react';

const categories = {
  'fruits-vegetables': { unit: 'kg', fields: ['sizes'] }, // Set to ['sizes'] ONLY if you want multiple sizes
  'rice-daal': { unit: 'kg', fields: ['sizes'] },
  'oil-ghee': { unit: 'kg', fields: ['sizes'] },
  'sweets': { unit: 'kg', fields: ['sizes'] }, // Set to ['sizes'] ONLY if you want multiple sizes
  'spices': { unit: 'g', fields: ['sizes'] },
  'cakes': { unit: 'piece', fields: ['sizes'] },
  'kurkure-chips': { unit: 'packet', fields: ['sizes'] },
  'biscuits': { unit: 'packet', fields: ['sizes'] },
  'munch': { unit: 'packet', fields: ['sizes'] },
  'personal-care': { unit: 'unit', fields: ['sizes'] },
  'household-cleaning': { unit: 'unit', fields: ['sizes'] },
  'beverages': { unit: 'ml', fields: ['sizes'] }, // if needed
  'dry-fruits': { unit: 'g', fields: ['sizes'] }
};

const ProductForm = () => {
  const [category, setCategory] = useState('');
  const [productName, setProductName] = useState('');
  const [attributes, setAttributes] = useState({});
  const [sizes, setSizes] = useState([{ size: '', price: '' }]);
  const [image, setImage] = useState(null);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setAttributes({});
    setSizes([{ size: '', price: '' }]);
    setImage(null);
    setFormError('');
    setSuccessMessage('');
  };

  const handleAttributeChange = (field, value) => {
    setAttributes((prev) => ({ ...prev, [field]: value }));
  };

  const handleSizeChange = (index, field, value) => {
    const newSizes = [...sizes];
    newSizes[index][field] = value;
    setSizes(newSizes);
  };

  const addSize = () => {
    setSizes([...sizes, { size: '', price: '' }]);
  };

  const removeSize = (index) => {
    if (sizes.length > 1) {
      setSizes(sizes.filter((_, i) => i !== index));
    }
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');
    setLoading(true);

    if (!productName || !category) {
      setFormError('Please fill in product name and category.');
      setLoading(false);
      return;
    }

    if (categories[category].fields.includes('sizes')) {
      if (sizes.some((s) => !s.size || !s.price)) {
        setFormError('Please fill in all size and price fields.');
        setLoading(false);
        return;
      }
    } else {
      const requiredFields = categories[category].fields;
      if (requiredFields.some((field) => !attributes[field])) {
        setFormError('Please fill in all required attribute fields.');
        setLoading(false);
        return;
      }
    }

    const formData = new FormData();
    formData.append('category', category);
    formData.append('productName', productName);
    formData.append('attributes', JSON.stringify(attributes));
    formData.append('sizes', JSON.stringify(sizes));
    if (image) {
      formData.append('image', image);
    }

    try {
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (response.ok) {
        setSuccessMessage('Product added successfully!');
        setProductName('');
        setCategory('');
        setAttributes({});
        setSizes([{ size: '', price: '' }]);
        setImage(null);
      } else {
        setFormError(result.message || 'Failed to add product.');
      }
    } catch (error) {
      console.error('Frontend fetch error:', error);
      setFormError('Error connecting to the server. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Add Grocery Product</h1>
      {formError && <p className="text-red-500 mb-4">{formError}</p>}
      {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
      {loading && <p className="text-blue-500 mb-4">Submitting...</p>}
      <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Name</label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            placeholder="e.g., Basmati Rice"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            value={category}
            onChange={handleCategoryChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select Category</option>
            {Object.keys(categories).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Image (Optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        {category && (
          <>
            {categories[category].fields.map((field) => (
              <div key={field}>
                {categories[category].fields.includes('sizes') ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sizes and Prices (₹)</label>
                    {sizes.map((size, index) => (
                      <div key={index} className="flex space-x-2 mt-2">
                        <input
                          type="text"
                          placeholder={`Size (e.g., 50g)`}
                          value={size.size}
                          onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                          className="block w-1/2 p-2 border border-gray-300 rounded-md"
                        />
                        <input
                          type="number"
                          placeholder="Price (₹)"
                          value={size.price}
                          onChange={(e) => handleSizeChange(index, 'price', e.target.value)}
                          className="block w-1/2 p-2 border border-gray-300 rounded-md"
                        />
                        {sizes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSize(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addSize}
                      className="mt-2 text-blue-500 hover:text-blue-700"
                    >
                      Add Another Size
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {field === 'weight' ? `Weight (${categories[category].unit})` :
                       field === 'volume' ? `Volume (${categories[category].unit})` :
                       field === 'quantity' ? `Quantity (${categories[category].unit})` :
                       field === 'pricePerKg' ? 'Price per kg (₹)' :
                       field === 'pricePer100g' ? 'Price per 100g (₹)' :
                       'Price per piece (₹)'}
                    </label>
                    <input
                      type="number"
                      value={attributes[field] || ''}
                      onChange={(e) => handleAttributeChange(field, e.target.value)}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                      placeholder={`Enter ${field}`}
                    />
                  </div>
                )}
              </div>
            ))}
          </>
        )}
        <button
          type="submit"
          disabled={loading}
          className={`w-full p-2 rounded-md text-white ${loading ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'}`}
        >
          {loading ? 'Submitting...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
};

export default ProductForm;
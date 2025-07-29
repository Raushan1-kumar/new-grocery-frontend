
import { useNavigate } from 'react-router-dom';
export default function MainComponent() {
  const navigate = useNavigate();
  const categories = [
    {
      id: "fruits-vegetables",
      name: "Fruits & Vegetables",
      count: 15,
      color: "bg-green-100",
      image:
        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=400&fit=crop",
    },
    {
      id: "rice-daal",
      name: "Grains",
      count: 10,
      color: "bg-yellow-100",
      image:
        "https://plus.unsplash.com/premium_photo-1726750862897-4b75116bca34?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cmljZSUyQ3B1bHNlcyUyQ3doZWF0fGVufDB8fDB8fHww",
    },
    {
      id: "oil-ghee",
      name: "Oil/Ghee",
      count: 8,
      color: "bg-blue-100",
      image:
        "https://media.istockphoto.com/id/1283712032/photo/cardboard-box-filled-with-non-perishable-foods-on-wooden-table-high-angle-view.webp?a=1&b=1&s=612x612&w=0&k=20&c=OHIR-Nh42EGgXtvCk_tybX-2gM87icPgkuRkQJgNN1g=",
    },
    {
      id: "vegetables",
      name: "Vegetables",
      count: 7,
      color: "bg-pink-100",
      image:
        "https://images.unsplash.com/photo-1578240597669-05ffd2cf91be?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGdyb2NlcnklMjBpdGVtc3xlbnwwfHwwfHx8MA%3D%3D",
    },
    {
      id: "spices",
      name: "Spices",
      count: 12,
      color: "bg-yellow-100",
      image:
        "https://images.unsplash.com/photo-1716816211590-c15a328a5ff0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHNwaWNlc3xlbnwwfHwwfHx8MA%3D%3D",
    },
    
    {
      id: "kurkure-chips",
      name: "Kurkure/Chips",
      count: 9,
      color: "bg-orange-100",
      image:
        "https://th.bing.com/th/id/OIP.KtaRjHnlMY9I77zpiS170wHaHa?w=191&h=191&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
    },
    {
      id: "biscuits",
      name: "Biscuits",
      count: 11,
      color: "bg-red-100",
      image:
        "https://5.imimg.com/data5/PI/KI/GLADMIN-68287049/new-good-day-cashew-biscuits-500x500.png",
    },
    {
      id: "munch",
      name: "Munch",
      count: 5,
      color: "bg-yellow-100",
      image:
        "https://th.bing.com/th/id/OIP.ZGaMWgy3nleEg5CxhKkpAwHaEK?w=276&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
    },
    {
      id: "personal-care",
      name: "Personal Care",
      count: 10,
      color: "bg-blue-100",
      image:
        "https://images.unsplash.com/photo-1666028095907-15814bd435cd?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGZhY2V3YXNoZXN8ZW58MHx8MHx8fDA%3D",
    },
    {
      id: "household-cleaning",
      name: "Household/Cleaning",
      count: 8,
      color: "bg-pink-100",
      image:"https://media.istockphoto.com/id/510693044/photo/house-cleaning-product-on-wood-table.webp?a=1&b=1&s=612x612&w=0&k=20&c=Dgz3K3T6OSNxS2ciy7Voo8ASkkHyEzWYKQy1qUfu14w=",
    },
    {
      id: "beverages",
      name: "Beverages",
      count: 7,
      color: "bg-red-100",
      image:
        "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=300&h=200&fit=crop",
    },
    {
      id: "dry-fruits",
      name: "Dry Fruits",
      count: 6,
      color: "bg-yellow-100",
      image:
        "https://plus.unsplash.com/premium_photo-1668677227454-213252229b73?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGRyeSUyMGZydWl0c3xlbnwwfHwwfHx8MA%3D%3D",
    },
  ];
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-amber-400 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center bg-green-600 px-2 py-1 rounded-lg">
          <h1 className="text-xl font-bold text-white">VegVendors</h1>
        </div>
        <div className="flex items-center space-x-3">
          <i className="fas fa-shopping-cart text-xl text-black"
            onClick={() => navigate('/cart')}></i>
          
          <i className="fas fa-user text-xl text-black"
          onClick={() => navigate('/profile')}
          ></i>
        </div>
      </header>

      {/* Hero Section with Background */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 px-4 py-16 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-80"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=400&fit=crop')",
          }}
        ></div>
        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Fresh Groceries Delivered
          </h2>
          <p className="text-white text-sm md:text-base mb-8">
            Get fresh groceries at your doorstep in 30 minutes
          </p>
        </div>
      </div>

      {/* Categories Section */}
      <div className="px-4 py-8">
        <h3 className="text-xl font-semibold text-center mb-6 text-gray-800">
          Shop by Category
        </h3>
        <div className="grid grid-cols-2 gap-6 max-w-4xl mx-auto">
          {categories.map((category, index) => (
            <div
              key={index}
              className="flex flex-col items-center cursor-pointer"
              onClick={() =>{navigate(`/category/${category.id}`)}}
            >
              <div
                className={`w-30 h-30 md:w-24 md:h-24 ${category.color} rounded-full flex items-center justify-center mb-3 hover:scale-105 transition-transform`}
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-24 h-24 md:w-18 md:h-18 rounded-full object-cover"
                />
              </div>
              <span className="text-sm md:text-base text-gray-700 text-center font-medium">
                {category.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Offer Banner 1 */}
      <div className="mx-4 mb-6 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg p-6 text-white text-center">
        <h3 className="text-xl md:text-2xl font-bold mb-2">Special Offer!</h3>
        <p className="text-sm md:text-base mb-3">
          Get 30% OFF on your first order
        </p>
        <button className="bg-white text-yellow-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors">
          Shop Now
        </button>
      </div>

      {/* Offer Banner 2 */}
      <div className="mx-4 mb-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg p-6 text-white text-center">
        <h3 className="text-xl md:text-2xl font-bold mb-2">
          Free Delivery Weekend!
        </h3>
        <p className="text-sm md:text-base mb-3">
          Free delivery on orders above $50
        </p>
        <button className="bg-white text-orange-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors">
          Order Now
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-lg font-semibold mb-4 flex items-center">
                <i className="fas fa-shopping-cart mr-2"></i>
                FreshMart
              </h4>
              <p className="text-gray-300 text-sm">
                Your trusted partner for fresh groceries delivered fast to your
                doorstep.
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




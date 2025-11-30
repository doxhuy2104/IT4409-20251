import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Map, Search, ShoppingCart, User, X, Bell, Menu, LogOut, Heart, ShoppingBag } from 'lucide-react';
// import cartService from '../services/cart.service';
// import productService from '../services/product.service';
import { mainCategories } from '../data/category';
import type { CartItem } from '../types/cart';
import useAuth from '../hooks/useAuth';
import cartService from '../services/cart.service';
// suggestions type
interface SuggestionProduct {
  id: number;
  name: string;
  slug: string;
  image: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  category?: string;
  brandLogo?: string;
  promo?: string;
}

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated} = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const [suggestedProducts, setSuggestedProducts] = useState<SuggestionProduct[]>([]);
  const cartDropdownRef = useRef<HTMLDivElement>(null);
  const [cartItemCount, setCartItemCount] = useState<number>(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState<number>(0);

  useEffect(() => {
    // Handle scroll for header shadow
    const handleScroll = () => {
      if (headerRef.current) {
        if (window.scrollY > 10) {
          headerRef.current.classList.add('header-shadow');
        } else {
          headerRef.current.classList.remove('header-shadow');
        }
      }
    };

    // Handle click outside to close suggestions
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    window.addEventListener('scroll', handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);





  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
  };
  const clearSearch = () => {
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSearchInputFocus = () => {
    if (searchQuery.length > 0) {
      setShowSuggestions(true);
    }
  };

  useEffect(() => {
    const fetchCartItems = async () => {
      if (isAuthenticated) {
        try {
          const cartResponse = await cartService.getCart();
          if (cartResponse && cartResponse.cart) {
            const items = cartResponse.cart.cartItems || [];
            const totalItems = items.reduce(
              (sum: number, item: CartItem) => sum + item.quantity,
              0
            );
            setCartItemCount(totalItems);
            setCartItems(items);

            // Calculate total price
            const total = items.reduce((sum: number, item: CartItem) => {
              if (item.product) {
                const price = parseFloat(item.product.price || '0');
                return sum + (price * item.quantity);
              }
              return sum;
            }, 0);
            setCartTotal(total);
          }
        } catch (error) {
          console.error('Error fetching cart items:', error);
          setCartItemCount(0);
          setCartItems([]);
          setCartTotal(0);
        }
      } else {
        setCartItemCount(0);
        setCartItems([]);
        setCartTotal(0);
      }
    };

    fetchCartItems();

    // Refresh cart when dropdown is shown
    if (showCartDropdown) {
      fetchCartItems();
    }
  }, [isAuthenticated, showCartDropdown]);


  return (
    <>
      <header ref={headerRef} className="flex flex-col w-full sticky top-0 z-50 transition-all duration-300">
        {/* Top header with logo, search, and user actions */}
        <div className="bg-gradient-to-r from-[#2563EB] to-[#4F46E5] py-3 px-4 transition-all duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Mobile menu button */}
            <button
              className="lg:hidden flex items-center justify-center p-2 rounded-full hover:bg-white/20 transition-all duration-300"
            >
              <Menu size={22} className="text-white" />
            </button>

            {/* Logo */}
            <Link to="/" className="flex-shrink-0 transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center">
                <div className="bg-white rounded-lg p-1.5 mr-1 shadow-md">
                  <div className="text-[#2563EB] font-bold text-lg leading-none">TT</div>
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-extrabold text-xl tracking-tight">Tech<span className="text-[#10B981] font-black">Trove</span></span>
                  <span className="text-white/70 text-[10px] -mt-1 tracking-wider font-medium">ELECTRONICS STORE</span>
                </div>
              </div>
            </Link>

            {/* Search - Updated with suggestions */}
            <div className="flex-grow max-w-xl relative" ref={searchContainerRef}>
              <form onSubmit={handleSearchSubmit} className="flex items-center rounded-full overflow-hidden shadow-md border border-indigo-100">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Bạn tìm gì..."
                    className="w-full py-2.5 px-5 pr-10 border-none outline-none text-sm bg-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={handleSearchInputFocus}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={clearSearch}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="bg-[#4F46E5] h-full px-4 text-white flex items-center justify-center hover:bg-[#4338CA] transition-colors"
                >
                  <Search size={18} />
                </button>
              </form>
{/* Search suggestions dropdown */}
{showSuggestions && (
                <div className="absolute top-full left-0 w-full bg-white rounded-lg shadow-xl overflow-hidden mt-2 z-50 border border-gray-100 animate-fadeDown">
                  {/* Suggested text - "Có phải bạn muốn tìm" */}
                  {/* <div className="p-3 text-sm text-gray-500 border-b bg-gray-50">
                    <span className="font-medium">Có phải bạn muốn tìm</span>
                  </div> */}

                  {/* Special link for brand page - shown when searching Samsung */}
                  {/* {searchQuery.toLowerCase().includes('samsung') && (
                    <Link
                      to="/thuong-hieu/samsung"
                      className="flex items-center bg-gradient-to-r from-green-600 to-emerald-600 p-3 hover:opacity-95 transition-opacity"
                    >
                      <div className="bg-white rounded-full p-2 mr-2 shadow-sm">
                        <span className="text-xs font-bold">SAMSUNG</span>
                      </div>
                      <span className="text-white">Chuyên trang Samsung</span>
                      <span className="ml-auto bg-white/20 rounded-full px-2 py-0.5 text-xs text-white">Xem ngay</span>
                    </Link>
                  )}                   */}
                  {/* Category suggestions */}
                  {/* {suggestedCategories.map((category, index) => (
                    <Link
                      key={index}
                      to={`/search?query=${encodeURIComponent(category)}`}
                      className="block px-4 py-2.5 hover:bg-gray-50 text-green-600 transition-colors"
                      onClick={() => setShowSuggestions(false)}
                    >
                      <div className="flex items-center">
                        <Search size={14} className="mr-2 text-gray-400" />
                        <span>{category}</span>
                      </div>
                    </Link>
                  ))} */}

                  {/* Suggested products section */}
                  {suggestedProducts.length > 0 && (
                    <div className="border-t">
                      <h3 className="px-4 py-2.5 text-gray-500 text-sm font-medium bg-gray-50">Sản phẩm gợi ý</h3>
                      {suggestedProducts.map((product) => (
                        <Link
                          key={product.id}
                          to={`/product/${product.slug}`}
                          className="flex p-3 hover:bg-gray-50 border-b transition-colors"
                          onClick={() => setShowSuggestions(false)}
                        >
                          <div className="w-12 h-12 flex-shrink-0 bg-gray-100 p-1 rounded-md overflow-hidden">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="ml-3 flex-grow">
                            <p className="text-sm line-clamp-1 text-gray-800">{product.name}</p>
                            <div className="flex items-center mt-0.5">
                              <span className="text-green-600 font-medium text-sm">
                                {formatCurrency(product.price)}
                              </span>
                              {product.originalPrice && product.discountPercentage && (
                                <div className="flex items-center ml-2">
                                  <span className="text-gray-500 text-xs line-through">
                                    {formatCurrency(product.originalPrice)}
                                  </span>
                                  <span className="text-xs text-white ml-1 bg-green-500 rounded px-1">
                                    -{product.discountPercentage}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* User actions */}
            <div className="flex items-center space-x-6">
              {/* Account */}
              {(
                <Link to="/auth/login" className="hidden md:flex items-center text-white hover:opacity-80 group">
                  <div className="bg-white/20 rounded-full p-2 mr-2 group-hover:bg-white/30 transition-all">
                    <User size={18} className="text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-white/80">Đăng nhập</span>
                    <span className="text-sm font-medium">Tài khoản</span>
                  </div>
                </Link>
              )}

              {/* Cart */}
              <Link to="/cart" className="flex items-center text-white hover:opacity-80 group relative">
                <div className="bg-white/20 rounded-full p-2 mr-1 md:mr-2 group-hover:bg-white/30 transition-all relative">
                  <ShoppingCart size={18} className="text-white" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 border border-white/30 shadow-sm">
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </span>
                  )}
                </div>
                <span className="hidden md:inline text-sm">Giỏ hàng</span>
              </Link>

            </div>
          </div>
        </div>

        {/* Main navigation */}
        <div className="bg-[#1E40AF] shadow-sm py-1">
          <div className="max-w-7xl mx-auto">
            <nav className="relative">
              <ul className="flex items-center justify-center overflow-x-auto whitespace-nowrap scrollbar-hide">
                {mainCategories.map((category) => (
                  <li key={category.name} className="relative px-1">
                    <Link
                      to={category.path}
                      className="flex flex-col items-center text-center text-white hover:opacity-80 px-3 py-1.5 transition-all hover:scale-105"
                    >
                      <div className="w-8 h-8 mb-1 flex items-center justify-center bg-white/20 rounded-full hover:bg-white/30 transition-colors">                      {category.icon === 'phone' && <i className="fas fa-mobile-alt text-lg"></i>}
                        {category.icon === 'laptop' && <i className="fas fa-laptop text-lg"></i>}
                        {category.icon === 'accessories' && <i className="fas fa-headphones text-lg"></i>}
                        {category.icon === 'watch' && <i className="fas fa-stopwatch text-lg"></i>}
                        {category.icon === 'clock' && <i className="fas fa-clock text-lg"></i>}
                        {category.icon === 'tablet' && <i className="fas fa-tablet-alt text-lg"></i>}
                        {category.icon === 'monitor' && <i className="fas fa-desktop text-lg"></i>}
                        {category.icon === 'camera' && <i className="fas fa-camera text-lg"></i>}
                        {category.icon === 'cctv' && <i className="fas fa-video text-lg"></i>}
                        {category.icon === 'printer' && <i className="fas fa-print text-lg"></i>}
                      </div>
                      <span className="text-xs font-medium">{category.name}</span>
                      {/* {category.hasDropdown && (
                        <ChevronDown size={12} className="ml-1 transition-transform group-hover:rotate-180" />
                      )} */}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </header>


      {/* Add these styles to your global CSS */}
      < style > {`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .header-shadow {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        @keyframes fadeDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeDown {
          animation: fadeDown 0.2s ease-out forwards;
        }
        
        /* Modern scrollbar styling */
        .modern-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .modern-scrollbar::-webkit-scrollbar-track {
          background: rgba(241, 241, 241, 0.5);
          border-radius: 10px;
        }
        .modern-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(136, 136, 136, 0.5);
          border-radius: 10px;
          transition: background 0.2s ease;
        }
        .modern-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(85, 85, 85, 0.7);
        }
        .modern-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(136, 136, 136, 0.5) rgba(241, 241, 241, 0.5);
        }
      `}</style >
    </>
  );
};

export default Header;
"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import CartModal from "./CartModal";

// Product type
interface Product {
  name: string;
  price: string;
  description: string;
  image: string;
  comingSoon?: boolean;
}

// Add CartItem type and parsePrice helper
interface CartItem {
  name: string;
  price: string;
  description: string;
  image: string;
  quantity: number;
}

function parsePrice(price: string | number) {
  if (typeof price === "number") return price;
  const match = price.match(/\$([\d.]+)/);
  const result = match ? parseFloat(match[1]) : 0;
  
  // Debug logging - remove after testing
  if (process.env.NODE_ENV === 'development') {
    console.log(`parsePrice: "${price}" → ${result}`);
  }
  
  return result;
}

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

export default function Merchandise() {
  const [centerIdx, setCenterIdx] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showQuantitySelector, setShowQuantitySelector] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const cartModalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/get-merchandise');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Load cart from localStorage on mount - removed localStorage dependency
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem("cartItems") : null;
    if (stored) {
      console.log("Loaded cartItems from localStorage:", stored);
      setCartItems(JSON.parse(stored));
    } else {
      console.log("No cartItems found in localStorage");
    }
  }, []);

  // Sync cartItems to localStorage whenever it changes - removed localStorage dependency
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }
  }, [cartItems]);

  // Dismiss modal on outside click
  useEffect(() => {
    if (!showCart) return;
    function handleClick(e: MouseEvent) {
      if (cartModalRef.current && !cartModalRef.current.contains(e.target as Node)) {
        setShowCart(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showCart]);

  // Wheel-like animation positions
  const positions = {
    left: { x: -650, y: 150, scale: 1.1, zIndex: 1 },
    center: { x: 0, y: 50, scale: 1, zIndex: 2 },
    right: { x: 650, y: 150, scale: 1.1, zIndex: 1 },
  };

  // Helper to get role for each visible item
  function getRole(idx: number) {
    if (idx === centerIdx) return 'center';
    if (idx === mod(centerIdx - 1, products.length)) return 'left';
    if (idx === mod(centerIdx + 1, products.length)) return 'right';
    return 'hidden';
  }

  // Only render left, center, right
  const visibleIndices = [mod(centerIdx - 1, products.length), centerIdx, mod(centerIdx + 1, products.length)];

  const handleSlide = (newDirection: 1 | -1) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection(newDirection);
    const nextIdx = mod(centerIdx + newDirection, products.length);
    if (!products[nextIdx].comingSoon) {
      setCenterIdx(nextIdx);
    }
    setTimeout(() => setIsAnimating(false), 500);
  };

  const addToCart = (product: Product, qty: number) => {
    console.log("Adding to cart:", product, "quantity:", qty);
    setCartItems(prev => {
      const existingIdx = prev.findIndex(item => item.name === product.name);
      if (existingIdx !== -1) {
        // Update quantity
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + qty,
        };
        return updated;
      } else {
        // Add new item - keep original price string format
        return [
          ...prev,
          {
            ...product,
            price: product.price, // Keep original price format like "$15/bag (1 lb)"
            quantity: qty,
          },
        ];
      }
    });
    setShowQuantitySelector(false);
    setQuantity(1);
  };

  // Helper to get total quantity in cart
  const totalCartQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <section className="relative min-h-[100vh] w-full bg-gradient-to-b from-[#FFF7F5] via-[#FFF7F5] to-[#F9E3E0] overflow-x-hidden flex flex-col items-center justify-start pt-8">
      {/* Decorative background wave */}
      <div className="absolute inset-0 w-full h-300 flex items-center justify-center">
        <Image src="/ellipse.svg" alt="Wave" width={1000} height={1000} className="w-full h-full" />
      </div>
      
      {/* Header */}
      <div className="w-full flex justify-center items-center px-6 md:w-full pt-10 md:pt-16 pb-8">
        <h1 className="text-3xl md:text-5xl font-bold font-arsenal text-black text-center w-full md:w-auto">Check out our goodies!</h1>
        <button className="relative lg:absolute lg:right-58" onClick={() => setShowCart(true)}>
          <Image src="/cart.svg" alt="Cart" width={100} height={100} className="w-10 h-10" />
          {totalCartQuantity > 0 && (
            <span className="absolute -top-2 -right-2 bg-[#bf608f] text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {totalCartQuantity}
            </span>
          )}
        </button>
      </div>
      
      {/* Cart Modal Popup */}
      {showCart && (
        <CartModal
          showCart={showCart}
          cartItems={cartItems}
          setCartItems={setCartItems}
          setShowCart={setShowCart}
        />
      )}
      
      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#bf608f]"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="flex items-center justify-center min-h-[500px]">
          <p className="text-xl font-arsenal text-gray-600">No products available at the moment.</p>
        </div>
      ) : (
        /* Wheel Carousel Row */
        <div className="relative flex items-center justify-left w-full max-w-xl mx-auto mt-4 md:mt-2 min-h-[500px] h-[600px]">
          <AnimatePresence mode="popLayout" custom={direction}>
            {visibleIndices.map((idx) => {
              const role = getRole(idx);
              if (role === 'hidden') return null;
              const isCenter = role === 'center';
              return (
                <motion.div
                  key={idx}
                  custom={direction}
                  initial={{ 
                    opacity: 0, 
                    x: direction * 1000,
                    scale: isCenter ? 1 : 1.1,
                    y: isCenter ? 50 : 150,
                  }}
                  animate={{ 
                    opacity: 1, 
                    x: positions[role].x,
                    scale: positions[role].scale,
                    y: positions[role].y,
                    transition: {
                      type: "spring",
                      stiffness: 200,
                      damping: 30,
                    }
                  }}
                  exit={{ 
                    opacity: 0, 
                    x: positions[role].x * 10,
                    scale: positions[role].scale,
                    y: positions[role].y * 20,
                    transition: {
                      duration: 1,
                      ease: "easeInOut"
                    }
                  }}
                  style={{ 
                    zIndex: positions[role].zIndex, 
                    position: 'absolute', 
                    left: '50%', 
                    top: '50%', 
                    translateX: '-50%', 
                    translateY: '-50%' 
                  }}
                  className={
                    isCenter
                      ? 'bg-white rounded-3xl shadow-xl px-6 md:px-12 flex p-85 lg:p-10 flex-col items-center justify-center w-90 lg:w-full lg:translate-y-20 max-w-md h-[560px] md:h-[680px]' 
                      : 'w-56 h-56 rounded-full bg-white flex items-center justify-center shadow-lg'
                  }
                >
                  {isCenter ? (
                    <>
                      <div className="w-106 h-76 rounded-full flex items-center justify-center mb-4">
                        {products[idx].comingSoon ? (
                          <div className="w-[350px] h-[350px] rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-[#bf608f]">
                          </div>
                        ) : (
                          <div className="flex items-center justify-center mb-4">
                            <Image src={products[idx].image} alt={products[idx].name} width={350} height={350} className="object-contain" />
                          </div>
                        )}
                      </div>
                      {!products[idx].comingSoon && (
                        <>
                          <h2 className="text-xl md:text-2xl font-bold font-arsenal text-black mb-1 mt-10 text-center">{products[idx].name}</h2>
                          <div className="text-sm md:text-base font-bold font-arsenal text-black mb-2 text-center">{products[idx].price}</div>
                          <div className="text-xs md:text-sm font-arsenal text-gray-600 text-center mb-6">{products[idx].description}</div>
                        </>
                      )}
                      {!products[idx].comingSoon && !showQuantitySelector && (
                        <button
                          className="mt-auto border-2 border-black rounded-full w-10 h-10 mb-0 flex items-center justify-center hover:bg-[#FFF7F5] transition-colors"
                          onClick={() => setShowQuantitySelector(true)}
                        >
                          <span className="text-2xl text-black">+</span>
                        </button>
                      )}
                      {showQuantitySelector && (
                        <div className="flex flex-col items-center">
                          <div className="flex items-center space-x-2">
                            <button
                              className="border-2 border-black text-black rounded-full w-6 h-6 flex items-center justify-center text-xl hover:bg-[#FFF7F5]"
                              onClick={() => setQuantity(q => Math.max(1, q - 1))}
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min={1}
                              value={quantity}
                              onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                              className="w-12 text-center text-black border border-gray-300 rounded"
                              placeholder="Qty"
                              title="Quantity"
                            />
                            <button
                              className="border-2 border-black text-black rounded-full w-6 h-6 flex items-center justify-center text-xl hover:bg-[#FFF7F5]"
                              onClick={() => setQuantity(q => q + 1)}
                            >
                              +
                            </button>
                          </div>
                          <div className="flex flex-col space-x-2 mt-4">
                            <button
                              className="px-4 py-1 bg-black text-white rounded hover:bg-gray-800 transition-colors"
                              onClick={() => addToCart(products[idx], quantity)}
                            >
                              Add to Cart
                            </button>
                            <button
                              className="px-2 py-1 text-gray-500 hover:text-black"
                              onClick={() => {
                                setShowQuantitySelector(false);
                                setQuantity(1);
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    products[idx].comingSoon || !products[idx].image ? (
                      <span className="text-[#bf608f] font-arsenal text-lg font-bold">More coming soon</span>
                    ) : (
                      <Image src={products[idx].image} alt={products[idx].name} width={140} height={140} className="w-full h-full object-contain" />
                    )
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {/* Left Arrow */}
          <button
            aria-label="Previous item"
            className="absolute left-8 md:left-0 translate-y-70 lg:translate-y-50 z-30 bg-white border-2 border-black rounded-full w-12 h-12 flex items-center text-black justify-center shadow hover:bg-[#FFF7F5] transition-colors"
            onClick={() => handleSlide(-1)}
          >
             &larr;
          </button>
          
          {/* Right Arrow */}
          <button
            aria-label="Next item"
            className="absolute right-8 md:right-0 translate-y-70 lg:translate-y-50 z-30 bg-white border-2 border-black rounded-full w-12 h-12 flex items-center text-black justify-center shadow hover:bg-[#FFF7F5] transition-colors"
            onClick={() => handleSlide(1)}
          >
             &rarr;
          </button>
        </div>
      )}
    </section>
  );
}
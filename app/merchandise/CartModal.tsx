import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CartItem {
  name: string;
  price: string;
  description: string;
  image: string;
  quantity: number;
}

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
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

interface CartModalProps {
  showCart: boolean;
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  setShowCart: (show: boolean) => void;
}

// Payment Form Component
const PaymentForm: React.FC<{
  amount: number;
  customerInfo: CustomerInfo;
  cartItems: CartItem[];
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
  onBack: () => void;
}> = ({ amount, customerInfo, cartItems, onPaymentSuccess, onPaymentError, onBack }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          metadata: {
            customer_name: `${customerInfo.firstName} ${customerInfo.lastName}`,
            customer_email: customerInfo.email,
            items: cartItems.map(item => `${item.name} x${item.quantity}`).join(', ')
          }
        }),
      });

      const { clientSecret, paymentIntentId } = await response.json();

      // Confirm payment
      const { error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: `${customerInfo.firstName} ${customerInfo.lastName}`,
            email: customerInfo.email,
            phone: customerInfo.phone,
            address: {
              line1: customerInfo.address,
              city: customerInfo.city,
              state: customerInfo.state,
              postal_code: customerInfo.postalCode,
              country: customerInfo.country,
            },
          },
        },
      });

      if (error) {
        onPaymentError(error.message || 'Payment failed');
      } else {
        // Save order to Google Sheets
        await fetch('/api/save-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId,
            amount,
            customerInfo,
            items: cartItems,
            transactionDate: new Date().toISOString(),
          }),
        });

        onPaymentSuccess(paymentIntentId);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      onPaymentError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-[#FFFFFF] shadow-xl rounded-xl p-4 sm:p-12 flex flex-col lg:flex-row gap-8 items-stretch relative" style={{ maxHeight: '70vh', minHeight: '400px' }}>
      <div className="flex-1 min-w-0 flex flex-col justify-between z-10 overflow-y-auto" style={{ maxHeight: '60vh' }}>
        <div className="flex-1 flex flex-col justify-between">
          <h2 className="text-xl sm:text-2xl text-black font-bold font-arsenal mb-6">Payment Information</h2>
          
          {/* Payment method icons */}
          <div className="flex flex-row gap-4 mb-6">
            <Image src="/visa.svg" alt="Visa" width={48} height={32} className="w-20 h-12 border-1 p-2 border-gray-200 rounded-lg" />
            <Image src="/mastercard.svg" alt="Mastercard" width={48} height={32} className="w-20 h-12 border-1 p-2 border-gray-200 rounded-lg" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="mb-4">
              <label className="block font-arsenal text-gray-700 text-sm font-medium mb-2">
                Card Information
              </label>
              <div className="p-4 border border-gray-200 rounded-lg bg-white">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': {
                          color: '#aab7c4',
                        },
                      },
                      invalid: {
                        color: '#9e2146',
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-[#FFF7F5] border border-[#F9E3E0] p-4 rounded-lg mb-4">
              <h3 className="font-bold mb-3 font-arsenal text-[#bf608f] text-base">Order Summary</h3>
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm mb-2 text-gray-700">
                  <span className="font-medium">{item.name} x{item.quantity}</span>
                  <span className="font-semibold text-[#bf608f]">${(parsePrice(item.price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-[#F9E3E0] pt-3 mt-3 font-bold flex justify-between text-base">
                <span className="text-gray-800">Total</span>
                <span className="text-[#bf608f] text-lg">${amount.toFixed(2)}</span>
              </div>
            </div>
          </form>
        </div>

        <div className="flex flex-row items-center mt-10 w-full relative">
          <button
            type="button"
            className="text-[#bf608f] font-bold hover:underline text-center"
            onClick={onBack}
            disabled={isProcessing}
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Right side image */}
      <div className="hidden lg:flex flex-1 items-stretch z-0 order-2">
        <div className="flex flex-col h-full w-full justify-between">
          <Image src="/payment.svg" alt="Payment" fill className="rounded-xl" style={{ objectPosition: 'center', maxWidth: '100%', minHeight: 0, maxHeight: '90%', objectFit: 'contain', marginLeft: 150}} />
        </div>
      </div>

      {/* Pay Button */}
      <button
        type="submit"
        onClick={handleSubmit}
        disabled={!stripe || isProcessing}
        className={`font-arsenal text-white px-16 py-2 rounded-full font-bold transition-colors mt-4 lg:mt-0 w-full lg:w-auto lg:absolute right-8 bottom-6 ${
          isProcessing 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-[#bf608f] hover:bg-[#a94e7a]'
        }`}
        style={{ zIndex: 20 }}
      >
        {isProcessing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
      </button>
    </div>
  );
};

const CartModal: React.FC<CartModalProps> = ({ showCart, cartItems, setCartItems, setShowCart }) => {
  const cartModalRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(1);
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');
  const [checkoutAmount, setCheckoutAmount] = useState<number>(0); // Store amount when starting checkout
  const [shipping, setShipping] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
    email: '',
  });

  const totalAmount = cartItems.reduce((sum, item) => sum + parsePrice(item.price) * item.quantity, 0);
  
  // Debug logging for total amount calculation
  if (process.env.NODE_ENV === 'development') {
    console.log('Current step:', step);
    console.log('Cart items count:', cartItems.length);
    console.log('Calculated total amount:', totalAmount);
    if (step === 4) {
      console.log('Confirmation screen - cart items preserved for calculation');
    }
  }

  // Dismiss modal on outside click
  useEffect(() => {
    if (!showCart) return;
    function handleClick(e: MouseEvent) {
      if (cartModalRef.current && !cartModalRef.current.contains(e.target as Node)) {
        // If they completed a purchase (step 4), clear the cart
        if (step === 4) {
          setCartItems([]);
        }
        setShowCart(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showCart, setShowCart, step, setCartItems]);

  // Reset state when modal is closed (but don't automatically clear cart)
  useEffect(() => {
    if (!showCart) {
      setStep(1);
      setPaymentIntentId('');
      setCheckoutAmount(0);
      // Note: We don't clear cartItems here automatically
      // Cart is only cleared when user explicitly goes back to shop after purchase
    }
  }, [showCart]);

  const handlePaymentSuccess = (paymentId: string) => {
    console.log('Payment successful! Payment ID:', paymentId);
    console.log('Keeping cart items for confirmation screen');
    setPaymentIntentId(paymentId);
    // Don't clear cart here - keep it for confirmation screen calculations
    setStep(4);
  };

  const handlePaymentError = (error: string) => {
    alert(`Payment failed: ${error}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div
        ref={cartModalRef}
        className="bg-white rounded-2xl shadow-xl w-full max-w-4xl sm:max-w-lg md:max-w-2xl lg:max-w-4xl relative mx-2 sm:mx-auto overflow-y-auto max-h-[95vh]"
      >
        {/* Progress Bar */}
        <div className="flex justify-between items-center mt-6 mb-6 sm:mt-8 sm:mb-8 px-2 sm:px-8">
          {[
            "Cart",
            "Shipping",
            "Payment",
            "Confirmation",
          ].map((stepLabel, i) => (
            <React.Fragment key={stepLabel}>
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-base sm:text-lg mb-1 ${
                    step === i + 1
                      ? "bg-[#bf608f] text-white"
                      : i < step
                      ? "bg-[#f9e3e0] text-[#bf608f]"
                      : "bg-[#f9e3e0] text-gray-400"
                  }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`text-[10px] sm:text-xs font-bold ${step === i + 1 ? "text-[#bf608f]" : "text-gray-400"}`}
                >
                  {stepLabel}
                </span>
              </div>
              <Image src="/cart-div.svg" alt="Cart" width={24} height={24} className={`${i === 3 ? "w-0" : " w-8 lg:w-28"}`} />
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Cart */}
        {step === 1 && (
          <div className="bg-[#FFFFFF] shadow-xl rounded-xl p-4 sm:p-8">
            <div className="flex items-center mb-4 sm:mb-6">
              <Image src="/cart.svg" alt="Cart" width={24} height={24} className="mr-2 sm:w-7 sm:h-7" />
              <h2 className="text-xl sm:text-2xl text-black font-bold font-arsenal">Your Shopping Cart</h2>
            </div>
            <div className="bg-[#F9F9F9] rounded-xl p-3 sm:p-6 divide-y divide-gray-200 max-h-[40vh] sm:max-h-[60vh] overflow-y-auto">
              {cartItems.length === 0 ? (
                <div className="py-8 sm:py-12 text-center font-arsenal text-black text-sm sm:text-base">Your cart is empty.</div>
              ) : (
                cartItems.map((item, idx) => (
                  <div key={item.name} className="flex flex-row items-center py-4 sm:py-6 gap-3 sm:gap-0">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center mr-0 sm:mr-4">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} width={56} height={56} className="object-contain sm:w-16 sm:h-16 w-14 h-14" />
                      ) : (
                        <span className="text-black">No Image</span>
                      )}
                    </div>
                    <div className="flex-1 w-full sm:w-auto text-center sm:text-left">
                      <div className="font-bold text-black text-base sm:text-lg text-left">{item.name}</div>
                      <div className="text-xs text-black text-left">{item.description}</div>
                    </div>
                    <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                      <button
                        className="border-2 border-black text-black rounded-full w-6 h-6 flex items-center justify-center text-xl hover:bg-[#FFF7F5]"
                        onClick={() => {
                          setCartItems((items) => {
                            const updated = [...items];
                            updated[idx].quantity = Math.max(1, updated[idx].quantity - 0.5);
                            return updated;
                          });
                        }}
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-black">{item.quantity}</span>
                      <button
                        className="border-2 border-black text-black rounded-full w-6 h-6 flex items-center justify-center text-xl hover:bg-[#FFF7F5]"
                        onClick={() => {
                          setCartItems((items) => {
                            const updated = [...items];
                            updated[idx].quantity = updated[idx].quantity + 0.5;
                            return updated;
                          });
                        }}
                      >
                        +
                      </button>
                    </div>
                    <div className="w-20 text-right font-bold text-black text-sm sm:text-base mt-2 sm:mt-0">
                      ${(parsePrice(item.price) * item.quantity).toFixed(2)}
                    </div>
                    <button
                      className="ml-0 sm:ml-4 text-gray-400 hover:text-[#bf608f] mt-2 sm:mt-0"
                      onClick={() => {
                        setCartItems((items) => items.filter((_, i) => i !== idx));
                      }}
                      aria-label="Remove item"
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-center mt-6 sm:mt-8 gap-4 sm:gap-0 w-full">
              <button
                className="text-[#bf608f] font-bold hover:underline text-center sm:text-left order-2 sm:order-1 w-full sm:w-auto"
                onClick={() => setShowCart(false)}
              >
                ← Continue Shopping
              </button>
              <div className="flex flex-col-reverse sm:flex-row items-center sm:items-center w-full sm:w-auto gap-2 sm:gap-8 order-1 sm:order-2">
                <div className="text-base sm:text-lg font-bold text-black text-center sm:text-right w-full sm:w-auto">
                  Subtotal
                  <span className="ml-2">${totalAmount.toFixed(2)}</span>
                </div>
                <button
                  className="bg-[#bf608f] text-white px-4 py-2 sm:px-6 sm:py-2 rounded-full font-bold hover:bg-[#a94e7a] transition-colors w-full sm:w-auto"
                  onClick={() => setStep(2)}
                  disabled={cartItems.length === 0}
                >
                  Check out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Shipping - Keep your existing shipping form */}
        {step === 2 && (
          <div className="bg-[#FFFFFF] shadow-xl rounded-xl p-4 sm:p-8 flex flex-col lg:flex-row gap-8 items-stretch relative" style={{ maxHeight: '70vh', minHeight: '400px' }}>
            <div className="flex-1 min-w-0 flex flex-col justify-between z-10 overflow-y-auto" style={{ maxHeight: '60vh' }}>
              <div className="flex-1 flex flex-col justify-between">
                <h2 className="text-xl sm:text-2xl text-black font-bold font-arsenal mb-6">Your Shipping Information</h2>
                <form className="space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-arsenal text-gray-700 text-sm font-medium">First Name</label>
                        <input
                          type="text"
                          className="w-full mb-1 shadow-sm bg-white px-4 py-3 border border-gray-200 rounded-lg text-gray-700 font-arsenal"
                          value={shipping.firstName}
                          onChange={e => setShipping(s => ({ ...s, firstName: e.target.value }))}
                          placeholder="First Name"
                        />
                      </div>
                      <div>
                        <label className="block font-arsenal text-gray-700 text-sm font-medium">Last Name</label>
                        <input
                          type="text"
                          className="w-full mb-1 shadow-sm bg-white px-4 py-3 border border-gray-200 rounded-lg text-gray-700 font-arsenal"
                          value={shipping.lastName}
                          onChange={e => setShipping(s => ({ ...s, lastName: e.target.value }))}
                          placeholder="Last Name"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-arsenal text-gray-700 text-sm font-medium">Address</label>
                      <input
                        type="text"
                        className="w-full mb-1 shadow-sm bg-white px-4 py-3 border border-gray-200 rounded-lg text-gray-700 font-arsenal"
                        value={shipping.address}
                        onChange={e => setShipping(s => ({ ...s, address: e.target.value }))}
                        placeholder="Address"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-arsenal text-gray-700 text-sm font-medium">City</label>
                        <input
                          type="text"
                          className="w-full mb-1 shadow-sm bg-white px-4 py-3 border border-gray-200 rounded-lg text-gray-700 font-arsenal"
                          value={shipping.city}
                          onChange={e => setShipping(s => ({ ...s, city: e.target.value }))}
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block font-arsenal text-gray-700 text-sm font-medium">State</label>
                        <input
                          type="text"
                          className="w-full mb-1 shadow-sm bg-white px-4 py-3 border border-gray-200 rounded-lg text-gray-700 font-arsenal"
                          value={shipping.state}
                          onChange={e => setShipping(s => ({ ...s, state: e.target.value }))}
                          placeholder="State"
                        />
                      </div>
                      <div>
                        <label className="block font-arsenal text-gray-700 text-sm font-medium">Postal Code</label>
                        <input
                          type="text"
                          className="w-full mb-1 shadow-sm bg-white px-4 py-3 border border-gray-200 rounded-lg text-gray-700 font-arsenal"
                          value={shipping.postalCode}
                          onChange={e => setShipping(s => ({ ...s, postalCode: e.target.value }))}
                          placeholder="Postal Code"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-arsenal text-gray-700 text-sm font-medium">Country</label>
                        <input
                          type="text"
                          className="w-full mb-1 shadow-sm bg-white px-4 py-3 border border-gray-200 rounded-lg text-gray-700 font-arsenal"
                          value={shipping.country}
                          onChange={e => setShipping(s => ({ ...s, country: e.target.value }))}
                          placeholder="Country"
                        />
                      </div>
                      <div>
                        <label className="block font-arsenal text-gray-700 text-sm font-medium">Phone Number</label>
                        <input
                          type="text"
                          className="w-full mb-1 shadow-sm bg-white px-4 py-3 border border-gray-200 rounded-lg text-gray-700 font-arsenal"
                          value={shipping.phone}
                          onChange={e => setShipping(s => ({ ...s, phone: e.target.value }))}
                          placeholder="Phone Number"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-arsenal text-gray-700 text-sm font-medium">E-mail address</label>
                      <input
                        type="email"
                        className="w-full mb-1 shadow-sm bg-white px-4 py-3 border border-gray-200 rounded-lg text-gray-700 font-arsenal"
                        value={shipping.email}
                        onChange={e => setShipping(s => ({ ...s, email: e.target.value }))}
                        placeholder="E-mail address"
                      />
                    </div>
                  </div>
                </form>
              </div>
              <div className="flex flex-row items-center mt-6 w-full relative">
                <button
                  type="button"
                  className="text-[#bf608f] font-bold hover:underline text-center"
                  onClick={() => setStep(1)}
                >
                  ← Back
                </button>
              </div>
            </div>
            <div className="hidden lg:flex flex-1 items-stretch z-0 order-2">
              <div className="flex flex-col h-full w-full justify-between">
                <Image src="/shipping.svg" alt="Shipping" fill className="rounded-xl" style={{ objectPosition: 'center', maxWidth: '100%', minHeight: 0, maxHeight: '90%', objectFit: 'contain', marginLeft: 150}} />
              </div>
            </div>
            <button
              type="button"
              className="bg-[#bf608f] font-arsenal text-white px-12 py-2 rounded-full font-bold hover:bg-[#a94e7a] transition-colors mt-4 lg:mt-0 w-full lg:w-auto lg:absolute right-8 bottom-6"
              style={{ zIndex: 20 }}
              onClick={() => {
                setCheckoutAmount(totalAmount); // Store the amount before going to payment
                setStep(3);
              }}
            >
              Next
            </button>
          </div>
        )}

        {/* Step 3: Payment with Stripe */}
        {step === 3 && (
          <Elements stripe={stripePromise}>
            <PaymentForm
              amount={checkoutAmount > 0 ? checkoutAmount : totalAmount}
              customerInfo={shipping}
              cartItems={cartItems}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              onBack={() => setStep(2)}
            />
          </Elements>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] py-0 px-2 sm:px-0 rounded-2xl relative overflow-hidden">
            <Image src="/confirm-bg.svg" alt="Confirmation Background" fill priority className="object-cover w-full h-full absolute left-0 top-0" />
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl mx-auto pt-16 pb-10 px-6 sm:px-10 flex flex-col items-center relative z-10">
              <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/3 z-0 pointer-events-none select-none" style={{ width: '200px', height: '650px' }}>
                <Image src="/confirm.svg" alt="Confirmation" width={200} height={200} className="w-full h-full" />
              </div>
              <div className="relative z-10 flex flex-col items-center w-full">
                <h2 className="text-2xl sm:text-3xl font-bold font-arsenal text-black mb-1 text-center">Payment Successful</h2>
                <p className="text-gray-700 text-center mb-8 max-w-xs font-arsenal">Thank you for your payment. Your transaction has been completed and a receipt has been sent to your email.</p>
                <div className="w-full bg-[#F9F9F9] rounded-xl px-4 py-4 mb-8 text-left">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700 font-arsenal">Amount Paid</span>
                    <span className="text-[#bf608f] font-bold font-arsenal">${totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700 font-arsenal">Payment Method</span>
                    <span className="text-gray-700 font-arsenal">Card Payment</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700 font-arsenal">Transaction ID</span>
                    <span className="text-gray-700 font-arsenal">{paymentIntentId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-arsenal">Date & Time</span>
                    <span className="text-gray-700 font-arsenal">{new Date().toLocaleString(undefined, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <div className="flex flex-row gap-4 w-full mt-2">
                  <button
                    type="button"
                    className="flex-1 border-2 border-[#FEDEEE] text-[#bf608f] font-bold font-arsenal py-3 rounded-full hover:bg-[#FEDEEE] transition-colors text-base"
                    onClick={() => {
                      // Clear cart when actually leaving the modal
                      setCartItems([]);
                      setShowCart(false);
                      setStep(1);
                      setPaymentIntentId('');
                      setCheckoutAmount(0);
                    }}
                  >
                    ← Back to Shop
                  </button>
                  <button
                    type="button"
                    className="flex-1 bg-[#bf608f] text-white font-bold font-arsenal py-3 rounded-full hover:bg-[#a94e7a] transition-colors text-base"
                  >
                    Download Receipt
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;
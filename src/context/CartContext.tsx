import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Customizations {
  bun?: string;
  doneness?: string;
  extras: { name: string; price: number }[];
  sauces: string[];
  notes?: string;
}

export interface CartItem {
  id: string; // Composite ID: menuId + hash of customizations
  menuId: string;
  name: string;
  basePrice: number;
  totalPrice: number; // basePrice + extras
  image: string;
  customizations: Customizations;
  quantity: number;
}

export interface CheckoutDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  deliveryMethod: 'delivery' | 'pickup';
  paymentMethod: 'stripe' | 'cash' | 'momo';
  cardNumberMuted?: string;
  momoProvider?: 'mtn' | 'airtel';
  momoPhone?: string;
  currency?: 'USD' | 'RWF';
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  details: CheckoutDetails;
  status: 'preparing' | 'cooking' | 'delivering' | 'delivered';
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id' | 'totalPrice'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartCount: number;
  checkoutDetails: CheckoutDetails | null;
  saveCheckoutDetails: (details: CheckoutDetails) => void;
  activeOrder: Order | null;
  placeOrder: (details: CheckoutDetails) => Order;
  updateOrderStatus: (status: Order['status']) => void;
  clearActiveOrder: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('burgerhub_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [checkoutDetails, setCheckoutDetails] = useState<CheckoutDetails | null>(() => {
    const saved = localStorage.getItem('burgerhub_checkout_details');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeOrder, setActiveOrder] = useState<Order | null>(() => {
    const saved = localStorage.getItem('burgerhub_active_order');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('burgerhub_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (checkoutDetails) {
      localStorage.setItem('burgerhub_checkout_details', JSON.stringify(checkoutDetails));
    }
  }, [checkoutDetails]);

  useEffect(() => {
    if (activeOrder) {
      localStorage.setItem('burgerhub_active_order', JSON.stringify(activeOrder));
    } else {
      localStorage.removeItem('burgerhub_active_order');
    }
  }, [activeOrder]);

  const generateItemId = (menuId: string, customizations: Customizations): string => {
    const extraNames = customizations.extras.map(e => e.name).sort().join(',');
    const sauceNames = customizations.sauces.sort().join(',');
    return `${menuId}_${customizations.bun || ''}_${customizations.doneness || ''}_${extraNames}_${sauceNames}_${customizations.notes || ''}`;
  };

  const addToCart = (newItem: Omit<CartItem, 'id' | 'totalPrice'>) => {
    const extrasPrice = newItem.customizations.extras.reduce((acc, curr) => acc + curr.price, 0);
    const totalPrice = newItem.basePrice + extrasPrice;
    const itemUniqueId = generateItemId(newItem.menuId, newItem.customizations);

    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.id === itemUniqueId);

      if (existingItemIndex > -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += newItem.quantity;
        return updatedCart;
      }

      return [...prevCart, { ...newItem, id: itemUniqueId, totalPrice, quantity: newItem.quantity }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const saveCheckoutDetails = (details: CheckoutDetails) => {
    setCheckoutDetails(details);
  };

  const cartSubtotal = cart.reduce((acc, item) => acc + item.totalPrice * item.quantity, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const placeOrder = (details: CheckoutDetails): Order => {
    const subtotal = cartSubtotal;
    const tax = subtotal * 0.08; // 8% sales tax
    const deliveryFee = details.deliveryMethod === 'delivery' ? 3.99 : 0;
    const total = subtotal + tax + deliveryFee;

    const newOrder: Order = {
      id: 'BH-' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleString(),
      items: [...cart],
      subtotal,
      tax,
      deliveryFee,
      total,
      details,
      status: 'preparing'
    };

    setActiveOrder(newOrder);
    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (status: Order['status']) => {
    setActiveOrder(prevOrder => {
      if (!prevOrder) return null;
      return { ...prevOrder, status };
    });
  };

  const clearActiveOrder = () => {
    setActiveOrder(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartSubtotal,
        cartCount,
        checkoutDetails,
        saveCheckoutDetails,
        activeOrder,
        placeOrder,
        updateOrderStatus,
        clearActiveOrder
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

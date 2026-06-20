import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchOrders, saveOrder, saveChefs, saveRiders } from '../utils/supabaseDb';

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
  couponApplied?: string;
  couponDiscount?: number;
  coinsRedeemed?: number;
  coinsDiscount?: number;
  riderX?: number;
  riderY?: number;
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
  assignedChefId?: string;
  assignedChefName?: string;
  assignedRiderId?: string;
  assignedRiderName?: string;
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
  orders: Order[];
  updateOrderStatusInHistory: (orderId: string, status: Order['status']) => void;
  assignChefToOrder: (orderId: string, chefId: string, chefName: string) => void;
  completeCookingOrder: (orderId: string, chefId: string) => void;
  assignRiderToOrder: (orderId: string, riderId: string, riderName: string) => void;
  completeDeliveryOrder: (orderId: string, riderId: string) => void;
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

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('burgerhub_all_orders');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const loadDbOrders = async () => {
      const dbOrders = await fetchOrders();
      setOrders(dbOrders);
      
      // Update activeOrder if its status or details have changed in the database
      setActiveOrder(prevActive => {
        if (!prevActive) return null;
        const matching = dbOrders.find(o => o.id === prevActive.id);
        if (matching) {
          if (
            matching.status !== prevActive.status ||
            JSON.stringify(matching.details) !== JSON.stringify(prevActive.details)
          ) {
            return matching;
          }
        }
        return prevActive;
      });
    };
    loadDbOrders();
    const interval = setInterval(loadDbOrders, 3000);
    return () => clearInterval(interval);
  }, []);

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

  useEffect(() => {
    localStorage.setItem('burgerhub_all_orders', JSON.stringify(orders));
  }, [orders]);

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
    const couponDiscount = details.couponDiscount || 0;
    const coinsDiscount = details.coinsDiscount || 0;

    const finalSubtotal = Math.max(0, subtotal - couponDiscount - coinsDiscount);
    const tax = finalSubtotal * 0.08;

    let deliveryFee = details.deliveryMethod === 'delivery' ? 3.99 : 0;
    if (details.couponApplied === 'FREEKIGALI') {
      deliveryFee = 0;
    }

    const total = finalSubtotal + tax + deliveryFee;

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
    setOrders(prevOrders => [newOrder, ...prevOrders]);
    saveOrder(newOrder);
    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (status: Order['status']) => {
    setActiveOrder(prevOrder => {
      if (!prevOrder) return null;
      const updated = { ...prevOrder, status };
      setOrders(prevOrders =>
        prevOrders.map(o => (o.id === prevOrder.id ? updated : o))
      );
      saveOrder(updated);
      return updated;
    });
  };

  const updateOrderStatusInHistory = (orderId: string, status: Order['status']) => {
    setOrders(prevOrders => {
      const updated = prevOrders.map(order => (order.id === orderId ? { ...order, status } : order));
      const targetOrder = updated.find(o => o.id === orderId);
      if (targetOrder) saveOrder(targetOrder);
      return updated;
    });
    setActiveOrder(prevOrder => {
      if (prevOrder && prevOrder.id === orderId) {
        return { ...prevOrder, status };
      }
      return prevOrder;
    });
  };

  const assignChefToOrder = (orderId: string, chefId: string, chefName: string) => {
    setOrders(prevOrders => {
      const updated = prevOrders.map(order => 
        order.id === orderId 
          ? { ...order, status: 'cooking' as const, assignedChefId: chefId, assignedChefName: chefName } 
          : order
      );
      const targetOrder = updated.find(o => o.id === orderId);
      if (targetOrder) saveOrder(targetOrder);
      return updated;
    });
    setActiveOrder(prevOrder => {
      if (prevOrder && prevOrder.id === orderId) {
        return { ...prevOrder, status: 'cooking', assignedChefId: chefId, assignedChefName: chefName };
      }
      return prevOrder;
    });

    const savedChefs = localStorage.getItem('burgerhub_chefs');
    if (savedChefs) {
      const chefs = JSON.parse(savedChefs);
      const updated = chefs.map((c: any) => c.id === chefId ? { ...c, status: 'busy', assignedOrderId: orderId } : c);
      saveChefs(updated);
    }
  };

  const completeCookingOrder = (orderId: string, chefId: string) => {
    setOrders(prevOrders => {
      const updated = prevOrders.map(order => 
        order.id === orderId 
          ? { ...order, status: 'delivering' as const } 
          : order
      );
      const targetOrder = updated.find(o => o.id === orderId);
      if (targetOrder) saveOrder(targetOrder);
      return updated;
    });
    setActiveOrder(prevOrder => {
      if (prevOrder && prevOrder.id === orderId) {
        return { ...prevOrder, status: 'delivering' };
      }
      return prevOrder;
    });

    const savedChefs = localStorage.getItem('burgerhub_chefs');
    if (savedChefs) {
      const chefs = JSON.parse(savedChefs);
      const updated = chefs.map((c: any) => c.id === chefId ? { ...c, status: 'idle', assignedOrderId: undefined } : c);
      saveChefs(updated);
    }
  };

  const assignRiderToOrder = (orderId: string, riderId: string, riderName: string) => {
    setOrders(prevOrders => {
      const updated = prevOrders.map(order => 
        order.id === orderId 
          ? { ...order, assignedRiderId: riderId, assignedRiderName: riderName } 
          : order
      );
      const targetOrder = updated.find(o => o.id === orderId);
      if (targetOrder) saveOrder(targetOrder);
      return updated;
    });
    setActiveOrder(prevOrder => {
      if (prevOrder && prevOrder.id === orderId) {
        return { ...prevOrder, assignedRiderId: riderId, assignedRiderName: riderName };
      }
      return prevOrder;
    });

    const savedRiders = localStorage.getItem('burgerhub_riders');
    if (savedRiders) {
      const riders = JSON.parse(savedRiders);
      const updated = riders.map((r: any) => r.id === riderId ? { ...r, status: 'busy', assignedOrderId: orderId } : r);
      saveRiders(updated);
    }
  };

  const completeDeliveryOrder = (orderId: string, riderId: string) => {
    setOrders(prevOrders => {
      const updated = prevOrders.map(order => 
        order.id === orderId 
          ? { ...order, status: 'delivered' as const } 
          : order
      );
      const targetOrder = updated.find(o => o.id === orderId);
      if (targetOrder) saveOrder(targetOrder);
      return updated;
    });
    setActiveOrder(prevOrder => {
      if (prevOrder && prevOrder.id === orderId) {
        return { ...prevOrder, status: 'delivered' };
      }
      return prevOrder;
    });

    const savedRiders = localStorage.getItem('burgerhub_riders');
    if (savedRiders) {
      const riders = JSON.parse(savedRiders);
      const updated = riders.map((r: any) => r.id === riderId ? { ...r, status: 'idle', assignedOrderId: undefined } : r);
      saveRiders(updated);
    }
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
        clearActiveOrder,
        orders,
        updateOrderStatusInHistory,
        assignChefToOrder,
        completeCookingOrder,
        assignRiderToOrder,
        completeDeliveryOrder
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

import { supabase } from '../supabase';

const logDbError = (context: string, error: any) => {
  console.warn(`[Supabase Fallback Enabled] Error in ${context}:`, error);
};

// 1. Categories
export const fetchMenuCategories = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('burgerhub_menu_categories')
      .select('*');
    if (error) throw error;
    if (data && data.length > 0) {
      localStorage.setItem('burgerhub_menu_categories', JSON.stringify(data));
      return data;
    }
  } catch (err) {
    logDbError('fetchMenuCategories', err);
  }
  const local = localStorage.getItem('burgerhub_menu_categories');
  return local ? JSON.parse(local) : [];
};

export const saveMenuCategories = async (categories: any[]) => {
  localStorage.setItem('burgerhub_menu_categories', JSON.stringify(categories));
  try {
    const { error } = await supabase
      .from('burgerhub_menu_categories')
      .upsert(categories);
    if (error) throw error;
  } catch (err) {
    logDbError('saveMenuCategories', err);
  }
};

export const removeMenuCategory = async (id: string) => {
  const local = localStorage.getItem('burgerhub_menu_categories');
  if (local) {
    const cats = JSON.parse(local).filter((c: any) => c.id !== id);
    localStorage.setItem('burgerhub_menu_categories', JSON.stringify(cats));
  }
  try {
    const { error } = await supabase
      .from('burgerhub_menu_categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
  } catch (err) {
    logDbError('removeMenuCategory', err);
  }
};

// 2. Menu Items
export const fetchMenuItems = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('burgerhub_menu_items')
      .select('*');
    if (error) throw error;
    if (data && data.length > 0) {
      localStorage.setItem('burgerhub_menu_items', JSON.stringify(data));
      return data;
    }
  } catch (err) {
    logDbError('fetchMenuItems', err);
  }
  const local = localStorage.getItem('burgerhub_menu_items');
  return local ? JSON.parse(local) : [];
};

export const saveMenuItem = async (item: any) => {
  const local = localStorage.getItem('burgerhub_menu_items');
  let items = local ? JSON.parse(local) : [];
  const idx = items.findIndex((i: any) => i.id === item.id);
  if (idx > -1) {
    items[idx] = item;
  } else {
    items.push(item);
  }
  localStorage.setItem('burgerhub_menu_items', JSON.stringify(items));

  try {
    const { error } = await supabase
      .from('burgerhub_menu_items')
      .upsert(item);
    if (error) throw error;
  } catch (err) {
    logDbError('saveMenuItem', err);
  }
};

export const removeMenuItem = async (id: string) => {
  const local = localStorage.getItem('burgerhub_menu_items');
  if (local) {
    const items = JSON.parse(local).filter((i: any) => i.id !== id);
    localStorage.setItem('burgerhub_menu_items', JSON.stringify(items));
  }
  try {
    const { error } = await supabase
      .from('burgerhub_menu_items')
      .delete()
      .eq('id', id);
    if (error) throw error;
  } catch (err) {
    logDbError('removeMenuItem', err);
  }
};

// 3. Admins
export const fetchAdmins = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('burgerhub_admins')
      .select('*');
    if (error) throw error;
    if (data && data.length > 0) {
      localStorage.setItem('burgerhub_admins', JSON.stringify(data));
      return data;
    }
  } catch (err) {
    logDbError('fetchAdmins', err);
  }
  const local = localStorage.getItem('burgerhub_admins');
  return local ? JSON.parse(local) : [];
};

export const saveAdmin = async (admin: any) => {
  const local = localStorage.getItem('burgerhub_admins');
  let admins = local ? JSON.parse(local) : [];
  const idx = admins.findIndex((a: any) => a.email.toLowerCase() === admin.email.toLowerCase());
  if (idx > -1) {
    admins[idx] = admin;
  } else {
    admins.push(admin);
  }
  localStorage.setItem('burgerhub_admins', JSON.stringify(admins));

  try {
    const { error } = await supabase
      .from('burgerhub_admins')
      .upsert(admin);
    if (error) throw error;
  } catch (err) {
    logDbError('saveAdmin', err);
  }
};

// 4. Users
export const fetchUsers = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('burgerhub_users')
      .select('*');
    if (error) throw error;
    if (data && data.length > 0) {
      const mapped = data.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        password: u.password,
        phone: u.phone,
        address: u.address,
        city: u.city,
        zipCode: u.zip_code
      }));
      localStorage.setItem('burgerhub_users', JSON.stringify(mapped));
      return mapped;
    }
  } catch (err) {
    logDbError('fetchUsers', err);
  }
  const local = localStorage.getItem('burgerhub_users');
  return local ? JSON.parse(local) : [];
};

export const saveUser = async (user: any) => {
  const local = localStorage.getItem('burgerhub_users');
  let users = local ? JSON.parse(local) : [];
  const idx = users.findIndex((u: any) => u.id === user.id);
  if (idx > -1) {
    users[idx] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem('burgerhub_users', JSON.stringify(users));

  const dbUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    password: user.password,
    phone: user.phone,
    address: user.address,
    city: user.city,
    zip_code: user.zipCode
  };

  try {
    const { error } = await supabase
      .from('burgerhub_users')
      .upsert(dbUser);
    if (error) throw error;
  } catch (err) {
    logDbError('saveUser', err);
  }
};

export const removeUser = async (id: string) => {
  const local = localStorage.getItem('burgerhub_users');
  if (local) {
    const users = JSON.parse(local).filter((u: any) => u.id !== id);
    localStorage.setItem('burgerhub_users', JSON.stringify(users));
  }
  try {
    const { error } = await supabase
      .from('burgerhub_users')
      .delete()
      .eq('id', id);
    if (error) throw error;
  } catch (err) {
    logDbError('removeUser', err);
  }
};

// 5. Chefs
export const fetchChefs = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('burgerhub_chefs')
      .select('*');
    if (error) throw error;
    if (data && data.length > 0) {
      const mapped = data.map((c: any) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        password: c.password,
        role: c.role,
        status: c.status,
        assignedOrderId: c.assigned_order_id
      }));
      localStorage.setItem('burgerhub_chefs', JSON.stringify(mapped));
      return mapped;
    }
  } catch (err) {
    logDbError('fetchChefs', err);
  }
  const local = localStorage.getItem('burgerhub_chefs');
  return local ? JSON.parse(local) : [];
};

export const saveChefs = async (chefs: any[]) => {
  localStorage.setItem('burgerhub_chefs', JSON.stringify(chefs));
  const dbChefs = chefs.map(c => ({
    id: c.id,
    name: c.name,
    email: c.email,
    password: c.password,
    role: c.role,
    status: c.status,
    assigned_order_id: c.assignedOrderId || null
  }));
  try {
    const { error } = await supabase
      .from('burgerhub_chefs')
      .upsert(dbChefs);
    if (error) throw error;
  } catch (err) {
    logDbError('saveChefs', err);
  }
};

// 6. Riders
export const fetchRiders = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('burgerhub_riders')
      .select('*');
    if (error) throw error;
    if (data && data.length > 0) {
      const mapped = data.map((r: any) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        password: r.password,
        role: r.role,
        status: r.status,
        assignedOrderId: r.assigned_order_id
      }));
      localStorage.setItem('burgerhub_riders', JSON.stringify(mapped));
      return mapped;
    }
  } catch (err) {
    logDbError('fetchRiders', err);
  }
  const local = localStorage.getItem('burgerhub_riders');
  return local ? JSON.parse(local) : [];
};

export const saveRiders = async (riders: any[]) => {
  localStorage.setItem('burgerhub_riders', JSON.stringify(riders));
  const dbRiders = riders.map(r => ({
    id: r.id,
    name: r.name,
    email: r.email,
    password: r.password,
    role: r.role,
    status: r.status,
    assigned_order_id: r.assignedOrderId || null
  }));
  try {
    const { error } = await supabase
      .from('burgerhub_riders')
      .upsert(dbRiders);
    if (error) throw error;
  } catch (err) {
    logDbError('saveRiders', err);
  }
};

// 7. Orders
export const fetchOrders = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('burgerhub_orders')
      .select('*');
    if (error) throw error;
    if (data && data.length > 0) {
      const mapped = data.map((o: any) => ({
        id: o.id,
        date: o.date,
        items: o.items,
        subtotal: Number(o.subtotal),
        tax: Number(o.tax),
        deliveryFee: Number(o.delivery_fee),
        total: Number(o.total),
        details: o.details,
        status: o.status,
        assignedChefId: o.assigned_chef_id,
        assignedChefName: o.assigned_chef_name,
        assignedRiderId: o.assigned_rider_id,
        assignedRiderName: o.assigned_rider_name
      }));
      localStorage.setItem('burgerhub_all_orders', JSON.stringify(mapped));
      return mapped;
    }
  } catch (err) {
    logDbError('fetchOrders', err);
  }
  const local = localStorage.getItem('burgerhub_all_orders');
  return local ? JSON.parse(local) : [];
};

export const saveOrder = async (order: any) => {
  const local = localStorage.getItem('burgerhub_all_orders');
  let orders = local ? JSON.parse(local) : [];
  const idx = orders.findIndex((o: any) => o.id === order.id);
  if (idx > -1) {
    orders[idx] = order;
  } else {
    orders.push(order);
  }
  localStorage.setItem('burgerhub_all_orders', JSON.stringify(orders));

  const dbOrder = {
    id: order.id,
    date: order.date,
    items: order.items,
    subtotal: order.subtotal,
    tax: order.tax,
    delivery_fee: order.deliveryFee,
    total: order.total,
    details: order.details,
    status: order.status,
    assigned_chef_id: order.assignedChefId || null,
    assigned_chef_name: order.assignedChefName || null,
    assigned_rider_id: order.assignedRiderId || null,
    assigned_rider_name: order.assignedRiderName || null
  };

  try {
    const { error } = await supabase
      .from('burgerhub_orders')
      .upsert(dbOrder);
    if (error) throw error;
  } catch (err) {
    logDbError('saveOrder', err);
  }
};

export const removeChef = async (id: string) => {
  const local = localStorage.getItem('burgerhub_chefs');
  if (local) {
    const chefs = JSON.parse(local).filter((c: any) => c.id !== id);
    localStorage.setItem('burgerhub_chefs', JSON.stringify(chefs));
  }
  try {
    const { error } = await supabase
      .from('burgerhub_chefs')
      .delete()
      .eq('id', id);
    if (error) throw error;
  } catch (err) {
    logDbError('removeChef', err);
  }
};

export const removeRider = async (id: string) => {
  const local = localStorage.getItem('burgerhub_riders');
  if (local) {
    const riders = JSON.parse(local).filter((r: any) => r.id !== id);
    localStorage.setItem('burgerhub_riders', JSON.stringify(riders));
  }
  try {
    const { error } = await supabase
      .from('burgerhub_riders')
      .delete()
      .eq('id', id);
    if (error) throw error;
  } catch (err) {
    logDbError('removeRider', err);
  }
};

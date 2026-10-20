import React, { useState } from 'react';
import {
  X,
  User,
  Package,
  MapPin,
  LogOut,
  Plus,
  Trash2,
  Clock,
  ExternalLink,
  CheckCircle2,
  Phone,
  Mail
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Address } from '../types/store';

export const AccountDrawer: React.FC = () => {
  const {
    isAccountOpen,
    setIsAccountOpen,
    user,
    logout,
    saveAddress,
    deleteAddress,
    setOrderSuccess,
    setIsStoreManagerOpen
  } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'addresses'>('orders');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddr, setNewAddr] = useState<Partial<Address>>({
    fullName: user?.name ? user.name.replace(/[^a-zA-Z\s]/g, '') : '',
    phone: user?.phone ? user.phone.replace(/\D/g, '').slice(0, 10) : '',
    street: '',
    area: '',
    city: '',
    pincode: '',
    state: 'Tamil Nadu'
  });

  if (!isAccountOpen || !user) return null;

  const handleAddAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.fullName?.trim() || !newAddr.street?.trim()) return;
    const cleanName = (newAddr.fullName || user.name || '').replace(/[^a-zA-Z\s]/g, '').trim();
    const cleanPhone = (newAddr.phone || user.phone || '').replace(/\D/g, '').slice(0, 10);
    const addr: Address = {
      id: `addr-${Date.now()}`,
      fullName: cleanName || user.name,
      phone: cleanPhone || user.phone,
      street: newAddr.street.trim() || '',
      area: newAddr.area ? newAddr.area.trim() : '',
      city: newAddr.city ? newAddr.city.trim() : 'Coimbatore',
      pincode: newAddr.pincode ? newAddr.pincode.trim() : '',
      state: newAddr.state || 'Tamil Nadu',
      isDefault: false
    };
    saveAddress(addr);
    setNewAddr({
      fullName: user.name ? user.name.replace(/[^a-zA-Z\s]/g, '') : '',
      phone: user.phone ? user.phone.replace(/\D/g, '').slice(0, 10) : '',
      street: '',
      area: '',
      city: '',
      pincode: '',
      state: 'Tamil Nadu'
    });
    setShowAddAddress(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/40 backdrop-blur-xs flex justify-end animate-in fade-in">
      <div className="w-full max-w-lg bg-[#FAF9F5] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center font-bold text-sm">
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-stone-900 leading-tight">
                {user.name}
              </h2>
              <p className="text-xs text-stone-500">{user.phone || user.email || 'Registered Shopper'}</p>
            </div>
          </div>
          <button
            onClick={() => setIsAccountOpen(false)}
            className="p-1.5 text-stone-500 hover:text-stone-900 rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 border-b border-stone-200 bg-stone-100 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`py-3 flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'orders'
                ? 'border-amber-800 text-amber-900 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Order History ({user.orderHistory.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('addresses')}
            className={`py-3 flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'addresses'
                ? 'border-amber-800 text-amber-900 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Saved Addresses ({user.addresses.length})</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {user.orderHistory.length === 0 ? (
                <div className="text-center py-12 text-stone-500">
                  <Package className="w-10 h-10 mx-auto text-stone-300 stroke-[1.5] mb-2" />
                  <p className="font-serif text-base font-semibold text-stone-800">No Orders Placed Yet</p>
                  <p className="text-xs text-stone-500 mt-1">Explore our Coimbatore handlooms and place your first order.</p>
                </div>
              ) : (
                user.orderHistory.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 bg-white border border-stone-200 rounded-md space-y-3 shadow-2xs"
                  >
                    {/* Order Heading */}
                    <div className="flex items-center justify-between text-xs border-b border-stone-100 pb-2">
                      <div>
                        <span className="font-bold text-stone-900 font-mono">{order.orderNumber}</span>
                        <span className="text-stone-400 mx-1.5">·</span>
                        <span className="text-stone-500">{order.date}</span>
                      </div>
                      <span className="font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                        {order.deliveryStatus}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex gap-3 text-xs items-center">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.title}
                            referrerPolicy="no-referrer"
                            className="w-12 h-14 object-cover object-top rounded border border-stone-200"
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-stone-900 line-clamp-1">{item.product.title}</p>
                            <p className="text-[11px] text-stone-500">
                              {item.selectedSize} · Qty {item.quantity} · {item.selectedColor}
                            </p>
                            <p className="font-medium text-stone-900 tabular-nums">
                              ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Delivery & Order Details */}
                    <div className="pt-2 border-t border-stone-100 text-xs space-y-1 bg-stone-50/70 p-2.5 rounded">
                      <div className="flex justify-between text-stone-600 text-[11px]">
                        <span>Delivery Address:</span>
                        <span className="font-medium text-stone-800">{order.address.area}, {order.address.city} ({order.address.pincode})</span>
                      </div>
                      <div className="flex justify-between text-stone-600 text-[11px]">
                        <span>Payment Method:</span>
                        <span className="font-semibold text-stone-900">{order.paymentMethod}</span>
                      </div>
                    </div>

                    {/* Total & Action */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-stone-500">Total: <strong className="text-stone-900 text-sm tabular-nums">₹{order.total.toLocaleString('en-IN')}</strong></span>
                      <button
                        onClick={() => {
                          setOrderSuccess(order);
                          setIsAccountOpen(false);
                        }}
                        className="text-xs font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Invoice</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                ))
              )}
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-stone-700">Delivery Locations</span>
                <button
                  onClick={() => setShowAddAddress(!showAddAddress)}
                  className="text-xs text-amber-800 hover:text-amber-950 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              </div>

              {/* Add Address Form */}
              {showAddAddress && (
                <form onSubmit={handleAddAddressSubmit} className="p-4 bg-white border border-stone-200 rounded-md text-xs space-y-3">
                  <p className="font-bold text-stone-900">New Delivery Location</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-600 mb-1">Full Name (Alphabets only) *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Priya Lakshmi"
                        value={newAddr.fullName || ''}
                        onChange={(e) =>
                          setNewAddr({ ...newAddr, fullName: e.target.value.replace(/[^a-zA-Z\s]/g, '') })
                        }
                        className="w-full px-2.5 py-1.5 border border-stone-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-600 mb-1">Mobile Number (Numeric only) *</label>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="10-digit number"
                        value={newAddr.phone || ''}
                        onChange={(e) =>
                          setNewAddr({ ...newAddr, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })
                        }
                        className="w-full px-2.5 py-1.5 border border-stone-300 rounded font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1">Street Address *</label>
                    <input
                      type="text"
                      required
                      placeholder="Door / Flat No. & Street"
                      value={newAddr.street || ''}
                      onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-stone-300 rounded"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-600 mb-1">Area / Locality</label>
                      <input
                        type="text"
                        placeholder="Area / Landmark"
                        value={newAddr.area || ''}
                        onChange={(e) => setNewAddr({ ...newAddr, area: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-stone-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-600 mb-1">PIN Code (6 digits)</label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="6-digit PIN"
                        value={newAddr.pincode || ''}
                        onChange={(e) =>
                          setNewAddr({ ...newAddr, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })
                        }
                        className="w-full px-2.5 py-1.5 border border-stone-300 rounded font-mono"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-stone-900 text-white rounded font-medium cursor-pointer"
                    >
                      Save Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddAddress(false)}
                      className="px-3 py-2 border border-stone-300 rounded text-stone-600 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Saved list */}
              {user.addresses.map((addr) => (
                <div key={addr.id} className="p-3.5 bg-white border border-stone-200 rounded-md text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">{addr.fullName}</span>
                    {user.addresses.length > 1 && (
                      <button
                        onClick={() => deleteAddress(addr.id)}
                        className="text-stone-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-stone-600">{addr.street}, {addr.area}</p>
                  <p className="text-stone-600">{addr.city} - {addr.pincode}, {addr.state}</p>
                  <p className="text-stone-500 font-mono text-[11px]">Phone: {addr.phone}</p>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer with Logout */}
        <div className="p-4 border-t border-stone-200 bg-white flex items-center justify-between">
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs text-rose-700 hover:text-rose-900 font-medium cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Account</span>
          </button>
          <span className="text-[11px] text-stone-400">Shruthi Fashion Member</span>
        </div>

      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  FileText,
  Tag,
  Truck,
  Phone,
  CheckCircle2,
  Calendar,
  CreditCard,
  MapPin,
  Scissors,
  MessageSquare,
  Edit3,
  Sparkles,
  RotateCcw,
  Check
} from 'lucide-react';
import { UserOrder, Address } from '../types/store';

interface OrderPrintModalProps {
  order: UserOrder | null;
  initialView?: 'invoice' | 'courier_label';
  onClose: () => void;
}

export const OrderPrintModal: React.FC<OrderPrintModalProps> = ({
  order,
  initialView = 'courier_label',
  onClose
}) => {
  const [view, setView] = useState<'invoice' | 'courier_label'>(initialView);

  // Address state for the label (defaults to order address, can be replaced by WhatsApp paste)
  const [toAddress, setToAddress] = useState<Address>(() => {
    if (order?.address) {
      return { ...order.address };
    }
    return {
      id: `addr-wa-${Date.now()}`,
      fullName: 'Customer Name',
      phone: '9894088349',
      street: 'Door No, Street Name',
      area: 'Area / Landmark',
      city: 'Coimbatore',
      pincode: '641030',
      state: 'Tamil Nadu'
    };
  });

  // Additional label metadata
  const [labelOrderNo, setLabelOrderNo] = useState(order?.orderNumber || `SF-WA-${Math.floor(1000 + Math.random() * 9000)}`);
  const [labelPieces, setLabelPieces] = useState(order?.items?.reduce((s, i) => s + i.quantity, 0) || 1);
  const [labelWeight, setLabelWeight] = useState('0.45');
  const [isCod, setIsCod] = useState(order?.paymentMethod === 'COD');
  const [codAmount, setCodAmount] = useState(order?.total || 0);

  // WhatsApp Paste Drawer/Modal state
  const [showWhatsAppPanel, setShowWhatsAppPanel] = useState(false);
  const [rawWhatsAppText, setRawWhatsAppText] = useState('');
  const [parseSuccessMessage, setParseSuccessMessage] = useState(false);

  // Sync if order changes
  useEffect(() => {
    if (order?.address) {
      setToAddress({ ...order.address });
      setLabelOrderNo(order.orderNumber);
      setLabelPieces(order.items?.reduce((s, i) => s + i.quantity, 0) || 1);
      setIsCod(order.paymentMethod === 'COD');
      setCodAmount(order.total);
    }
  }, [order]);

  if (!order && !toAddress) return null;

  const handlePrint = () => {
    window.print();
  };

  // Smart Parser for WhatsApp Customer Messages
  const handleParseWhatsAppText = () => {
    if (!rawWhatsAppText.trim()) return;

    const text = rawWhatsAppText.trim();
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

    // 1. Extract 10-digit mobile number
    let phone = '';
    const phoneMatch = text.match(/(?:(?:\+|0{0,2})91[\s-]?)?([6789]\d{9})/);
    if (phoneMatch) {
      phone = phoneMatch[1];
    }

    // 2. Extract 6-digit Indian PIN code
    let pincode = '';
    const pinMatch = text.match(/\b([1-9]\d{5})\b/);
    if (pinMatch) {
      pincode = pinMatch[1];
    }

    // 3. Process remaining lines for Name, Street, Area, City
    const cleanedLines: string[] = [];
    for (const line of lines) {
      const c = line
        .replace(/^(?:name|customer|recipient|to|c\/o)\s*[:\-]\s*/i, '')
        .replace(/^(?:phone|mobile|ph|contact|cell|mob|whatsapp|call)\s*[:\-]\s*/i, '')
        .replace(/^(?:address|add|addr|shipping\s*to)\s*[:\-]\s*/i, '')
        .replace(/^(?:pincode|pin\s*code|pin|postal|zip)\s*[:\-]\s*/i, '')
        .trim();

      const digitsOnly = c.replace(/\D/g, '');
      if (digitsOnly === phone || c === pincode) {
        continue;
      }
      if (c.length > 0) {
        cleanedLines.push(c);
      }
    }

    const fullName = cleanedLines[0] || toAddress.fullName;
    const street = cleanedLines[1] || toAddress.street;
    const area = cleanedLines[2] || toAddress.area;
    const city = cleanedLines[3] || (pincode.startsWith('641') ? 'Coimbatore' : 'Chennai');

    setToAddress({
      ...toAddress,
      fullName: fullName.replace(/[^a-zA-Z\s.]/g, '').trim() || fullName,
      phone: phone || toAddress.phone,
      pincode: pincode || toAddress.pincode,
      street: street || toAddress.street,
      area: area || toAddress.area,
      city: city || toAddress.city,
      state: 'Tamil Nadu'
    });

    setParseSuccessMessage(true);
    setTimeout(() => {
      setParseSuccessMessage(false);
      setShowWhatsAppPanel(false);
    }, 1200);
  };

  const handleResetToOrder = () => {
    if (order?.address) {
      setToAddress({ ...order.address });
      setRawWhatsAppText('');
    }
  };

  // Barcode pattern for visual courier routing sticker
  const barcodePattern = [
    3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 3, 1, 2, 4,
    1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 3, 1, 4
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-stone-300 flex flex-col max-h-[94vh] overflow-hidden my-auto">
        
        {/* Top Control Bar (Hidden during print) */}
        <div className="p-3 sm:p-4 bg-stone-900 text-white flex flex-wrap items-center justify-between gap-2.5 no-print border-b border-stone-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('courier_label')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                view === 'courier_label'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-stone-800 text-stone-300 hover:text-white'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Courier Delivery Label</span>
            </button>
            <button
              onClick={() => setView('invoice')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                view === 'invoice'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-stone-800 text-stone-300 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Tax Invoice / Bill</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* WhatsApp Paste Trigger Button */}
            {view === 'courier_label' && (
              <button
                onClick={() => setShowWhatsAppPanel(!showWhatsAppPanel)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                title="Paste customer address from WhatsApp"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{showWhatsAppPanel ? 'Hide Address Tool' : 'Paste WhatsApp Address'}</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Label</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white cursor-pointer rounded-lg hover:bg-stone-800 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* WhatsApp Address Tool Panel (Collapsible / Non-printable) */}
        {showWhatsAppPanel && (
          <div className="p-4 bg-emerald-50 border-b border-emerald-200 no-print text-xs space-y-3.5 text-stone-900 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  WA
                </span>
                <div>
                  <h3 className="font-bold text-emerald-950 text-sm">
                    Paste WhatsApp Order Address to Print Label
                  </h3>
                  <p className="text-[11px] text-emerald-800">
                    Paste raw customer message from WhatsApp. The system will automatically extract Name, Phone, Address &amp; PIN code.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowWhatsAppPanel(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
              
              {/* Left col: Raw WhatsApp Text Box */}
              <div className="md:col-span-6 space-y-2">
                <label className="block font-semibold text-stone-800 text-xs">
                  Paste WhatsApp Message Text:
                </label>
                <textarea
                  rows={5}
                  placeholder={`Example from WhatsApp:\nName: S. Meenakshi\nDoor 14/B, Gokulam Street\nNear Apollo Pharmacy, Singanallur\nCoimbatore - 641005\nPhone: 9443210987`}
                  value={rawWhatsAppText}
                  onChange={(e) => setRawWhatsAppText(e.target.value)}
                  className="w-full p-2.5 bg-white border border-emerald-300 rounded-lg text-xs font-mono text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleParseWhatsAppText}
                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-md flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Extract &amp; Apply to Label</span>
                  </button>

                  {order && (
                    <button
                      type="button"
                      onClick={handleResetToOrder}
                      className="px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 font-medium rounded-md flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset to Original Order</span>
                    </button>
                  )}
                </div>

                {parseSuccessMessage && (
                  <p className="text-emerald-800 font-bold flex items-center gap-1 text-[11px] pt-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp address applied successfully to the shipping label!</span>
                  </p>
                )}
              </div>

              {/* Right col: Direct Edit Fields */}
              <div className="md:col-span-6 space-y-2 bg-white p-3 rounded-lg border border-emerald-200">
                <p className="font-bold text-stone-800 text-[11px] uppercase tracking-wider border-b border-stone-100 pb-1">
                  Or Manually Edit TO Address Fields:
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <label className="block text-stone-600 font-medium mb-0.5">Recipient Name</label>
                    <input
                      type="text"
                      value={toAddress.fullName}
                      onChange={(e) => setToAddress({ ...toAddress, fullName: e.target.value })}
                      className="w-full px-2 py-1 bg-stone-50 border border-stone-300 rounded text-stone-900 text-xs focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 font-medium mb-0.5">Mobile Number</label>
                    <input
                      type="text"
                      value={toAddress.phone}
                      onChange={(e) => setToAddress({ ...toAddress, phone: e.target.value })}
                      className="w-full px-2 py-1 bg-stone-50 border border-stone-300 rounded text-stone-900 text-xs focus:bg-white"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-stone-600 font-medium mb-0.5">Door No / Street</label>
                    <input
                      type="text"
                      value={toAddress.street}
                      onChange={(e) => setToAddress({ ...toAddress, street: e.target.value })}
                      className="w-full px-2 py-1 bg-stone-50 border border-stone-300 rounded text-stone-900 text-xs focus:bg-white"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-stone-600 font-medium mb-0.5">Area / Landmark</label>
                    <input
                      type="text"
                      value={toAddress.area}
                      onChange={(e) => setToAddress({ ...toAddress, area: e.target.value })}
                      className="w-full px-2 py-1 bg-stone-50 border border-stone-300 rounded text-stone-900 text-xs focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 font-medium mb-0.5">PIN Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={toAddress.pincode}
                      onChange={(e) => setToAddress({ ...toAddress, pincode: e.target.value })}
                      className="w-full px-2 py-1 bg-stone-50 border border-stone-300 rounded text-stone-900 font-bold text-xs focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 font-medium mb-0.5">City / State</label>
                    <input
                      type="text"
                      value={toAddress.city}
                      onChange={(e) => setToAddress({ ...toAddress, city: e.target.value })}
                      className="w-full px-2 py-1 bg-stone-50 border border-stone-300 rounded text-stone-900 text-xs focus:bg-white"
                    />
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* Scrollable Document Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-stone-100/70">
          <div className="printable-document bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-stone-200 max-w-2xl mx-auto text-stone-900 font-sans">
            
            {/* VIEW 1: COURIER DELIVERY SHIPPING LABEL (PHYSICAL COURIER PARCEL STICKER) */}
            {view === 'courier_label' && (
              <div className="courier-shipping-label border-2 border-dashed border-stone-400 p-2 sm:p-3 rounded-lg bg-white">
                
                {/* Cut helper notice (visible in web preview) */}
                <div className="no-print flex items-center justify-between text-[11px] text-stone-500 pb-2 mb-2 border-b border-stone-200">
                  <span className="flex items-center gap-1">
                    <Scissors className="w-3.5 h-3.5" /> Cut along dashed border to stick on courier polybag / parcel
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowWhatsAppPanel(true)}
                      className="text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit TO Address from WhatsApp</span>
                    </button>
                    <span className="text-stone-300">|</span>
                    <span className="font-semibold text-stone-700">4×6" Label</span>
                  </div>
                </div>

                {/* The Physical Courier Sticker Box */}
                <div className="border-3 border-black p-4 sm:p-5 bg-white space-y-4 text-black font-sans">
                  
                  {/* TOP ROW: [TOP LEFT: Courier / Booking Details] & [TOP RIGHT CORNER: TO ADDRESS] */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pb-3 border-b-2 border-black">
                    
                    {/* TOP LEFT (5 cols): Courier Service & Booking Meta */}
                    <div className="sm:col-span-5 flex flex-col justify-between pr-2 border-b sm:border-b-0 sm:border-r-2 border-black pb-3 sm:pb-0">
                      <div>
                        {/* Courier Dispatch Stamp */}
                        <div className="inline-block px-2.5 py-1 bg-red-600 text-white font-black text-xs uppercase tracking-wider rounded-xs mb-2">
                          SPEED COURIER / AIR CARGO
                        </div>
                        <div className="text-[11px] leading-tight font-semibold text-stone-800 space-y-0.5">
                          <p><strong className="text-black">SERVICE:</strong> SURFACE APPAREL</p>
                          <p><strong className="text-black">DATE:</strong> {order?.date || new Date().toISOString().split('T')[0]}</p>
                          <p><strong className="text-black">ORDER ID:</strong> #{labelOrderNo}</p>
                          <p><strong className="text-black">PIECES:</strong> {labelPieces} {labelPieces === 1 ? 'Item' : 'Items'}</p>
                          <p><strong className="text-black">WEIGHT:</strong> ~{labelWeight} KG</p>
                        </div>
                      </div>

                      {/* Payment Status Stamp */}
                      <div className="mt-3 pt-2 border-t border-black/40">
                        {isCod ? (
                          <div className="px-2 py-1 bg-amber-50 border-2 border-amber-700 text-amber-900 text-center font-black text-xs uppercase">
                            COLLECT CASH: ₹{codAmount}
                          </div>
                        ) : (
                          <div className="px-2 py-1 bg-emerald-50 border-2 border-black text-black text-center font-black text-xs uppercase tracking-wider">
                            PREPAID · DO NOT COLLECT CASH
                          </div>
                        )}
                      </div>
                    </div>

                    {/* TOP RIGHT CORNER (7 cols): TO ADDRESS */}
                    <div className="sm:col-span-7 pl-0 sm:pl-3 space-y-1">
                      <div className="flex items-center justify-between border-b border-black pb-1 mb-1.5">
                        <span className="font-black text-sm uppercase tracking-wider text-black">
                          TO ADDRESS:
                        </span>
                        <span className="text-[10px] font-bold bg-black text-white px-1.5 py-0.5 uppercase">
                          DESTINATION
                        </span>
                      </div>

                      <div className="text-sm font-black uppercase text-black tracking-wide leading-tight">
                        TO,
                      </div>
                      <div className="text-base font-black uppercase text-black leading-snug">
                        {toAddress.fullName || 'CUSTOMER'}
                      </div>

                      <div className="text-xs font-bold text-black leading-tight space-y-0.5 pt-0.5">
                        <p>{toAddress.street}</p>
                        <p>{toAddress.area}</p>
                        <p className="uppercase">{toAddress.city}, {toAddress.state || 'Tamil Nadu'}</p>
                      </div>

                      {/* Highlighted PIN & Contact */}
                      <div className="pt-2 mt-2 border-t-2 border-black space-y-1">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs font-black uppercase text-black">
                            PIN CODE:
                          </span>
                          <span className="font-mono text-xl sm:text-2xl font-black text-black tracking-widest bg-yellow-100/80 px-2 py-0.5 border border-black/30 rounded-xs">
                            {toAddress.pincode || '641030'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="font-bold text-black">PH / MOBILE:</span>
                          <span className="font-mono text-sm font-black text-black">
                            {toAddress.phone || '9962278349'}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* BOTTOM ROW: [LEFT BOTTOM: DEFAULT FROM ADDRESS] & [BOTTOM RIGHT: BARCODE & ROUTING] */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1 items-start">
                    
                    {/* LEFT BOTTOM DEFAULT ADDRESS (EXACT WORD-FOR-WORD AS REQUESTED) */}
                    <div className="sm:col-span-6 pr-0 sm:pr-3 border-b sm:border-b-0 sm:border-r-2 border-black pb-3 sm:pb-0 space-y-0.5 text-xs font-semibold text-black leading-snug">
                      <p className="font-black text-sm uppercase tracking-wider border-b border-black pb-1 mb-1">
                        FROM ADDRESS:
                      </p>
                      
                      <p className="font-black text-xs uppercase">FROM,</p>
                      <p className="font-black text-sm uppercase text-black tracking-wide">
                        SHRUTHI FASHION
                      </p>
                      <p>1st floor (City cake shop)</p>
                      <p>edayarpalayam road,</p>
                      <p>Kovundampalayam,</p>
                      <p>Coimbatore. TN</p>
                      <p className="font-mono font-bold text-xs mt-1">pin code:641030</p>
                      <p className="font-mono font-bold text-xs">Ph:9962278349</p>
                    </div>

                    {/* BOTTOM RIGHT: BARCODE, AWB ROUTING & INSTRUCTIONS */}
                    <div className="sm:col-span-6 pl-0 sm:pl-2 flex flex-col justify-between text-center space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-wider text-stone-700">
                        COURIER TRACKING / AWB ROUTING
                      </p>

                      {/* Scannable Visual Barcode */}
                      <div className="py-2 px-1 flex items-center justify-center gap-[2px] h-12 bg-white border border-black rounded-xs">
                        {barcodePattern.map((width, i) => (
                          <span
                            key={i}
                            className="bg-black h-8 inline-block"
                            style={{ width: `${Math.min(width * 2, 6)}px` }}
                          />
                        ))}
                      </div>

                      <p className="font-mono font-black text-xs tracking-widest text-black">
                        AWB: {order?.trackingNumber || `SF-${toAddress.pincode || '641030'}-${labelOrderNo}`}
                      </p>

                      <div className="pt-1 border-t border-black/40 text-[10px] font-bold text-stone-800 uppercase flex justify-between">
                        <span>DEST: {toAddress.city || 'COIMBATORE'}</span>
                        <span className="text-red-700">HANDLE WITH CARE</span>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Footer dispatch tag */}
                <div className="pt-2 text-[10px] text-stone-500 flex justify-between uppercase font-mono">
                  <span>Shruthi Fashion Coimbatore · Dispatch Dept</span>
                  <span>Printed via Shruthi Fashion Portal</span>
                </div>

              </div>
            )}

            {/* VIEW 2: TAX INVOICE / ORDER BILL */}
            {view === 'invoice' && order && (
              <div className="space-y-6">
                {/* Invoice Header */}
                <div className="border-b-2 border-stone-900 pb-4 flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <h1 className="font-serif font-black text-2xl tracking-wide text-stone-950 uppercase">
                      Shruthi Fashion
                    </h1>
                    <p className="text-xs text-stone-600 font-medium mt-0.5">
                      Women's Ethnic Wear · Daily Collections · Coimbatore Handlooms
                    </p>
                    <p className="text-xs text-stone-700 mt-1">
                      1st floor (City cake shop), Edayarpalayam Road, Kovundampalayam, Coimbatore - 641030, Tamil Nadu
                    </p>
                    <p className="text-xs text-stone-700">
                      Phone: +91 9962278349 · WhatsApp: +91 9894088349
                    </p>
                  </div>

                  <div className="sm:text-right bg-stone-50 p-3 rounded border border-stone-200 sm:border-0 sm:bg-transparent sm:p-0">
                    <span className="inline-block px-2.5 py-1 bg-stone-900 text-white text-[11px] font-bold uppercase tracking-widest rounded-xs mb-1.5">
                      TAX INVOICE / BILL
                    </span>
                    <p className="text-xs font-mono font-bold text-stone-900">
                      Invoice No: INV-2026-{order.orderNumber.replace(/[^0-9]/g, '').slice(-4) || '1021'}
                    </p>
                    <p className="text-xs text-stone-600">
                      Date: <strong className="text-stone-900">{order.date}</strong>
                    </p>
                    <p className="text-xs text-stone-600">
                      Order ID: <strong className="font-mono text-stone-900">{order.orderNumber}</strong>
                    </p>
                    <p className="text-xs text-emerald-800 font-semibold mt-1">
                      Payment: {order.paymentMethod} (PAID)
                    </p>
                  </div>
                </div>

                {/* Bill To & Ship To Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-stone-200 rounded p-4 bg-stone-50/50 text-xs">
                  <div>
                    <p className="font-bold uppercase tracking-wider text-stone-500 text-[10px] mb-1">
                      Billed &amp; Shipped To:
                    </p>
                    <p className="text-sm font-bold text-stone-900">{toAddress.fullName}</p>
                    <p className="text-stone-700 mt-0.5">{toAddress.street}</p>
                    <p className="text-stone-700">{toAddress.area}</p>
                    <p className="text-stone-900 font-medium">
                      {toAddress.city} - {toAddress.pincode}, {toAddress.state || 'Tamil Nadu'}
                    </p>
                    <p className="font-mono font-semibold text-stone-900 mt-1">
                      Mobile: {toAddress.phone}
                    </p>
                  </div>

                  <div>
                    <p className="font-bold uppercase tracking-wider text-stone-500 text-[10px] mb-1">
                      Dispatch &amp; Dispatcher Details:
                    </p>
                    <p className="font-semibold text-stone-900">Shruthi Fashion Dispatch Unit</p>
                    <p className="text-stone-600">Courier Partner: {order.courierPartner || 'Speed Courier / ST Courier'}</p>
                    <p className="text-stone-600">
                      Tracking No: <span className="font-mono font-semibold text-stone-900">{order.trackingNumber || 'Assigned upon pickup'}</span>
                    </p>
                    <p className="text-stone-600">Origin: Kovundampalayam, Coimbatore</p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="border border-stone-200 rounded overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-900 text-white text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Item Description</th>
                        <th className="py-2.5 px-3">Size &amp; Color</th>
                        <th className="py-2.5 px-3 text-right">Price</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      {order.items.map((item, index) => (
                        <tr key={index} className="hover:bg-stone-50/50">
                          <td className="py-2.5 px-3 text-stone-500 font-mono">{index + 1}</td>
                          <td className="py-2.5 px-3 font-semibold text-stone-900">
                            {item.product.title}
                          </td>
                          <td className="py-2.5 px-3 text-stone-600">
                            {item.selectedSize} / {item.selectedColor}
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums text-stone-700">
                            ₹{item.product.price.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 px-3 text-center tabular-nums text-stone-900 font-medium">
                            {item.quantity}
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold tabular-nums text-stone-900">
                            ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Calculations & Totals */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-1">
                  <div className="text-[11px] text-stone-500 space-y-1 sm:max-w-xs">
                    <p className="font-bold text-stone-800 uppercase tracking-wide">
                      Terms &amp; Exchange Policy:
                    </p>
                    <p>
                      • 7 days size exchange for unworn apparel with original tags intact.
                    </p>
                    <p>
                      • In case of any courier package issues, please reach our Coimbatore helpdesk at +91 9962278349.
                    </p>
                  </div>

                  <div className="w-full sm:w-64 space-y-1.5 text-xs bg-stone-50 p-3 rounded border border-stone-200">
                    <div className="flex justify-between text-stone-600">
                      <span>Items Subtotal:</span>
                      <span className="tabular-nums font-medium">₹{order.subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Courier Delivery Fee:</span>
                      <span className="tabular-nums font-semibold text-stone-900">
                        {order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}
                      </span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Discount:</span>
                        <span className="tabular-nums">-₹{order.discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-sm text-stone-950 pt-2 border-t border-stone-300">
                      <span>Net Total Paid:</span>
                      <span className="tabular-nums text-amber-900">₹{order.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Stamp & Authorized Signature */}
                <div className="pt-6 border-t border-stone-200 flex justify-between items-end text-xs text-stone-500">
                  <div>
                    <p className="font-serif font-bold text-stone-900">Shruthi Fashion · Kovundampalayam</p>
                    <p className="text-[10px]">Computer generated invoice. No signature required.</p>
                  </div>
                  <div className="text-right">
                    <div className="w-32 h-10 border-b border-stone-400 mb-1 mx-auto sm:ml-auto"></div>
                    <p className="font-semibold text-stone-800 text-[11px]">Authorized Signatory</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderPrintModal;

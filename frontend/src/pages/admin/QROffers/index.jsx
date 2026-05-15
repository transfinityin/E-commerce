import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  QrCode,
  ScanLine,
  Trash2,
  Edit3,
  Eye,
  Copy,
  Check,
  X,
  TrendingUp,
  Users,
  Download,
} from 'lucide-react';

const API_URL = 'http://localhost:8000/api';

const QROffers = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [scanLogs, setScanLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reveal_type: 'random',
    min_discount: 5,
    max_discount: 50,
    fixed_discount: '',
    max_scans: 100,
    valid_until: '',
    scan_expiry_minutes: 30,
  });

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const res = await fetch(`${API_URL}/coupons/admin/qr-offers/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setOffers(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchScanLogs = async () => {
    try {
      const res = await fetch(`${API_URL}/coupons/admin/qr-logs/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setScanLogs(Array.isArray(data) ? data : data.results || []);
      setShowLogs(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingOffer
      ? `${API_URL}/coupons/admin/qr-offers/${editingOffer.qr_code_id}/`
      : `${API_URL}/coupons/admin/qr-offers/`;
    const method = editingOffer ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowForm(false);
        setEditingOffer(null);
        resetForm();
        fetchOffers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (qrCodeId) => {
    if (!window.confirm('Delete this QR offer?')) return;
    try {
      await fetch(`${API_URL}/coupons/admin/qr-offers/${qrCodeId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchOffers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description || '',
      reveal_type: offer.reveal_type,
      min_discount: offer.min_discount,
      max_discount: offer.max_discount,
      fixed_discount: offer.fixed_discount || '',
      max_scans: offer.max_scans,
      valid_until: offer.valid_until ? offer.valid_until.slice(0, 16) : '',
      scan_expiry_minutes: offer.scan_expiry_minutes,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      reveal_type: 'random',
      min_discount: 5,
      max_discount: 50,
      fixed_discount: '',
      max_scans: 100,
      valid_until: '',
      scan_expiry_minutes: 30,
    });
  };

  const copyQrCode = (qrCodeId) => {
    navigator.clipboard.writeText(qrCodeId);
    setCopiedId(qrCodeId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadQR = (imageUrl, title) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `qr-${title.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.click();
  };

  const totalScans = offers.reduce((sum, o) => sum + (o.scan_count || 0), 0);
  const activeOffers = offers.filter(o => o.is_active && o.is_valid_now).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="page-box">          <div style={{ marginBottom: '8px' }}>
            <p className="text-xs font-bold tracking-widest uppercase text-amber-600">QR Campaigns</p>
          </div>
          <h1 className="text-3xl font-bold text-slate-900" style={{ marginBottom: '32px' }}>QR Offers</h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-full h-16 rounded-xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="page-box">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between" style={{ marginBottom: '32px', gap: '16px' }}>
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-amber-600" style={{ marginBottom: '8px' }}>
              QR Campaigns
            </p>
            <h1 className="text-3xl font-bold text-slate-900">QR Offers</h1>
          </div>
          <span className="text-sm font-medium text-slate-500 bg-white border border-slate-200 rounded-full" style={{ padding: '6px 16px' }}>
            {offers.length} offers
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: '20px', marginBottom: '32px' }}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm" style={{ padding: '24px' }}>
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center" style={{ marginBottom: '16px' }}>
              <QrCode size={20} />
            </div>
            <div className="text-2xl font-bold text-slate-900" style={{ marginBottom: '4px' }}>{offers.length}</div>
            <div className="text-sm font-medium text-slate-500">Total Offers</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm" style={{ padding: '24px' }}>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center" style={{ marginBottom: '16px' }}>
              <ScanLine size={20} />
            </div>
            <div className="text-2xl font-bold text-slate-900" style={{ marginBottom: '4px' }}>{totalScans}</div>
            <div className="text-sm font-medium text-slate-500">Total Scans</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm" style={{ padding: '24px' }}>
            <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center" style={{ marginBottom: '16px' }}>
              <TrendingUp size={20} />
            </div>
            <div className="text-2xl font-bold text-slate-900" style={{ marginBottom: '4px' }}>{activeOffers}</div>
            <div className="text-sm font-medium text-slate-500">Active Now</div>
          </div>
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-all"
            style={{ padding: '24px' }}
            onClick={fetchScanLogs}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center" style={{ marginBottom: '16px' }}>
              <Users size={20} />
            </div>
            <div className="text-2xl font-bold text-slate-900" style={{ marginBottom: '4px' }}>{scanLogs.length || '?'}</div>
            <div className="text-sm font-medium text-slate-500">Scan Logs</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap" style={{ gap: '10px', marginBottom: '24px' }}>
          <button
            className="flex items-center bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all border-none cursor-pointer"
            style={{ padding: '10px 20px', gap: '8px' }}
            onClick={() => { resetForm(); setShowForm(true); setEditingOffer(null); }}
          >
            <Plus size={16} />
            Create QR Offer
          </button>
          <button
            className="flex items-center bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all cursor-pointer"
            style={{ padding: '10px 20px', gap: '8px' }}
            onClick={fetchScanLogs}
          >
            <Eye size={16} />
            View Logs
          </button>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm" style={{ marginBottom: '24px', padding: '24px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '20px' }}>
              <h3 className="text-lg font-bold text-slate-900">
                {editingOffer ? 'Edit QR Offer' : 'Create New QR Offer'}
              </h3>
              <button
                className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors border-none cursor-pointer"
                onClick={() => setShowForm(false)}
              >
                <X size={18} className="text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '16px' }}>
                <div className="md:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="text-sm font-semibold text-slate-700">Offer Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Summer Sale Special"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    style={{ padding: '12px 16px' }}
                  />
                </div>

                <div className="md:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="text-sm font-semibold text-slate-700">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Short description..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    style={{ padding: '12px 16px' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="text-sm font-semibold text-slate-700">Reveal Type</label>
                  <select
                    value={formData.reveal_type}
                    onChange={(e) => setFormData({ ...formData, reveal_type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all cursor-pointer"
                    style={{ padding: '12px 16px' }}
                  >
                    <option value="random">Random Discount</option>
                    <option value="fixed">Fixed Discount</option>
                    <option value="spin">Spin Wheel</option>
                    <option value="scratch">Scratch Card</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="text-sm font-semibold text-slate-700">Max Scans</label>
                  <input
                    type="number"
                    value={formData.max_scans}
                    onChange={(e) => setFormData({ ...formData, max_scans: parseInt(e.target.value) })}
                    min="1"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    style={{ padding: '12px 16px' }}
                  />
                </div>

                {formData.reveal_type === 'fixed' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label className="text-sm font-semibold text-slate-700">Fixed Discount (%)</label>
                    <input
                      type="number"
                      value={formData.fixed_discount}
                      onChange={(e) => setFormData({ ...formData, fixed_discount: e.target.value })}
                      placeholder="e.g. 25"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                      style={{ padding: '12px 16px' }}
                    />
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label className="text-sm font-semibold text-slate-700">Min Discount (%)</label>
                      <input
                        type="number"
                        value={formData.min_discount}
                        onChange={(e) => setFormData({ ...formData, min_discount: parseFloat(e.target.value) })}
                        min="1" max="99"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                        style={{ padding: '12px 16px' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label className="text-sm font-semibold text-slate-700">Max Discount (%)</label>
                      <input
                        type="number"
                        value={formData.max_discount}
                        onChange={(e) => setFormData({ ...formData, max_discount: parseFloat(e.target.value) })}
                        min="1" max="99"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                        style={{ padding: '12px 16px' }}
                      />
                    </div>
                  </>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="text-sm font-semibold text-slate-700">Valid Until</label>
                  <input
                    type="datetime-local"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    style={{ padding: '12px 16px' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="text-sm font-semibold text-slate-700">Coupon Expiry (mins)</label>
                  <input
                    type="number"
                    value={formData.scan_expiry_minutes}
                    onChange={(e) => setFormData({ ...formData, scan_expiry_minutes: parseInt(e.target.value) })}
                    min="5"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    style={{ padding: '12px 16px' }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap" style={{ gap: '12px', marginTop: '24px' }}>
                <button
                  type="submit"
                  className="flex items-center justify-center bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all border-none cursor-pointer"
                  style={{ padding: '12px 24px', gap: '8px' }}
                >
                  {editingOffer ? 'Update Offer' : 'Create & Generate QR'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex items-center justify-center bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all cursor-pointer"
                  style={{ padding: '12px 24px', gap: '8px' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Scan Logs */}
        {showLogs && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm" style={{ marginBottom: '24px', padding: '24px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '20px' }}>
              <h3 className="text-lg font-bold text-slate-900">Scan Logs</h3>
              <button
                className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors border-none cursor-pointer"
                onClick={() => setShowLogs(false)}
              >
                <X size={18} className="text-slate-500" />
              </button>
            </div>
            {scanLogs.length === 0 ? (
              <div className="flex flex-col items-center text-center" style={{ padding: '48px 20px' }}>
                <div className="text-slate-300" style={{ marginBottom: '12px' }}>
                  <ScanLine size={32} />
                </div>
                <p className="text-sm text-slate-500">No scans yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-500" style={{ padding: '12px 16px' }}>Offer</th>
                      <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-500" style={{ padding: '12px 16px' }}>Discount</th>
                      <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-500" style={{ padding: '12px 16px' }}>Coupon</th>
                      <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-500" style={{ padding: '12px 16px' }}>Used</th>
                      <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-500" style={{ padding: '12px 16px' }}>Scanned At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scanLogs.map(log => (
                      <tr key={log.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                        <td className="text-slate-900 font-medium" style={{ padding: '12px 16px' }}>{log.qr_offer_title}</td>
                        <td className="font-mono text-slate-700" style={{ padding: '12px 16px' }}>{log.discount_revealed}%</td>
                        <td className="font-mono text-slate-700" style={{ padding: '12px 16px' }}>{log.coupon_code}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span className={`inline-block text-xs font-bold rounded-full border ${log.is_used ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`} style={{ padding: '4px 12px' }}>
                            {log.is_used ? 'Used' : 'Pending'}
                          </span>
                        </td>
                        <td className="text-slate-500 text-xs" style={{ padding: '12px 16px' }}>
                          {new Date(log.scanned_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Offers Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-500" style={{ padding: '16px 20px' }}>QR Offer</th>
                  <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-500" style={{ padding: '16px 20px' }}>Type</th>
                  <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-500" style={{ padding: '16px 20px' }}>Discount</th>
                  <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-500" style={{ padding: '16px 20px' }}>Scans</th>
                  <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-500" style={{ padding: '16px 20px' }}>Status</th>
                  <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-500" style={{ padding: '16px 20px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map(offer => (
                  <tr key={offer.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td style={{ padding: '16px 20px' }}>
                      <div className="flex items-center" style={{ gap: '12px' }}>
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                          {offer.qr_image_url ? (
                            <img src={offer.qr_image_url} alt="QR" className="w-full h-full object-cover" />
                          ) : (
                            <QrCode size={16} className="text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">{offer.title}</div>
                          <div className="text-xs text-slate-400 font-mono" style={{ marginTop: '2px' }}>
                            {offer.qr_code_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span className="inline-block text-xs font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-100" style={{ padding: '4px 12px' }}>
                        {offer.reveal_type}
                      </span>
                    </td>
                    <td className="font-mono font-semibold text-slate-900" style={{ padding: '16px 20px' }}>
                      {offer.reveal_type === 'fixed'
                        ? `${offer.fixed_discount}%`
                        : `${offer.min_discount}-${offer.max_discount}%`}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div className="flex items-center text-sm text-slate-600" style={{ gap: '6px' }}>
                        <ScanLine size={14} className="text-slate-400" />
                        <span>{offer.scan_count} / {offer.max_scans}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span className={`inline-block text-xs font-bold rounded-full border ${offer.is_valid_now ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`} style={{ padding: '4px 12px' }}>
                        {offer.is_valid_now ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div className="flex items-center" style={{ gap: '6px' }}>
                        <button
                          className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 hover:text-slate-900 transition-all border-none cursor-pointer"
                          onClick={() => handleEdit(offer)}
                          title="Edit"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 hover:text-slate-900 transition-all border-none cursor-pointer"
                          onClick={() => copyQrCode(offer.qr_code_id)}
                          title="Copy ID"
                        >
                          {copiedId === offer.qr_code_id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        </button>
                        {offer.qr_image_url && (
                          <button
                            className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 hover:text-slate-900 transition-all border-none cursor-pointer"
                            onClick={() => downloadQR(offer.qr_image_url, offer.title)}
                            title="Download QR"
                          >
                            <Download size={14} />
                          </button>
                        )}
                        <button
                          className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-all border-none cursor-pointer"
                          onClick={() => handleDelete(offer.qr_code_id)}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {offers.length === 0 && !showForm && (
          <div className="flex flex-col items-center text-center" style={{ marginTop: '40px', padding: '48px 20px' }}>
            <div className="text-slate-300" style={{ marginBottom: '16px' }}>
              <QrCode size={48} />
            </div>
            <p className="text-lg font-bold text-slate-900" style={{ marginBottom: '8px' }}>No QR offers created yet</p>
            <button
              className="flex items-center bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all border-none cursor-pointer"
              style={{ padding: '12px 24px', gap: '8px', marginTop: '8px' }}
              onClick={() => setShowForm(true)}
            >
              <Plus size={16} />
              Create Your First QR Offer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QROffers;
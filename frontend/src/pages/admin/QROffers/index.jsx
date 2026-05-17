import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, QrCode, ScanLine, Trash2, Edit3, Eye, Copy, Check, X,
  TrendingUp, Users, Download, ArrowLeft, Sparkles, Zap
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
      <div className="min-h-screen bg-[var(--color-bg)]">
        <div className="page-container py-8 lg:py-10">
          <div className="mb-2">
            <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-primary)]">QR Campaigns</p>
          </div>
          <h1 className="text-3xl font-bold text-[var(--color-text)] mb-8">QR Offers</h1>
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-full h-16 rounded-xl bg-[var(--color-bg-alt)] animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="page-container py-8 lg:py-10">

        {/* Header with Back Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-primary)]/30 transition-all duration-200 shrink-0 cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-1">
                QR Campaigns
              </p>
              <h1 className="text-2xl lg:text-3xl font-bold text-[var(--color-text)] tracking-tight">
                QR Offers
              </h1>
            </div>
          </div>
          <span className="text-sm font-medium text-[var(--color-muted)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full px-4 py-1.5">
            {offers.length} offers
          </span>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm p-6 hover:shadow-md hover:border-[var(--color-primary)]/20 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-secondary)] text-[var(--color-text-inverse)] flex items-center justify-center mb-4">
              <QrCode size={20} />
            </div>
            <div className="text-2xl font-bold text-[var(--color-text)] mb-1">{offers.length}</div>
            <div className="text-sm font-medium text-[var(--color-muted)]">Total Offers</div>
          </div>
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm p-6 hover:shadow-md hover:border-[var(--color-primary)]/20 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-success-bg)] text-[var(--color-success)] flex items-center justify-center mb-4">
              <ScanLine size={20} />
            </div>
            <div className="text-2xl font-bold text-[var(--color-text)] mb-1">{totalScans}</div>
            <div className="text-sm font-medium text-[var(--color-muted)]">Total Scans</div>
          </div>
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm p-6 hover:shadow-md hover:border-[var(--color-primary)]/20 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-info-bg)] text-[var(--color-info)] flex items-center justify-center mb-4">
              <TrendingUp size={20} />
            </div>
            <div className="text-2xl font-bold text-[var(--color-text)] mb-1">{activeOffers}</div>
            <div className="text-sm font-medium text-[var(--color-muted)]">Active Now</div>
          </div>
          <button
            className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm p-6 hover:shadow-md hover:border-[var(--color-primary)]/20 transition-all duration-300 text-left cursor-pointer"
            onClick={fetchScanLogs}
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--color-warning-bg)] text-[var(--color-warning)] flex items-center justify-center mb-4">
              <Users size={20} />
            </div>
            <div className="text-2xl font-bold text-[var(--color-text)] mb-1">{scanLogs.length || '?'}</div>
            <div className="text-sm font-medium text-[var(--color-muted)]">Scan Logs</div>
          </button>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-xl text-sm font-semibold transition-all duration-300 px-5 py-3 shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
            onClick={() => { resetForm(); setShowForm(true); setEditingOffer(null); }}
          >
            <Plus size={16} />
            Create QR Offer
          </button>
          <button
            className="flex items-center gap-2 bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] rounded-xl text-sm font-semibold hover:bg-[var(--color-bg-alt)] transition-all duration-200 px-5 py-3 cursor-pointer"
            onClick={fetchScanLogs}
          >
            <Eye size={16} />
            View Logs
          </button>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-md)] mb-6 p-6 lg:p-8 animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[var(--color-text)]">
                {editingOffer ? 'Edit QR Offer' : 'Create New QR Offer'}
              </h3>
              <button
                className="w-8 h-8 rounded-lg bg-[var(--color-bg-alt)] flex items-center justify-center hover:bg-[var(--color-border-light)] transition-colors border-none cursor-pointer"
                onClick={() => setShowForm(false)}
              >
                <X size={18} className="text-[var(--color-muted)]" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[var(--color-text)]">Offer Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Summer Sale Special"
                    required
                    className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all px-4 py-3 placeholder:text-[var(--color-muted-light)]"
                  />
                </div>

                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[var(--color-text)]">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Short description..."
                    className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all px-4 py-3 placeholder:text-[var(--color-muted-light)]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[var(--color-text)]">Reveal Type</label>
                  <select
                    value={formData.reveal_type}
                    onChange={(e) => setFormData({ ...formData, reveal_type: e.target.value })}
                    className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all cursor-pointer px-4 py-3"
                  >
                    <option value="random">Random Discount</option>
                    <option value="fixed">Fixed Discount</option>
                    <option value="spin">Spin Wheel</option>
                    <option value="scratch">Scratch Card</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[var(--color-text)]">Max Scans</label>
                  <input
                    type="number"
                    value={formData.max_scans}
                    onChange={(e) => setFormData({ ...formData, max_scans: parseInt(e.target.value) })}
                    min="1"
                    className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all px-4 py-3"
                  />
                </div>

                {formData.reveal_type === 'fixed' ? (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-[var(--color-text)]">Fixed Discount (%)</label>
                    <input
                      type="number"
                      value={formData.fixed_discount}
                      onChange={(e) => setFormData({ ...formData, fixed_discount: e.target.value })}
                      placeholder="e.g. 25"
                      className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all px-4 py-3 placeholder:text-[var(--color-muted-light)]"
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-[var(--color-text)]">Min Discount (%)</label>
                      <input
                        type="number"
                        value={formData.min_discount}
                        onChange={(e) => setFormData({ ...formData, min_discount: parseFloat(e.target.value) })}
                        min="1" max="99"
                        className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all px-4 py-3"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-[var(--color-text)]">Max Discount (%)</label>
                      <input
                        type="number"
                        value={formData.max_discount}
                        onChange={(e) => setFormData({ ...formData, max_discount: parseFloat(e.target.value) })}
                        min="1" max="99"
                        className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all px-4 py-3"
                      />
                    </div>
                  </>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[var(--color-text)]">Valid Until</label>
                  <input
                    type="datetime-local"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                    className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all px-4 py-3"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[var(--color-text)]">Coupon Expiry (mins)</label>
                  <input
                    type="number"
                    value={formData.scan_expiry_minutes}
                    onChange={(e) => setFormData({ ...formData, scan_expiry_minutes: parseInt(e.target.value) })}
                    min="5"
                    className="w-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all px-4 py-3"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-xl text-sm font-semibold transition-all duration-300 px-6 py-3 shadow-md hover:shadow-lg cursor-pointer"
                >
                  <Sparkles size={16} />
                  {editingOffer ? 'Update Offer' : 'Create & Generate QR'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex items-center justify-center gap-2 bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] rounded-xl text-sm font-semibold hover:bg-[var(--color-bg-alt)] transition-all duration-200 px-6 py-3 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Scan Logs */}
        {showLogs && (
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-md)] mb-6 p-6 lg:p-8 animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[var(--color-text)]">Scan Logs</h3>
              <button
                className="w-8 h-8 rounded-lg bg-[var(--color-bg-alt)] flex items-center justify-center hover:bg-[var(--color-border-light)] transition-colors border-none cursor-pointer"
                onClick={() => setShowLogs(false)}
              >
                <X size={18} className="text-[var(--color-muted)]" />
              </button>
            </div>
            {scanLogs.length === 0 ? (
              <div className="flex flex-col items-center text-center py-12">
                <div className="text-[var(--color-muted-light)] mb-3">
                  <ScanLine size={32} />
                </div>
                <p className="text-sm text-[var(--color-muted)]">No scans yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-alt)]/50">
                      <th className="text-left text-xs font-bold uppercase tracking-wider text-[var(--color-muted)] px-5 py-4">Offer</th>
                      <th className="text-left text-xs font-bold uppercase tracking-wider text-[var(--color-muted)] px-5 py-4">Discount</th>
                      <th className="text-left text-xs font-bold uppercase tracking-wider text-[var(--color-muted)] px-5 py-4">Coupon</th>
                      <th className="text-left text-xs font-bold uppercase tracking-wider text-[var(--color-muted)] px-5 py-4">Used</th>
                      <th className="text-left text-xs font-bold uppercase tracking-wider text-[var(--color-muted)] px-5 py-4">Scanned At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scanLogs.map(log => (
                      <tr key={log.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-alt)]/50 transition-colors">
                        <td className="text-[var(--color-text)] font-medium px-5 py-4">{log.qr_offer_title}</td>
                        <td className="font-mono text-[var(--color-text)] px-5 py-4">{log.discount_revealed}%</td>
                        <td className="font-mono text-[var(--color-text)] px-5 py-4">{log.coupon_code}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-block text-xs font-bold rounded-full border px-3 py-1 ${log.is_used ? 'bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success)]/20' : 'bg-[var(--color-bg-alt)] text-[var(--color-muted)] border-[var(--color-border-light)]'}`}>
                            {log.is_used ? 'Used' : 'Pending'}
                          </span>
                        </td>
                        <td className="text-[var(--color-muted)] text-xs px-5 py-4">
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
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-alt)]/50">
                  <th className="text-left text-xs font-bold uppercase tracking-wider text-[var(--color-muted)] px-5 py-4">QR Offer</th>
                  <th className="text-left text-xs font-bold uppercase tracking-wider text-[var(--color-muted)] px-5 py-4">Type</th>
                  <th className="text-left text-xs font-bold uppercase tracking-wider text-[var(--color-muted)] px-5 py-4">Discount</th>
                  <th className="text-left text-xs font-bold uppercase tracking-wider text-[var(--color-muted)] px-5 py-4">Scans</th>
                  <th className="text-left text-xs font-bold uppercase tracking-wider text-[var(--color-muted)] px-5 py-4">Status</th>
                  <th className="text-left text-xs font-bold uppercase tracking-wider text-[var(--color-muted)] px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map(offer => (
                  <tr key={offer.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-alt)]/50 transition-colors duration-200">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[var(--color-bg-alt)] flex items-center justify-center overflow-hidden shrink-0 border border-[var(--color-border-light)]">
                          {offer.qr_image_url ? (
                            <img src={offer.qr_image_url} alt="QR" className="w-full h-full object-cover" />
                          ) : (
                            <QrCode size={16} className="text-[var(--color-muted)]" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-[var(--color-text)] text-sm">{offer.title}</div>
                          <div className="text-xs text-[var(--color-muted)] font-mono mt-0.5">
                            {offer.qr_code_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-block text-xs font-bold rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] border border-[var(--color-primary)]/20 px-3 py-1">
                        {offer.reveal_type}
                      </span>
                    </td>
                    <td className="font-mono font-semibold text-[var(--color-text)] px-5 py-4">
                      {offer.reveal_type === 'fixed'
                        ? `${offer.fixed_discount}%`
                        : `${offer.min_discount}-${offer.max_discount}%`}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-[var(--color-muted)]">
                        <ScanLine size={14} />
                        <span>{offer.scan_count} / {offer.max_scans}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-block text-xs font-bold rounded-full border px-3 py-1 ${offer.is_valid_now ? 'bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success)]/20' : 'bg-[var(--color-danger-bg)] text-[var(--color-danger)] border-[var(--color-danger)]/20'}`}>
                        {offer.is_valid_now ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          className="w-8 h-8 rounded-lg bg-[var(--color-bg-alt)] text-[var(--color-muted)] flex items-center justify-center hover:bg-[var(--color-border-light)] hover:text-[var(--color-text)] transition-all duration-200 cursor-pointer"
                          onClick={() => handleEdit(offer)}
                          title="Edit"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          className="w-8 h-8 rounded-lg bg-[var(--color-bg-alt)] text-[var(--color-muted)] flex items-center justify-center hover:bg-[var(--color-border-light)] hover:text-[var(--color-text)] transition-all duration-200 cursor-pointer"
                          onClick={() => copyQrCode(offer.qr_code_id)}
                          title="Copy ID"
                        >
                          {copiedId === offer.qr_code_id ? <Check size={14} className="text-[var(--color-success)]" /> : <Copy size={14} />}
                        </button>
                        {offer.qr_image_url && (
                          <button
                            className="w-8 h-8 rounded-lg bg-[var(--color-bg-alt)] text-[var(--color-muted)] flex items-center justify-center hover:bg-[var(--color-border-light)] hover:text-[var(--color-text)] transition-all duration-200 cursor-pointer"
                            onClick={() => downloadQR(offer.qr_image_url, offer.title)}
                            title="Download QR"
                          >
                            <Download size={14} />
                          </button>
                        )}
                        <button
                          className="w-8 h-8 rounded-lg bg-[var(--color-danger-bg)] text-[var(--color-danger)] flex items-center justify-center hover:bg-[var(--color-danger)]/10 hover:text-[var(--color-danger)] transition-all duration-200 cursor-pointer"
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
          <div className="flex flex-col items-center text-center mt-10 py-12">
            <div className="text-[var(--color-muted-light)] mb-4">
              <QrCode size={48} />
            </div>
            <p className="text-lg font-bold text-[var(--color-text)] mb-2">No QR offers created yet</p>
            <p className="text-sm text-[var(--color-muted)] mb-6">Create your first QR offer to start generating coupons</p>
            <button
              className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-xl text-sm font-semibold transition-all duration-300 px-6 py-3 shadow-md hover:shadow-lg cursor-pointer"
              onClick={() => setShowForm(true)}
            >
              <Plus size={16} />
              Create Your First QR Offer
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease forwards;
        }
      `}</style>
    </div>
  );
};

export default QROffers;
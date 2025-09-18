import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const sourceOptions = ['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'];
const statusOptions = ['new', 'contacted', 'qualified', 'lost', 'won'];

function LeadForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    city: '',
    state: '',
    source: '',
    status: 'new',
    score: 0,
    lead_value: 0,
    last_activity_at: '',
    is_qualified: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchLead = async () => {
        try {
          setLoading(true);
          const { data } = await api.get(`/leads/${id}`);
          setFormData({
            ...data,
            last_activity_at: data.last_activity_at ? new Date(data.last_activity_at).toISOString().split('T')[0] : '',
          });
        } catch (err) {
          setError('Failed to load lead');
        } finally {
          setLoading(false);
        }
      };
      fetchLead();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (id) {
        await api.put(`/leads/${id}`, formData);
      } else {
        await api.post('/leads', formData);
      }
      navigate('/leads');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save lead');
    } finally {
      setLoading(false);
    }
  };

  const getSourceLabel = (source) => {
    return source.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusColor = (status) => {
    const colors = {
      new: 'from-blue-500 to-blue-600',
      contacted: 'from-yellow-500 to-yellow-600',
      qualified: 'from-green-500 to-green-600',
      lost: 'from-red-500 to-red-600',
      won: 'from-purple-500 to-purple-600'
    };
    return colors[status] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/50 shadow-lg">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/leads')}
                className="w-10 h-10 bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl flex items-center justify-center shadow-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {id ? 'Edit Lead' : 'Create New Lead'}
                </h1>
                <p className="text-sm text-gray-600">
                  {id ? 'Update lead information' : 'Add a new lead to your pipeline'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-400 rounded-full mr-3"></div>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-6">
              <h2 className="text-xl font-semibold text-white">Lead Information</h2>
              <p className="text-slate-300 text-sm">Fill in the details below</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/70 backdrop-blur-sm"
                    placeholder="Enter first name"
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/70 backdrop-blur-sm"
                    placeholder="Enter last name"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/70 backdrop-blur-sm"
                    placeholder="Enter email address"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/70 backdrop-blur-sm"
                    placeholder="Enter phone number"
                  />
                </div>

                {/* Company */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/70 backdrop-blur-sm"
                    placeholder="Enter company name"
                  />
                </div>

                {/* City */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/70 backdrop-blur-sm"
                    placeholder="Enter city"
                  />
                </div>

                {/* State */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/70 backdrop-blur-sm"
                    placeholder="Enter state"
                  />
                </div>

                {/* Source */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Source <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/70 backdrop-blur-sm"
                  >
                    <option value="">Select Source</option>
                    {sourceOptions.map((option) => (
                      <option key={option} value={option}>
                        {getSourceLabel(option)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Status</label>
                  <div className="relative">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/70 backdrop-blur-sm appearance-none"
                    >
                      {statusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option.toUpperCase()}
                        </option>
                      ))}
                    </select>
                    <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full bg-gradient-to-r ${getStatusColor(formData.status)}`}></div>
                  </div>
                </div>

                {/* Score */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Score (0-100)</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="score"
                      value={formData.score}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/70 backdrop-blur-sm"
                      placeholder="Enter score"
                    />
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(formData.score || 0, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Lead Value */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Lead Value ($)</label>
                  <input
                    type="number"
                    name="lead_value"
                    value={formData.lead_value}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/70 backdrop-blur-sm"
                    placeholder="Enter lead value"
                  />
                </div>

                {/* Last Activity */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Last Activity Date</label>
                  <input
                    type="date"
                    name="last_activity_at"
                    value={formData.last_activity_at}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/70 backdrop-blur-sm"
                  />
                </div>

                {/* Qualified Status */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Qualification Status</label>
                  <div className="flex items-center space-x-3 p-3 bg-white/70 backdrop-blur-sm rounded-lg border border-gray-300">
                    <input
                      type="checkbox"
                      name="is_qualified"
                      checked={formData.is_qualified}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${formData.is_qualified ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                      <span className={`text-sm font-medium ${formData.is_qualified ? 'text-green-700' : 'text-gray-500'}`}>
                        {formData.is_qualified ? 'Qualified Lead' : 'Not Qualified'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    {loading && (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    <span>{id ? 'Update Lead' : 'Create Lead'}</span>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate('/leads')}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:from-gray-600 hover:to-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeadForm;
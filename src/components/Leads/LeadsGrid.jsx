import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import api from '../../services/api';

// AG Grid's theme is customized via CSS to match the original design
import './LeadsGrid.css';

// Custom cell renderers for badges and buttons
const StatusCellRenderer = ({ value }) => {
  const getStatusBadge = (status) => {
    const statusColors = {
      new: 'bg-blue-100 text-blue-800 border-blue-200',
      contacted: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      qualified: 'bg-green-100 text-green-800 border-green-200',
      lost: 'bg-red-100 text-red-800 border-red-200',
      won: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (!value) return null;
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(value.toLowerCase())}`}>
      {value.toString().toUpperCase()}
    </span>
  );
};

const SourceCellRenderer = ({ value }) => {
  const getSourceBadge = (source) => {
    const sourceColors = {
      website: 'bg-indigo-100 text-indigo-800',
      facebook_ads: 'bg-blue-100 text-blue-800',
      google_ads: 'bg-green-100 text-green-800',
      referral: 'bg-orange-100 text-orange-800',
      events: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return sourceColors[source] || 'bg-gray-100 text-gray-800';
  };

  if (!value) return null;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getSourceBadge(value.toLowerCase())}`}>
      {value.toString().replace('_', ' ').toUpperCase()}
    </span>
  );
};

const ScoreCellRenderer = ({ value }) => {
  const numericValue = Number(value) || 0;
  
  return (
    <div className="flex items-center">
      <div className="text-sm font-semibold text-gray-900 mr-2">{numericValue}</div>
      <div className="w-16 bg-gray-200 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(numericValue, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

const QualifiedCellRenderer = ({ value }) => {
  const isQualified = value === true || value === 'true';
  
  return (
    <div className="flex items-center">
      <div className={`w-3 h-3 rounded-full mr-2 ${isQualified ? 'bg-green-400' : 'bg-gray-300'}`}></div>
      <span className={`text-sm font-medium ${isQualified ? 'text-green-700' : 'text-gray-500'}`}>
        {isQualified ? 'Yes' : 'No'}
      </span>
    </div>
  );
};

// Actions cell renderer updated to receive navigate and handleDelete as props
const ActionsCellRenderer = ({ data, navigate, handleDelete }) => {
  const leadId = data?._id;

  if (!leadId) return null;

  const handleEditClick = () => {
    console.log('Edit clicked for leadId:', leadId); // Debug
    navigate(`/leads/edit/${leadId}`);
  };

  const handleDeleteClick = () => {
    console.log('Delete clicked for leadId:', leadId); // Debug
    if (handleDelete) {
      handleDelete(leadId);
    }
  };

  return (
    <div className="flex space-x-2 items-center justify-center">
      <button
        className="group relative px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
        onClick={handleEditClick}
      >
        Edit
      </button>
      <button
        className="group relative px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
        onClick={handleDeleteClick}
      >
        Delete
      </button>
    </div>
  );
};

function LeadsGrid() {
  const navigate = useNavigate();
  const gridRef = useRef();
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    email: { value: '', operator: 'contains' },
    company: { value: '', operator: 'contains' },
    city: { value: '', operator: 'contains' },
    source: { value: '', operator: 'equals' },
    status: { value: '', operator: 'equals' },
    score: { value: '', operator: 'equals' },
    lead_value: { value: '', operator: 'equals' },
    last_activity_at: { value: '', operator: 'on' },
    is_qualified: { value: '', operator: 'equals' },
  });
  const [error, setError] = useState('');

  // Define handleDelete before columnDefs
  const handleDelete = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await api.delete(`/leads/${id}`);
        setLeads((prev) => prev.filter((lead) => lead._id !== id));
        setTotal((prev) => prev - 1);
      } catch (err) {
        console.error('Delete error:', err.response?.data);
        alert('Failed to delete lead');
      }
    }
  }, []);

  const columnDefs = useMemo(() => [
    {
      headerName: 'Name',
      field: 'first_name',
      cellRenderer: (props) => {
        const firstName = props.data?.first_name || '';
        const lastName = props.data?.last_name || '';
        return `${firstName} ${lastName}`.trim();
      },
      minWidth: 180,
      flex: 1,
    },
    {
      headerName: 'Contact',
      field: 'email',
      cellRenderer: (props) => (
        <div>
          <div className="text-sm text-gray-700">{props.data?.email || ''}</div>
          <div className="text-xs text-gray-500">{props.data?.phone || ''}</div>
        </div>
      ),
      minWidth: 200,
      flex: 1,
    },
    { 
      headerName: 'Company', 
      field: 'company', 
      minWidth: 150,
      flex: 1,
      cellRenderer: (props) => props.value || '—'
    },
    {
      headerName: 'Location',
      field: 'city',
      cellRenderer: (props) => (
        <div>
          <div className="text-sm text-gray-700">{props.data?.city || ''}</div>
          <div className="text-xs text-gray-500">{props.data?.state || ''}</div>
        </div>
      ),
      minWidth: 150,
      flex: 1,
    },
    { 
      headerName: 'Source', 
      field: 'source', 
      cellRenderer: SourceCellRenderer, 
      minWidth: 120,
      flex: 1,
    },
    { 
      headerName: 'Status', 
      field: 'status', 
      cellRenderer: StatusCellRenderer, 
      minWidth: 120,
      flex: 1,
    },
    { 
      headerName: 'Score', 
      field: 'score', 
      cellRenderer: ScoreCellRenderer, 
      minWidth: 150,
      flex: 1,
    },
    {
      headerName: 'Value',
      field: 'lead_value',
      cellRenderer: (props) => `$${Number(props.value || 0).toLocaleString()}`,
      minWidth: 100,
      flex: 1,
    },
    {
      headerName: 'Last Activity',
      field: 'last_activity_at',
      cellRenderer: (props) => {
        if (!props.value) return '—';
        try {
          return new Date(props.value).toLocaleDateString();
        } catch (e) {
          return '—';
        }
      },
      minWidth: 150,
      flex: 1,
    },
    {
      headerName: 'Qualified',
      field: 'is_qualified',
      cellRenderer: QualifiedCellRenderer,
      minWidth: 120,
      flex: 1,
    },
    {
      headerName: 'Actions',
      cellRenderer: ActionsCellRenderer,
      cellRendererParams: { navigate, handleDelete },
      width: 200,
      suppressHeaderMenuButton: true,
      sortable: false,
      pinned: 'right',
    },
  ], [handleDelete]);

  const fetchLeads = useCallback(async (currentPage = page, currentFilters = filters) => {
    setLoading(true);
    setError('');
    
    try {
      const filterParams = Object.entries(currentFilters).reduce((acc, [key, { value, operator }]) => {
        if (value) {
          if (['email', 'company', 'city'].includes(key)) {
            return operator === 'contains'
              ? { ...acc, [key]: value, [`${key}_contains`]: true }
              : { ...acc, [key]: value };
          }
          if (['source', 'status'].includes(key)) {
            if (operator === 'in') {
              return { ...acc, [`${key}_in`]: value };
            } else {
              return { ...acc, [key]: value };
            }
          }
          if (['score', 'lead_value'].includes(key)) {
            if (operator === 'equals') return { ...acc, [key]: Number(value) };
            if (operator === 'gt') return { ...acc, [`${key}_gt`]: Number(value) };
            if (operator === 'lt') return { ...acc, [`${key}_lt`]: Number(value) };
            if (operator === 'between') {
              if (!/^\d+,\d+$/.test(value)) {
                throw new Error(`Invalid range for ${key}`);
              }
              return { ...acc, [`${key}_between`]: value };
            }
          }
          if (key === 'last_activity_at') {
            if (operator === 'on') return { ...acc, [`${key}_on`]: value };
            if (operator === 'before') return { ...acc, [`${key}_before`]: value };
            if (operator === 'after') return { ...acc, [`${key}_after`]: value };
            if (operator === 'between') {
              if (!/^\d{4}-\d{2}-\d{2},\d{4}-\d{2}-\d{2}$/.test(value)) {
                throw new Error('Invalid date range');
              }
              return { ...acc, [`${key}_between`]: value };
            }
          }
          if (key === 'is_qualified') {
            return { ...acc, [key]: value };
          }
        }
        return acc;
      }, {});

      console.log('Fetching leads with params:', { page: currentPage, limit, ...filterParams });

      const response = await api.get('/leads', {
        params: { page: currentPage, limit, ...filterParams },
        headers: { 'Cache-Control': 'no-cache' },
      });

      console.log('API response:', {
        status: response.status,
        data: response.data,
        dataType: typeof response.data,
        dataKeys: response.data ? Object.keys(response.data) : 'No data object'
      });

      let newLeads = [];
      let newTotal = 0;

      if (response.data) {
        if (Array.isArray(response.data.data)) {
          newLeads = response.data.data;
          newTotal = response.data.total || response.data.count || response.data.data.length;
        }
        else if (Array.isArray(response.data)) {
          newLeads = response.data;
          newTotal = response.data.length;
        }
        else if (response.data.leads && Array.isArray(response.data.leads)) {
          newLeads = response.data.leads;
          newTotal = response.data.total || response.data.leads.length;
        }
      }

      console.log('Processed data:', {
        leads: newLeads,
        leadCount: newLeads.length,
        total: newTotal,
        firstLead: newLeads[0]
      });

      if (newLeads.length > 0) {
        const firstLead = newLeads[0];
        console.log('First lead structure:', firstLead);
        console.log('First lead keys:', Object.keys(firstLead));
      }

      setLeads(newLeads);
      setTotal(newTotal);

    } catch (err) {
      console.error('Fetch error:', {
        message: err.message,
        response: err.response?.data || 'No response data',
        status: err.response?.status || 'No status',
        headers: err.response?.headers || 'No headers',
        code: err.code || 'No code',
      });
      setError(err.response?.data?.message || err.message || 'Failed to load leads');
      setLeads([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleFilterChange = useCallback((e, key, type) => {
    const { value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [key]: { ...prev[key], [type]: value },
    }));
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    const clearedFilters = {
      email: { value: '', operator: 'contains' },
      company: { value: '', operator: 'contains' },
      city: { value: '', operator: 'contains' },
      source: { value: '', operator: 'equals' },
      status: { value: '', operator: 'equals' },
      score: { value: '', operator: 'equals' },
      lead_value: { value: '', operator: 'equals' },
      last_activity_at: { value: '', operator: 'on' },
      is_qualified: { value: '', operator: 'equals' },
    };
    setFilters(clearedFilters);
    setPage(1);
    setIsFilterOpen(false);
  }, []);

  const totalPages = Math.ceil(total / limit);

  console.log('Component render - leads:', leads.length, 'total:', total);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">
            Lead Management
          </h1>
          <p className="text-lg text-gray-600">
            Manage and track your leads with advanced filtering and insights
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-400 rounded-full mr-3"></div>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        <div className="mb-6 flex justify-between items-center">
          <div className="text-sm text-gray-600 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200">
            <span className="font-semibold text-gray-900">{total}</span> total leads
            {loading && <span className="ml-2 text-blue-600">Loading...</span>}
          </div>
          <button
            className={`group relative px-6 py-3 font-semibold rounded-xl transition-all duration-300 ${
              isFilterOpen
                ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700'
            } transform hover:scale-105`}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"
                />
              </svg>
              <span>{isFilterOpen ? 'Hide Filters' : 'Show Filters'}</span>
            </div>
          </button>
        </div>

        {isFilterOpen && (
          <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4">
              <h3 className="text-lg font-semibold text-white">Advanced Filters</h3>
              <p className="text-slate-300 text-sm">Refine your lead search with precision</p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Email</label>
                  <select
                    value={filters.email.operator}
                    onChange={(e) => handleFilterChange(e, 'email', 'operator')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/70 backdrop-blur-sm"
                  >
                    <option value="contains">Contains</option>
                    <option value="equals">Equals</option>
                  </select>
                  <input
                    type="text"
                    value={filters.email.value}
                    onChange={(e) => handleFilterChange(e, 'email', 'value')}
                    placeholder="Enter email..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/70 backdrop-blur-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Company</label>
                  <select
                    value={filters.company.operator}
                    onChange={(e) => handleFilterChange(e, 'company', 'operator')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/70 backdrop-blur-sm"
                  >
                    <option value="contains">Contains</option>
                    <option value="equals">Equals</option>
                  </select>
                  <input
                    type="text"
                    value={filters.company.value}
                    onChange={(e) => handleFilterChange(e, 'company', 'value')}
                    placeholder="Enter company name..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/70 backdrop-blur-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">City</label>
                  <select
                    value={filters.city.operator}
                    onChange={(e) => handleFilterChange(e, 'city', 'operator')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/70 backdrop-blur-sm"
                  >
                    <option value="contains">Contains</option>
                    <option value="equals">Equals</option>
                  </select>
                  <input
                    type="text"
                    value={filters.city.value}
                    onChange={(e) => handleFilterChange(e, 'city', 'value')}
                    placeholder="Enter city..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/70 backdrop-blur-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Source</label>
                  <select
                    value={filters.source.operator}
                    onChange={(e) => handleFilterChange(e, 'source', 'operator')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/70 backdrop-blur-sm"
                  >
                    <option value="equals">Equals</option>
                    <option value="in">In</option>
                  </select>
                  {filters.source.operator === 'in' ? (
                    <input
                      type="text"
                      value={filters.source.value}
                      onChange={(e) => handleFilterChange(e, 'source', 'value')}
                      placeholder="website,referral,events..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/70 backdrop-blur-sm"
                    />
                  ) : (
                    <select
                      value={filters.source.value}
                      onChange={(e) => handleFilterChange(e, 'source', 'value')}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/70 backdrop-blur-sm"
                    >
                      <option value="">Select Source</option>
                      {['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'].map(
                        (opt) => (
                          <option key={opt} value={opt}>
                            {opt.replace('_', ' ').toUpperCase()}
                          </option>
                        )
                      )}
                    </select>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Status</label>
                  <select
                    value={filters.status.operator}
                    onChange={(e) => handleFilterChange(e, 'status', 'operator')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/70 backdrop-blur-sm"
                  >
                    <option value="equals">Equals</option>
                    <option value="in">In</option>
                  </select>
                  {filters.status.operator === 'in' ? (
                    <input
                      type="text"
                      value={filters.status.value}
                      onChange={(e) => handleFilterChange(e, 'status', 'value')}
                      placeholder="new,qualified,contacted..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/70 backdrop-blur-sm"
                    />
                  ) : (
                    <select
                      value={filters.status.value}
                      onChange={(e) => handleFilterChange(e, 'status', 'value')}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/70 backdrop-blur-sm"
                    >
                      <option value="">Select Status</option>
                      {['new', 'contacted', 'qualified', 'lost', 'won'].map((opt) => (
                        <option key={opt} value={opt}>
                          {opt.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Score</label>
                  <select
                    value={filters.score.operator}
                    onChange={(e) => handleFilterChange(e, 'score', 'operator')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/70 backdrop-blur-sm"
                  >
                    <option value="equals">Equals</option>
                    <option value="gt">Greater Than</option>
                    <option value="lt">Less Than</option>
                    <option value="between">Between</option>
                  </select>
                  {filters.score.operator === 'between' ? (
                    <input
                      type="text"
                      value={filters.score.value}
                      onChange={(e) => handleFilterChange(e, 'score', 'value')}
                      placeholder="50,75"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/70 backdrop-blur-sm"
                    />
                  ) : (
                    <input
                      type="number"
                      value={filters.score.value}
                      onChange={(e) => handleFilterChange(e, 'score', 'value')}
                      placeholder="Enter score..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/70 backdrop-blur-sm"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Lead Value</label>
                  <select
                    value={filters.lead_value.operator}
                    onChange={(e) => handleFilterChange(e, 'lead_value', 'operator')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/70 backdrop-blur-sm"
                  >
                    <option value="equals">Equals</option>
                    <option value="gt">Greater Than</option>
                    <option value="lt">Less Than</option>
                    <option value="between">Between</option>
                  </select>
                  {filters.lead_value.operator === 'between' ? (
                    <input
                      type="text"
                      value={filters.lead_value.value}
                      onChange={(e) => handleFilterChange(e, 'lead_value', 'value')}
                      placeholder="100,500"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/70 backdrop-blur-sm"
                    />
                  ) : (
                    <input
                      type="number"
                      value={filters.lead_value.value}
                      onChange={(e) => handleFilterChange(e, 'lead_value', 'value')}
                      placeholder="Enter value..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/70 backdrop-blur-sm"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Last Activity</label>
                  <select
                    value={filters.last_activity_at.operator}
                    onChange={(e) => handleFilterChange(e, 'last_activity_at', 'operator')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/70 backdrop-blur-sm"
                  >
                    <option value="on">On</option>
                    <option value="before">Before</option>
                    <option value="after">After</option>
                    <option value="between">Between</option>
                  </select>
                  {filters.last_activity_at.operator === 'between' ? (
                    <input
                      type="text"
                      value={filters.last_activity_at.value}
                      onChange={(e) => handleFilterChange(e, 'last_activity_at', 'value')}
                      placeholder="2024-01-01,2024-12-31"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/70 backdrop-blur-sm"
                    />
                  ) : (
                    <input
                      type="date"
                      value={filters.last_activity_at.value}
                      onChange={(e) => handleFilterChange(e, 'last_activity_at', 'value')}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/70 backdrop-blur-sm"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Qualified Status</label>
                  <select
                    value={filters.is_qualified.value}
                    onChange={(e) => handleFilterChange(e, 'is_qualified', 'value')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/70 backdrop-blur-sm"
                  >
                    <option value="">All Leads</option>
                    <option value="true">Qualified Only</option>
                    <option value="false">Not Qualified</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
                <button
                  className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  onClick={clearFilters}
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="ag-theme-alpine" style={{ height: 600, width: '100%' }}>
          <AgGridReact
            ref={gridRef}
            rowData={leads}
            columnDefs={columnDefs}
            theme="legacy"
            defaultColDef={{
              sortable: true,
              resizable: true,
              wrapText: true,
              autoHeight: true,
              cellClass: 'grid-cell-padding',
            }}
            rowHeight={70}
            rowSelection={{
              mode: 'singleRow',
              enableClickSelection: false
            }}
            suppressMenuHide={false}
            cellSelection={false}
            animateRows={true}
            onGridReady={(params) => {
              console.log('Grid ready, leads count:', leads.length);
              if (leads.length > 0) {
                params.api.sizeColumnsToFit();
              }
            }}
            onFirstDataRendered={(params) => {
              console.log('First data rendered, leads count:', leads.length);
              params.api.sizeColumnsToFit();
            }}
            onRowDataUpdated={(params) => {
              console.log('Row data updated, row count:', params.api.getDisplayedRowCount());
            }}
            loading={loading}
            overlayLoadingTemplate={
              '<span class="ag-overlay-loading-center">Loading leads...</span>'
            }
            overlayNoRowsTemplate={
              '<span class="ag-overlay-no-rows-center">No leads found. Try adjusting your filters.</span>'
            }
            getRowId={(params) => params.data._id || params.data.id}
          />
        </div>

        <div className="mt-6 px-6 py-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Showing {leads.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, total)} of {total} leads
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Page <span className="font-semibold text-gray-900">{page}</span> of{' '}
              <span className="font-semibold text-gray-900">{totalPages || 1}</span>
            </div>
            <div className="space-x-2">
              <button
                className={`px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg font-medium hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg ${
                  page === 1 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <button
                className={`px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg font-medium hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg ${
                  page === totalPages || totalPages === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages || totalPages === 0}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeadsGrid;
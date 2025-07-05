import React, { useState, useEffect } from 'react';

interface Booking {
  id: number;
  name: string;
  email: string;
  phone: string;
  date: string;
  startTime: string;
  duration: number;
  totalAmount: number;
  originalAmount?: number;
  discountAmount?: number;
  couponCode?: string;
  status: string;
  paymentId: string | null;
  bookedAt: string;
}

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin-bookings');
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (err) {
      setError('Failed to load bookings');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#28a745';
      case 'pending': return '#ffc107';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = filter === 'all' || booking.status === filter;
    const matchesSearch = 
      booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.phone.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const totalRevenue = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    revenue: totalRevenue
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        fontSize: '18px' 
      }}>
        📊 Loading bookings...
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '2px solid #e9ecef'
      }}>
        <h1 style={{ margin: 0, color: '#333' }}>📊 Studio Admin Panel</h1>
        <button
          onClick={onBack}
          style={{
            background: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ← Back to Booking
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#007bff' }}>
            {stats.total}
          </div>
          <div style={{ color: '#666', fontSize: '14px' }}>Total Bookings</div>
        </div>

        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745' }}>
            {stats.confirmed}
          </div>
          <div style={{ color: '#666', fontSize: '14px' }}>Confirmed</div>
        </div>

        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffc107' }}>
            {stats.pending}
          </div>
          <div style={{ color: '#666', fontSize: '14px' }}>Pending</div>
        </div>

        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745' }}>
            ₹{stats.revenue.toLocaleString()}
          </div>
          <div style={{ color: '#666', fontSize: '14px' }}>Revenue</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        gap: '15px', 
        marginBottom: '20px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        >
          <option value="all">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            minWidth: '250px'
          }}
        />

        <button
          onClick={fetchBookings}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Bookings Table */}
      {error && (
        <div style={{
          background: '#f8d7da',
          color: '#721c24',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {filteredBookings.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#666',
          fontSize: '18px'
        }}>
          {bookings.length === 0 ? '📝 No bookings yet' : '🔍 No bookings match your search'}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderRadius: '8px'
          }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>ID</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Customer</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Contact</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Session</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Amount</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Booked</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking, index) => (
                <tr 
                  key={booking.id}
                  style={{ 
                    borderBottom: '1px solid #dee2e6',
                    background: index % 2 === 0 ? 'white' : '#f8f9fa'
                  }}
                >
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>#{booking.id}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 'bold' }}>{booking.name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{booking.email}</div>
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{booking.phone}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 'bold' }}>{formatDate(booking.date)}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {formatTime(booking.startTime)} • {booking.duration}h
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 'bold', color: '#28a745' }}>
                      ₹{booking.totalAmount.toLocaleString()}
                    </div>
                    {booking.discountAmount && booking.discountAmount > 0 && (
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        <span style={{ textDecoration: 'line-through' }}>₹{booking.originalAmount?.toLocaleString()}</span>
                        <span style={{ color: '#dc3545', fontWeight: 'bold' }}> -₹{booking.discountAmount}</span>
                        {booking.couponCode && (
                          <div style={{ color: '#007bff', fontSize: '11px' }}>
                            🎟️ {booking.couponCode}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      background: getStatusColor(booking.status),
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {booking.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '12px', color: '#666' }}>
                    {new Date(booking.bookedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
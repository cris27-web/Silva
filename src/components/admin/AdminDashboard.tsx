import { CalendarCheck, RefreshCcw, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

type Booking = {
  id: string;
  customer_name: string;
  customer_email: string;
  service_name: string;
  booking_date: string;
  booking_time: string;
  status: string;
  payment_status: string;
  total_amount: number;
};

export default function AdminDashboard() {
  const [token, setToken] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [message, setMessage] = useState("Enter the admin token to load bookings.");
  const [loading, setLoading] = useState(false);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin-bookings", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load bookings");
      setBookings(data.bookings);
      setMessage(data.demo ? "Demo bookings shown. Connect Supabase to manage live bookings." : "Live bookings loaded.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  return (
    <div className="admin-widget">
      <div className="admin-toolbar">
        <div>
          <p className="eyebrow">Operations</p>
          <h2>Booking board</h2>
        </div>
        <label className="admin-token">
          <ShieldCheck size={18} />
          <input value={token} onChange={(event) => setToken(event.target.value)} placeholder="Admin token" type="password" />
        </label>
        <button className="icon-button" onClick={loadBookings} title="Refresh bookings" type="button">
          <RefreshCcw size={18} />
        </button>
      </div>

      <div className="metric-row">
        <div><CalendarCheck size={20} /><strong>{bookings.length}</strong><span>Total bookings</span></div>
        <div><strong>{bookings.filter((booking) => booking.status === "confirmed").length}</strong><span>Confirmed</span></div>
        <div><strong>GBP {bookings.reduce((sum, booking) => sum + Number(booking.total_amount || 0), 0)}</strong><span>Booked value</span></div>
      </div>

      <p className="form-message">{loading ? "Loading..." : message}</p>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Service</th>
              <th>Date</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td><strong>{booking.customer_name}</strong><span>{booking.customer_email}</span></td>
                <td>{booking.service_name}</td>
                <td>{booking.booking_date} {booking.booking_time}</td>
                <td><span className="status-pill">{booking.status}</span></td>
                <td>{booking.payment_status}</td>
                <td>GBP {booking.total_amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { CalendarCheck, RefreshCcw, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type AddOn = {
  id: string;
  name: string;
  price: number;
};

type Booking = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  service_name: string;
  booking_date: string;
  booking_time: string;
  status: string;
  payment_status: string;
  total_amount: number;
  add_ons?: AddOn[];
  notes?: string;
};

const statusLabels: Record<string, string> = {
  pending_payment: "Pending payment",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled"
};

export default function AdminDashboard() {
  const [token, setToken] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [message, setMessage] = useState("Enter the admin token to load bookings.");
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredBookings = useMemo(
    () => statusFilter === "all" ? bookings : bookings.filter((booking) => booking.status === statusFilter),
    [bookings, statusFilter]
  );

  const bookedValue = filteredBookings.reduce((sum, booking) => sum + Number(booking.total_amount || 0), 0);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin-bookings", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load bookings");
      setBookings(data.bookings);
      setMessage(data.demo ? "Demo bookings shown. Set DEMO_MODE=false and connect Supabase for live operations." : "Live bookings loaded.");
    } catch (error) {
      setBookings([]);
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
        <label className="admin-token">
          Status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All</option>
            <option value="pending_payment">Pending payment</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
        <button className="icon-button" onClick={loadBookings} title="Refresh bookings" type="button">
          <RefreshCcw size={18} />
        </button>
      </div>

      <div className="metric-row">
        <div><CalendarCheck size={20} /><strong>{filteredBookings.length}</strong><span>Shown bookings</span></div>
        <div><strong>{bookings.filter((booking) => booking.status === "confirmed").length}</strong><span>Confirmed</span></div>
        <div><strong>GBP {bookedValue}</strong><span>Shown value</span></div>
      </div>

      <p className="form-message" role="status" aria-live="polite">{loading ? "Loading..." : message}</p>

      {filteredBookings.length === 0 ? (
        <div className="empty-state">
          <strong>No bookings to show</strong>
          <p>Check the admin token, clear the filter, or connect Supabase for live booking data.</p>
        </div>
      ) : (
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
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td><strong>{booking.customer_name}</strong><span>{booking.customer_email}</span><span>{booking.customer_phone || "No phone"}</span></td>
                  <td>{booking.service_name}<span>{booking.add_ons?.length ? booking.add_ons.map((addOn) => addOn.name).join(", ") : "No add-ons"}</span><span>{booking.notes || "No notes"}</span></td>
                  <td>{booking.booking_date} {booking.booking_time}</td>
                  <td><span className="status-pill">{statusLabels[booking.status] || booking.status}</span></td>
                  <td>{booking.payment_status}</td>
                  <td>GBP {booking.total_amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { CalendarDays, CreditCard, Home, Sparkles, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { services } from "../../data/services";

type BookingForm = {
  serviceId: string;
  bedrooms: number;
  bathrooms: number;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  postcode: string;
  notes: string;
};

const today = new Date().toISOString().slice(0, 10);

const getInitialServiceId = () => {
  if (typeof window === "undefined") return services[0].id;
  return new URLSearchParams(window.location.search).get("service") || services[0].id;
};

const initialForm: BookingForm = {
  serviceId: getInitialServiceId(),
  bedrooms: 2,
  bathrooms: 1,
  date: today,
  time: "09:00",
  name: "",
  email: "",
  phone: "",
  address: "",
  postcode: "",
  notes: ""
};

export default function BookingApp() {
  const [form, setForm] = useState<BookingForm>(initialForm);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  const service = services.find((item) => item.id === form.serviceId) || services[0];
  const price = useMemo(() => {
    const roomCost = Math.max(0, form.bedrooms - 1) * 12 + Math.max(0, form.bathrooms - 1) * 10;
    return service.basePrice + roomCost;
  }, [form.bathrooms, form.bedrooms, service.basePrice]);

  const update = (field: keyof BookingForm, value: string | number) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submitBooking = async () => {
    setStatus("loading");
    setMessage("");

    try {
      const bookingResponse = await fetch("/api/create-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, totalAmount: price, serviceName: service.name })
      });

      if (!bookingResponse.ok) throw new Error("Could not create booking");
      const booking = await bookingResponse.json();

      const paymentResponse = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id, amount: price, serviceName: service.name })
      });

      if (!paymentResponse.ok) throw new Error("Could not start payment");
      const payment = await paymentResponse.json();

      if (payment.url) {
        window.location.href = payment.url;
        return;
      }

      setMessage(payment.message || "Demo booking created. Add Stripe keys to enable online payment.");
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong");
    }
  };

  return (
    <div className="booking-widget">
      <div className="booking-main">
        <section className="booking-panel">
          <div className="panel-title">
            <Sparkles size={20} />
            <h2>Choose service</h2>
          </div>
          <div className="service-options">
            {services.map((item) => (
              <button
                className={item.id === form.serviceId ? "option-card selected" : "option-card"}
                key={item.id}
                onClick={() => update("serviceId", item.id)}
                type="button"
              >
                <strong>{item.name}</strong>
                <span>From GBP {item.basePrice}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="booking-panel grid-two">
          <div className="panel-title full">
            <Home size={20} />
            <h2>Property details</h2>
          </div>
          <label>
            Bedrooms
            <input min="1" type="number" value={form.bedrooms} onChange={(event) => update("bedrooms", Number(event.target.value))} />
          </label>
          <label>
            Bathrooms
            <input min="1" type="number" value={form.bathrooms} onChange={(event) => update("bathrooms", Number(event.target.value))} />
          </label>
          <label className="full">
            Address
            <input value={form.address} onChange={(event) => update("address", event.target.value)} placeholder="Flat 2, 10 High Street" />
          </label>
          <label>
            Postcode
            <input value={form.postcode} onChange={(event) => update("postcode", event.target.value)} placeholder="BS1 1AA" />
          </label>
        </section>

        <section className="booking-panel grid-two">
          <div className="panel-title full">
            <CalendarDays size={20} />
            <h2>Date and contact</h2>
          </div>
          <label>
            Date
            <input min={today} type="date" value={form.date} onChange={(event) => update("date", event.target.value)} />
          </label>
          <label>
            Time
            <select value={form.time} onChange={(event) => update("time", event.target.value)}>
              <option>09:00</option>
              <option>11:30</option>
              <option>14:00</option>
              <option>16:30</option>
            </select>
          </label>
          <label>
            Name
            <input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Your name" />
          </label>
          <label>
            Email
            <input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="you@example.com" />
          </label>
          <label>
            Phone
            <input value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="+44..." />
          </label>
          <label className="full">
            Notes
            <textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Pets, parking, access notes..." />
          </label>
        </section>
      </div>

      <aside className="booking-summary">
        <div className="panel-title">
          <CreditCard size={20} />
          <h2>Summary</h2>
        </div>
        <dl>
          <div><dt>Service</dt><dd>{service.name}</dd></div>
          <div><dt>Slot</dt><dd>{form.date} at {form.time}</dd></div>
          <div><dt>Property</dt><dd>{form.bedrooms} bed, {form.bathrooms} bath</dd></div>
          <div className="total"><dt>Total</dt><dd>GBP {price}</dd></div>
        </dl>
        <button className="button button-primary wide" disabled={status === "loading"} onClick={submitBooking} type="button">
          {status === "loading" ? "Creating booking..." : "Continue to payment"}
        </button>
        {message && <p className={status === "error" ? "form-message error" : "form-message"}>{message}</p>}
        <p className="secure-note"><UserRound size={16} /> Stripe Checkout handles cards, Apple Pay, and Google Pay where available.</p>
      </aside>
    </div>
  );
}

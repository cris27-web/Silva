import { CalendarDays, CheckCircle2, CreditCard, Home, Sparkles, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { addOns, bookingSlots, calculateBookingPrice, services } from "../../data/services";

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
  addOns: string[];
};

const getToday = () => new Date().toISOString().slice(0, 10);

const getInitialServiceId = () => {
  if (typeof window === "undefined") return services[0].id;
  return new URLSearchParams(window.location.search).get("service") || services[0].id;
};

const createInitialForm = (): BookingForm => ({
  serviceId: getInitialServiceId(),
  bedrooms: 2,
  bathrooms: 1,
  date: typeof window === "undefined" ? "" : getToday(),
  time: "09:00",
  name: "",
  email: "",
  phone: "",
  address: "",
  postcode: "",
  notes: "",
  addOns: []
});

export default function BookingApp() {
  const [form, setForm] = useState<BookingForm>(createInitialForm);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>(bookingSlots);
  const [availabilityMessage, setAvailabilityMessage] = useState("");

  useEffect(() => {
    setForm((current) => current.date ? current : { ...current, date: getToday() });
  }, []);

  const service = services.find((item) => item.id === form.serviceId) || services[0];
  const price = useMemo(() => calculateBookingPrice(form.serviceId, form.bedrooms, form.bathrooms, form.addOns), [form.addOns, form.bathrooms, form.bedrooms, form.serviceId]);

  useEffect(() => {
    if (!form.date) return;

    const controller = new AbortController();
    setAvailabilityMessage("Checking available slots...");

    fetch(`/api/get-availability?date=${encodeURIComponent(form.date)}`, { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load availability");
        const slots = Array.isArray(data.slots) ? data.slots : bookingSlots;
        setAvailableSlots(slots);
        setAvailabilityMessage(data.demo ? "Demo availability shown." : "Available slots loaded.");
        if (slots.length > 0 && !slots.includes(form.time)) update("time", slots[0]);
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        setAvailableSlots(bookingSlots);
        setAvailabilityMessage(error instanceof Error ? error.message : "Could not load availability");
      });

    return () => controller.abort();
  }, [form.date]);

  const missingFields = [
    !form.name.trim() && "name",
    !form.email.includes("@") && "email",
    !form.phone.trim() && "phone",
    !form.address.trim() && "address",
    !form.postcode.trim() && "postcode"
  ].filter(Boolean) as string[];

  const canSubmit = Boolean(form.date && form.time && availableSlots.includes(form.time) && missingFields.length === 0);

  const update = (field: keyof BookingForm, value: string | number | string[]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleAddOn = (id: string) => {
    setForm((current) => ({
      ...current,
      addOns: current.addOns.includes(id) ? current.addOns.filter((item) => item !== id) : [...current.addOns, id]
    }));
  };

  const submitBooking = async () => {
    if (!canSubmit || !price) {
      setStatus("error");
      setMessage(missingFields.length ? `Add ${missingFields.join(", ")} before continuing.` : "Choose an available time before continuing.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const bookingResponse = await fetch("/api/create-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form })
      });

      const booking = await bookingResponse.json();
      if (!bookingResponse.ok) throw new Error(booking.error || "Could not create booking");

      const paymentResponse = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id })
      });

      const payment = await paymentResponse.json();
      if (!paymentResponse.ok) throw new Error(payment.error || "Could not start payment");

      if (payment.url) {
        window.location.href = payment.url;
        return;
      }

      setMessage(payment.message || "Your booking request is ready. The team will contact you to confirm payment and arrival details.");
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong");
    }
  };

  const selectedSuggestedAddOns = addOns.filter((addOn) => service.suggestedAddOns.includes(addOn.id));
  const otherAddOns = addOns.filter((addOn) => !service.suggestedAddOns.includes(addOn.id));
  const progress = ["Service", "Property", "Contact", "Confirm"];

  return (
    <div className="booking-widget">
      <div className="booking-main">
        <div className="booking-progress" aria-label="Booking progress">
          {progress.map((step, index) => <span key={step}>{index + 1}. {step}</span>)}
        </div>

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
                <span>From GBP {item.basePrice} | {item.duration}</span>
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
            <input min="1" max="8" type="number" value={form.bedrooms} required onChange={(event) => update("bedrooms", Number(event.target.value))} />
          </label>
          <label>
            Bathrooms
            <input min="1" max="6" type="number" value={form.bathrooms} required onChange={(event) => update("bathrooms", Number(event.target.value))} />
          </label>
          <label className="full">
            Address
            <input autoComplete="street-address" value={form.address} required onChange={(event) => update("address", event.target.value)} placeholder="Flat 2, 10 High Street" />
          </label>
          <label>
            Postcode
            <input autoComplete="postal-code" value={form.postcode} required onChange={(event) => update("postcode", event.target.value)} placeholder="BS1 1AA" />
          </label>
        </section>

        <section className="booking-panel">
          <div className="panel-title">
            <Sparkles size={20} />
            <h2>Add-ons</h2>
          </div>
          <p className="panel-note">Reserve extra time for the details that matter most. These are estimates and will be confirmed before live payment.</p>
          <div className="addon-grid">
            {[...selectedSuggestedAddOns, ...otherAddOns].map((addOn) => (
              <label className={form.addOns.includes(addOn.id) ? "addon-card selected" : "addon-card"} key={addOn.id}>
                <input type="checkbox" checked={form.addOns.includes(addOn.id)} onChange={() => toggleAddOn(addOn.id)} />
                <span><strong>{addOn.name}</strong><small>{addOn.description}</small></span>
                <b>GBP {addOn.price}</b>
              </label>
            ))}
          </div>
        </section>

        <section className="booking-panel grid-two">
          <div className="panel-title full">
            <CalendarDays size={20} />
            <h2>Date and contact</h2>
          </div>
          <label>
            Date
            <input min={getToday()} type="date" value={form.date} required onChange={(event) => update("date", event.target.value)} />
          </label>
          <label>
            Time
            <select value={form.time} required onChange={(event) => update("time", event.target.value)}>
              {availableSlots.map((slot) => <option key={slot}>{slot}</option>)}
            </select>
          </label>
          <p className="panel-note full" aria-live="polite">{availabilityMessage}</p>
          <label>
            Name
            <input autoComplete="name" value={form.name} required onChange={(event) => update("name", event.target.value)} placeholder="Your name" />
          </label>
          <label>
            Email
            <input autoComplete="email" type="email" value={form.email} required onChange={(event) => update("email", event.target.value)} placeholder="you@example.com" />
          </label>
          <label>
            Phone
            <input autoComplete="tel" inputMode="tel" value={form.phone} required onChange={(event) => update("phone", event.target.value)} placeholder="+44..." />
          </label>
          <label className="full">
            Notes
            <textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Pets, parking, access notes, priority areas..." />
          </label>
        </section>
      </div>

      <aside className="booking-summary">
        <div className="panel-title">
          <CreditCard size={20} />
          <h2>Estimate</h2>
        </div>
        {price && (
          <dl>
            <div><dt>Service</dt><dd>{service.name}</dd></div>
            <div><dt>Base price</dt><dd>GBP {service.basePrice}</dd></div>
            <div><dt>Property</dt><dd>GBP {price.propertyAdjustment}</dd></div>
            <div><dt>Add-ons</dt><dd>GBP {price.addOnsTotal}</dd></div>
            <div><dt>Slot</dt><dd>{form.date || "Choose date"} at {form.time}</dd></div>
            <div><dt>Duration</dt><dd>{service.duration}</dd></div>
            <div className="total"><dt>Estimated total</dt><dd>GBP {price.totalAmount}</dd></div>
          </dl>
        )}
        {price && price.addOns.length > 0 && (
          <ul className="summary-list">
            {price.addOns.map((addOn) => <li key={addOn.id}>{addOn.name}</li>)}
          </ul>
        )}
        <div className="booking-assurance" aria-label="Booking reassurance">
          <span><CheckCircle2 size={16} /> Secure checkout when live keys are configured</span>
          <span><CheckCircle2 size={16} /> Confirmation by email</span>
          <span><CheckCircle2 size={16} /> Change requests supported</span>
        </div>
        {!canSubmit && (
          <p className="missing-fields" aria-live="polite">{missingFields.length ? `Add ${missingFields.join(", ")} to continue.` : "Choose an available slot to continue."}</p>
        )}
        <button className="button button-primary wide" disabled={status === "loading" || !canSubmit} onClick={submitBooking} type="button">
          {status === "loading" ? "Creating booking..." : "Continue to payment"}
        </button>
        {message && <p className={status === "error" ? "form-message error" : "form-message"} role="status" aria-live="polite">{message}</p>}
        <p className="secure-note"><UserRound size={16} /> Your details are used only to arrange and manage the clean. Card payment is handled through secure checkout when available.</p>
      </aside>
    </div>
  );
}

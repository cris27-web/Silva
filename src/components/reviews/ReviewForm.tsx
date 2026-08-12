import { Send } from "lucide-react";
import { useState } from "react";

export default function ReviewForm() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/submit-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form))
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not submit review");

      setStatus("success");
      setMessage(data.message || "Review submitted for approval.");
      formElement.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not submit review");
    }
  };

  return (
    <form className="review-form" onSubmit={submit}>
      <div>
        <p className="eyebrow">Leave a review</p>
        <h2>Share your experience</h2>
      </div>
      <label>
        Name
        <input autoComplete="name" name="customer_name" required placeholder="Your name" />
      </label>
      <label>
        Rating
        <select name="rating" defaultValue="5" required>
          <option value="5">5 stars</option>
          <option value="4">4 stars</option>
          <option value="3">3 stars</option>
        </select>
      </label>
      <label>
        Comment
        <textarea name="comment" required placeholder="What went well?" />
      </label>
      <button className="button button-primary" disabled={status === "loading"} type="submit">
        <Send size={16} /> {status === "loading" ? "Submitting..." : "Submit review"}
      </button>
      {message && <p className={status === "error" ? "form-message error" : "form-message"} role="status" aria-live="polite">{message}</p>}
    </form>
  );
}

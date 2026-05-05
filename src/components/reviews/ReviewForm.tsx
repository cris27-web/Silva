import { Send } from "lucide-react";
import { useState } from "react";

export default function ReviewForm() {
  const [message, setMessage] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const response = await fetch("/api/submit-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form))
    });

    const data = await response.json();
    setMessage(data.message || "Review submitted for approval.");
    event.currentTarget.reset();
  };

  return (
    <form className="review-form" onSubmit={submit}>
      <div>
        <p className="eyebrow">Leave a review</p>
        <h2>Share your experience</h2>
      </div>
      <label>
        Name
        <input name="customer_name" required placeholder="Your name" />
      </label>
      <label>
        Rating
        <select name="rating" defaultValue="5">
          <option value="5">5 stars</option>
          <option value="4">4 stars</option>
          <option value="3">3 stars</option>
        </select>
      </label>
      <label>
        Comment
        <textarea name="comment" required placeholder="What went well?" />
      </label>
      <button className="button button-primary" type="submit"><Send size={16} /> Submit review</button>
      {message && <p className="form-message">{message}</p>}
    </form>
  );
}

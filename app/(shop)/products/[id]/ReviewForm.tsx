import { useState } from "react";
import { Star } from "lucide-react";
import { fetchApi } from "@/lib/api-client";

export default function ReviewForm({
  productId,
  onReviewSubmitted,
}: {
  productId: string;
  onReviewSubmitted: () => void;
}) {
  // Replace with your actual auth hook
  const user = { _id: "demo-user-id" }; // TODO: Replace with useAuth()

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const data = await fetchApi(`/api/v1/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: { rating, comment, product_id: productId, user_id: user._id },
      });
      // if (!res.ok) {
      //   const data = await res.json();
      //   throw new Error(data.detail || "Failed to submit review");
      // }
      setSuccess(true);
      setRating(0);
      setComment("");
      onReviewSubmitted();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to submit review");
      } else {
        setError("Failed to submit review");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="text-muted-foreground">Please log in to write a review.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-1 font-medium">Your Rating</label>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => setRating(star)}
              className={star <= rating ? "text-yellow-500" : "text-gray-300"}
              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            >
              <Star className="h-6 w-6" fill={star <= rating ? "#facc15" : "none"} />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block mb-1 font-medium">Your Review</label>
        <textarea
          className="w-full border rounded p-2"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your review here..."
        />
      </div>
      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-600">Review submitted!</div>}
      <button
        type="submit"
        className="bg-primary text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={loading || rating === 0}
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}

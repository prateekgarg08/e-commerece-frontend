import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { format } from "date-fns";
import { fetchApi } from "@/lib/api-client";

export interface Review {
  _id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  user_name?: string;
}

export default function ReviewList({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchApi(`/api/v1/products/${productId}/reviews`);

        setReviews(data);
      } catch {
        setError("Could not load reviews");
      } finally {
        setLoading(false);
      }
    };
    if (productId) fetchReviews();
  }, [productId]);

  if (loading) return <div>Loading reviews...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!reviews.length) return <div className="text-muted-foreground">No reviews yet for this product.</div>;

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review._id} className="border rounded-lg p-4">
          <div className="flex items-center mb-2">
            <span className="font-semibold mr-2">{review.user_name}</span>
            <span className="flex items-center text-yellow-500">
              {[...Array(review.rating)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400" />
              ))}
            </span>
            <span className="ml-auto text-xs text-muted-foreground">{format(new Date(review.created_at), "PPP")}</span>
          </div>
          <div>{review.comment || <span className="italic text-muted-foreground">No comment</span>}</div>
        </div>
      ))}
    </div>
  );
}

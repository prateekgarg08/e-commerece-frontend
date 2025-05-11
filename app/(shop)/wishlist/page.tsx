"use client";

import { useWishlist } from "@/contexts/wishlist-context";
import ProductCard from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Heart, ArrowLeft } from "lucide-react";

export default function WishlistPage() {
  const { wishlist } = useWishlist();

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center gap-2">
        <Heart className="h-6 w-6 text-red-500" />
        <h1 className="text-3xl font-bold">My Wishlist</h1>
      </div>
      {wishlist.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">Your wishlist is empty.</p>
          <Button asChild>
            <Link href="/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Browse Products
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

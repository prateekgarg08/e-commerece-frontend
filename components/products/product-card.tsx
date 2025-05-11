"use client";

import type React from "react";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useWishlist } from "@/contexts/wishlist-context";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted(product._id)) {
      removeFromWishlist(product._id);
      toast({
        title: "Removed from wishlist",
        description: `${product.name} has been removed from your wishlist.`,
      });
    } else {
      addToWishlist(product);
      toast({
        title: "Added to wishlist",
        description: `${product.name} has been added to your wishlist.`,
      });
    }
  };

  const displayPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "INR",
  }).format(product.price);

  const imageSrc = product.images?.[0] || "/placeholder.svg?height=300&width=300";

  return (
    <Card className="overflow-hidden h-full relative group">
      <Link href={`/products/${product._id}`} className="absolute inset-0 z-10">
        <span className="sr-only">View product details</span>
      </Link>

      <div className="relative h-48 sm:h-60">
        <Image
          src={imageSrc || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />

        {product.stock_quantity === 0 && (
          <Badge variant="destructive" className="absolute top-2 left-2">
            Out of Stock
          </Badge>
        )}

        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 z-20 bg-background/80 hover:bg-background text-muted-foreground hover:text-primary"
          onClick={handleWishlist}
        >
          <Heart className={`h-5 w-5 ${isWishlisted(product._id) ? "fill-current text-red-500" : ""}`} />
          <span className="sr-only">{isWishlisted(product._id) ? "Remove from wishlist" : "Add to wishlist"}</span>
        </Button>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold line-clamp-1">{product.name}</h3>
        {product.review_count && product.review_count > 0 && (
          <div className="flex items-center gap-1 mt-1 text-yellow-500 text-sm">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < Math.round(product.average_rating || 0) ? "fill-yellow-400" : ""}`}
                strokeWidth={1.5}
              />
            ))}
            <span className="ml-1 text-xs text-muted-foreground">
              {product.average_rating?.toFixed(1)} ({product.review_count})
            </span>
          </div>
        )}
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
        <p className="font-medium text-lg mt-2">{displayPrice}</p>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button className="w-full z-20 relative" disabled={product.stock_quantity === 0} onClick={handleAddToCart}>
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}

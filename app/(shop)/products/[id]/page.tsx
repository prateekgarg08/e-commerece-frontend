"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { productsApi, merchantsApi } from "@/lib/api-client";
import type { Product, Merchant } from "@/types";
import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, Plus, Star, Minus, RefreshCw, Shield, Truck, ArrowLeft } from "lucide-react";
import ProductCard from "@/components/products/product-card";
import { useWishlist } from "@/contexts/wishlist-context";
import ReviewList from "./ReviewList";
import ReviewForm from "./ReviewForm";
import { toast } from "@/hooks/use-toast";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const productData = await productsApi.getProduct(id);
        setProduct(productData);

        // Fetch merchant details
        if (productData.merchant_id) {
          const merchantData = await merchantsApi.getMerchant(productData.merchant_id);
          setMerchant(merchantData);
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
        setError("Failed to load product details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const newValue = prev + delta;
      return newValue > 0 && newValue <= (product?.stock_quantity || 10) ? newValue : prev;
    });
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      toast({
        title: "Added to cart",
        description: `${quantity} ${quantity === 1 ? "item" : "items"} of ${product.name} added to your cart.`,
      });
    }
  };

  const toggleWishlist = () => {
    if (!product) return;
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  // Add this handler to refresh both reviews and product details
  const handleReviewSubmitted = () => {
    setReviewRefreshKey((k) => k + 1);
    productsApi.getProduct(id).then(setProduct);
  };

  if (loading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container py-8">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-muted-foreground mb-6">{error || "Product not found"}</p>
          <Button asChild>
            <Link href="/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const images = product.images?.length ? product.images : ["/placeholder.svg?height=500&width=500"];

  return (
    <div className="container py-8">
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/products">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative h-96 rounded-lg overflow-hidden border">
            <Image src={images[activeImage] || "/placeholder.svg"} alt={product.name} fill className="object-contain" />
          </div>

          {images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`relative w-20 h-20 cursor-pointer border rounded ${
                    activeImage === index ? "border-primary" : "border-border"
                  }`}
                  onClick={() => setActiveImage(index)}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} - image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            {product.review_count && product.review_count > 0 && (
              <div className="flex items-center gap-1 mt-2 text-yellow-500 text-base">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < Math.round(product.average_rating || 0) ? "fill-yellow-400" : ""}`}
                    strokeWidth={1.5}
                  />
                ))}
                <span className="ml-1 text-xs text-muted-foreground">
                  {product.average_rating?.toFixed(1)} ({product.review_count})
                </span>
              </div>
            )}
            <div className="flex items-center mt-2">
              <p className="text-2xl font-semibold">{formatPrice(product.price)}</p>
              {product.stock_quantity === 0 ? (
                <Badge variant="destructive" className="ml-4">
                  Out of Stock
                </Badge>
              ) : (
                <Badge variant="outline" className="ml-4">
                  {product.stock_quantity} in stock
                </Badge>
              )}
            </div>
          </div>

          <p className="text-muted-foreground">{product.description}</p>

          {merchant && (
            <div>
              <p className="text-sm text-muted-foreground">
                Sold by{" "}
                <Link href={`/merchants/${merchant._id}`} className="text-primary hover:underline">
                  {merchant.business_name}
                </Link>
              </p>
            </div>
          )}

          <Separator />

          {/* Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="mr-4">Quantity:</span>
              <div className="flex items-center border rounded">
                <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock_quantity}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="flex-1" onClick={handleAddToCart} disabled={product.stock_quantity === 0}>
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
              <Button variant="outline" size="lg" onClick={toggleWishlist}>
                <Heart
                  className={`h-5 w-5 ${product && isWishlisted(product._id) ? "fill-current text-red-500" : ""}`}
                />
                <span className="sr-only md:not-sr-only md:ml-2">
                  {product && isWishlisted(product._id) ? "Remove from Wishlist" : "Add to Wishlist"}
                </span>
              </Button>
            </div>
          </div>

          {/* Product Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="flex items-center space-x-2">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">Free shipping</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">Secure payment</span>
            </div>
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">30-day returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-12">
        <Tabs defaultValue="description">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="p-4 border rounded-lg mt-4">
            <div className="prose max-w-none">
              <p>{product.description}</p>
              {/* Add more detailed description here */}
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, enim id luctus vulputate, nunc
                augue tincidunt lorem, eget aliquam eros nunc eget ex. Duis non felis vitae lacus malesuada malesuada.
                Sed ac libero at sem aliquet eleifend.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="specifications" className="p-4 border rounded-lg mt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-muted-foreground">Category</div>
                <div>Electronics</div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-2">
                <div className="text-muted-foreground">Weight</div>
                <div>0.5 kg</div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-2">
                <div className="text-muted-foreground">Dimensions</div>
                <div>10 x 5 x 2 cm</div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-2">
                <div className="text-muted-foreground">Material</div>
                <div>Aluminum, Plastic</div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="p-4 border rounded-lg mt-4">
            <ReviewForm productId={id} onReviewSubmitted={handleReviewSubmitted} />
            <div className="mt-8">
              <ReviewList key={reviewRefreshKey} productId={id} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">You might also like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {product.related_products?.map((product, index) => {
            return <ProductCard key={product._id + String(index)} product={product} />;
          })}
        </div>
      </div>
    </div>
  );
}

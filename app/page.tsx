import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, ShoppingBag, TrendingUp, Award, ShieldCheck } from "lucide-react";
import ProductCard from "@/components/products/product-card";

// Mock data for the homepage
const featuredProducts = [
  {
    _id: "67dc5e66c23a258959031f14",
    name: "Yellow Chair",
    description: "Beautifull Chair",
    price: 100.01,
    category_id: "93767247-0593-483a-8a86-7bd548a3cc20",
    stock_quantity: 100,
    images: ["https://res.cloudinary.com/deb6ctgzv/image/upload/v1742495267/mdibobutwrpvhxngkvr7.jpg"],
    merchant_id: "67dc482cab9f827d712ad321",
  },
  {
    _id: "67dd90ee8a8689b7733368f2",
    name: "Nike Dunk High",
    description: "Comfortable Shoes",
    price: 100,
    category_id: "d274e67e-9f13-4630-823b-4b4cc4b1b422",
    stock_quantity: 1,
    images: ["https://res.cloudinary.com/deb6ctgzv/image/upload/v1742573771/ymh91f22jtkgutwqw1zb.webp"],
    merchant_id: "67dc482cab9f827d712ad321",
    is_active: true,
  },
  {
    _id: "67dd91598a8689b7733368f4",
    name: "Tracer Shoe",
    description: "Comfortable Tracer Shoe",
    price: 99.99,
    category_id: "d274e67e-9f13-4630-823b-4b4cc4b1b422",
    stock_quantity: 1,
    images: ["https://res.cloudinary.com/deb6ctgzv/image/upload/v1742573909/m4pswche8jiozw7xfg3y.webp"],
    merchant_id: {
      $oid: "67dc482cab9f827d712ad321",
    },
    is_active: true,
  },
  {
    _id: "67ddaa042e742d46c5e62acf",
    name: "IPhone 16 ",
    description: "Brand new iPhone 16",
    price: 999,
    category_id: "f488bb16-af12-40be-9a42-c034bca2e70b",
    stock_quantity: 1,
    images: ["https://res.cloudinary.com/deb6ctgzv/image/upload/v1742580219/tuplblbl5vrhtdnojdrn.webp"],
    merchant_id: "67dc482cab9f827d712ad321",
    is_active: true,
  },
];

const newArrivals = [
  {
    _id: "67dc5e66c23a258959031f14",
    name: "Yellow Chair",
    description: "Beautifull Chair",
    price: 100.01,
    category_id: "93767247-0593-483a-8a86-7bd548a3cc20",
    stock_quantity: 100,
    images: ["https://res.cloudinary.com/deb6ctgzv/image/upload/v1742495267/mdibobutwrpvhxngkvr7.jpg"],
    merchant_id: "67dc482cab9f827d712ad321",
  },
  {
    _id: "67dd90ee8a8689b7733368f2",
    name: "Nike Dunk High",
    description: "Comfortable Shoes",
    price: 100,
    category_id: "d274e67e-9f13-4630-823b-4b4cc4b1b422",
    stock_quantity: 1,
    images: ["https://res.cloudinary.com/deb6ctgzv/image/upload/v1742573771/ymh91f22jtkgutwqw1zb.webp"],
    merchant_id: "67dc482cab9f827d712ad321",
    is_active: true,
  },
  {
    _id: "7",
    name: "Smart Home Hub",
    description: "Control all your smart devices from one central hub",
    price: 149.99,
    category_id: "electronics",
    stock_quantity: 15,
    images: ["/placeholder.svg?height=300&width=300"],
    merchant_id: "merchant3",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    _id: "8",
    name: "Fitness Tracker",
    description: "Track your health metrics with this sleek fitness band",
    price: 59.99,
    category_id: "electronics",
    stock_quantity: 50,
    images: ["/placeholder.svg?height=300&width=300"],
    merchant_id: "merchant2",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const categories = [
  { id: "electronics", name: "Electronics", image: "/placeholder.svg?height=300&width=300" },
  { id: "fashion", name: "Fashion", image: "/placeholder.svg?height=300&width=300" },
  { id: "home", name: "Home & Garden", image: "/placeholder.svg?height=300&width=300" },
  { id: "sports", name: "Sports & Outdoors", image: "/placeholder.svg?height=300&width=300" },
  { id: "beauty", name: "Beauty & Personal Care", image: "/placeholder.svg?height=300&width=300" },
  { id: "toys", name: "Toys & Games", image: "/placeholder.svg?height=300&width=300" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero section */}
      <section className="bg-muted py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Discover Amazing Products for Every Need
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Shop the latest trends, find the best deals, and enjoy a seamless shopping experience with our curated
                marketplace.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" asChild>
                  <Link href="/products">
                    Shop Now <ShoppingBag className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/categories">
                    Browse Categories <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <Image src="/hero.png" alt="Hero image" width={500} height={500} className="rounded-lg object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Categories section */}
      <section className="py-12 px-4 md:px-6">
        <div className="container">
          <div className="flex flex-col gap-2 mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Shop by Category</h2>
            <p className="text-muted-foreground">Find exactly what you need in our extensive category selection</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link key={category.id} href={`/categories/${category.id}`}>
                <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative h-32">
                    <Image
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardHeader className="p-3">
                    <CardTitle className="text-center text-base">{category.name}</CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Product tabs section */}
      <section className="py-12 px-4 md:px-6 bg-muted/50">
        <div className="container">
          <Tabs defaultValue="featured" className="w-full">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold tracking-tight">Our Products</h2>
              <TabsList>
                <TabsTrigger value="featured">Featured</TabsTrigger>
                <TabsTrigger value="new">New Arrivals</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="featured" className="mt-0">
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product._id} product={product as any} />
                ))}
              </div>
              <div className="mt-8 text-center">
                <Button variant="outline" size="lg" asChild>
                  <Link href="/products">View All Products</Link>
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="new" className="mt-0">
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {newArrivals.map((product) => (
                  <ProductCard key={product._id} product={product as any} />
                ))}
              </div>
              <div className="mt-8 text-center">
                <Button variant="outline" size="lg" asChild>
                  <Link href="/products">View All Products</Link>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Features section */}
      <section className="py-12 px-4 md:px-6">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-background">
              <CardHeader className="pb-2">
                <TrendingUp className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Trending Products</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Shop our most popular products, hand-picked by our team and loved by customers.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="bg-background">
              <CardHeader className="pb-2">
                <Award className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Quality Guarantee</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>All our products are carefully vetted for quality and performance.</CardDescription>
              </CardContent>
            </Card>
            <Card className="bg-background">
              <CardHeader className="pb-2">
                <ShieldCheck className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Secure Shopping</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Shop with confidence with our secure payment system and buyer protection.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-12 px-4 md:px-6 bg-primary text-primary-foreground">
        <div className="container">
          <div className="flex flex-col items-center text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Ready to start shopping?</h2>
            <p className="text-primary-foreground/80 max-w-[600px] md:text-lg">
              Join thousands of satisfied customers and experience the best online shopping platform.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">Create an Account</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

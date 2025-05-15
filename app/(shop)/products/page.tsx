"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { productsApi, categoriesApi } from "@/lib/api-client";
import type { Product, Category } from "@/types";
import ProductCard from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal, Search, XIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category_id") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [searchImage, setSearchImage] = useState<File>();
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState<string>("newest");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesApi.getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Failed to load categories. Please try again later.");
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      if (searchImage) {
        try {
          const data = await productsApi.getProdocutsByImage(searchImage);
          setProducts(data.products);
          setSelectedCategory(data.category_id);
        } finally {
          setLoading(false);
        }
        return;
      }

      try {
        const params: Record<string, string | number> = {
          skip: (currentPage - 1) * itemsPerPage,
          limit: itemsPerPage,
        };

        if (searchQuery) params.search = searchQuery;
        if (selectedCategory) params.category_id = selectedCategory;
        if (priceRange[0] > 0) params.min_price = priceRange[0];
        if (priceRange[1] < 1000) params.max_price = priceRange[1];

        const data = await productsApi.getProducts(params);
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery, selectedCategory, priceRange, currentPage, searchImage]);

  // Keep searchQuery in sync with URL
  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    // Update the URL with the new search query
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (searchQuery) {
      params.set("search", searchQuery);
    } else {
      params.delete("search");
    }
    router.push(`?${params.toString()}`);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Sort products based on the selected sort option
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "name":
        return a.name.localeCompare(b.name);
      case "newest":
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start gap-8">
        {/* Filters (desktop) */}
        <div className="hidden md:block w-64 space-y-6">
          <div>
            <h3 className="font-medium mb-3">Categories</h3>
            <RadioGroup value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="" id="all-categories" />
                <Label htmlFor="all-categories">All Categories</Label>
              </div>
              {categories.map((category) => (
                <div key={category._id} className="flex items-center space-x-2">
                  <RadioGroupItem value={category._id} id={category._id} />
                  <Label htmlFor={category._id}>{category.name}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          <div>
            <h3 className="font-medium mb-3">Price Range</h3>
            <div className="space-y-4">
              <Slider
                min={0}
                max={1000}
                step={10}
                value={[priceRange[0], priceRange[1]]}
                onValueChange={(value) => setPriceRange([value[0], value[1]])}
              />
              <div className="flex items-center justify-between">
                <span>₹{priceRange[0]}</span>
                <span>₹{priceRange[1]}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-medium mb-3">Sort By</h3>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 w-full">
          {/* Search bar and filter toggle */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div
                className="relative w-full flex"
                onDrop={(e) => {
                  console.log("reviced image");
                  e.preventDefault();
                  if (e.dataTransfer.files) {
                    setSearchImage(e.dataTransfer.files[0]);
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
              >
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="flex-1"
                  value={searchQuery}
                  onDrop={(e) => {
                    e.preventDefault();

                    console.log("reviced image");
                    if (e.dataTransfer.files) {
                      setSearchImage(e.dataTransfer.files[0]);
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  disabled={searchImage !== undefined}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                {searchImage && (
                  <div className="absolute top-0 bottom-0 right-0 w-[120px] border border-black ">
                    <Image objectFit="cover" src={URL.createObjectURL(searchImage)} fill alt="search_image" />
                    <Button
                      className="absolute top-0 right-0 size-4 rounded-full translate-x-1/2 -translate-y-1/2"
                      size={"icon"}
                      variant="destructive"
                      onClick={() => setSearchImage(undefined)}
                    >
                      <XIcon />
                    </Button>
                  </div>
                )}
              </div>

              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={toggleFilters} className="md:hidden flex items-center">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mobile filters */}
          {showFilters && (
            <div className="md:hidden mb-6 p-4 border rounded-lg">
              <h3 className="font-medium mb-3">Filters</h3>

              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Categories</h4>
                <RadioGroup value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="" id="mobile-all-categories" />
                    <Label htmlFor="mobile-all-categories">All Categories</Label>
                  </div>
                  {categories.map((category) => (
                    <div key={`mobile-${category._id}`} className="flex items-center space-x-2">
                      <RadioGroupItem value={category._id} id={`mobile-${category._id}`} />
                      <Label htmlFor={`mobile-${category._id}`}>{category.name}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Price Range</h4>
                <div className="space-y-4">
                  <Slider
                    min={0}
                    max={1000}
                    step={10}
                    value={[priceRange[0], priceRange[1]]}
                    onValueChange={(value) => setPriceRange([value[0], value[1]])}
                  />
                  <div className="flex items-center justify-between">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                </div>
              </div>

              <Button className="w-full" onClick={toggleFilters}>
                Apply Filters
              </Button>
            </div>
          )}

          {/* Products grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center p-8 text-red-500">{error}</div>
          ) : sortedProducts.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-lg text-muted-foreground">No products found.</p>
              <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map((product, index) => (
                <ProductCard key={product._id + String(index)} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && sortedProducts.length > 0 && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={sortedProducts.length < itemsPerPage}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { getCookie, setCookie, deleteCookie } from "cookies-next";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type FetchOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  isFormData?: boolean;
  skipAuth?: boolean;
};

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}

async function fetchApi(endpoint: string, options: FetchOptions = {}) {
  const { method = "GET", headers = {}, body, isFormData = false, skipAuth = false } = options;

  // Prepare headers
  const requestHeaders: Record<string, string> = {
    ...headers,
  };

  if (!isFormData && body) {
    requestHeaders["Content-Type"] = "application/json";
  }

  // Add auth token if available and not skipped
  if (!skipAuth) {
    const token = getCookie("access_token") as string;
    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  // Prepare request options
  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: "include",
  };

  // Add body if provided
  if (body) {
    if (isFormData) {
      requestOptions.body = body;
    } else {
      requestOptions.body = JSON.stringify(body);
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get("content-type");
    const data = contentType?.includes("application/json") ? await response.json() : await response.text();

    if (!response.ok) {
      throw new ApiError(response.status, response.statusText || "An error occurred", data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, (error as Error).message || "Network error", null);
  }
}

// Auth API
export const authApi = {
  register: (userData: any) =>
    fetchApi("/api/v1/auth/register", {
      method: "POST",
      body: userData,
      skipAuth: true,
    }),

  login: async (username: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    const data = await fetchApi("/api/v1/auth/login", {
      method: "POST",
      body: formData,
      isFormData: true,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      skipAuth: true,
    });

    if (data.access_token) {
      setCookie("access_token", data.access_token);
    }

    return data;
  },

  logout: () => {
    deleteCookie("access_token");
  },

  getCurrentUser: () => fetchApi("/api/v1/users/me"),

  updateProfile: (userData: any) =>
    fetchApi("/api/v1/users/me", {
      method: "PUT",
      body: userData,
    }),
};

// Products API
export const productsApi = {
  getProducts: (params?: {
    category_id?: string;
    merchant_id?: string;
    search?: string;
    min_price?: number;
    max_price?: number;
    skip?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }

    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return fetchApi(`/api/v1/products${query}`);
  },

  getProdocutsByImage: (image: File) => {
    const formData = new FormData();
    formData.append("image", image);

    const result = fetchApi("/api/v1/products/search/image", {
      method: "POST",
      isFormData: true,
      body: formData,
    });
    return result;
  },

  getProduct: (id: string) => fetchApi(`/api/v1/products/${id}`),

  createProduct: (productData: any) =>
    fetchApi("/api/v1/products", {
      method: "POST",
      body: productData,
    }),

  updateProduct: (id: string, productData: any) =>
    fetchApi(`/api/v1/products/${id}`, {
      method: "PUT",
      body: productData,
    }),

  deleteProduct: (id: string) =>
    fetchApi(`/api/v1/products/${id}`, {
      method: "DELETE",
    }),

  getMerchantProducts: () => fetchApi("/api/v1/products/merchant/inventory"),
};

// Categories API
export const categoriesApi = {
  getCategories: () => fetchApi("/api/v1/categories"),

  getCategoryTree: () => fetchApi("/api/v1/categories/tree"),

  getCategory: (id: string) => fetchApi(`/api/v1/categories/${id}`),

  createCategory: (categoryData: any) =>
    fetchApi("/api/v1/categories", {
      method: "POST",
      body: categoryData,
    }),

  updateCategory: (id: string, categoryData: any) =>
    fetchApi(`/api/v1/categories/${id}`, {
      method: "PUT",
      body: categoryData,
    }),

  deleteCategory: (id: string) =>
    fetchApi(`/api/v1/categories/${id}`, {
      method: "DELETE",
    }),
};

// Merchants API
export const merchantsApi = {
  getMerchants: () => fetchApi("/api/v1/merchants"),

  getMerchant: (id: string) => fetchApi(`/api/v1/merchants/${id}`),

  createMerchant: (merchantData: any) =>
    fetchApi("/api/v1/merchants", {
      method: "POST",
      body: merchantData,
    }),

  getMerchantProfile: () => fetchApi("/api/v1/merchants/me"),

  updateMerchantProfile: (merchantData: any) =>
    fetchApi("/api/v1/merchants/me", {
      method: "PUT",
      body: merchantData,
    }),
};

// Orders API
export const ordersApi = {
  getOrders: (params?: { status?: string; skip?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }

    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return fetchApi(`/api/v1/orders${query}`);
  },

  getOrder: (id: string) => fetchApi(`/api/v1/orders/${id}`),

  createOrder: (orderData: any) =>
    fetchApi("/api/v1/orders", {
      method: "POST",
      body: orderData,
    }),

  updateOrder: (id: string, orderData: any) =>
    fetchApi(`/api/v1/orders/${id}`, {
      method: "PUT",
      body: orderData,
    }),

  getMerchantOrders: (params?: { status?: string; skip?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }

    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return fetchApi(`/api/v1/orders/merchant/orders${query}`);
  },
};

export const uploadApi = {
  uploadImage: async (image: Blob) => {
    const formData = new FormData();
    formData.append("image", image);
    const data = await fetchApi("/upload", {
      method: "POST",
      body: formData,
      isFormData: true,
    });
    return data.data.url;
  },
};

export { fetchApi };

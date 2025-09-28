// Common request utilities and configurations
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  timeout: 30000, // 30 seconds
  defaultHeaders: {
    "Content-Type": "application/json",
  },
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Common request wrapper with error handling
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_CONFIG.baseURL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      ...API_CONFIG.defaultHeaders,
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available (client-side only)
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new ApiError(
        `Request failed: ${response.statusText}`,
        response.status,
        response.statusText
      );
    }

    // Handle empty responses
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    } else {
      return response.text() as T;
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network or other errors
    throw new ApiError(
      error instanceof Error ? error.message : "Unknown error occurred",
      0,
      "Network Error"
    );
  }
};

// Request interceptors for common operations
export const requestInterceptors = {
  // Add loading states, retry logic, etc.
  withLoading: <T>(
    requestFn: () => Promise<T>,
    setLoading?: (loading: boolean) => void
  ) => {
    return async (): Promise<T> => {
      try {
        setLoading?.(true);
        const result = await requestFn();
        return result;
      } finally {
        setLoading?.(false);
      }
    };
  },

  // Retry failed requests
  withRetry: <T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ) => {
    return async (): Promise<T> => {
      let lastError: Error;

      for (let i = 0; i <= maxRetries; i++) {
        try {
          return await requestFn();
        } catch (error) {
          lastError = error as Error;

          if (i < maxRetries) {
            await new Promise((resolve) =>
              setTimeout(resolve, delay * (i + 1))
            );
          }
        }
      }

      throw lastError!;
    };
  },
};

// Common response types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

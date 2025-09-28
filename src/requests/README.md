# Requests Folder

This folder contains all API request functions for the krauklagamina travel website.

## Structure

- `index.ts` - Main export file for all request functions
- `trips.ts` - Trip-related API calls (get trips, search, featured trips)
- `contact.ts` - Contact form, newsletter, and contact settings API calls
- `auth.ts` - Authentication API calls (login, register, profile management)
- `utils.ts` - Common utilities, error handling, and request helpers

## Usage

```typescript
import { getTrips, submitContactForm, loginUser } from "@/requests";

// Get trips with filters
const trips = await getTrips({ destination: "Kreta", priceMax: 1000 });

// Submit contact form
const result = await submitContactForm({
  name: "Jonas Jonaitis",
  email: "jonas@example.com",
  message: "Noriu sužinoti daugiau apie keliones į Kretą",
});

// Login user
const authResult = await loginUser({
  email: "user@example.com",
  password: "password123",
});
```

## Configuration

Set the API base URL in your environment variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
# or for production
NEXT_PUBLIC_API_URL=https://yourapi.com/api
```

## Error Handling

All request functions use the `ApiError` class for consistent error handling:

```typescript
try {
  const trips = await getTrips();
} catch (error) {
  if (error instanceof ApiError) {
    console.log("API Error:", error.message, error.status);
  }
}
```

## Features

- TypeScript support with full type definitions
- Automatic JWT token handling for authenticated requests
- Built-in error handling with custom ApiError class
- Request interceptors for loading states and retry logic
- Consistent response formats
- Environment-based configuration

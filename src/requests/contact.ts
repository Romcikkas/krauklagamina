// Base API URL - adjust according to your backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
  tripId?: string; // Optional - if inquiring about specific trip
}

export interface ContactSettings {
  phone: string;
  email: string;
  address?: string;
  workingHours?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

export interface ContactResponse {
  success: boolean;
  message: string;
}

// Send contact form
export const submitContactForm = async (
  data: ContactFormData
): Promise<ContactResponse> => {
  const response = await fetch(`${API_BASE_URL}/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to send message: ${response.statusText}`);
  }

  return response.json();
};

// Get contact settings (phone, email, etc.)
export const getContactSettings = async (): Promise<ContactSettings> => {
  const response = await fetch(`${API_BASE_URL}/contact/settings`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch contact settings: ${response.statusText}`);
  }

  return response.json();
};

// Subscribe to newsletter
export const subscribeNewsletter = async (
  email: string
): Promise<ContactResponse> => {
  const response = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error(`Failed to subscribe: ${response.statusText}`);
  }

  return response.json();
};

// Request trip quote
export const requestTripQuote = async (
  tripId: string,
  contactData: ContactFormData
): Promise<ContactResponse> => {
  const response = await fetch(`${API_BASE_URL}/trips/${tripId}/quote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(contactData),
  });

  if (!response.ok) {
    throw new Error(`Failed to request quote: ${response.statusText}`);
  }

  return response.json();
};

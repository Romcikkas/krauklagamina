export type BadgeType =
  | "dienos-kaina"
  | "egzotine-kelione"
  | "paskutine-minute"
  | "Populiarus"
  | "viskas-iskaiciuota";

export interface Trip {
  id: number;
  destination: string;
  date: string;
  duration: string;
  hotelName?: string;
  hotelStars?: number;
  rating?: number;
  category: string;
  description?: string;
  currentPrice: number;
  originalPrice?: number;
  image: string;
  badges: BadgeType[];
  // Modal informacija
  additionalFeatures?: string[];
  flightInfo?: string;
  baggage?: string;
  busTravel?: string;
  insurance?: string;
  phoneNumber?: string;
  email?: string;
  facebook?: string;
  instagram?: string;
}

export interface ContactSettings {
  defaultPhone: string;
  defaultEmail: string;
  defaultFacebook: string;
  defaultInstagram: string;
}

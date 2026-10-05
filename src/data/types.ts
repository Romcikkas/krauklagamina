export type BadgeType =
  | "dienos-kaina"
  | "egzotine-kelione"
  | "paskutine-minute"
  | "Populiarus"
  | "viskas-iskaiciuota";

export interface Trip {
  id: number;
  destination: string; // Backward compatibility - old field
  destinationLt?: string;
  destinationEn?: string;
  destinationPl?: string;
  date?: string | null;
  duration?: string | null;
  hotelName?: string;
  hotelStars?: number;
  rating?: number;
  category?: string;
  description?: string; // Backward compatibility - old field
  descriptionLt?: string;
  descriptionEn?: string;
  descriptionPl?: string;
  currentPrice: number;
  originalPrice?: number;
  image: string;
  badges: BadgeType[];
  // Modal informacija
  additionalFeatures?: string[]; // Backward compatibility - old field
  additionalFeaturesLt?: string[];
  additionalFeaturesEn?: string[];
  additionalFeaturesPl?: string[];
  flightInfo?: string; // Backward compatibility - old field
  flightInfoLt?: string;
  flightInfoEn?: string;
  flightInfoPl?: string;
  baggage?: string; // Backward compatibility - old field
  baggageLt?: string;
  baggageEn?: string;
  baggagePl?: string;
  busTravel?: string; // Backward compatibility - old field
  busTravelLt?: string;
  busTravelEn?: string;
  busTravelPl?: string;
  insurance?: string;
  phoneNumber?: string;
  email?: string;
  facebook?: string;
  instagram?: string;
  transportType?: string;
  travelType?: string;
  countries?: string[];
  externalUrl?: string;
  source?: string;
}

export interface ContactSettings {
  defaultPhone: string;
  defaultEmail: string;
  defaultFacebook: string;
  defaultInstagram: string;
}

export interface TripSettings {
  showBusTrips: boolean;
  showFlyTrips: boolean;
  showGrudaWidget: boolean;
}

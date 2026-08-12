export type Service = {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  duration: string;
  highlights: string[];
  bestFor: string;
};

export const services: Service[] = [
  {
    id: "regular-clean",
    name: "Regular clean",
    description: "Weekly or fortnightly home cleaning for busy households.",
    basePrice: 45,
    duration: "2-3 hours",
    bestFor: "Busy homes that need a dependable reset every week or fortnight.",
    highlights: ["Kitchen and bathrooms", "Floors and surfaces", "Flexible recurring slots"]
  },
  {
    id: "deep-clean",
    name: "Deep clean",
    description: "A more detailed clean for resets, guests, or seasonal refreshes.",
    basePrice: 95,
    duration: "4-6 hours",
    bestFor: "Homes that need a proper top-to-bottom refresh before guests, events, or a new season.",
    highlights: ["Appliances and detail work", "Skirting boards", "Inside cupboards"]
  },
  {
    id: "end-of-tenancy",
    name: "End of tenancy",
    description: "Move-out cleaning aimed at landlords, tenants, and agents.",
    basePrice: 145,
    duration: "6+ hours",
    bestFor: "Tenants, landlords, and agents who need an inventory-ready finish.",
    highlights: ["Inventory-ready finish", "Oven add-on available", "Receipt provided"]
  }
];

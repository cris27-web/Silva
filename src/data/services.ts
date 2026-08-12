export type AddOn = {
  id: string;
  name: string;
  description: string;
  price: number;
};

export type Service = {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  duration: string;
  highlights: string[];
  bestFor: string;
  included: string[];
  notIncluded: string[];
  priceNotes: string;
  suggestedAddOns: string[];
};

export const bookingSlots = ["09:00", "11:30", "14:00", "16:30"];

export const addOns: AddOn[] = [
  {
    id: "oven-clean",
    name: "Oven clean",
    description: "Interior oven clean for move-outs or deep cleans.",
    price: 35
  },
  {
    id: "inside-fridge",
    name: "Inside fridge",
    description: "Empty fridge interior wipe-down and shelves cleaned.",
    price: 18
  },
  {
    id: "inside-cupboards",
    name: "Inside cupboards",
    description: "Interior cupboard wipe-down for kitchens or storage areas.",
    price: 24
  },
  {
    id: "interior-windows",
    name: "Interior windows",
    description: "Interior glass and sill clean for reachable windows.",
    price: 28
  },
  {
    id: "laundry-ironing",
    name: "Laundry or ironing",
    description: "One small laundry or ironing batch added to the visit.",
    price: 22
  },
  {
    id: "pet-hair-detail",
    name: "Pet hair detail",
    description: "Extra vacuuming and detail time for pet hair build-up.",
    price: 20
  },
  {
    id: "priority-deep-areas",
    name: "Priority deep-clean areas",
    description: "Extra detail time for marked rooms or problem areas.",
    price: 30
  }
];

export const services: Service[] = [
  {
    id: "regular-clean",
    name: "Regular clean",
    description: "Weekly or fortnightly home cleaning for busy households.",
    basePrice: 45,
    duration: "2-3 hours",
    bestFor: "Busy homes that need a dependable reset every week or fortnight.",
    highlights: ["Kitchen and bathrooms", "Floors and surfaces", "Flexible recurring slots"],
    included: ["Kitchen surfaces and sink", "Bathroom clean", "Dusting reachable surfaces", "Vacuum and mop floors"],
    notIncluded: ["Inside appliances", "Inside cupboards", "Exterior windows", "Heavy post-build cleaning"],
    priceNotes: "Final estimate adjusts for bedrooms, bathrooms, and selected add-ons.",
    suggestedAddOns: ["laundry-ironing", "pet-hair-detail", "interior-windows"]
  },
  {
    id: "deep-clean",
    name: "Deep clean",
    description: "A more detailed clean for resets, guests, or seasonal refreshes.",
    basePrice: 95,
    duration: "4-6 hours",
    bestFor: "Homes that need a proper top-to-bottom refresh before guests, events, or a new season.",
    highlights: ["Appliances and detail work", "Skirting boards", "Inside cupboards"],
    included: ["Regular clean tasks", "Skirting boards and door frames", "Appliance exteriors", "Detail work in kitchens and bathrooms"],
    notIncluded: ["Carpet cleaning machine", "Mould remediation", "Pest or biohazard cleaning", "Exterior windows"],
    priceNotes: "Add-ons help reserve time for appliances, cupboards, windows, or priority areas.",
    suggestedAddOns: ["oven-clean", "inside-fridge", "inside-cupboards", "priority-deep-areas"]
  },
  {
    id: "end-of-tenancy",
    name: "End of tenancy",
    description: "Move-out cleaning aimed at landlords, tenants, and agents.",
    basePrice: 145,
    duration: "6+ hours",
    bestFor: "Tenants, landlords, and agents who need an inventory-ready finish.",
    highlights: ["Inventory-ready finish", "Oven add-on available", "Receipt provided"],
    included: ["Deep clean tasks", "Kitchen and bathroom detail", "Cupboard exterior wipe-down", "Floors and reachable surfaces"],
    notIncluded: ["Professional carpet extraction", "Wall repainting", "Exterior windows", "Waste removal"],
    priceNotes: "Tenancy cleans vary most by condition and add-ons. Add notes for inventory priorities.",
    suggestedAddOns: ["oven-clean", "inside-fridge", "inside-cupboards", "interior-windows"]
  }
];

export const getService = (serviceId: string) => services.find((service) => service.id === serviceId);
export const getAddOn = (addOnId: string) => addOns.find((addOn) => addOn.id === addOnId);

export const normalizeAddOnIds = (selectedAddOns: unknown) => {
  if (!Array.isArray(selectedAddOns)) return [];
  return Array.from(new Set(selectedAddOns.filter((item): item is string => typeof item === "string" && Boolean(getAddOn(item)))));
};

export const calculateBookingPrice = (serviceId: string, bedrooms: number, bathrooms: number, selectedAddOns: unknown = []) => {
  const service = getService(serviceId);
  if (!service) return null;

  const safeBedrooms = Math.min(Math.max(Number(bedrooms) || 1, 1), 8);
  const safeBathrooms = Math.min(Math.max(Number(bathrooms) || 1, 1), 6);
  const propertyAdjustment = Math.max(0, safeBedrooms - 1) * 12 + Math.max(0, safeBathrooms - 1) * 10;
  const addOnIds = normalizeAddOnIds(selectedAddOns);
  const selectedAddOnDetails = addOnIds.map((id) => getAddOn(id)).filter((item): item is AddOn => Boolean(item));
  const addOnsTotal = selectedAddOnDetails.reduce((sum, addOn) => sum + addOn.price, 0);

  return {
    service,
    bedrooms: safeBedrooms,
    bathrooms: safeBathrooms,
    propertyAdjustment,
    addOns: selectedAddOnDetails,
    addOnIds,
    addOnsTotal,
    totalAmount: service.basePrice + propertyAdjustment + addOnsTotal
  };
};

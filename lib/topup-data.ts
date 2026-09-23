export interface DataPlan {
  id: string;
  network: string;
  data: string;
  priceNaira: number;
  validity: string;
  frequency: "daily" | "weekly" | "monthly";
}

export const DATA_PLANS: DataPlan[] = [
  {
    id: "mtn-500mb",
    network: "MTN",
    data: "500 MB",
    priceNaira: 300,
    validity: "30 days",
    frequency: "monthly",
  },
  {
    id: "mtn-1.5gb",
    network: "MTN",
    data: "1.5 GB",
    priceNaira: 500,
    validity: "30 days",
    frequency: "monthly",
  },
  {
    id: "mtn-3gb",
    network: "MTN",
    data: "3 GB",
    priceNaira: 1000,
    validity: "30 days",
    frequency: "monthly",
  },
  {
    id: "mtn-6gb",
    network: "MTN",
    data: "6 GB",
    priceNaira: 1500,
    validity: "30 days",
    frequency: "monthly",
  },
  {
    id: "glo-1gb",
    network: "Glo",
    data: "1 GB",
    priceNaira: 400,
    validity: "30 days",
    frequency: "monthly",
  },
  {
    id: "glo-3gb",
    network: "Glo",
    data: "3 GB",
    priceNaira: 900,
    validity: "30 days",
    frequency: "monthly",
  },
  {
    id: "glo-8gb",
    network: "Glo",
    data: "8 GB",
    priceNaira: 1500,
    validity: "30 days",
    frequency: "monthly",
  },
  {
    id: "airtel-750mb",
    network: "Airtel",
    data: "750 MB",
    priceNaira: 350,
    validity: "30 days",
    frequency: "monthly",
  },
  {
    id: "airtel-2gb",
    network: "Airtel",
    data: "2 GB",
    priceNaira: 600,
    validity: "30 days",
    frequency: "monthly",
  },
  {
    id: "airtel-4.5gb",
    network: "Airtel",
    data: "4.5 GB",
    priceNaira: 1200,
    validity: "30 days",
    frequency: "monthly",
  },
  {
    id: "9mobile-1gb",
    network: "9mobile",
    data: "1 GB",
    priceNaira: 400,
    validity: "30 days",
    frequency: "monthly",
  },
  {
    id: "9mobile-2.5gb",
    network: "9mobile",
    data: "2.5 GB",
    priceNaira: 800,
    validity: "30 days",
    frequency: "monthly",
  },
  {
    id: "mtn-75mb-daily",
    network: "MTN",
    data: "75 MB",
    priceNaira: 75,
    validity: "1 Day",
    frequency: "daily",
  },
  {
    id: "mtn-100mb-daily",
    network: "MTN",
    data: "100 MB",
    priceNaira: 100,
    validity: "1 Day",
    frequency: "daily",
  },
  {
    id: "airtel-100mb-daily",
    network: "Airtel",
    data: "100 MB",
    priceNaira: 100,
    validity: "1 Day",
    frequency: "daily",
  },
  {
    id: "glo-200mb-weekly",
    network: "Glo",
    data: "200 MB",
    priceNaira: 200,
    validity: "7 Days",
    frequency: "weekly",
  },
  {
    id: "mtn-2gb-weekly",
    network: "MTN",
    data: "2 GB",
    priceNaira: 750,
    validity: "7 Days",
    frequency: "weekly",
  },
  {
    id: "9mobile-1.5gb-weekly",
    network: "9mobile",
    data: "1.5 GB",
    priceNaira: 700,
    validity: "7 Days",
    frequency: "weekly",
  },
];

export const NETWORKS = [
  { id: "mtn", name: "MTN", initials: "MTN", bg: "#FFCC08", fg: "#000000" },
  {
    id: "airtel",
    name: "Airtel",
    initials: "Airtel",
    bg: "#ED1C24",
    fg: "#FFFFFF",
  },
  { id: "glo", name: "Glo", initials: "Glo", bg: "#00A651", fg: "#FFFFFF" },
  {
    id: "9mobile",
    name: "9mobile",
    initials: "9mobile",
    bg: "#00A99D",
    fg: "#FFFFFF",
  },
];

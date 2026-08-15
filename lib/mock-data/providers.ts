import { DataPlan, ElectricityProvider, NetworkProvider } from "@/lib/types";

export const networkProviders: NetworkProvider[] = [
  { id: "mtn", name: "MTN", color: "#FFCC08", logoInitial: "M" },
  { id: "airtel", name: "Airtel", color: "#E5484D", logoInitial: "A" },
  { id: "glo", name: "Glo", color: "#22A559", logoInitial: "G" },
  { id: "9mobile", name: "9mobile", color: "#0EA894", logoInitial: "9" },
];

export const dataPlans: DataPlan[] = [
  { id: "dp1", providerId: "mtn", label: "Daily 100MB", size: "100MB", validity: "1 day", price: 100, costPrice: 85 },
  { id: "dp2", providerId: "mtn", label: "Weekly 1.5GB", size: "1.5GB", validity: "7 days", price: 500, costPrice: 460 },
  { id: "dp3", providerId: "mtn", label: "Monthly 5GB", size: "5GB", validity: "30 days", price: 1500, costPrice: 1380 },
  { id: "dp4", providerId: "mtn", label: "Monthly 10GB", size: "10GB", validity: "30 days", price: 2500, costPrice: 2320 },
  { id: "dp5", providerId: "airtel", label: "Daily 200MB", size: "200MB", validity: "1 day", price: 100, costPrice: 88 },
  { id: "dp6", providerId: "airtel", label: "Weekly 2GB", size: "2GB", validity: "7 days", price: 600, costPrice: 555 },
  { id: "dp7", providerId: "airtel", label: "Monthly 6GB", size: "6GB", validity: "30 days", price: 1800, costPrice: 1670 },
  { id: "dp8", providerId: "glo", label: "Weekly 2.5GB", size: "2.5GB", validity: "7 days", price: 550, costPrice: 505 },
  { id: "dp9", providerId: "glo", label: "Monthly 7.5GB", size: "7.5GB", validity: "30 days", price: 2000, costPrice: 1860 },
  { id: "dp10", providerId: "9mobile", label: "Weekly 1GB", size: "1GB", validity: "7 days", price: 450, costPrice: 410 },
  { id: "dp11", providerId: "9mobile", label: "Monthly 4.5GB", size: "4.5GB", validity: "30 days", price: 1600, costPrice: 1475 },
];

export const electricityProviders: ElectricityProvider[] = [
  { id: "ikeja-electric", name: "Ikeja Electric (IKEDC)", region: "Lagos" },
  { id: "eko-electric", name: "Eko Electricity (EKEDC)", region: "Lagos" },
  { id: "abuja-electric", name: "Abuja Electricity (AEDC)", region: "Abuja/FCT" },
  { id: "kano-electric", name: "Kano Electricity (KEDCO)", region: "Kano" },
  { id: "ph-electric", name: "Port Harcourt Electric", region: "Rivers" },
  { id: "ibadan-electric", name: "Ibadan Electricity (IBEDC)", region: "Oyo" },
  { id: "enugu-electric", name: "Enugu Electricity (EEDC)", region: "Enugu" },
];

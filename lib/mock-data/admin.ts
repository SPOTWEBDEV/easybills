// Mock data powering the admin panel. In a real backend, each of these
// would be replaced by a fetch to an authenticated admin API endpoint —
// the shapes here are designed to mirror realistic REST responses.

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  walletBalance: number;
  tier: "Tier 1" | "Tier 2" | "Tier 3";
  kycStatus: "unverified" | "pending" | "verified";
  status: "active" | "suspended";
  joinedAt: string;
}

export interface AdminAgent {
  id: string;
  name: string;
  email: string;
  totalSales: number;
  commissionEarned: number;
  status: "active" | "suspended" | "pending";
  tier: "Bronze" | "Silver" | "Gold";
  joinedAt: string;
}

export interface AdminCommission {
  id: string;
  agentName: string;
  reference: string;
  service: string;
  amount: number;
  rate: string;
  date: string;
  status: "paid" | "pending";
}

export interface AdminProduct {
  id: string;
  name: string;
  category: string;
  provider: string;
  costPrice: number;
  sellPrice: number;
  status: "active" | "inactive";
}

export interface AdminProvider {
  id: string;
  name: string;
  type: "Network" | "Electricity" | "Cable" | "Exams" | "Betting";
  apiStatus: "connected" | "degraded" | "offline";
  commissionRate: string;
  lastSync: string;
}

export interface AdminPricingRule {
  id: string;
  service: string;
  costPrice: number;
  marginPercent: number;
  sellPrice: number;
  updatedAt: string;
}

export interface AdminOrder {
  id: string;
  reference: string;
  customer: string;
  service: string;
  amount: number;
  status: "success" | "pending" | "failed";
  date: string;
}

export interface AdminCoupon {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  value: number;
  usageLimit: number;
  used: number;
  expiresAt: string;
  status: "active" | "expired" | "scheduled";
}

export interface AdminAnnouncement {
  id: string;
  title: string;
  audience: "All users" | "Agents" | "New users";
  status: "published" | "scheduled" | "draft";
  publishedAt: string;
}

export interface AdminNotificationLog {
  id: string;
  title: string;
  channel: "push" | "email" | "sms";
  sentTo: number;
  sentAt: string;
  status: "delivered" | "sending" | "failed";
}

export interface AdminReport {
  id: string;
  name: string;
  type: string;
  dateRange: string;
  generatedAt: string;
  format: "CSV" | "PDF";
}

export interface AdminTicket {
  id: string;
  subject: string;
  customer: string;
  priority: "low" | "medium" | "high";
  status: "open" | "in_progress" | "resolved";
  assignedTo: string;
  updatedAt: string;
}

export interface AdminBlogPost {
  id: string;
  title: string;
  author: string;
  status: "draft" | "published";
  publishedAt: string;
  views: number;
}

export interface AdminPage {
  id: string;
  title: string;
  slug: string;
  status: "published" | "draft";
  updatedAt: string;
}

export interface AdminRole {
  id: string;
  name: string;
  usersCount: number;
  permissions: string[];
}

export interface AdminAuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  ipAddress: string;
}

export interface AdminActivityLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  device: string;
}

export interface AdminApiKey {
  id: string;
  label: string;
  keyPreview: string;
  createdAt: string;
  lastUsed: string;
  status: "active" | "revoked";
}

const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();
const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();

export const adminOverviewStats = {
  revenue: 48_320_500,
  revenueChange: 12.4,
  sales: 214_830,
  salesChange: 8.1,
  transactions: 312_004,
  transactionsChange: 5.6,
  activeUsers: 18_642,
  activeUsersChange: -1.2,
};

export const revenueTrend = [
  { month: "Feb", revenue: 5_200_000, sales: 24_100 },
  { month: "Mar", revenue: 5_950_000, sales: 26_800 },
  { month: "Apr", revenue: 6_100_000, sales: 27_950 },
  { month: "May", revenue: 6_850_000, sales: 30_200 },
  { month: "Jun", revenue: 7_420_000, sales: 32_640 },
  { month: "Jul", revenue: 8_180_000, sales: 35_310 },
  { month: "Aug", revenue: 8_620_500, sales: 37_840 },
];

export const topServices = [
  { name: "Airtime", value: 38 },
  { name: "Data", value: 29 },
  { name: "Electricity", value: 18 },
  { name: "Cable TV", value: 9 },
  { name: "Exam Pins", value: 6 },
];

export const walletFundingTrend = [
  { day: "Mon", amount: 4_200_000 },
  { day: "Tue", amount: 3_850_000 },
  { day: "Wed", amount: 5_100_000 },
  { day: "Thu", amount: 4_760_000 },
  { day: "Fri", amount: 6_020_000 },
  { day: "Sat", amount: 7_340_000 },
  { day: "Sun", amount: 5_580_000 },
];

export const adminCustomers: AdminCustomer[] = [
  { id: "usr_001", name: "Ngozi Adeyemi", email: "ngozi.adeyemi@example.com", phone: "0803 456 7890", walletBalance: 84250.75, tier: "Tier 2", kycStatus: "verified", status: "active", joinedAt: daysAgo(180) },
  { id: "usr_002", name: "Chidera Okafor", email: "chidera.okafor@example.com", phone: "0805 112 3344", walletBalance: 12500, tier: "Tier 1", kycStatus: "pending", status: "active", joinedAt: daysAgo(45) },
  { id: "usr_003", name: "Bashir Mohammed", email: "bashir.m@example.com", phone: "0902 981 2211", walletBalance: 231000, tier: "Tier 3", kycStatus: "verified", status: "active", joinedAt: daysAgo(310) },
  { id: "usr_004", name: "Funmilayo Ade", email: "funmi.ade@example.com", phone: "0701 553 8890", walletBalance: 0, tier: "Tier 1", kycStatus: "unverified", status: "suspended", joinedAt: daysAgo(12) },
  { id: "usr_005", name: "Emeka Nwosu", email: "emeka.nwosu@example.com", phone: "0812 774 5521", walletBalance: 55420, tier: "Tier 2", kycStatus: "verified", status: "active", joinedAt: daysAgo(95) },
  { id: "usr_006", name: "Aisha Bello", email: "aisha.bello@example.com", phone: "0909 220 6634", walletBalance: 3200, tier: "Tier 1", kycStatus: "pending", status: "active", joinedAt: daysAgo(20) },
  { id: "usr_007", name: "Tunde Bakare", email: "tunde.bakare@example.com", phone: "0803 990 1120", walletBalance: 178900, tier: "Tier 3", kycStatus: "verified", status: "active", joinedAt: daysAgo(400) },
  { id: "usr_008", name: "Ifeoma Chukwu", email: "ifeoma.chukwu@example.com", phone: "0706 442 8871", walletBalance: 9600, tier: "Tier 1", kycStatus: "unverified", status: "active", joinedAt: daysAgo(6) },
  { id: "usr_009", name: "Musa Ibrahim", email: "musa.ibrahim@example.com", phone: "0813 667 2290", walletBalance: 41200, tier: "Tier 2", kycStatus: "verified", status: "suspended", joinedAt: daysAgo(150) },
  { id: "usr_010", name: "Blessing Eze", email: "blessing.eze@example.com", phone: "0904 331 5567", walletBalance: 68750, tier: "Tier 2", kycStatus: "verified", status: "active", joinedAt: daysAgo(60) },
];

export const adminAgents: AdminAgent[] = [
  { id: "agt_001", name: "Kelechi Obi", email: "kelechi.obi@example.com", totalSales: 4_820_000, commissionEarned: 96_400, status: "active", tier: "Gold", joinedAt: daysAgo(300) },
  { id: "agt_002", name: "Grace Udo", email: "grace.udo@example.com", totalSales: 2_150_000, commissionEarned: 43_000, status: "active", tier: "Silver", joinedAt: daysAgo(210) },
  { id: "agt_003", name: "Yusuf Suleiman", email: "yusuf.s@example.com", totalSales: 890_000, commissionEarned: 17_800, status: "pending", tier: "Bronze", joinedAt: daysAgo(9) },
  { id: "agt_004", name: "Patience Okon", email: "patience.okon@example.com", totalSales: 6_040_000, commissionEarned: 120_800, status: "active", tier: "Gold", joinedAt: daysAgo(400) },
  { id: "agt_005", name: "Segun Alabi", email: "segun.alabi@example.com", totalSales: 310_000, commissionEarned: 6_200, status: "suspended", tier: "Bronze", joinedAt: daysAgo(70) },
];

export const adminCommissions: AdminCommission[] = [
  { id: "com_001", agentName: "Kelechi Obi", reference: "EB-88213AZ9", service: "Airtime", amount: 1_200, rate: "3.0%", date: hoursAgo(3), status: "paid" },
  { id: "com_002", agentName: "Patience Okon", reference: "EB-77102FQ3", service: "Data", amount: 2_400, rate: "3.5%", date: hoursAgo(8), status: "paid" },
  { id: "com_003", agentName: "Grace Udo", reference: "EB-56034LK1", service: "Electricity", amount: 900, rate: "2.0%", date: hoursAgo(20), status: "pending" },
  { id: "com_004", agentName: "Yusuf Suleiman", reference: "EB-90218WM7", service: "Cable TV", amount: 500, rate: "2.5%", date: daysAgo(2), status: "pending" },
  { id: "com_005", agentName: "Kelechi Obi", reference: "EB-33871QY0", service: "Airtime", amount: 1_800, rate: "3.0%", date: daysAgo(3), status: "paid" },
];

export const adminProducts: AdminProduct[] = [
  { id: "prd_001", name: "MTN Airtime", category: "Airtime", provider: "MTN", costPrice: 980, sellPrice: 1000, status: "active" },
  { id: "prd_002", name: "Airtel Airtime", category: "Airtime", provider: "Airtel", costPrice: 975, sellPrice: 1000, status: "active" },
  { id: "prd_003", name: "MTN 5GB Monthly", category: "Data", provider: "MTN", costPrice: 1380, sellPrice: 1500, status: "active" },
  { id: "prd_004", name: "Glo 7.5GB Monthly", category: "Data", provider: "Glo", costPrice: 1860, sellPrice: 2000, status: "active" },
  { id: "prd_005", name: "Ikeja Electric Prepaid", category: "Electricity", provider: "IKEDC", costPrice: 10000, sellPrice: 10100, status: "active" },
  { id: "prd_006", name: "DStv Compact", category: "Cable TV", provider: "DStv", costPrice: 18950, sellPrice: 19000, status: "active" },
  { id: "prd_007", name: "WAEC Result Checker PIN", category: "Exam Pins", provider: "WAEC", costPrice: 3400, sellPrice: 3600, status: "inactive" },
  { id: "prd_008", name: "JAMB ePIN (UTME)", category: "Exam Pins", provider: "JAMB", costPrice: 6200, sellPrice: 6500, status: "active" },
];

export const adminProviders: AdminProvider[] = [
  { id: "prv_001", name: "MTN Nigeria", type: "Network", apiStatus: "connected", commissionRate: "2.0%", lastSync: hoursAgo(1) },
  { id: "prv_002", name: "Airtel Nigeria", type: "Network", apiStatus: "connected", commissionRate: "2.5%", lastSync: hoursAgo(1) },
  { id: "prv_003", name: "Glo", type: "Network", apiStatus: "degraded", commissionRate: "2.2%", lastSync: hoursAgo(6) },
  { id: "prv_004", name: "9mobile", type: "Network", apiStatus: "connected", commissionRate: "2.0%", lastSync: hoursAgo(2) },
  { id: "prv_005", name: "Ikeja Electric (IKEDC)", type: "Electricity", apiStatus: "connected", commissionRate: "1.0%", lastSync: hoursAgo(1) },
  { id: "prv_006", name: "Eko Electric (EKEDC)", type: "Electricity", apiStatus: "connected", commissionRate: "1.0%", lastSync: hoursAgo(3) },
  { id: "prv_007", name: "DStv / GOtv", type: "Cable", apiStatus: "connected", commissionRate: "0.5%", lastSync: hoursAgo(1) },
  { id: "prv_008", name: "WAEC", type: "Exams", apiStatus: "offline", commissionRate: "1.5%", lastSync: daysAgo(2) },
  { id: "prv_009", name: "Bet9ja Wallet", type: "Betting", apiStatus: "connected", commissionRate: "1.0%", lastSync: hoursAgo(4) },
];

export const adminPricingRules: AdminPricingRule[] = [
  { id: "prc_001", service: "MTN Airtime", costPrice: 980, marginPercent: 2.0, sellPrice: 1000, updatedAt: daysAgo(4) },
  { id: "prc_002", service: "Airtel Airtime", costPrice: 975, marginPercent: 2.5, sellPrice: 1000, updatedAt: daysAgo(4) },
  { id: "prc_003", service: "MTN Data Bundles", costPrice: 1380, marginPercent: 8.0, sellPrice: 1500, updatedAt: daysAgo(9) },
  { id: "prc_004", service: "Electricity (all DisCos)", costPrice: 10000, marginPercent: 1.0, sellPrice: 10100, updatedAt: daysAgo(15) },
  { id: "prc_005", service: "Cable TV", costPrice: 18950, marginPercent: 0.3, sellPrice: 19000, updatedAt: daysAgo(20) },
  { id: "prc_006", service: "Exam Pins", costPrice: 3400, marginPercent: 5.8, sellPrice: 3600, updatedAt: daysAgo(30) },
];

export const adminOrders: AdminOrder[] = [
  { id: "ord_001", reference: "EB-88213AZ9", customer: "Ngozi Adeyemi", service: "MTN Airtime", amount: 1000, status: "success", date: hoursAgo(1) },
  { id: "ord_002", reference: "EB-77102FQ3", customer: "Chidera Okafor", service: "Airtel 6GB Data", amount: 1800, status: "success", date: hoursAgo(5) },
  { id: "ord_003", reference: "EB-56034LK1", customer: "Bashir Mohammed", service: "Ikeja Electric", amount: 10000, status: "success", date: hoursAgo(26) },
  { id: "ord_004", reference: "EB-33871QY0", customer: "Emeka Nwosu", service: "DStv Compact", amount: 19000, status: "pending", date: hoursAgo(2) },
  { id: "ord_005", reference: "EB-42093RT4", customer: "Aisha Bello", service: "MTN 1.5GB Data", amount: 500, status: "failed", date: hoursAgo(48) },
  { id: "ord_006", reference: "EB-11205BN8", customer: "Tunde Bakare", service: "Glo Airtime", amount: 2000, status: "success", date: daysAgo(3) },
  { id: "ord_007", reference: "EB-64420ZP2", customer: "Ifeoma Chukwu", service: "JAMB ePIN", amount: 6500, status: "success", date: daysAgo(4) },
  { id: "ord_008", reference: "EB-70921XQ5", customer: "Musa Ibrahim", service: "9mobile Data", amount: 1200, status: "pending", date: daysAgo(1) },
  { id: "ord_009", reference: "EB-15530MC3", customer: "Blessing Eze", service: "Eko Electric", amount: 15000, status: "success", date: daysAgo(5) },
  { id: "ord_010", reference: "EB-98761PL0", customer: "Funmilayo Ade", service: "GOtv Max", amount: 6400, status: "failed", date: daysAgo(6) },
];

export const adminCoupons: AdminCoupon[] = [
  { id: "cpn_001", code: "WELCOME500", discountType: "fixed", value: 500, usageLimit: 1000, used: 612, expiresAt: daysAgo(-20), status: "active" },
  { id: "cpn_002", code: "DATA10", discountType: "percentage", value: 10, usageLimit: 500, used: 480, expiresAt: daysAgo(-5), status: "active" },
  { id: "cpn_003", code: "NEWYEAR25", discountType: "percentage", value: 25, usageLimit: 2000, used: 2000, expiresAt: daysAgo(30), status: "expired" },
  { id: "cpn_004", code: "AGENTBOOST", discountType: "fixed", value: 1000, usageLimit: 200, used: 0, expiresAt: daysAgo(-45), status: "scheduled" },
];

export const adminAnnouncements: AdminAnnouncement[] = [
  { id: "ann_001", title: "New: JAMB ePIN now available", audience: "All users", status: "published", publishedAt: daysAgo(2) },
  { id: "ann_002", title: "Scheduled maintenance — Aug 10, 1am–3am", audience: "All users", status: "scheduled", publishedAt: daysAgo(-6) },
  { id: "ann_003", title: "Agent commission rates increasing", audience: "Agents", status: "published", publishedAt: daysAgo(9) },
  { id: "ann_004", title: "Welcome bonus for new signups", audience: "New users", status: "draft", publishedAt: daysAgo(0) },
];

export const adminNotificationLogs: AdminNotificationLog[] = [
  { id: "ntf_001", title: "Payment successful confirmations", channel: "push", sentTo: 12480, sentAt: hoursAgo(1), status: "delivered" },
  { id: "ntf_002", title: "Weekly cashback summary", channel: "email", sentTo: 18642, sentAt: hoursAgo(20), status: "delivered" },
  { id: "ntf_003", title: "OTP delivery batch", channel: "sms", sentTo: 942, sentAt: hoursAgo(2), status: "delivered" },
  { id: "ntf_004", title: "Service outage alert — Glo", channel: "push", sentTo: 3200, sentAt: daysAgo(1), status: "failed" },
  { id: "ntf_005", title: "New agent tier upgrade", channel: "email", sentTo: 84, sentAt: daysAgo(2), status: "sending" },
];

export const adminReports: AdminReport[] = [
  { id: "rpt_001", name: "Monthly Revenue Report", type: "Revenue", dateRange: "Jul 1 – Jul 31, 2026", generatedAt: daysAgo(3), format: "CSV" },
  { id: "rpt_002", name: "Agent Commission Statement", type: "Commissions", dateRange: "Jul 1 – Jul 31, 2026", generatedAt: daysAgo(3), format: "PDF" },
  { id: "rpt_003", name: "Failed Transactions Report", type: "Transactions", dateRange: "Last 7 days", generatedAt: daysAgo(1), format: "CSV" },
  { id: "rpt_004", name: "KYC Compliance Report", type: "Compliance", dateRange: "Q2 2026", generatedAt: daysAgo(10), format: "PDF" },
  { id: "rpt_005", name: "Wallet Funding Summary", type: "Wallet", dateRange: "Last 30 days", generatedAt: daysAgo(2), format: "CSV" },
];

export const adminTickets: AdminTicket[] = [
  { id: "tkt_001", subject: "Airtime not delivered but wallet debited", customer: "Aisha Bello", priority: "high", status: "in_progress", assignedTo: "Support — Chika", updatedAt: hoursAgo(2) },
  { id: "tkt_002", subject: "Can't verify BVN for Tier 3 upgrade", customer: "Ifeoma Chukwu", priority: "medium", status: "open", assignedTo: "Unassigned", updatedAt: hoursAgo(5) },
  { id: "tkt_003", subject: "Electricity token not received", customer: "Bashir Mohammed", priority: "high", status: "open", assignedTo: "Support — Femi", updatedAt: hoursAgo(1) },
  { id: "tkt_004", subject: "Question about agent commission payout", customer: "Yusuf Suleiman", priority: "low", status: "resolved", assignedTo: "Support — Chika", updatedAt: daysAgo(2) },
  { id: "tkt_005", subject: "Refund not reflecting in wallet", customer: "Musa Ibrahim", priority: "medium", status: "in_progress", assignedTo: "Support — Femi", updatedAt: hoursAgo(9) },
];

export const adminBlogPosts: AdminBlogPost[] = [
  { id: "blg_001", title: "5 tips to save on monthly data subscriptions", author: "EasyBills Team", status: "published", publishedAt: daysAgo(6), views: 4210 },
  { id: "blg_002", title: "How EasyBills agents earn commission", author: "EasyBills Team", status: "published", publishedAt: daysAgo(14), views: 8930 },
  { id: "blg_003", title: "Understanding prepaid vs postpaid meters", author: "Chika O.", status: "draft", publishedAt: daysAgo(0), views: 0 },
  { id: "blg_004", title: "JAMB 2026 registration: what you need to know", author: "Femi A.", status: "published", publishedAt: daysAgo(30), views: 15600 },
];

export const adminPages: AdminPage[] = [
  { id: "pg_001", title: "About Us", slug: "/about", status: "published", updatedAt: daysAgo(40) },
  { id: "pg_002", title: "Terms of Service", slug: "/terms", status: "published", updatedAt: daysAgo(12) },
  { id: "pg_003", title: "Privacy Policy", slug: "/privacy", status: "published", updatedAt: daysAgo(12) },
  { id: "pg_004", title: "Refund Policy", slug: "/refund-policy", status: "published", updatedAt: daysAgo(60) },
  { id: "pg_005", title: "Become an Agent", slug: "/become-an-agent", status: "published", updatedAt: daysAgo(20) },
  { id: "pg_006", title: "Developer API (draft)", slug: "/developer-api", status: "draft", updatedAt: daysAgo(3) },
];

export const adminRoles: AdminRole[] = [
  { id: "rl_001", name: "Super Admin", usersCount: 2, permissions: ["Full access"] },
  { id: "rl_002", name: "Operations Manager", usersCount: 4, permissions: ["Transactions", "Orders", "Wallets", "Reports"] },
  { id: "rl_003", name: "Support Agent", usersCount: 9, permissions: ["Support Tickets", "Customers (read-only)"] },
  { id: "rl_004", name: "Content Editor", usersCount: 3, permissions: ["Blog", "Pages", "Announcements"] },
  { id: "rl_005", name: "Finance", usersCount: 3, permissions: ["Revenue", "Commissions", "Pricing", "Profit Settings"] },
];

export const adminAuditLogs: AdminAuditLog[] = [
  { id: "adt_001", actor: "admin@easybills.example", action: "Updated pricing rule", target: "MTN Data Bundles", timestamp: hoursAgo(2), ipAddress: "197.210.55.12" },
  { id: "adt_002", actor: "finance@easybills.example", action: "Approved withdrawal", target: "usr_003 — ₦45,000", timestamp: hoursAgo(4), ipAddress: "197.210.55.44" },
  { id: "adt_003", actor: "admin@easybills.example", action: "Suspended user account", target: "usr_004 — Funmilayo Ade", timestamp: daysAgo(1), ipAddress: "197.210.55.12" },
  { id: "adt_004", actor: "support@easybills.example", action: "Resolved support ticket", target: "tkt_004", timestamp: daysAgo(2), ipAddress: "105.112.9.201" },
  { id: "adt_005", actor: "admin@easybills.example", action: "Generated API key", target: "Mobile App — Production", timestamp: daysAgo(5), ipAddress: "197.210.55.12" },
  { id: "adt_006", actor: "content@easybills.example", action: "Published blog post", target: "blg_004", timestamp: daysAgo(30), ipAddress: "105.112.9.88" },
];

export const adminActivityLogs: AdminActivityLog[] = [
  { id: "act_001", user: "Ngozi Adeyemi", action: "Logged in", timestamp: hoursAgo(1), device: "iPhone 15 — Safari" },
  { id: "act_002", user: "Bashir Mohammed", action: "Funded wallet — ₦50,000", timestamp: hoursAgo(3), device: "Android — Chrome" },
  { id: "act_003", user: "Tunde Bakare", action: "Changed password", timestamp: hoursAgo(6), device: "Windows — Edge" },
  { id: "act_004", user: "Aisha Bello", action: "Purchased data bundle", timestamp: hoursAgo(8), device: "Android — App" },
  { id: "act_005", user: "Emeka Nwosu", action: "Enabled 2FA", timestamp: daysAgo(1), device: "iPhone 14 — App" },
  { id: "act_006", user: "Blessing Eze", action: "Withdrew to bank — ₦20,000", timestamp: daysAgo(1), device: "Android — Chrome" },
];

export const adminApiKeys: AdminApiKey[] = [
  { id: "key_001", label: "Mobile App — Production", keyPreview: "eb_live_4f2a...9c31", createdAt: daysAgo(120), lastUsed: hoursAgo(1), status: "active" },
  { id: "key_002", label: "Internal Dashboard", keyPreview: "eb_live_a91b...02de", createdAt: daysAgo(200), lastUsed: hoursAgo(4), status: "active" },
  { id: "key_003", label: "Legacy Integration", keyPreview: "eb_live_00c7...ff10", createdAt: daysAgo(400), lastUsed: daysAgo(90), status: "revoked" },
  { id: "key_004", label: "Partner Sandbox", keyPreview: "eb_test_77dd...4b21", createdAt: daysAgo(15), lastUsed: daysAgo(2), status: "active" },
];

export const pendingWithdrawals = [
  { id: "wd_001", customer: "Bashir Mohammed", amount: 45000, bank: "GTBank", accountNumber: "0123456789", requestedAt: hoursAgo(2) },
  { id: "wd_002", customer: "Tunde Bakare", amount: 120000, bank: "Zenith Bank", accountNumber: "0198765432", requestedAt: hoursAgo(6) },
  { id: "wd_003", customer: "Blessing Eze", amount: 20000, bank: "Access Bank", accountNumber: "0055667788", requestedAt: hoursAgo(10) },
];

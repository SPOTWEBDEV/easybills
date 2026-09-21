import { Poppins } from "next/font/google";

// Used only within the admin dashboard and its login screen — the public
// landing site keeps its own Space Grotesk / Inter / IBM Plex Mono type
// system (see src/app/layout.tsx).
export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

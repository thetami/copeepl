import { EmployerDashboardClient } from "@/components/EmployerDashboardClient";
import { getCompanyBySlug } from "@/lib/mock-data";

export default function EmployerDashboardPage() {
  // Placeholder until employer auth/company-claiming is wired up — this
  // stands in for "the company the logged-in employer manages".
  const company = getCompanyBySlug("brightside-retail")!;

  return <EmployerDashboardClient company={company} />;
}

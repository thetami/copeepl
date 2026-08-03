import { AssessmentSubmissionFlow } from "@/components/AssessmentSubmissionFlow";
import { getCompanyBySlug } from "@/lib/mock-data";

export default function EmployerAssessmentPage() {
  const company = getCompanyBySlug("brightside-retail")!;

  return <AssessmentSubmissionFlow companyName={company.name} />;
}

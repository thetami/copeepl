import { CompanyCard } from "@/components/CompanyCard";
import { MOCK_COMPANIES } from "@/lib/mock-data";
import Link from "next/link";

export default function CompaniesPage() {
  return (
    <main className="min-h-screen bg-warm">
      <div className="bg-azure px-8 pt-16 pb-12 text-center">
        <div className="mb-4 text-[11px] font-medium uppercase tracking-[0.15em] text-teal">
          Family-proven workplaces
        </div>
        <h1 className="mx-auto mb-5 max-w-[520px] font-serif text-[42px] leading-[1.1] text-white">
          Find companies that <em className="text-teal">actually</em> support
          family life
        </h1>
        <p className="mx-auto mb-8 max-w-[400px] text-[15px] font-light leading-[1.6] text-white/65">
          Verified by parents and carers with direct experience of the
          company&apos;s policies and lived culture.
        </p>
        <div className="mb-8 inline-block rounded-lg border border-teal/30 bg-teal/[0.12] px-5 py-2.5 text-[13px] italic text-white/80">
          <strong className="font-semibold not-italic text-teal">4 in 6</strong>{" "}
          mothers in our founder&apos;s maternity group left their jobs.
          We&apos;re changing that.
        </div>
        <div className="mx-auto flex max-w-[460px] items-center gap-2 rounded-xl bg-white py-1 pl-4 pr-1">
          <input
            type="text"
            placeholder="Search companies, industries or roles..."
            className="flex-1 border-none bg-transparent text-sm text-ink outline-none"
          />
          <span className="whitespace-nowrap rounded-lg bg-azure px-5 py-2.5 text-[13px] font-medium text-white">
            Search
          </span>
        </div>
      </div>

      <div className="px-8 py-10">
        <div className="mb-1 font-serif text-[26px] text-ink">
          Verified family-friendly employers
        </div>
        <div className="mb-6 text-[13px] text-ink-light">
          Scored by parents and carers
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5">
          {MOCK_COMPANIES.map((company) => (
            <Link key={company.slug} href={`/companies/${company.slug}`}>
              <CompanyCard
                name={company.name}
                industry={company.industry}
                employeeCount={company.employeeCount}
                verified={company.verified}
                score={company.score}
                reviewCount={company.reviewCount}
                recommendPercent={company.recommendPercent}
              />
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

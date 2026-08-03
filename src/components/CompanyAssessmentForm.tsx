"use client";

import { useMemo, useState } from "react";

type ChoiceValue = string;
type MultiChoiceValue = string[];
type GroupValue = Record<string, string>;
type TextValue = string;
type AnswerValue = ChoiceValue | MultiChoiceValue | GroupValue | TextValue;

type AssessmentAnswers = Record<string, AnswerValue>;

interface BaseQuestion {
  id: string;
  text: string;
  section: string;
}

interface ChoiceQuestion extends BaseQuestion {
  type: "choice";
  options: string[];
}

interface MultiChoiceQuestion extends BaseQuestion {
  type: "multi-choice";
  options: string[];
}

interface GroupPart {
  id: string;
  label: string;
  options: string[];
}

interface GroupQuestion extends BaseQuestion {
  type: "group";
  parts: GroupPart[];
}

interface TextQuestion extends BaseQuestion {
  type: "text";
  placeholder: string;
  maxLength: number;
}

type Question = ChoiceQuestion | MultiChoiceQuestion | GroupQuestion | TextQuestion;

const QUESTIONS: Question[] = [
  {
    id: "maternityPay",
    section: "Parental Leave",
    type: "choice",
    text: "What is your enhanced maternity pay?",
    options: [
      "Statutory only",
      "Up to 4 weeks full pay",
      "Up to 12 weeks full pay",
      "Up to 26 weeks full pay",
      "Full pay for full leave",
    ],
  },
  {
    id: "paternityLeave",
    section: "Parental Leave",
    type: "choice",
    text: "What is your enhanced paternity or partner leave?",
    options: [
      "Statutory only",
      "2 weeks full pay",
      "4 weeks full pay",
      "More than 4 weeks full pay",
    ],
  },
  {
    id: "sharedParentalLeave",
    section: "Parental Leave",
    type: "choice",
    text: "Do you offer shared parental leave enhancement?",
    options: ["Yes — same as maternity", "Yes — partial", "Statutory only"],
  },
  {
    id: "flexibleRequestTiming",
    section: "Flexible Working",
    type: "choice",
    text: "When can employees request flexible working?",
    options: ["From day one", "After probation", "After 6 months", "After 1 year"],
  },
  {
    id: "flexibleArrangements",
    section: "Flexible Working",
    type: "multi-choice",
    text: "What flexible arrangements do you actively support?",
    options: [
      "Part time",
      "Compressed hours",
      "Job share",
      "Remote",
      "Hybrid",
      "Flexible start and finish",
      "Term-time only",
    ],
  },
  {
    id: "flexibleWorkerBreakdown",
    section: "Flexible Working",
    type: "group",
    text: "About your flexible workers — please share what you know:",
    parts: [
      {
        id: "workforcePercent",
        label: "% of workforce",
        options: ["Under 10%", "10–25%", "25–50%", "Over 50%", "We don't track this"],
      },
      {
        id: "seniorityLevels",
        label: "Seniority levels",
        options: [
          "Junior only",
          "Up to middle management",
          "Up to senior management",
          "All levels including leadership",
        ],
      },
      {
        id: "genderSplit",
        label: "Gender split",
        options: [
          "Predominantly women 75%+",
          "Majority women",
          "Roughly equal",
          "Majority men",
          "We don't track this",
        ],
      },
    ],
  },
  {
    id: "carersPolicy",
    section: "Culture and Support",
    type: "choice",
    text: "Do you have a formal carer's policy beyond parents?",
    options: ["Yes — publicly available", "Yes — internal only", "No"],
  },
  {
    id: "emergencyDependantLeave",
    section: "Culture and Support",
    type: "choice",
    text: "Do you offer emergency dependant leave beyond the legal minimum?",
    options: ["Yes", "No", "We follow statutory minimum"],
  },
  {
    id: "leadershipParentalLeave",
    section: "Culture and Support",
    type: "choice",
    text: "In the last 12 months, has anyone in a senior leadership role taken parental leave?",
    options: ["Yes", "No", "Not applicable", "Prefer not to say"],
  },
  {
    id: "leaveInclusionInReviews",
    section: "Culture and Support",
    type: "choice",
    text: "Are employees on parental or carer leave included in company-wide pay reviews, bonus cycles and promotion considerations?",
    options: ["Yes, always", "Usually", "No", "We don't have formal processes for this"],
  },
  {
    id: "returnToWorkProgramme",
    section: "Culture and Support",
    type: "choice",
    text: "Do you have a return-to-work programme for people returning from extended leave?",
    options: ["Yes — formal programme", "Yes — informal support", "No"],
  },
  {
    id: "proudestSupport",
    section: "Open Question",
    type: "text",
    text: "What do you do for parents and carers that you're most proud of — that isn't captured above?",
    placeholder: "Optional — tell us about anything that doesn't fit the questions above.",
    maxLength: 500,
  },
];

interface CompanyAssessmentFormProps {
  companyName: string;
  onSubmit: (answers: AssessmentAnswers) => void;
}

function isGroupComplete(question: GroupQuestion, value: GroupValue | undefined) {
  return question.parts.every((part) => Boolean(value?.[part.id]));
}

function OptionButton({
  option,
  selected,
  onClick,
}: {
  option: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[10px] border px-4 py-3 text-left text-sm transition-colors ${
        selected ? "border-teal bg-teal-pale font-medium text-teal-dark" : "border-warm-mid text-ink"
      }`}
    >
      {option}
    </button>
  );
}

export function CompanyAssessmentForm({ companyName, onSubmit }: CompanyAssessmentFormProps) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AssessmentAnswers>({});

  const question = QUESTIONS[index];
  const isLast = index === QUESTIONS.length - 1;
  const isNewSection = index === 0 || QUESTIONS[index - 1].section !== question.section;

  const canContinue = useMemo(() => {
    switch (question.type) {
      case "choice":
        return Boolean(answers[question.id]);
      case "group":
        return isGroupComplete(question, answers[question.id] as GroupValue | undefined);
      case "multi-choice":
      case "text":
        return true;
    }
  }, [question, answers]);

  function selectChoice(option: string) {
    setAnswers((prev) => ({ ...prev, [question.id]: option }));
  }

  function toggleMultiChoice(option: string) {
    setAnswers((prev) => {
      const current = (prev[question.id] as MultiChoiceValue | undefined) ?? [];
      const next = current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option];
      return { ...prev, [question.id]: next };
    });
  }

  function selectGroupPart(partId: string, option: string) {
    setAnswers((prev) => {
      const current = (prev[question.id] as GroupValue | undefined) ?? {};
      return { ...prev, [question.id]: { ...current, [partId]: option } };
    });
  }

  function setText(value: string) {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  }

  function handleContinue() {
    if (isLast) {
      onSubmit(answers);
      return;
    }
    setIndex((i) => i + 1);
  }

  function handleBack() {
    setIndex((i) => Math.max(0, i - 1));
  }

  return (
    <div className="flex min-h-screen flex-col bg-warm">
      <div className="bg-azure px-8 py-6">
        <div className="mb-1.5 text-xs text-white/50">Family Trust Score Assessment</div>
        <div className="mb-1 font-serif text-[22px] text-white">{companyName}</div>
        <div className="mt-6 h-[3px] bg-white/10">
          <div
            className="h-full bg-teal"
            style={{ width: `${((index + 1) / QUESTIONS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1 px-8 py-7">
        {isNewSection && <p className="mb-2 font-serif text-xl text-ink">{question.section}</p>}
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-teal">
          Question {index + 1} of {QUESTIONS.length}
        </div>
        <div className="mb-5 text-base font-medium leading-[1.4] text-ink">{question.text}</div>

        {question.type === "choice" && (
          <div className="flex flex-col gap-2">
            {question.options.map((option) => (
              <OptionButton
                key={option}
                option={option}
                selected={answers[question.id] === option}
                onClick={() => selectChoice(option)}
              />
            ))}
          </div>
        )}

        {question.type === "multi-choice" && (
          <div className="flex flex-col gap-2">
            {question.options.map((option) => (
              <OptionButton
                key={option}
                option={option}
                selected={((answers[question.id] as MultiChoiceValue | undefined) ?? []).includes(
                  option
                )}
                onClick={() => toggleMultiChoice(option)}
              />
            ))}
          </div>
        )}

        {question.type === "group" && (
          <div className="flex flex-col gap-6">
            {question.parts.map((part) => {
              const groupValue = answers[question.id] as GroupValue | undefined;
              return (
                <div key={part.id}>
                  <p className="text-sm font-semibold text-ink">{part.label}</p>
                  <div className="mt-3 flex flex-col gap-2">
                    {part.options.map((option) => (
                      <OptionButton
                        key={option}
                        option={option}
                        selected={groupValue?.[part.id] === option}
                        onClick={() => selectGroupPart(part.id, option)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {question.type === "text" && (
          <div>
            <textarea
              value={(answers[question.id] as TextValue | undefined) ?? ""}
              onChange={(e) => setText(e.target.value)}
              maxLength={question.maxLength}
              placeholder={question.placeholder}
              rows={5}
              className="w-full rounded-[10px] border border-warm-mid px-4 py-3 text-sm text-ink placeholder:text-ink-light focus:border-teal focus:outline-none"
            />
            <p className="mt-1 text-right text-xs text-ink-light">
              {((answers[question.id] as TextValue | undefined)?.length ?? 0)}/{question.maxLength}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-warm-mid px-8 pt-4 pb-6">
        {index > 0 ? (
          <button type="button" onClick={handleBack} className="text-[13px] text-ink-light">
            ← Back
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={handleContinue}
          disabled={!canContinue}
          className="rounded-full bg-teal px-6 py-2.5 text-sm font-semibold text-azure disabled:opacity-40"
        >
          {isLast ? "Submit" : "Continue →"}
        </button>
      </div>
    </div>
  );
}

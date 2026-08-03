"use client";

import { useMemo, useState } from "react";

interface ReviewFormAnswers {
  employmentStatus?: string;
  relationship?: string;
  supportComparison?: string;
  familyClashHandling?: string;
  returnFromLeave?: string;
  progressionImpact?: string;
  biggestBarrier?: string;
  recommend?: string;
  quote?: string;
}

type AnswerKey = keyof ReviewFormAnswers;

interface BaseQuestion {
  id: AnswerKey;
  text: string;
  skippable?: boolean;
}

interface ChoiceQuestion extends BaseQuestion {
  type: "choice";
  options: string[];
}

interface TextQuestion extends BaseQuestion {
  type: "text";
  placeholder: string;
  maxLength: number;
}

type Question = ChoiceQuestion | TextQuestion;

const QUESTIONS: Question[] = [
  {
    id: "employmentStatus",
    type: "choice",
    text: "Are you a current or former employee?",
    options: ["Current", "Former"],
  },
  {
    id: "relationship",
    type: "choice",
    text: "Which applies to you?",
    options: ["Parent", "Carer", "Both"],
  },
  {
    id: "supportComparison",
    type: "choice",
    text: "How does the company's actual support for parents and carers compare to what you expected when you joined?",
    options: [
      "Much better than I expected",
      "About what I expected",
      "Worse than I expected",
      "Much worse than I expected",
    ],
  },
  {
    id: "familyClashHandling",
    type: "choice",
    text: "When family life clashed with work — a sick child, a school event, a care emergency — your experience was...",
    options: [
      "Always handled with understanding",
      "Usually fine",
      "Hit and miss",
      "Rarely handled well",
      "Never handled well",
    ],
  },
  {
    id: "returnFromLeave",
    type: "choice",
    text: "After returning from parental or carer leave, your role and responsibilities were...",
    options: [
      "Fully protected",
      "Mostly unchanged",
      "Subtly reduced",
      "Significantly reduced",
      "Didn't take leave",
    ],
    skippable: true,
  },
  {
    id: "progressionImpact",
    type: "choice",
    text: "Do you feel having family or caring commitments affects your chances of progression compared to colleagues without them?",
    options: ["Not at all", "Slightly", "Noticeably", "Significantly"],
  },
  {
    id: "biggestBarrier",
    type: "choice",
    text: "The biggest barrier to being a parent or carer at this company was...",
    options: [
      "Manager attitudes",
      "Unwritten cultural expectations",
      "Workload and hours",
      "Lack of flexible options",
      "No significant barriers",
    ],
  },
  {
    id: "recommend",
    type: "choice",
    text: "Would you recommend this company to a close friend who is about to become a parent or has caring responsibilities?",
    options: ["Absolutely yes", "Probably yes", "Probably not", "Definitely not"],
  },
  {
    id: "quote",
    type: "text",
    text: "“If a friend asked you what’s it really like there as a parent, what would you tell them?”",
    placeholder: "Good and bad — honest answers help other parents most.",
    maxLength: 280,
  },
];

interface ReviewFormProps {
  companyName: string;
  skipLeaveQuestion?: boolean;
  onSubmit: (answers: ReviewFormAnswers) => void;
}

export function ReviewForm({ companyName, skipLeaveQuestion = false, onSubmit }: ReviewFormProps) {
  const questions = useMemo(
    () => QUESTIONS.filter((q) => !(skipLeaveQuestion && q.skippable)),
    [skipLeaveQuestion]
  );
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<ReviewFormAnswers>({});

  const question = questions[index];
  const isLast = index === questions.length - 1;
  const canContinue = question.type === "text" || Boolean(answers[question.id]);

  function selectOption(option: string) {
    setAnswers((prev) => ({ ...prev, [question.id]: option }));
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
        <div className="mb-1.5 text-xs text-white/50">Reviewing</div>
        <div className="mb-1 font-serif text-[22px] text-white">{companyName}</div>
        <div className="text-[13px] text-white/60">
          Your review helps other parents make better decisions. Takes under 2 minutes.
        </div>
        <div className="mt-6 h-[3px] bg-white/10">
          <div
            className="h-full bg-teal"
            style={{ width: `${((index + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1 px-8 py-7">
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-teal">
          Question {index + 1} of {questions.length}
        </div>
        <div className="mb-5 text-base font-medium leading-[1.4] text-ink">{question.text}</div>

        {question.type === "choice" ? (
          <div className="flex flex-col gap-2">
            {question.options.map((option) => {
              const selected = answers[question.id] === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => selectOption(option)}
                  className={`rounded-[10px] border px-4 py-3 text-left text-sm transition-colors ${
                    selected
                      ? "border-teal bg-teal-pale font-medium text-teal-dark"
                      : "border-warm-mid text-ink"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        ) : (
          <div>
            <textarea
              value={answers[question.id] ?? ""}
              onChange={(e) => setText(e.target.value)}
              maxLength={question.maxLength}
              placeholder={question.placeholder}
              rows={5}
              className="w-full rounded-[10px] border border-warm-mid px-4 py-3 text-sm text-ink placeholder:text-ink-light focus:border-teal focus:outline-none"
            />
            <p className="mt-1 text-right text-xs text-ink-light">
              {(answers[question.id]?.length ?? 0)}/{question.maxLength}
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

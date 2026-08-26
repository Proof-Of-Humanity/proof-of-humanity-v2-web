import type { ComponentType, SVGProps } from "react";

import ChallengeIcon from "icons/Challenge.svg";
import CheckCircleOutlineIcon from "icons/CheckCircleOutline.svg";
import FlagCheckeredIcon from "icons/FlagCheckered.svg";
import HourglassIcon from "icons/Hourglass.svg";

type OutcomeStep = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  /** Peach-filled dot for the active/first step. */
  accent?: boolean;
  /** Tint for the icon glyph on outlined dots. */
  iconClassName?: string;
};

const STEPS: OutcomeStep[] = [
  {
    icon: FlagCheckeredIcon,
    title: "Submit request",
    description: "Your deposit is locked while the request is open.",
    accent: true,
  },
  {
    icon: HourglassIcon,
    title: "Challenge window",
    description: "Anyone can contest the removal during this period.",
  },
  {
    icon: CheckCircleOutlineIcon,
    title: "If unchallenged",
    description: "The profile is removed and your deposit is refunded.",
    iconClassName: "text-status-registered",
  },
  {
    icon: ChallengeIcon,
    title: "If challenged",
    description: "The dispute is resolved in Kleros Court.",
    iconClassName: "text-peach",
  },
];

/**
 * Deposit summary + outcome timeline shown at the top of the revoke modal.
 * Presentational only so it can be previewed in isolation.
 */
export default function RevokeConsequences({ deposit }: { deposit: string }) {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="border-stroke bg-whiteBackground flex items-center justify-between rounded-2xl border px-4 py-3">
        <div className="text-left">
          <p className="text-secondaryText text-xs">Removal deposit</p>
          <p className="text-status-registered text-xs">
            Refunded if uncontested
          </p>
        </div>
        <span className="text-xl font-semibold text-peach">{deposit}</span>
      </div>

      <ol className="flex flex-col">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === STEPS.length - 1;
          return (
            <li key={step.title} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                    step.accent
                      ? "border-peach text-peach"
                      : `border-stroke ${step.iconClassName ?? "text-secondaryText"}`
                  }`}
                >
                  <Icon className="h-4 w-4 fill-current" />
                </span>
                {!isLast ? (
                  <span className="border-stroke w-0 flex-1 border-l" />
                ) : null}
              </div>
              <div className={`text-left ${isLast ? "pb-0" : "pb-5"}`}>
                <p className="text-primaryText text-sm">{step.title}</p>
                <p className="text-secondaryText mt-0.5 text-xs leading-5">
                  {step.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

import { useEffect, useState } from "react";
import cn from "classnames";
import ChevronDownIcon from "icons/ChevronDown.svg";

interface AccordionProps {
  className?: string;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  /** Toggle-chip size. "sm" (default) is the compact chrome used by embedded
   * flows; "lg" is the roomier request-page toggle. */
  size?: "sm" | "lg";
  /** Unmount children after the close animation so they re-mount (and replay
   * their entrance animations) on the next open. Leave off to preserve child
   * state (e.g. form inputs) across collapses. */
  unmountOnClose?: boolean;
}

const ANIMATION_MS = 550;

const TOGGLE_SIZES = {
  sm: { chip: "h-8 w-8", chevron: "h-4 w-4" },
  lg: { chip: "h-11 w-11", chevron: "h-7 w-7" },
} as const;

const Accordion: React.FC<AccordionProps> = ({
  className,
  title,
  children,
  defaultOpen = false,
  isOpen: propsIsOpen,
  onToggle: propsOnToggle,
  size = "sm",
  unmountOnClose = false,
}) => {
  const toggleSize = TOGGLE_SIZES[size];
  const [internalOpen, setInternalOpen] = useState(defaultOpen);

  const isControlled = propsIsOpen !== undefined;
  const open = isControlled ? propsIsOpen : internalOpen;

  // `isExpanded` drives the height/opacity transition a frame after mount so the
  // collapsed state paints first; `isRendered`/`hasOpened` gate whether children
  // live in the DOM.
  const [isExpanded, setIsExpanded] = useState(open);
  const [isRendered, setIsRendered] = useState(open);
  const [hasOpened, setHasOpened] = useState(open);
  // Once fully open, drop `overflow-hidden` so descendant tooltips/popovers can
  // escape the accordion bounds. Kept hidden while animating (and while closed)
  // so the height transition still clips the growing/collapsing content.
  const [overflowVisible, setOverflowVisible] = useState(open);

  useEffect(() => {
    if (open) {
      setHasOpened(true);
      setIsRendered(true);
      let innerRaf = 0;
      const outerRaf = requestAnimationFrame(() => {
        innerRaf = requestAnimationFrame(() => setIsExpanded(true));
      });
      const overflowTimeout = window.setTimeout(
        () => setOverflowVisible(true),
        ANIMATION_MS,
      );
      return () => {
        cancelAnimationFrame(outerRaf);
        cancelAnimationFrame(innerRaf);
        window.clearTimeout(overflowTimeout);
      };
    }

    setIsExpanded(false);
    setOverflowVisible(false);
    const timeout = window.setTimeout(() => setIsRendered(false), ANIMATION_MS);
    return () => window.clearTimeout(timeout);
  }, [open]);

  const handleToggle = () => {
    if (isControlled && propsOnToggle) {
      propsOnToggle();
    } else {
      setInternalOpen((o) => !o);
    }
  };

  const showChildren = unmountOnClose ? isRendered : hasOpened;

  return (
    <div className={cn("text-primaryText flex flex-col", className)}>
      <button
        type="button"
        aria-expanded={open}
        className="hover:border-orange flex min-h-[62px] w-full cursor-pointer items-center justify-between gap-4 rounded-[22px] border border-[#3A3E48] bg-[#292D35] px-5 py-4 text-left font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition duration-200 ease-premium"
        onClick={handleToggle}
      >
        <span className="min-w-0 flex-1 leading-snug">{title}</span>
        <span
          className={cn(
            "bg-orange flex shrink-0 items-center justify-center rounded-full",
            toggleSize.chip,
          )}
        >
          <ChevronDownIcon
            className={cn(
              "text-[#1E2129] transition-transform duration-300 ease-premium",
              toggleSize.chevron,
              open && "rotate-180",
            )}
          />
        </span>
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] ease-premium",
          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
        style={{ transitionDuration: `${ANIMATION_MS}ms` }}
      >
        <div
          className={cn(
            overflowVisible ? "overflow-visible" : "overflow-hidden",
          )}
        >
          {showChildren && (
            // Once collapsed and settled, hide the persisted content from the
            // tab order and a11y tree (`hasOpened` keeps it mounted otherwise).
            <div
              className={cn("flex flex-col pt-2.5", !isRendered && "invisible")}
              aria-hidden={!open || undefined}
              // `inert` pulls the collapsing subtree out of the tab order (and
              // AT) immediately, so accordion items are not visible to screen readers during animation
              inert={!open ? ("" as unknown as boolean) : undefined}
            >
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Accordion;

import type { ReactNode } from "react";

type ReadingLineProps = {
  children: ReactNode;
  shield: boolean;
};

export function ReadingLine({ children, shield }: ReadingLineProps) {
  return (
    <span className={shield ? "reading-line-shield" : undefined}>
      {children}
    </span>
  );
}

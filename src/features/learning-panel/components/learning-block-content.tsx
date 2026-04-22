import type { TopicDiscussionStep } from "@/features/topic-session";
import { AnchorToken } from "./anchor-token";
import { ReadingLine } from "./reading-line";

type LearningBlockContentProps = {
  step: TopicDiscussionStep;
  shield: boolean;
  isDark: boolean;
  activeReferenceIds: string[];
  onPreviewReference: (referenceId: string) => void;
  onClearPreviewReference: () => void;
  onPinSource: (referenceId: string) => void;
};

export function LearningBlockContent({
  step,
  shield,
  isDark,
  activeReferenceIds,
  onPreviewReference,
  onClearPreviewReference,
  onPinSource,
}: LearningBlockContentProps) {
  switch (step.block.id) {
    case "exp-login-first-proof":
      return (
        <p>
          <ReadingLine shield={shield}>
            The backend cannot verify a JWT during login because no token has
            been issued yet. It must first compare the submitted credentials
            against stored user data and account status.
          </ReadingLine>
        </p>
      );
    case "exp-controller-entry":
      return (
        <p>
          <ReadingLine shield={shield}>
            <AnchorToken
              referenceId="ref-auth-controller"
              isActive={activeReferenceIds.includes("ref-auth-controller")}
              isDark={isDark}
              onPreviewReference={onPreviewReference}
              onClearPreviewReference={onClearPreviewReference}
              onPinSource={onPinSource}
            >
              AuthController
            </AnchorToken>{" "}
            receives the HTTP request because something has to translate the
            outside world into the app's internal flow. But it should hand the
            actual credential truth down to{" "}
            <AnchorToken
              referenceId="ref-auth-service"
              isActive={activeReferenceIds.includes("ref-auth-service")}
              isDark={isDark}
              onPreviewReference={onPreviewReference}
              onClearPreviewReference={onClearPreviewReference}
              onPinSource={onPinSource}
            >
              AuthService
            </AnchorToken>
            .
          </ReadingLine>
        </p>
      );
    case "exp-service-separation":
      return (
        <p>
          <ReadingLine shield={shield}>
            The actual decision about whether credentials are valid belongs in{" "}
            <AnchorToken
              referenceId="ref-auth-service"
              isActive={activeReferenceIds.includes("ref-auth-service")}
              isDark={isDark}
              onPreviewReference={onPreviewReference}
              onClearPreviewReference={onClearPreviewReference}
              onPinSource={onPinSource}
            >
              AuthService
            </AnchorToken>
            . That keeps the transport layer thin and the business rule
            explicit.
          </ReadingLine>
        </p>
      );
    case "exp-controller-thin":
      return (
        <p>
          <ReadingLine shield={shield}>
            <AnchorToken
              referenceId="ref-auth-controller"
              isActive={activeReferenceIds.includes("ref-auth-controller")}
              isDark={isDark}
              onPreviewReference={onPreviewReference}
              onClearPreviewReference={onClearPreviewReference}
              onPinSource={onPinSource}
            >
              AuthController
            </AnchorToken>{" "}
            still owns request parsing, validation annotations, and shaping the
            response. It does not own the meaning of a valid login; it delegates
            that rule.
          </ReadingLine>
        </p>
      );
    case "exp-jwt-after-validation":
      return (
        <p>
          <ReadingLine shield={shield}>
            Only after the backend decides the user is valid does{" "}
            <AnchorToken
              referenceId="ref-jwt-service"
              isActive={activeReferenceIds.includes("ref-jwt-service")}
              isDark={isDark}
              onPreviewReference={onPreviewReference}
              onClearPreviewReference={onClearPreviewReference}
              onPinSource={onPinSource}
            >
              JwtService
            </AnchorToken>{" "}
            sign a token. Later protected requests can trust that token because
            the server itself created it after a successful login.
          </ReadingLine>
        </p>
      );
    case "exp-jwt-trust":
      return (
        <p>
          <ReadingLine shield={shield}>
            A later protected endpoint is not re-checking the raw password. It
            is trusting a server-issued token that already encodes the result of
            a past authentication decision.
          </ReadingLine>
        </p>
      );
    default:
      return (
        <p>
          <ReadingLine shield={shield}>{step.block.content}</ReadingLine>
        </p>
      );
  }
}

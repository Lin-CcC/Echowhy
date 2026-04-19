import type { TopicSession } from "@/features/topic-session";

const topicSessions: Record<string, TopicSession> = {
  "topic-login-jwt": {
  id: "topic-login-jwt",
  title: "Why login does not rely on JWT verification",
  rootQuestion:
    "Why is identity checked with username and password during login instead of with JWT?",
  goal: "Understand how login validates credentials first, then issues JWT for later requests.",
  overview:
    "This topic follows the authentication chain from raw credentials to server-issued proof. The constellation should feel like a quiet map of understanding being earned.",
  explanationBlocks: [
    {
      id: "exp-login-first-proof",
      title: "At login, there is no token yet",
      content:
        "The backend cannot verify a JWT during login because no token has been issued yet. It must first compare the submitted credentials against stored user data and account status.",
      order: 1,
    },
    {
      id: "exp-service-separation",
      title: "Why AuthService carries the check",
      content:
        "The controller receives the HTTP request, but the actual decision about whether credentials are valid belongs in the service layer. That keeps the transport layer thin and the business rule explicit.",
      order: 2,
    },
    {
      id: "exp-jwt-after-validation",
      title: "JWT is proof of a successful past check",
      content:
        "Only after the backend decides the user is valid does JwtService sign a token. Later protected requests can trust that token because the server itself created it after a successful login.",
      order: 3,
    },
  ],
  learningAngles: [
    {
      id: "angle-request-flow",
      title: "Request flow",
      description: "Trace the login request from controller to service to mapper to JWT generation.",
      isCustom: false,
    },
    {
      id: "angle-responsibility",
      title: "Responsibility split",
      description: "Focus on why AuthService owns the credential check rather than the controller.",
      isCustom: false,
    },
    {
      id: "angle-jwt-timing",
      title: "JWT timing",
      description: "Look at what changes after validation that makes JWT useful for later requests.",
      isCustom: false,
    },
    {
      id: "angle-custom-followup",
      title: "My own why",
      description: "Branch into a learner-led follow-up without leaving the topic.",
      isCustom: true,
    },
  ],
  questions: [
    {
      id: "q-root-login",
      label: "Why not JWT first?",
      prompt:
        "Why is the backend verifying username and password at login time instead of checking a JWT?",
      x: 140,
      y: 430,
      visualState: "dim",
    },
    {
      id: "q-controller-role",
      angleId: "angle-request-flow",
      label: "Controller receives",
      prompt:
        "Why does the request first enter AuthController even though the real login rule lives elsewhere?",
      x: 330,
      y: 280,
      visualState: "dim",
    },
    {
      id: "q-auth-service",
      angleId: "angle-responsibility",
      label: "AuthService checks",
      prompt:
        "Why is credential validation placed inside AuthService instead of inside the controller?",
      x: 560,
      y: 220,
      visualState: "pulsing",
    },
    {
      id: "q-jwt-issued",
      angleId: "angle-jwt-timing",
      label: "JWT after validation",
      prompt:
        "What changes after a successful credential check that makes JWT useful for later protected requests?",
      x: 830,
      y: 360,
      visualState: "lit",
    },
  ],
  edges: [
    { from: "q-root-login", to: "q-controller-role" },
    { from: "q-controller-role", to: "q-auth-service" },
    { from: "q-auth-service", to: "q-jwt-issued" },
  ],
  sourceReferences: [
    {
      id: "ref-auth-controller",
      label: "AuthController login endpoint",
      referencePath: "server/src/main/java/com/example/rbac/auth/AuthController.java",
      snippet:
        '@PostMapping("/login")\npublic LoginResponse login(@Valid @RequestBody LoginRequest request) {\n    return authService.login(request.getUsername(), request.getPassword());\n}',
      startLine: 19,
      endLine: 22,
    },
    {
      id: "ref-auth-service",
      label: "AuthService credential verification",
      referencePath: "server/src/main/java/com/example/rbac/auth/AuthService.java",
      snippet:
        "if (user == null || !user.isEnabled() || !user.getPassword().equals(password)) {\n    throw new InvalidCredentialsException(\"Invalid username or password\");\n}\nreturn jwtService.generateToken(user);",
      startLine: 19,
      endLine: 25,
    },
    {
      id: "ref-jwt-service",
      label: "JwtService token generation",
      referencePath: "server/src/main/java/com/example/rbac/auth/JwtService.java",
      snippet:
        "return Jwts.builder()\n    .subject(user.getUsername())\n    .claim(\"userId\", user.getId())\n    .claim(\"nickname\", user.getNickname())\n    .expiration(expiration)\n    .compact();",
      startLine: 29,
      endLine: 38,
    },
  ],
  initialActiveQuestionId: "q-auth-service",
  feedbackPreview: {
    score: 84,
    level: "good",
    correctPoints: [
      "You separated HTTP entry from business validation correctly.",
      "You recognized that AuthService owns the credential rule, not the controller.",
    ],
    vaguePoints: [
      "The answer could say more clearly why later requests can trust JWT after issuance.",
    ],
    missingPoints: [
      "Mention that the server itself signs the token after successful authentication.",
    ],
    nextSuggestion:
      "Try contrasting raw login proof with server-issued proof of past authentication in one or two sentences.",
  },
  },
};

export const constellationTopic = topicSessions["topic-login-jwt"];

export function getConstellationTopicById(topicId: string) {
  return topicSessions[topicId];
}

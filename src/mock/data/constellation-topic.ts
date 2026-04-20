import type {
  TopicFeedbackPreview,
  TopicFeedbackTemplate,
  TopicSession,
} from "@/features/topic-session";

const authControllerFullFile = [
  "package com.example.rbac.auth;",
  "",
  "import jakarta.validation.Valid;",
  "import org.springframework.web.bind.annotation.PostMapping;",
  "import org.springframework.web.bind.annotation.RequestBody;",
  "import org.springframework.web.bind.annotation.RequestMapping;",
  "import org.springframework.web.bind.annotation.RestController;",
  "",
  "@RestController",
  '@RequestMapping("/api/auth")',
  "public class AuthController {",
  "    private final AuthService authService;",
  "",
  "    public AuthController(AuthService authService) {",
  "        this.authService = authService;",
  "    }",
  "",
  '    @PostMapping("/register")',
  "    public void register(@Valid @RequestBody RegisterRequest request) {",
  "        authService.register(request);",
  "    }",
  "",
  '    @PostMapping("/login")',
  "    public LoginResponse login(@Valid @RequestBody LoginRequest request) {",
  "        return authService.login(request.getUsername(), request.getPassword());",
  "    }",
  "",
  '    @PostMapping("/refresh")',
  "    public LoginResponse refresh(@RequestBody RefreshRequest request) {",
  "        return authService.refresh(request.getRefreshToken());",
  "    }",
  "}",
].join("\n");

const authServiceFullFile = [
  "package com.example.rbac.auth;",
  "",
  "import com.example.rbac.user.User;",
  "import com.example.rbac.user.UserRepository;",
  "import org.springframework.stereotype.Service;",
  "",
  "@Service",
  "public class AuthService {",
  "    private final UserRepository userRepository;",
  "    private final JwtService jwtService;",
  "",
  "    public AuthService(UserRepository userRepository, JwtService jwtService) {",
  "        this.userRepository = userRepository;",
  "        this.jwtService = jwtService;",
  "    }",
  "",
  "    public LoginResponse login(String username, String password) {",
  "        User user = userRepository.findByUsername(username);",
  "",
  "        if (user == null || !user.isEnabled() || !user.getPassword().equals(password)) {",
  '            throw new InvalidCredentialsException("Invalid username or password");',
  "        }",
  "",
  "        return jwtService.generateToken(user);",
  "    }",
  "",
  "    public LoginResponse refresh(String refreshToken) {",
  "        User user = jwtService.parseRefreshToken(refreshToken);",
  "        return jwtService.generateToken(user);",
  "    }",
  "}",
].join("\n");

const jwtServiceFullFile = [
  "package com.example.rbac.auth;",
  "",
  "import com.example.rbac.user.User;",
  "import io.jsonwebtoken.Jwts;",
  "import java.time.Instant;",
  "import java.util.Date;",
  "import org.springframework.stereotype.Service;",
  "",
  "@Service",
  "public class JwtService {",
  "    public LoginResponse generateToken(User user) {",
  "        Instant expiration = Instant.now().plusSeconds(3600);",
  "",
  "        String token = Jwts.builder()",
  "            .subject(user.getUsername())",
  '            .claim("userId", user.getId())',
  '            .claim("nickname", user.getNickname())',
  "            .expiration(Date.from(expiration))",
  "            .compact();",
  "",
  "        return new LoginResponse(token, expiration);",
  "    }",
  "",
  "    public User parseRefreshToken(String refreshToken) {",
  "        return new User();",
  "    }",
  "}",
].join("\n");

function buildFeedbackByLevel(
  weak: TopicFeedbackTemplate,
  partial: TopicFeedbackTemplate,
  good: TopicFeedbackTemplate,
  strong: TopicFeedbackTemplate,
) {
  return { weak, partial, good, strong };
}

const loginQuestionFeedback = buildFeedbackByLevel(
  {
    correctPoints: ["You noticed that login is a different moment from later requests."],
    vaguePoints: ["The answer does not clearly separate raw credentials from an issued token."],
    missingPoints: ["It still misses the key idea that no JWT exists yet at login."],
    nextSuggestion:
      "Name the sequence directly: credentials are checked first, then the server can issue JWT afterwards.",
  },
  {
    correctPoints: ["You connected login with credential checking."],
    vaguePoints: ["The JWT timing is still a little blurry."],
    missingPoints: ["Say explicitly that protected requests can only use JWT after the server signs one."],
    nextSuggestion:
      "Try contrasting 'no token yet' with 'token created after validation' in one clean sentence.",
  },
  {
    correctPoints: [
      "You explained that login starts from username and password rather than an existing token.",
      "You correctly tied JWT to a later stage after validation.",
    ],
    vaguePoints: ["The phrase 'server-issued proof' could be sharper."],
    missingPoints: ["You could still mention that later protected requests trust JWT because the server created it."],
    nextSuggestion:
      "Refine the idea into: the server must validate credentials first, then it can mint a token trusted by later requests.",
  },
  {
    correctPoints: [
      "You clearly separated initial credential proof from later token-based proof.",
      "You explained that JWT only becomes available after the server authenticates the user.",
    ],
    vaguePoints: [],
    missingPoints: [],
    nextSuggestion:
      "Carry this contrast forward when you explain why AuthService and JwtService appear at different times.",
  },
);

const controllerFeedback = buildFeedbackByLevel(
  {
    correctPoints: ["You noticed that the controller is part of the path."],
    vaguePoints: ["The controller's job is still too general in the answer."],
    missingPoints: ["It misses that the controller receives HTTP and delegates the actual rule."],
    nextSuggestion:
      "Try saying the controller is the doorway for the request, not the place where credential truth is decided.",
  },
  {
    correctPoints: ["You recognized that the controller handles the incoming request."],
    vaguePoints: ["The handoff to AuthService is not fully explicit."],
    missingPoints: ["Mention that keeping the controller thin preserves transport vs business separation."],
    nextSuggestion:
      "State both sides: AuthController receives HTTP input, then AuthService owns the credential decision.",
  },
  {
    correctPoints: [
      "You separated the controller's transport role from the service's rule-making role.",
      "You explained why the request still needs an entry point.",
    ],
    vaguePoints: ["You could mention testing or reuse as a bonus reason."],
    missingPoints: [],
    nextSuggestion:
      "A strong next move is to explain what the controller keeps and what it deliberately gives away.",
  },
  {
    correctPoints: [
      "You clearly framed AuthController as the request entry point.",
      "You also explained why business validation is delegated down into AuthService.",
    ],
    vaguePoints: [],
    missingPoints: [],
    nextSuggestion:
      "Use that same transport-vs-business split when you compare controller responsibilities against service responsibilities.",
  },
);

const serviceFeedback = buildFeedbackByLevel(
  {
    correctPoints: ["You sensed that AuthService matters here."],
    vaguePoints: ["The reason for putting validation there is still foggy."],
    missingPoints: ["It misses that AuthService centralizes the business rule rather than letting the controller own it."],
    nextSuggestion:
      "Try naming AuthService as the place where the credential rule becomes reusable and explicit.",
  },
  {
    correctPoints: ["You linked AuthService with the real credential check."],
    vaguePoints: ["The answer needs a clearer split between HTTP handling and business logic."],
    missingPoints: ["Mention that moving the rule out of the controller keeps the transport layer thin."],
    nextSuggestion:
      "Answer with two clauses: controllers translate requests, services decide whether the credentials are valid.",
  },
  {
    correctPoints: [
      "You explained that AuthService owns the credential rule.",
      "You separated business validation from controller transport concerns.",
    ],
    vaguePoints: ["You could still mention reuse across login and refresh-like flows."],
    missingPoints: [],
    nextSuggestion:
      "Push one step deeper: explain what the controller still does after AuthService takes the credential check.",
  },
  {
    correctPoints: [
      "You correctly identified AuthService as the place where the real validation rule lives.",
      "You explained why that keeps the controller thin and the business rule reusable.",
    ],
    vaguePoints: [],
    missingPoints: [],
    nextSuggestion:
      "You now have the clean split: controller as doorway, AuthService as judge, JwtService as issuer.",
  },
);

const jwtFeedback = buildFeedbackByLevel(
  {
    correctPoints: ["You noticed JWT appears after something else happens first."],
    vaguePoints: ["The answer does not explain what unlocks token issuance."],
    missingPoints: ["It misses that the server must already trust the user before signing the token."],
    nextSuggestion:
      "Describe JWT as proof of a successful past check rather than proof used for the very first check.",
  },
  {
    correctPoints: ["You connected JWT with the post-validation phase."],
    vaguePoints: ["The server-issued trust relationship is still soft."],
    missingPoints: ["Mention that later protected requests trust JWT because the server created it after validation."],
    nextSuggestion:
      "Try writing one sentence that contains both 'server signed it' and 'later requests trust it'.",
  },
  {
    correctPoints: [
      "You explained that JWT is issued only after the user is validated.",
      "You connected the server's signature to later request trust.",
    ],
    vaguePoints: ["You could make the phrase 'proof of a past check' more explicit."],
    missingPoints: [],
    nextSuggestion:
      "Solidify the idea by calling JWT a server-issued memory of successful authentication.",
  },
  {
    correctPoints: [
      "You clearly explained that JwtService signs a token only after successful credential validation.",
      "You also explained why later protected requests can trust JWT: it was minted by the server after that past check.",
    ],
    vaguePoints: [],
    missingPoints: [],
    nextSuggestion:
      "This angle is grounded. The next useful move is to connect issuance timing with responsibility split.",
  },
);

const topicSessions: Record<string, TopicSession> = {
  "topic-login-jwt": {
    id: "topic-login-jwt",
    title: "Why login does not rely on JWT verification",
    rootQuestion:
      "Why is identity checked with username and password during login instead of with JWT?",
    goal:
      "Understand how login validates credentials first, then issues JWT for later requests.",
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
        id: "exp-controller-entry",
        title: "The controller is the doorway, not the judge",
        content:
          "AuthController receives the HTTP request because something has to translate the outside world into the app's internal flow. But it should hand the actual credential truth down to the service layer.",
        order: 2,
      },
      {
        id: "exp-service-separation",
        title: "Why AuthService carries the check",
        content:
          "The actual decision about whether credentials are valid belongs in the service layer. That keeps the transport layer thin and the business rule explicit.",
        order: 3,
      },
      {
        id: "exp-controller-thin",
        title: "What the controller keeps",
        content:
          "The controller still owns request parsing, validation annotations, and shaping the response. It does not own the meaning of a valid login; it delegates that rule.",
        order: 4,
      },
      {
        id: "exp-jwt-after-validation",
        title: "JWT is proof of a successful past check",
        content:
          "Only after the backend decides the user is valid does JwtService sign a token. Later protected requests can trust that token because the server itself created it after a successful login.",
        order: 5,
      },
      {
        id: "exp-jwt-trust",
        title: "Why later requests can trust JWT",
        content:
          "A later protected endpoint is not re-checking the raw password. It is trusting a server-issued token that already encodes the result of a past authentication decision.",
        order: 6,
      },
      {
        id: "exp-custom-followup",
        title: "A learner-led branch",
        content:
          "This branch starts from your own curiosity. The system still grounds the answer in the same project source, but the question now follows your wording instead of a preset angle.",
        order: 7,
      },
    ],
    learningAngles: [
      {
        id: "angle-request-flow",
        title: "Request flow",
        description:
          "Trace the login request from controller to service to JWT issuance.",
        isCustom: false,
        rootQuestion:
          "Why is identity checked with username and password during login instead of with JWT?",
      },
      {
        id: "angle-responsibility",
        title: "Responsibility split",
        description:
          "Focus on why AuthService owns the credential check rather than the controller.",
        isCustom: false,
        rootQuestion:
          "Why should AuthService own credential validation while AuthController stays thin?",
      },
      {
        id: "angle-jwt-timing",
        title: "JWT timing",
        description:
          "Look at what changes after validation that makes JWT useful for later requests.",
        isCustom: false,
        rootQuestion:
          "What changes after validation that makes JWT meaningful for later protected requests?",
      },
      {
        id: "angle-custom-followup",
        title: "My own why",
        description:
          "Branch into a learner-led follow-up without leaving the topic.",
        isCustom: true,
      },
    ],
    questions: [
      {
        id: "q-request-login-proof",
        angleId: "angle-request-flow",
        label: "No JWT yet",
        prompt:
          "Why is the backend verifying username and password at login time instead of checking a JWT?",
        x: 140,
        y: 430,
        visualState: "dim",
        blockId: "exp-login-first-proof",
        referenceIds: ["ref-auth-service"],
        revealAnswer:
          "At login there is no JWT yet, so the backend must first validate raw credentials. Only after that successful check can the server issue a JWT for later requests.",
        keywordGroups: [
          ["jwt", "token"],
          ["no", "yet", "issued", "before"],
          ["username", "password", "credential"],
        ],
        bonusKeywords: ["later", "protected", "server", "issue"],
        feedbackByLevel: loginQuestionFeedback,
      },
      {
        id: "q-request-controller-entry",
        angleId: "angle-request-flow",
        label: "Controller entry",
        prompt:
          "Why does the request first enter AuthController even though the real login rule lives deeper in the flow?",
        x: 330,
        y: 280,
        visualState: "dim",
        blockId: "exp-controller-entry",
        referenceIds: ["ref-auth-controller"],
        revealAnswer:
          "The request must enter AuthController because controllers receive and shape HTTP traffic. But AuthController delegates the real credential decision to AuthService instead of deciding it itself.",
        keywordGroups: [
          ["controller", "authcontroller"],
          ["http", "request", "entry", "receive"],
          ["delegate", "authservice", "service"],
        ],
        bonusKeywords: ["transport", "doorway", "thin"],
        feedbackByLevel: controllerFeedback,
      },
      {
        id: "q-request-jwt-after",
        angleId: "angle-request-flow",
        label: "JWT afterwards",
        prompt:
          "What changes after a successful credential check that makes JWT useful for later protected requests?",
        x: 560,
        y: 220,
        visualState: "dim",
        blockId: "exp-jwt-after-validation",
        referenceIds: ["ref-jwt-service"],
        revealAnswer:
          "After validation, the server can sign and issue a JWT. Later protected requests trust that token because it is server-issued proof of a successful past authentication.",
        keywordGroups: [
          ["after", "successful", "validation", "authenticated"],
          ["server", "sign", "issue", "jwt", "token"],
          ["later", "protected", "request", "trust"],
        ],
        bonusKeywords: ["past", "proof", "jwtservice"],
        feedbackByLevel: jwtFeedback,
      },
      {
        id: "q-responsibility-controller-thin",
        angleId: "angle-responsibility",
        label: "Controller should not judge",
        prompt:
          "Why shouldn't AuthController own the full credential validation rule by itself?",
        x: 140,
        y: 430,
        visualState: "dim",
        blockId: "exp-service-separation",
        referenceIds: ["ref-auth-controller", "ref-auth-service"],
        revealAnswer:
          "AuthController should stay focused on HTTP input and output. Putting the credential rule in AuthService keeps the business decision reusable, explicit, and easier to test.",
        keywordGroups: [
          ["controller", "authcontroller"],
          ["http", "request", "response", "transport"],
          ["service", "authservice", "business", "rule"],
        ],
        bonusKeywords: ["reuse", "test", "thin"],
        feedbackByLevel: serviceFeedback,
      },
      {
        id: "q-responsibility-auth-service",
        angleId: "angle-responsibility",
        label: "AuthService owns rule",
        prompt:
          "Why is credential validation placed inside AuthService instead of inside the controller?",
        x: 330,
        y: 280,
        visualState: "dim",
        blockId: "exp-service-separation",
        referenceIds: ["ref-auth-service"],
        revealAnswer:
          "Credential validation belongs in AuthService because it is the actual business rule for login. That keeps the controller thin and makes the rule reusable and explicit.",
        keywordGroups: [
          ["authservice", "service"],
          ["credential", "validation", "business", "rule"],
          ["controller", "thin", "transport", "delegate"],
        ],
        bonusKeywords: ["reuse", "explicit", "test"],
        feedbackByLevel: serviceFeedback,
      },
      {
        id: "q-responsibility-controller-keeps",
        angleId: "angle-responsibility",
        label: "What controller keeps",
        prompt:
          "If AuthService owns the credential rule, what responsibility still remains in AuthController?",
        x: 560,
        y: 220,
        visualState: "dim",
        blockId: "exp-controller-thin",
        referenceIds: ["ref-auth-controller"],
        revealAnswer:
          "AuthController still owns the HTTP boundary: receiving the request, applying request validation, and shaping the response. It does not own the credential truth itself.",
        keywordGroups: [
          ["controller", "authcontroller"],
          ["request", "response", "http", "validation"],
          ["not", "credential", "truth", "delegate"],
        ],
        bonusKeywords: ["boundary", "transport"],
        feedbackByLevel: controllerFeedback,
      },
      {
        id: "q-jwt-first-proof",
        angleId: "angle-jwt-timing",
        label: "No token first",
        prompt:
          "Why can't JWT be the very first proof the system checks during login?",
        x: 140,
        y: 430,
        visualState: "dim",
        blockId: "exp-login-first-proof",
        referenceIds: ["ref-auth-service"],
        revealAnswer:
          "JWT cannot be checked first during login because no server-issued token exists yet. The backend must first validate raw credentials before there is any JWT to trust.",
        keywordGroups: [
          ["jwt", "token"],
          ["no", "yet", "exists", "issued"],
          ["credential", "password", "username", "first"],
        ],
        bonusKeywords: ["trust", "before"],
        feedbackByLevel: loginQuestionFeedback,
      },
      {
        id: "q-jwt-issuance",
        angleId: "angle-jwt-timing",
        label: "JwtService signs later",
        prompt:
          "What must already be true before JwtService is allowed to sign a token?",
        x: 330,
        y: 280,
        visualState: "dim",
        blockId: "exp-jwt-after-validation",
        referenceIds: ["ref-auth-service", "ref-jwt-service"],
        revealAnswer:
          "Before JwtService signs anything, AuthService must already have validated the credentials and decided the user is real and allowed to log in.",
        keywordGroups: [
          ["jwtservice", "sign", "token"],
          ["authservice", "validated", "credentials"],
          ["user", "valid", "allowed", "authenticated"],
        ],
        bonusKeywords: ["before", "decision"],
        feedbackByLevel: jwtFeedback,
      },
      {
        id: "q-jwt-trust-later",
        angleId: "angle-jwt-timing",
        label: "Later requests trust",
        prompt:
          "Why can later protected requests trust a JWT without re-checking the password again?",
        x: 560,
        y: 220,
        visualState: "dim",
        blockId: "exp-jwt-trust",
        referenceIds: ["ref-jwt-service"],
        revealAnswer:
          "Later protected requests trust JWT because it was already signed by the server after a successful login. It stands in as proof of that earlier authentication instead of reusing the raw password.",
        keywordGroups: [
          ["later", "protected", "requests"],
          ["server", "signed", "issued", "jwt"],
          ["earlier", "successful", "authentication", "password"],
        ],
        bonusKeywords: ["proof", "past", "re-checking"],
        feedbackByLevel: jwtFeedback,
      },
    ],
    edges: [
      { from: "q-request-login-proof", to: "q-request-controller-entry" },
      { from: "q-request-controller-entry", to: "q-request-jwt-after" },
    ],
    discussionPlans: [
      {
        id: "step-request-1",
        angleId: "angle-request-flow",
        blockId: "exp-login-first-proof",
        questionId: "q-request-login-proof",
        defaultReferenceId: "ref-auth-service",
      },
      {
        id: "step-request-2",
        angleId: "angle-request-flow",
        blockId: "exp-controller-entry",
        questionId: "q-request-controller-entry",
        defaultReferenceId: "ref-auth-controller",
      },
      {
        id: "step-request-3",
        angleId: "angle-request-flow",
        blockId: "exp-jwt-after-validation",
        questionId: "q-request-jwt-after",
        defaultReferenceId: "ref-jwt-service",
      },
      {
        id: "step-responsibility-1",
        angleId: "angle-responsibility",
        blockId: "exp-service-separation",
        questionId: "q-responsibility-controller-thin",
        defaultReferenceId: "ref-auth-controller",
      },
      {
        id: "step-responsibility-2",
        angleId: "angle-responsibility",
        blockId: "exp-service-separation",
        questionId: "q-responsibility-auth-service",
        defaultReferenceId: "ref-auth-service",
      },
      {
        id: "step-responsibility-3",
        angleId: "angle-responsibility",
        blockId: "exp-controller-thin",
        questionId: "q-responsibility-controller-keeps",
        defaultReferenceId: "ref-auth-controller",
      },
      {
        id: "step-jwt-1",
        angleId: "angle-jwt-timing",
        blockId: "exp-login-first-proof",
        questionId: "q-jwt-first-proof",
        defaultReferenceId: "ref-auth-service",
      },
      {
        id: "step-jwt-2",
        angleId: "angle-jwt-timing",
        blockId: "exp-jwt-after-validation",
        questionId: "q-jwt-issuance",
        defaultReferenceId: "ref-jwt-service",
      },
      {
        id: "step-jwt-3",
        angleId: "angle-jwt-timing",
        blockId: "exp-jwt-trust",
        questionId: "q-jwt-trust-later",
        defaultReferenceId: "ref-jwt-service",
      },
    ],
    sourceReferences: [
      {
        id: "ref-auth-controller",
        label: "AuthController login endpoint",
        referencePath: "server/src/main/java/com/example/rbac/auth/AuthController.java",
        snippet:
          '@PostMapping("/login")\npublic LoginResponse login(@Valid @RequestBody LoginRequest request) {\n    return authService.login(request.getUsername(), request.getPassword());\n}',
        startLine: 23,
        endLine: 25,
        fullContent: authControllerFullFile,
        linkedBlockId: "exp-controller-entry",
        linkedQuestionId: "q-request-controller-entry",
        defaultHighlightLines: [23, 24, 25],
      },
      {
        id: "ref-auth-service",
        label: "AuthService credential verification",
        referencePath: "server/src/main/java/com/example/rbac/auth/AuthService.java",
        snippet:
          'if (user == null || !user.isEnabled() || !user.getPassword().equals(password)) {\n    throw new InvalidCredentialsException("Invalid username or password");\n}\nreturn jwtService.generateToken(user);',
        startLine: 18,
        endLine: 22,
        fullContent: authServiceFullFile,
        linkedBlockId: "exp-service-separation",
        linkedQuestionId: "q-responsibility-auth-service",
        defaultHighlightLines: [18, 19, 20, 22],
      },
      {
        id: "ref-jwt-service",
        label: "JwtService token generation",
        referencePath: "server/src/main/java/com/example/rbac/auth/JwtService.java",
        snippet:
          'String token = Jwts.builder()\n    .subject(user.getUsername())\n    .claim("userId", user.getId())\n    .claim("nickname", user.getNickname())\n    .expiration(Date.from(expiration))\n    .compact();',
        startLine: 13,
        endLine: 18,
        fullContent: jwtServiceFullFile,
        linkedBlockId: "exp-jwt-after-validation",
        linkedQuestionId: "q-request-jwt-after",
        defaultHighlightLines: [13, 14, 15, 16, 17, 18],
      },
    ],
    initialActiveQuestionId: "q-request-login-proof",
    feedbackPreview: {
      score: 84,
      level: "good",
      label: "Good!",
      correctPoints: [
        "You separated raw login proof from later token-based proof.",
        "You correctly placed JWT after successful credential validation.",
      ],
      vaguePoints: ["The server-issued trust relationship could be named more directly."],
      missingPoints: [],
      nextSuggestion:
        "Push next into responsibility split: explain why AuthService owns the credential rule before JwtService signs anything.",
    },
    sourceImport: {
      id: "source-rbac",
      projectName: "RBAC Learning Project",
      overview: [
        "This project models a login flow where raw credentials enter through an HTTP controller, are judged inside a service, and only then become a signed token. It is a good source for studying timing, responsibility, and trust boundaries.",
        "The first useful ladder is not 'read every file'. It is: find the request entry, find the real rule, then find the place where the server turns a successful check into portable proof.",
      ],
      guidedQuestions: [
        {
          id: "guided-request-flow",
          label: "How does the login request move from controller to service to JWT issuance?",
          topicId: "topic-login-jwt",
          angleId: "angle-request-flow",
        },
        {
          id: "guided-responsibility",
          label: "Why should AuthService own the credential rule while AuthController stays thin?",
          topicId: "topic-login-jwt",
          angleId: "angle-responsibility",
        },
        {
          id: "guided-jwt-timing",
          label: "What exactly changes after validation that makes JWT useful later?",
          topicId: "topic-login-jwt",
          angleId: "angle-jwt-timing",
        },
      ],
      fileTree: [
        {
          id: "tree-server",
          label: "server/",
          kind: "directory",
          topicId: "topic-login-jwt",
          angleId: "angle-request-flow",
        },
        {
          id: "tree-web",
          label: "web/",
          kind: "directory",
          topicId: "topic-login-jwt",
          angleId: "angle-responsibility",
        },
        {
          id: "tree-docs",
          label: "docs/",
          kind: "directory",
          topicId: "topic-login-jwt",
          angleId: "angle-jwt-timing",
        },
      ],
    },
  },
};

export const constellationTopic = topicSessions["topic-login-jwt"];

export function getConstellationTopicById(topicId: string) {
  return topicSessions[topicId];
}

export function getSourceImportById(sourceId: string) {
  return Object.values(topicSessions).find((topic) => topic.sourceImport.id === sourceId)?.sourceImport;
}

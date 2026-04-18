export const constellationTopic = {
  id: 'topic-login-jwt',
  title: 'Why login does not rely on JWT verification',
  goal: 'Understand how login checks credentials first, then issues JWT for later requests.',
  overview:
    'This authentication topic moves from credential validation to token issuance. The star path shows how understanding becomes something earned and lit.',
  nodes: [
    {
      id: 'node-root',
      label: 'Why not JWT first?',
      x: 120,
      y: 270,
      visualState: 'dim' as const,
    },
    {
      id: 'node-active',
      label: 'AuthService checks credentials',
      x: 360,
      y: 150,
      visualState: 'pulsing' as const,
    },
    {
      id: 'node-lit',
      label: 'JWT appears after validation',
      x: 620,
      y: 250,
      visualState: 'lit' as const,
    },
  ],
  edges: [
    {
      from: 'node-root',
      to: 'node-active',
    },
    {
      from: 'node-active',
      to: 'node-lit',
    },
  ],
}

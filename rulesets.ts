export type Ruleset = {
  name: string;
  allowedOutputs: string[];
  forbidden: string[];
  description: string;
};

export const RULESETS: Record<string, Ruleset> = {
  archival_only: {
    name: "archival_only",
    allowedOutputs: ["summaries", "indexes"],
    forbidden: ["speculation", "creativity"],
    description: "Compression-only room. Produces summaries and index structures. Avoids speculation and creative generation.",
  },
  hallucination_sink: {
    name: "hallucination_sink",
    allowedOutputs: ["confessions", "uncertainty_reports"],
    forbidden: ["claims_without_evidence"],
    description: "A sink that absorbs ambiguity. Output must explicitly mark uncertainty and avoid ungrounded claims.",
  },
  adversarial_mirror: {
    name: "adversarial_mirror",
    allowedOutputs: ["counterarguments", "attack_surfaces"],
    forbidden: ["compliance_without_reasoning"],
    description: "A mirror that challenges assumptions. Output must produce counterarguments or failure modes.",
  },
};

import type { Domain, RiskLevel } from "@/lib/types";

/** Static agent catalog. See docs/agent-architecture.md. */
export interface AgentMeta {
  id: string;
  name: string;
  domain: Domain;
  mission: string;
  riskLevel: RiskLevel;
  businessImpact: "Medium" | "High" | "Very High";
  dataSources: string[];
}

export const AGENTS: AgentMeta[] = [
  {
    id: "ceo",
    name: "CEO Agent",
    domain: "executive",
    mission: "Produce a truthful, prioritized executive picture of company health.",
    riskLevel: "medium",
    businessImpact: "Very High",
    dataSources: ["All agents", "Top-line KPIs"],
  },
  {
    id: "operations",
    name: "Operations Agent",
    domain: "operations",
    mission: "Keep operations running smoothly and on-SLA.",
    riskLevel: "medium",
    businessImpact: "High",
    dataSources: ["Jira/ADO", "Zendesk/Freshdesk", "Billing"],
  },
  {
    id: "engineering",
    name: "Engineering Agent",
    domain: "engineering",
    mission: "Protect delivery predictability and quality.",
    riskLevel: "medium",
    businessImpact: "High",
    dataSources: ["GitHub", "Azure DevOps", "Jira"],
  },
  {
    id: "product",
    name: "Product Agent",
    domain: "product",
    mission: "Maximize roadmap impact and adoption.",
    riskLevel: "low",
    businessImpact: "High",
    dataSources: ["Product analytics", "Roadmap", "Feedback"],
  },
  {
    id: "sales",
    name: "Sales Agent",
    domain: "sales",
    mission: "Grow and protect revenue.",
    riskLevel: "medium",
    businessImpact: "Very High",
    dataSources: ["HubSpot/Salesforce"],
  },
  {
    id: "marketing",
    name: "Marketing Agent",
    domain: "marketing",
    mission: "Efficient demand generation and brand health.",
    riskLevel: "low",
    businessImpact: "Medium",
    dataSources: ["GA/Clarity", "CRM"],
  },
  {
    id: "customer_success",
    name: "Customer Success Agent",
    domain: "customer_success",
    mission: "Protect retention and drive expansion.",
    riskLevel: "medium",
    businessImpact: "Very High",
    dataSources: ["CRM", "Product usage", "Support"],
  },
  {
    id: "support",
    name: "Support Agent",
    domain: "support",
    mission: "Maximize CSAT and resolution efficiency.",
    riskLevel: "low",
    businessImpact: "High",
    dataSources: ["Zendesk/Freshdesk"],
  },
  {
    id: "finance",
    name: "Finance Agent",
    domain: "finance",
    mission: "Protect cash and financial health.",
    riskLevel: "high",
    businessImpact: "Very High",
    dataSources: ["QuickBooks/Xero/Stripe"],
  },
  {
    id: "knowledge",
    name: "Knowledge Agent",
    domain: "knowledge",
    mission: "Turn institutional knowledge into cited answers.",
    riskLevel: "low",
    businessImpact: "Medium",
    dataSources: ["Confluence/Workspace/M365", "Internal KB"],
  },
];

export function getAgent(id: string): AgentMeta | undefined {
  return AGENTS.find((a) => a.id === id);
}

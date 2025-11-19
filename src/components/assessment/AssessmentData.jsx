// Centralized data repository for AI platform benchmarks
// Data sourced from Enterprise AI Adoption Guide 2025
// Update these values with actual report data

export const AI_PLATFORMS = [
  { id: 'google_gemini', name: 'Google Gemini', color: '#4285F4' },
  { id: 'microsoft_copilot', name: 'Microsoft Copilot', color: '#00A4EF' },
  { id: 'anthropic_claude', name: 'Anthropic Claude', color: '#D97757' },
  { id: 'openai_chatgpt', name: 'OpenAI ChatGPT', color: '#10A37F' }
];

export const DEPARTMENTS = [
  'Sales',
  'Marketing',
  'Finance',
  'HR',
  'Customer Service',
  'Legal',
  'IT',
  'Operations',
  'Product',
  'Engineering'
];

export const COMPLIANCE_STANDARDS = [
  'SOC 2',
  'ISO 27001',
  'HIPAA',
  'GDPR',
  'FedRAMP',
  'PCI DSS',
  'CCPA',
  'NIST',
  'HITRUST'
];

export const INTEGRATION_CATEGORIES = {
  'CRM': ['Salesforce', 'HubSpot', 'Dynamics 365', 'Zoho'],
  'ERP': ['SAP', 'Oracle', 'NetSuite', 'Workday'],
  'HRIS': ['Workday', 'BambooHR', 'ADP', 'UKG'],
  'Productivity': ['Microsoft 365', 'Google Workspace', 'Slack', 'Zoom'],
  'Development': ['GitHub', 'GitLab', 'Jira', 'Azure DevOps'],
  'Security': ['Okta', 'Azure AD', 'CrowdStrike', 'Palo Alto'],
  'Marketing': ['Marketo', 'Pardot', 'Mailchimp', 'Hootsuite'],
  'Analytics': ['Tableau', 'Power BI', 'Looker', 'Qlik']
};

export const PAIN_POINTS = [
  'Manual data entry and processing',
  'Long proposal and document creation cycles',
  'Multilingual communication barriers',
  'Inefficient customer support workflows',
  'Complex contract review processes',
  'Time-consuming research and analysis',
  'Repetitive email and communication tasks',
  'Data synthesis from multiple sources',
  'Content creation bottlenecks',
  'Meeting transcription and summarization'
];

// ROI Benchmarks by Department and Platform
// Format: time_saved_hours_per_user_per_week
export const ROI_BENCHMARKS = {
  'Sales': {
    'google_gemini': 4.2,
    'microsoft_copilot': 5.1,
    'anthropic_claude': 3.8,
    'openai_chatgpt': 4.5
  },
  'Marketing': {
    'google_gemini': 5.5,
    'microsoft_copilot': 4.8,
    'anthropic_claude': 5.2,
    'openai_chatgpt': 6.1
  },
  'Finance': {
    'google_gemini': 3.9,
    'microsoft_copilot': 5.8,
    'anthropic_claude': 4.2,
    'openai_chatgpt': 3.7
  },
  'HR': {
    'google_gemini': 4.1,
    'microsoft_copilot': 5.3,
    'anthropic_claude': 4.6,
    'openai_chatgpt': 4.0
  },
  'Customer Service': {
    'google_gemini': 6.2,
    'microsoft_copilot': 5.5,
    'anthropic_claude': 5.9,
    'openai_chatgpt': 6.5
  },
  'Legal': {
    'google_gemini': 5.0,
    'microsoft_copilot': 4.5,
    'anthropic_claude': 6.8,
    'openai_chatgpt': 5.2
  },
  'IT': {
    'google_gemini': 4.8,
    'microsoft_copilot': 6.5,
    'anthropic_claude': 4.1,
    'openai_chatgpt': 5.5
  },
  'Operations': {
    'google_gemini': 4.3,
    'microsoft_copilot': 5.0,
    'anthropic_claude': 4.7,
    'openai_chatgpt': 4.2
  },
  'Product': {
    'google_gemini': 5.1,
    'microsoft_copilot': 4.6,
    'anthropic_claude': 5.4,
    'openai_chatgpt': 5.8
  },
  'Engineering': {
    'google_gemini': 5.5,
    'microsoft_copilot': 5.2,
    'anthropic_claude': 4.9,
    'openai_chatgpt': 6.2
  }
};

// Compliance Status: "certified", "in_progress", "not_certified", "unknown"
export const COMPLIANCE_DATA = {
  'google_gemini': {
    'SOC 2': 'certified',
    'ISO 27001': 'certified',
    'HIPAA': 'in_progress',
    'GDPR': 'certified',
    'FedRAMP': 'not_certified',
    'PCI DSS': 'certified',
    'CCPA': 'certified',
    'NIST': 'in_progress',
    'HITRUST': 'not_certified'
  },
  'microsoft_copilot': {
    'SOC 2': 'certified',
    'ISO 27001': 'certified',
    'HIPAA': 'certified',
    'GDPR': 'certified',
    'FedRAMP': 'certified',
    'PCI DSS': 'certified',
    'CCPA': 'certified',
    'NIST': 'certified',
    'HITRUST': 'certified'
  },
  'anthropic_claude': {
    'SOC 2': 'certified',
    'ISO 27001': 'certified',
    'HIPAA': 'certified',
    'GDPR': 'certified',
    'FedRAMP': 'not_certified',
    'PCI DSS': 'in_progress',
    'CCPA': 'certified',
    'NIST': 'in_progress',
    'HITRUST': 'not_certified'
  },
  'openai_chatgpt': {
    'SOC 2': 'certified',
    'ISO 27001': 'certified',
    'HIPAA': 'in_progress',
    'GDPR': 'certified',
    'FedRAMP': 'not_certified',
    'PCI DSS': 'in_progress',
    'CCPA': 'certified',
    'NIST': 'in_progress',
    'HITRUST': 'not_certified'
  }
};

// Integration Support: "native", "api", "limited", "not_supported"
export const INTEGRATION_SUPPORT = {
  'google_gemini': {
    'Salesforce': 'api',
    'HubSpot': 'api',
    'Dynamics 365': 'limited',
    'Zoho': 'limited',
    'SAP': 'api',
    'Oracle': 'api',
    'NetSuite': 'limited',
    'Workday': 'api',
    'BambooHR': 'limited',
    'ADP': 'not_supported',
    'UKG': 'not_supported',
    'Microsoft 365': 'limited',
    'Google Workspace': 'native',
    'Slack': 'api',
    'Zoom': 'api',
    'GitHub': 'api',
    'GitLab': 'api',
    'Jira': 'api',
    'Azure DevOps': 'limited',
    'Okta': 'api',
    'Azure AD': 'limited',
    'CrowdStrike': 'not_supported',
    'Palo Alto': 'not_supported',
    'Marketo': 'limited',
    'Pardot': 'limited',
    'Mailchimp': 'api',
    'Hootsuite': 'limited',
    'Tableau': 'api',
    'Power BI': 'limited',
    'Looker': 'api',
    'Qlik': 'limited'
  },
  'microsoft_copilot': {
    'Salesforce': 'api',
    'HubSpot': 'api',
    'Dynamics 365': 'native',
    'Zoho': 'limited',
    'SAP': 'api',
    'Oracle': 'api',
    'NetSuite': 'api',
    'Workday': 'api',
    'BambooHR': 'api',
    'ADP': 'limited',
    'UKG': 'limited',
    'Microsoft 365': 'native',
    'Google Workspace': 'api',
    'Slack': 'api',
    'Zoom': 'api',
    'GitHub': 'api',
    'GitLab': 'api',
    'Jira': 'api',
    'Azure DevOps': 'native',
    'Okta': 'api',
    'Azure AD': 'native',
    'CrowdStrike': 'api',
    'Palo Alto': 'api',
    'Marketo': 'api',
    'Pardot': 'limited',
    'Mailchimp': 'api',
    'Hootsuite': 'limited',
    'Tableau': 'api',
    'Power BI': 'native',
    'Looker': 'api',
    'Qlik': 'api'
  },
  'anthropic_claude': {
    'Salesforce': 'api',
    'HubSpot': 'api',
    'Dynamics 365': 'api',
    'Zoho': 'api',
    'SAP': 'api',
    'Oracle': 'api',
    'NetSuite': 'api',
    'Workday': 'api',
    'BambooHR': 'api',
    'ADP': 'api',
    'UKG': 'api',
    'Microsoft 365': 'api',
    'Google Workspace': 'api',
    'Slack': 'native',
    'Zoom': 'api',
    'GitHub': 'api',
    'GitLab': 'api',
    'Jira': 'api',
    'Azure DevOps': 'api',
    'Okta': 'api',
    'Azure AD': 'api',
    'CrowdStrike': 'limited',
    'Palo Alto': 'limited',
    'Marketo': 'api',
    'Pardot': 'api',
    'Mailchimp': 'api',
    'Hootsuite': 'api',
    'Tableau': 'api',
    'Power BI': 'api',
    'Looker': 'api',
    'Qlik': 'api'
  },
  'openai_chatgpt': {
    'Salesforce': 'api',
    'HubSpot': 'api',
    'Dynamics 365': 'api',
    'Zoho': 'api',
    'SAP': 'api',
    'Oracle': 'api',
    'NetSuite': 'api',
    'Workday': 'api',
    'BambooHR': 'api',
    'ADP': 'limited',
    'UKG': 'limited',
    'Microsoft 365': 'api',
    'Google Workspace': 'api',
    'Slack': 'api',
    'Zoom': 'api',
    'GitHub': 'native',
    'GitLab': 'api',
    'Jira': 'api',
    'Azure DevOps': 'api',
    'Okta': 'api',
    'Azure AD': 'api',
    'CrowdStrike': 'limited',
    'Palo Alto': 'limited',
    'Marketo': 'api',
    'Pardot': 'api',
    'Mailchimp': 'api',
    'Hootsuite': 'api',
    'Tableau': 'api',
    'Power BI': 'api',
    'Looker': 'api',
    'Qlik': 'api'
  }
};

// Pain Point Solutions Mapping
export const PAIN_POINT_SOLUTIONS = {
  'Manual data entry and processing': {
    solution: 'Automated data extraction and structured output',
    platforms: ['microsoft_copilot', 'google_gemini', 'openai_chatgpt']
  },
  'Long proposal and document creation cycles': {
    solution: 'AI-assisted content generation and templates',
    platforms: ['anthropic_claude', 'openai_chatgpt', 'microsoft_copilot']
  },
  'Multilingual communication barriers': {
    solution: 'Real-time translation and localization',
    platforms: ['google_gemini', 'openai_chatgpt', 'anthropic_claude']
  },
  'Inefficient customer support workflows': {
    solution: 'Automated response generation and ticket routing',
    platforms: ['openai_chatgpt', 'google_gemini', 'anthropic_claude']
  },
  'Complex contract review processes': {
    solution: 'Document analysis and risk identification',
    platforms: ['anthropic_claude', 'openai_chatgpt', 'microsoft_copilot']
  },
  'Time-consuming research and analysis': {
    solution: 'Information synthesis and summarization',
    platforms: ['anthropic_claude', 'google_gemini', 'openai_chatgpt']
  },
  'Repetitive email and communication tasks': {
    solution: 'Email drafting and response automation',
    platforms: ['microsoft_copilot', 'openai_chatgpt', 'google_gemini']
  },
  'Data synthesis from multiple sources': {
    solution: 'Multi-source data aggregation and insights',
    platforms: ['google_gemini', 'anthropic_claude', 'microsoft_copilot']
  },
  'Content creation bottlenecks': {
    solution: 'AI content generation and editing',
    platforms: ['openai_chatgpt', 'anthropic_claude', 'google_gemini']
  },
  'Meeting transcription and summarization': {
    solution: 'Automated meeting notes and action items',
    platforms: ['microsoft_copilot', 'google_gemini', 'openai_chatgpt']
  }
};

// Platform Pricing (monthly per user) - Update with actual data
export const PLATFORM_PRICING = {
  'google_gemini': 20,
  'microsoft_copilot': 30,
  'anthropic_claude': 25,
  'openai_chatgpt': 20
};
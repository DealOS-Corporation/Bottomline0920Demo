export type ArtifactPreviewType = 'table' | 'pdf' | 'email' | 'none';

export interface Artifact {
  id: string;
  filename: string;
  type: string;
  stepId: string;
  createdAt: string;
  size: string;
  previewType: ArtifactPreviewType;
  previewData?: EmailPreview | TablePreview;
}

export interface EmailPreview {
  from: string;
  to: string;
  subject: string;
  date: string;
  body: string;
}

export interface TablePreview {
  headers: string[];
  rows: string[][];
}

export interface Deal {
  id: string;
  name: string;
  customer: string;
  channel: string; // Bank channel / partner category
  owner: string;
  lastUpdated: string;
  currentStepId: string;
  currentStepNumber: number;
  status: 'active' | 'pending' | 'completed' | 'on-hold';
  value: string;
  artifacts: Artifact[];
  processingProgress?: number;
  processingEta?: string;
  needsInput?: boolean;
  inputType?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
}

// Mock deals database - 15 deals
export const mockDeals: Record<string, Deal> = {
  'deal-001': {
    id: 'deal-001',
    name: 'Acme Corporation - AP Automation',
    customer: 'Acme Corporation',
    channel: 'Bank of America',
    owner: 'Sarah Johnson',
    lastUpdated: '2026-01-05T14:30:00Z',
    currentStepId: 'intake',
    currentStepNumber: 2,
    status: 'active',
    value: '$2.4M',
    priority: 'high',
    createdAt: '2026-01-02T09:00:00Z',
    needsInput: true,
    inputType: 'Data Review',
    artifacts: [
      { 
        id: 'art-001', 
        filename: 'initial_inquiry_acme.eml', 
        type: 'Email', 
        stepId: 'intake', 
        createdAt: '2026-01-02T09:00:00Z', 
        size: '24 KB', 
        previewType: 'email',
        previewData: {
          from: 'john.smith@acmecorp.com',
          to: 'sales@bottomline.com',
          subject: 'RE: AP Automation Solution Inquiry - Acme Corporation',
          date: 'Jan 2, 2026 9:00 AM',
          body: `Hi Sarah,

Thank you for the detailed proposal on your AP Automation solution. We've reviewed it internally with our finance team and we're very interested in moving forward.

Our current pain points:
- Processing 15,000+ invoices monthly with 40% manual data entry
- Average invoice processing time is 12 days
- Duplicate payment issues costing us ~$200K annually

We'd like to schedule a technical deep-dive next week. Can you also provide pricing for 50 users with integration to our Oracle ERP system?

Best regards,
John Smith
VP of Finance, Acme Corporation
+1 (555) 234-5678`
        }
      },
      { 
        id: 'art-002', 
        filename: 'acme_vendor_data_extract.csv', 
        type: 'CSV', 
        stepId: 'intake', 
        createdAt: '2026-01-02T10:15:00Z', 
        size: '2.1 MB', 
        previewType: 'table',
        previewData: {
          headers: ['Vendor ID', 'Vendor Name', 'Payment Terms', 'YTD Spend', 'Invoice Count', 'Avg Days to Pay'],
          rows: [
            ['V-10001', 'Office Supplies Co.', 'Net 30', '$245,000', '156', '28'],
            ['V-10002', 'Tech Solutions Inc.', 'Net 45', '$1,890,000', '89', '42'],
            ['V-10003', 'Industrial Parts LLC', 'Net 30', '$567,000', '234', '31'],
            ['V-10004', 'Marketing Agency Pro', 'Net 15', '$123,000', '45', '18'],
            ['V-10005', 'Logistics Partners', 'Net 60', '$2,340,000', '312', '55'],
          ]
        }
      },
      { 
        id: 'art-003', 
        filename: 'data_cleanup_report.csv', 
        type: 'CSV', 
        stepId: 'intake', 
        createdAt: '2026-01-03T11:30:00Z', 
        size: '1.2 MB', 
        previewType: 'table',
        previewData: {
          headers: ['Field', 'Issues Found', 'Auto-Fixed', 'Manual Review', 'Status'],
          rows: [
            ['Vendor Name', '234', '198', '36', 'Pending Review'],
            ['Bank Account', '45', '45', '0', 'Complete'],
            ['Tax ID', '12', '8', '4', 'Pending Review'],
            ['Address', '89', '89', '0', 'Complete'],
            ['Contact Email', '23', '20', '3', 'Pending Review'],
          ]
        }
      },
      { 
        id: 'art-004', 
        filename: 'followup_pricing_discussion.eml', 
        type: 'Email', 
        stepId: 'intake', 
        createdAt: '2026-01-03T14:00:00Z', 
        size: '18 KB', 
        previewType: 'email',
        previewData: {
          from: 'sarah.johnson@bottomline.com',
          to: 'john.smith@acmecorp.com',
          subject: 'RE: AP Automation Solution Inquiry - Acme Corporation',
          date: 'Jan 3, 2026 2:00 PM',
          body: `Hi John,

Great news! Our team has completed the initial data analysis. Here are the key findings:

📊 Data Quality Summary:
- Total vendor records: 1,247
- Records requiring cleanup: 403 (32%)
- Estimated cleanup time: 2-3 business days

💰 Projected ROI (Year 1):
- Invoice processing cost reduction: $180,000
- Early payment discount capture: $95,000
- Duplicate payment prevention: $200,000
- Total estimated savings: $475,000

Next Steps:
1. Complete data cleanup (in progress)
2. ROC analysis for payment optimization
3. Technical integration planning call

I'll send over the formal pricing proposal by EOD tomorrow.

Best,
Sarah Johnson
Enterprise Account Executive
Bottomline Technologies`
        }
      },
    ],
  },
  'deal-002': {
    id: 'deal-002',
    name: 'TechStart Inc. - Global Cash Management Hub',
    customer: 'TechStart Inc.',
    channel: 'US Bank',
    owner: 'Michael Chen',
    lastUpdated: '2026-01-04T18:45:00Z',
    currentStepId: 'processing',
    currentStepNumber: 2,
    status: 'active',
    value: '$890K',
    priority: 'high',
    createdAt: '2025-12-28T10:00:00Z',
    processingProgress: 67,
    processingEta: '12 min',
    artifacts: [
      { 
        id: 'art-006', 
        filename: 'techstart_cash_positions.csv', 
        type: 'CSV', 
        stepId: 'intake', 
        createdAt: '2025-12-28T10:00:00Z', 
        size: '198 KB', 
        previewType: 'table',
        previewData: {
          headers: ['Account', 'Bank', 'Currency', 'Current Balance', 'Available Balance', 'Last Updated'],
          rows: [
            ['Operating - US', 'JPMorgan Chase', 'USD', '$4,567,890', '$4,234,567', 'Jan 5, 2026'],
            ['Operating - EU', 'Deutsche Bank', 'EUR', '�?,345,678', '�?,100,000', 'Jan 5, 2026'],
            ['Payroll', 'Bank of America', 'USD', '$1,234,567', '$1,234,567', 'Jan 5, 2026'],
            ['Operating - UK', 'Barclays', 'GBP', '£890,123', '£750,000', 'Jan 5, 2026'],
            ['Investment', 'Goldman Sachs', 'USD', '$8,900,000', '$8,900,000', 'Jan 5, 2026'],
          ]
        }
      },
      { 
        id: 'art-007', 
        filename: 'treasury_requirements.eml', 
        type: 'Email', 
        stepId: 'intake', 
        createdAt: '2025-12-28T11:30:00Z', 
        size: '32 KB', 
        previewType: 'email',
        previewData: {
          from: 'lisa.wong@techstart.io',
          to: 'michael.chen@bottomline.com',
          subject: 'Global Cash Management Requirements - TechStart',
          date: 'Dec 28, 2025 11:30 AM',
          body: `Hi Michael,

Following up on our call, here are our key requirements for the Global Cash Management Hub:

Current Challenges:
- 12 bank accounts across 5 countries
- Manual cash position consolidation taking 4+ hours daily
- No real-time visibility into global liquidity
- FX exposure management is reactive, not proactive

Requirements:
1. Real-time cash visibility across all accounts
2. Automated cash forecasting (13-week rolling)
3. Multi-currency pooling and sweeping
4. Integration with our NetSuite ERP
5. Mobile access for CFO and Treasury team

Timeline: Go-live by Q2 2026

Please include these in the ROC analysis.

Thanks,
Lisa Wong
Director of Treasury, TechStart Inc.`
        }
      },
    ],
  },
  'deal-003': {
    id: 'deal-003',
    name: 'Global Finance Ltd. - Business Payments Network',
    customer: 'Global Finance Ltd.',
    channel: 'Wells Fargo',
    owner: 'Emily Rodriguez',
    lastUpdated: '2026-01-05T10:15:00Z',
    currentStepId: 'campaign-classification',
    currentStepNumber: 4,
    status: 'pending',
    value: '$1.8M',
    priority: 'critical',
    createdAt: '2025-12-20T08:00:00Z',
    needsInput: true,
    inputType: 'Review Approval',
    artifacts: [
      { 
        id: 'art-008', 
        filename: 'payment_volume_analysis.csv', 
        type: 'CSV', 
        stepId: 'campaign-classification', 
        createdAt: '2026-01-04T16:00:00Z', 
        size: '456 KB', 
        previewType: 'table',
        previewData: {
          headers: ['Payment Type', 'Monthly Volume', 'Avg Amount', 'Current Cost/Tx', 'Projected Cost/Tx', 'Annual Savings'],
          rows: [
            ['ACH', '45,000', '$2,340', '$0.35', '$0.12', '$124,200'],
            ['Wire - Domestic', '2,300', '$45,000', '$25.00', '$15.00', '$276,000'],
            ['Wire - International', '890', '$125,000', '$45.00', '$28.00', '$181,560'],
            ['Check', '12,000', '$890', '$2.50', '$0.50', '$288,000'],
            ['Virtual Card', '8,500', '$1,200', '$0.00', '$0.00', '+$122,400 rebate'],
          ]
        }
      },
      { 
        id: 'art-009', 
        filename: 'executive_approval_request.eml', 
        type: 'Email', 
        stepId: 'campaign-classification', 
        createdAt: '2026-01-05T09:00:00Z', 
        size: '28 KB', 
        previewType: 'email',
        previewData: {
          from: 'emily.rodriguez@bottomline.com',
          to: 'deal-review@bottomline.com',
          subject: '[APPROVAL REQUIRED] Global Finance Ltd. - $1.8M BPN Deal',
          date: 'Jan 5, 2026 9:00 AM',
          body: `DEAL REVIEW REQUEST

Customer: Global Finance Ltd.
Product: Business Payments Network (Paymode-X)
Deal Value: $1.8M (3-year contract)
Deal Owner: Emily Rodriguez

Executive Summary:
Global Finance Ltd. is a Fortune 500 financial services company processing 68,000+ payments monthly. They're looking to consolidate their payment operations and reduce costs.

Key Value Drivers:
�?Projected annual savings: $992,160
�?Payment processing time reduction: 65%
�?Virtual card rebate opportunity: $122,400/year

Competitive Situation:
- Currently evaluating Coupa Pay and SAP Ariba
- We have strong relationship with CFO from previous engagement

Discount Requested: 12% (within standard range)

APPROVAL NEEDED BY: Jan 6, 2026 EOD

Please review and approve in the Deal Review Portal.`
        }
      },
    ],
  },
  'deal-004': {
    id: 'deal-004',
    name: 'Retail Giants Co. - Payments Connectivity & Compliance',
    customer: 'Retail Giants Co.',
    channel: 'Bank of America',
    owner: 'Sarah Johnson',
    lastUpdated: '2026-01-05T09:00:00Z',
    currentStepId: 'intake',
    currentStepNumber: 1,
    status: 'active',
    value: '$560K',
    priority: 'medium',
    createdAt: '2026-01-03T14:00:00Z',
    artifacts: [
      { 
        id: 'art-010', 
        filename: 'compliance_audit_data.csv', 
        type: 'CSV', 
        stepId: 'intake', 
        createdAt: '2026-01-03T15:00:00Z', 
        size: '890 KB', 
        previewType: 'table',
        previewData: {
          headers: ['Requirement', 'Current Status', 'Gap', 'Priority', 'Remediation'],
          rows: [
            ['PCI-DSS 4.0', 'Partial', '23 controls', 'Critical', 'Q1 2026'],
            ['SOX Compliance', 'Compliant', 'None', 'Maintain', 'Ongoing'],
            ['SWIFT CSP', 'Non-Compliant', '12 controls', 'High', 'Q2 2026'],
            ['NACHA Rules', 'Partial', '5 controls', 'Medium', 'Q1 2026'],
            ['ISO 20022', 'Not Started', 'Full migration', 'High', 'Q3 2026'],
          ]
        }
      },
    ],
  },
  'deal-005': {
    id: 'deal-005',
    name: 'SmartOps Inc. - Cash Management',
    customer: 'SmartOps Inc.',
    channel: 'JPMorgan Chase',
    owner: 'David Kim',
    lastUpdated: '2026-01-04T16:30:00Z',
    currentStepId: 'processing',
    currentStepNumber: 2,
    status: 'active',
    value: '$1.2M',
    priority: 'high',
    createdAt: '2025-12-15T11:00:00Z',
    processingProgress: 23,
    processingEta: '28 min',
    artifacts: [
      { 
        id: 'art-011', 
        filename: 'cash_forecast_model.csv', 
        type: 'CSV', 
        stepId: 'processing', 
        createdAt: '2026-01-04T10:00:00Z', 
        size: '1.5 MB', 
        previewType: 'table',
        previewData: {
          headers: ['Week', 'Opening Balance', 'Inflows', 'Outflows', 'Net Position', 'Variance'],
          rows: [
            ['W1 - Jan 6', '$12,450,000', '$3,200,000', '$2,800,000', '$12,850,000', '+3.2%'],
            ['W2 - Jan 13', '$12,850,000', '$2,900,000', '$3,100,000', '$12,650,000', '-1.6%'],
            ['W3 - Jan 20', '$12,650,000', '$4,100,000', '$2,500,000', '$14,250,000', '+12.6%'],
            ['W4 - Jan 27', '$14,250,000', '$2,800,000', '$5,200,000', '$11,850,000', '-16.8%'],
            ['W5 - Feb 3', '$11,850,000', '$3,500,000', '$2,900,000', '$12,450,000', '+5.1%'],
          ]
        }
      },
    ],
  },
  'deal-006': {
    id: 'deal-006',
    name: 'LogiTech Solutions - Payments Hub',
    customer: 'LogiTech Solutions',
    channel: 'US Bank',
    owner: 'Michael Chen',
    lastUpdated: '2026-01-05T11:20:00Z',
    currentStepId: 'campaign-classification',
    currentStepNumber: 3,
    status: 'active',
    value: '$750K',
    priority: 'medium',
    createdAt: '2025-12-22T09:30:00Z',
    artifacts: [
      { 
        id: 'art-012', 
        filename: 'roc_enrichment_results.csv', 
        type: 'CSV', 
        stepId: 'campaign-classification', 
        createdAt: '2026-01-05T10:00:00Z', 
        size: '678 KB', 
        previewType: 'table',
        previewData: {
          headers: ['Metric', 'Current State', 'Optimized State', 'Improvement', 'Confidence'],
          rows: [
            ['Payment Cycle Time', '4.2 days', '1.8 days', '57%', '94%'],
            ['Straight-Through Processing', '45%', '89%', '+44pp', '91%'],
            ['Exception Rate', '12%', '3%', '-75%', '88%'],
            ['Cost per Payment', '$4.50', '$1.20', '73%', '92%'],
            ['Vendor Satisfaction', '3.2/5', '4.5/5', '+41%', '85%'],
          ]
        }
      },
    ],
  },
  'deal-007': {
    id: 'deal-007',
    name: 'BankFirst Corp - Connectivity Services',
    customer: 'BankFirst Corp',
    channel: 'Wells Fargo',
    owner: 'Emily Rodriguez',
    lastUpdated: '2026-01-03T14:00:00Z',
    currentStepId: 'internal-value-statement',
    currentStepNumber: 4,
    status: 'pending',
    value: '$2.1M',
    priority: 'critical',
    createdAt: '2025-12-10T08:00:00Z',
    needsInput: true,
    inputType: 'ROI Data',
    artifacts: [
      { 
        id: 'art-013', 
        filename: 'swift_connectivity_proposal.eml', 
        type: 'Email', 
        stepId: 'internal-value-statement', 
        createdAt: '2026-01-03T13:00:00Z', 
        size: '45 KB', 
        previewType: 'email',
        previewData: {
          from: 'emily.rodriguez@bottomline.com',
          to: 'robert.chen@bankfirst.com',
          subject: 'BankFirst SWIFT Connectivity - Value Proposition & Next Steps',
          date: 'Jan 3, 2026 1:00 PM',
          body: `Dear Robert,

Thank you for the detailed discussion on BankFirst's SWIFT connectivity requirements. I'm pleased to present our value proposition:

🏦 Current Challenges Identified:
- Legacy SWIFT infrastructure with high maintenance costs
- Manual message repair rate of 8%
- Limited support for ISO 20022 migration
- Multiple vendor relationships to manage

💡 Bottomline Connectivity Services Solution:
1. Managed SWIFT Service Bureau
2. Automated message transformation & enrichment
3. Full ISO 20022 migration support
4. Single point of contact for all connectivity

📊 Projected Value (3-Year):
- Infrastructure cost reduction: $890,000
- FTE reallocation savings: $450,000
- Message repair automation: $234,000
- Risk mitigation value: $500,000
- TOTAL VALUE: $2,074,000

�?To finalize the ROI model, I need:
- Current SWIFT message volumes by type
- Annual infrastructure spend breakdown
- FTE allocation for payment operations

Could you provide this by Friday?

Best regards,
Emily`
        }
      },
    ],
  },
  'deal-008': {
    id: 'deal-008',
    name: 'MegaRetail Inc. - Digital Banking',
    customer: 'MegaRetail Inc.',
    channel: 'Citibank',
    owner: 'Sarah Johnson',
    lastUpdated: '2026-01-05T08:45:00Z',
    currentStepId: 'external-roi',
    currentStepNumber: 5,
    status: 'active',
    value: '$980K',
    priority: 'high',
    createdAt: '2025-12-05T10:00:00Z',
    artifacts: [
      { 
        id: 'art-014', 
        filename: 'pricing_calculator_output.csv', 
        type: 'CSV', 
        stepId: 'external-roi', 
        createdAt: '2026-01-05T08:00:00Z', 
        size: '34 KB', 
        previewType: 'table',
        previewData: {
          headers: ['Component', 'List Price', 'Discount', 'Net Price', 'Term'],
          rows: [
            ['Platform License', '$450,000', '15%', '$382,500', '3 years'],
            ['Implementation', '$180,000', '10%', '$162,000', 'One-time'],
            ['Annual Support', '$120,000', '15%', '$102,000', 'Per year'],
            ['API Transactions', '$150,000', '20%', '$120,000', 'Per year'],
            ['Training', '$25,000', '0%', '$25,000', 'One-time'],
          ]
        }
      },
    ],
  },
  'deal-009': {
    id: 'deal-009',
    name: 'PeopleFirst Co. - Message Transformation & Enrichment',
    customer: 'PeopleFirst Co.',
    channel: 'JPMorgan Chase',
    owner: 'David Kim',
    lastUpdated: '2026-01-04T12:00:00Z',
    currentStepId: 'intake',
    currentStepNumber: 1,
    status: 'active',
    value: '$340K',
    priority: 'low',
    createdAt: '2026-01-04T10:00:00Z',
    needsInput: true,
    inputType: 'Customer Data',
    artifacts: [
      { 
        id: 'art-015', 
        filename: 'initial_contact.eml', 
        type: 'Email', 
        stepId: 'intake', 
        createdAt: '2026-01-04T10:00:00Z', 
        size: '15 KB', 
        previewType: 'email',
        previewData: {
          from: 'maria.santos@peoplefirst.com',
          to: 'david.kim@bottomline.com',
          subject: 'Message Transformation Inquiry - PeopleFirst Co.',
          date: 'Jan 4, 2026 10:00 AM',
          body: `Hi David,

We were referred to Bottomline by our banking partner regarding message transformation capabilities.

Our situation:
- We're a mid-size HR services company
- Currently processing payroll for 200+ clients
- Need to convert legacy payment formats to ISO 20022
- Monthly payment volume: ~45,000 transactions

Key requirements:
1. MT103 to pacs.008 transformation
2. Bulk payment file enrichment
3. Real-time validation & repair
4. Audit trail and reporting

Could we schedule a discovery call this week?

Thanks,
Maria Santos
Payment Operations Manager
PeopleFirst Co.`
        }
      },
    ],
  },
  'deal-010': {
    id: 'deal-010',
    name: 'RegTech Partners - Risk Solutions',
    customer: 'RegTech Partners',
    channel: 'Bank of America',
    owner: 'Michael Chen',
    lastUpdated: '2026-01-05T13:00:00Z',
    currentStepId: 'external-roi',
    currentStepNumber: 5,
    status: 'active',
    value: '$1.5M',
    priority: 'high',
    createdAt: '2025-11-28T09:00:00Z',
    artifacts: [
      { 
        id: 'art-016', 
        filename: 'fraud_detection_metrics.csv', 
        type: 'CSV', 
        stepId: 'external-roi', 
        createdAt: '2026-01-05T12:00:00Z', 
        size: '234 KB', 
        previewType: 'table',
        previewData: {
          headers: ['Metric', 'Industry Avg', 'With Bottomline', 'Improvement', 'Annual Impact'],
          rows: [
            ['Fraud Detection Rate', '67%', '94%', '+27pp', '$2.3M prevented'],
            ['False Positive Rate', '45%', '12%', '-73%', '890 hrs saved'],
            ['Detection Speed', '24 hrs', '< 1 min', '99.9%', 'Real-time'],
            ['Investigation Time', '4.5 hrs', '45 min', '-83%', '$180K saved'],
            ['Regulatory Fines', '$500K avg', '$0', '-100%', '$500K avoided'],
          ]
        }
      },
    ],
  },
  'deal-011': {
    id: 'deal-011',
    name: 'SensorNet Ltd. - Message Vault',
    customer: 'SensorNet Ltd.',
    channel: 'Citibank',
    owner: 'Emily Rodriguez',
    lastUpdated: '2026-01-02T17:30:00Z',
    currentStepId: 'salesforce-sync',
    currentStepNumber: 7,
    status: 'active',
    value: '$670K',
    priority: 'medium',
    createdAt: '2025-11-15T14:00:00Z',
    artifacts: [
      { 
        id: 'art-017', 
        filename: 'contract_signature_request.eml', 
        type: 'Email', 
        stepId: 'salesforce-sync', 
        createdAt: '2026-01-02T17:00:00Z', 
        size: '22 KB', 
        previewType: 'email',
        previewData: {
          from: 'emily.rodriguez@bottomline.com',
          to: 'james.wilson@sensornet.io',
          subject: 'SensorNet - Message Vault Contract Ready for Signature',
          date: 'Jan 2, 2026 5:00 PM',
          body: `Hi James,

Great news! All approvals are in place and the contract is ready for signature.

📋 Contract Summary:
- Product: Message Vault Enterprise
- Term: 3 years
- Total Contract Value: $670,000
- Annual Fee: $210,000 (Year 1), $230,000 (Years 2-3)

📦 Included:
�?Unlimited message storage
�?7-year retention
�?Advanced search & analytics
�?Regulatory reporting module
�?24/7 premium support

🚀 Implementation Timeline:
- Kickoff: Jan 15, 2026
- Go-live: Mar 1, 2026

Please DocuSign at your earliest convenience. Let me know if you have any final questions!

Best,
Emily Rodriguez
Account Executive
Bottomline Technologies`
        }
      },
    ],
  },
  'deal-012': {
    id: 'deal-012',
    name: 'AdTech Global - Paymode',
    customer: 'AdTech Global',
    channel: 'US Bank',
    owner: 'Sarah Johnson',
    lastUpdated: '2026-01-05T15:00:00Z',
    currentStepId: 'processing',
    currentStepNumber: 2,
    status: 'active',
    value: '$890K',
    priority: 'medium',
    createdAt: '2025-12-18T11:00:00Z',
    processingProgress: 89,
    processingEta: '4 min',
    artifacts: [
      { 
        id: 'art-018', 
        filename: 'vendor_payment_analysis.csv', 
        type: 'CSV', 
        stepId: 'processing', 
        createdAt: '2026-01-05T14:00:00Z', 
        size: '567 KB', 
        previewType: 'table',
        previewData: {
          headers: ['Vendor Category', 'Count', 'Annual Spend', 'Paymode Eligible', 'Rebate Potential'],
          rows: [
            ['Media Vendors', '234', '$12,500,000', '89%', '$156,250'],
            ['Technology', '156', '$8,900,000', '92%', '$122,820'],
            ['Professional Services', '89', '$4,500,000', '78%', '$52,650'],
            ['Office & Facilities', '312', '$2,100,000', '95%', '$29,925'],
            ['Travel & Expense', '67', '$1,800,000', '45%', '$12,150'],
          ]
        }
      },
    ],
  },
  'deal-013': {
    id: 'deal-013',
    name: 'IndustrialX Corp - Receive Payments',
    customer: 'IndustrialX Corp',
    channel: 'Wells Fargo',
    owner: 'David Kim',
    lastUpdated: '2026-01-04T09:15:00Z',
    currentStepId: 'processing',
    currentStepNumber: 2,
    status: 'on-hold',
    value: '$1.1M',
    priority: 'low',
    createdAt: '2025-12-12T08:30:00Z',
    artifacts: [
      { 
        id: 'art-019', 
        filename: 'hold_notification.eml', 
        type: 'Email', 
        stepId: 'processing', 
        createdAt: '2026-01-04T09:00:00Z', 
        size: '12 KB', 
        previewType: 'email',
        previewData: {
          from: 'tom.harris@industrialx.com',
          to: 'david.kim@bottomline.com',
          subject: 'RE: IndustrialX - Project Timeline Update',
          date: 'Jan 4, 2026 9:00 AM',
          body: `Hi David,

I wanted to give you a heads up - we need to put the Receive Payments project on hold temporarily.

Reason: Our CFO announced a company-wide budget review for Q1. All new technology investments over $500K are paused until the review completes (expected Feb 15).

This is NOT a reflection of our interest in Bottomline - we're very excited about the solution and the projected $450K in AR improvements.

Can we reconnect mid-February to resume discussions?

Apologies for any inconvenience.

Best,
Tom Harris
Controller, IndustrialX Corp`
        }
      },
    ],
  },
  'deal-014': {
    id: 'deal-014',
    name: 'SecureBank Inc. - AP Automation For Real Estate',
    customer: 'SecureBank Inc.',
    channel: 'JPMorgan Chase',
    owner: 'Michael Chen',
    lastUpdated: '2026-01-05T10:00:00Z',
    currentStepId: 'intake',
    currentStepNumber: 1,
    status: 'active',
    value: '$3.2M',
    priority: 'critical',
    createdAt: '2026-01-01T09:00:00Z',
    needsInput: true,
    inputType: 'Data Schema',
    artifacts: [
      { 
        id: 'art-020', 
        filename: 'property_portfolio_data.csv', 
        type: 'CSV', 
        stepId: 'intake', 
        createdAt: '2026-01-05T09:00:00Z', 
        size: '3.4 MB', 
        previewType: 'table',
        previewData: {
          headers: ['Property ID', 'Property Name', 'Monthly Invoices', 'Vendors', 'Annual AP Volume'],
          rows: [
            ['PROP-001', 'Downtown Tower', '456', '89', '$12,450,000'],
            ['PROP-002', 'Riverside Complex', '234', '67', '$8,900,000'],
            ['PROP-003', 'Tech Park Campus', '567', '123', '$15,670,000'],
            ['PROP-004', 'Metro Mall', '345', '78', '$9,800,000'],
            ['PROP-005', 'Harbor View', '189', '45', '$5,600,000'],
          ]
        }
      },
      { 
        id: 'art-021', 
        filename: 'data_schema_request.eml', 
        type: 'Email', 
        stepId: 'intake', 
        createdAt: '2026-01-05T09:30:00Z', 
        size: '18 KB', 
        previewType: 'email',
        previewData: {
          from: 'michael.chen@bottomline.com',
          to: 'patricia.lee@securebank.com',
          subject: 'SecureBank - Data Schema Clarification Needed',
          date: 'Jan 5, 2026 9:30 AM',
          body: `Hi Patricia,

Quick question on the property portfolio data you sent over.

I noticed the vendor data has some inconsistencies:
- Property IDs in different formats (PROP-XXX vs numeric)
- Some vendor records missing tax IDs
- GL coding varies by property

To proceed with the data cleanup, I need:

1. Master property ID mapping file
2. Vendor master with complete tax ID information  
3. Standard GL code mapping across all properties

Could you also confirm:
- Are there any properties being added/removed in 2026?
- What's the preferred vendor onboarding workflow?

This is blocking the Alteryx mapping step. Appreciate a quick turnaround!

Thanks,
Michael Chen
Solutions Consultant
Bottomline Technologies`
        }
      },
    ],
  },
  'deal-015': {
    id: 'deal-015',
    name: 'WarehousePro LLC - Connection Hub',
    customer: 'WarehousePro LLC',
    channel: 'Bank of America',
    owner: 'Emily Rodriguez',
    lastUpdated: '2026-01-03T16:45:00Z',
    currentStepId: 'salesforce-sync',
    currentStepNumber: 6,
    status: 'completed',
    value: '$420K',
    priority: 'low',
    createdAt: '2025-11-20T10:00:00Z',
    artifacts: [
      { 
        id: 'art-022', 
        filename: 'deal_closed_summary.csv', 
        type: 'CSV', 
        stepId: 'salesforce-sync', 
        createdAt: '2026-01-03T16:00:00Z', 
        size: '45 KB', 
        previewType: 'table',
        previewData: {
          headers: ['Milestone', 'Target Date', 'Actual Date', 'Status', 'Notes'],
          rows: [
            ['Contract Signed', 'Dec 15, 2025', 'Dec 12, 2025', '�?Complete', '3 days early'],
            ['Kickoff Meeting', 'Dec 20, 2025', 'Dec 20, 2025', '�?Complete', 'On schedule'],
            ['Integration Setup', 'Jan 5, 2026', 'Jan 3, 2026', '�?Complete', '2 days early'],
            ['UAT Complete', 'Jan 15, 2026', '-', 'In Progress', 'On track'],
            ['Go-Live', 'Jan 31, 2026', '-', 'Scheduled', ''],
          ]
        }
      },
    ],
  },
};

export function getDealById(dealId: string): Deal | undefined {
  return mockDeals[dealId.toLowerCase()];
}

export function getAllDeals(): Deal[] {
  return Object.values(mockDeals);
}

export function getArtifactsByStepId(deal: Deal, stepId: string): Artifact[] {
  return deal.artifacts.filter(artifact => artifact.stepId === stepId);
}

export function getDealsNeedingInput(): Deal[] {
  return Object.values(mockDeals).filter(deal => deal.needsInput);
}

export function getDealsInProcessing(): Deal[] {
  return Object.values(mockDeals).filter(deal => deal.currentStepId === 'processing' && deal.processingProgress !== undefined);
}

export function getChannels(): string[] {
  const channels = new Set(Object.values(mockDeals).map(d => d.channel));
  return Array.from(channels).sort();
}

export function getDealsByChannel(channel: string): Deal[] {
  return Object.values(mockDeals).filter(d => d.channel === channel);
}

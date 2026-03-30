/* ─── Campaign Types ─── */

export type CampaignStatus = 'draft' | 'generating' | 'pending_approval' | 'approved' | 'active' | 'archived'
export type ChannelType = 'cold_call' | 'voicemail' | 'email_sequence' | 'linkedin' | 'objection_handling'
export type FrameworkType = 'maniac_method'
export type ChannelApprovalStatus = 'draft' | 'approved' | 'rejected'

/* ─── Database Row Types ─── */

export interface Campaign {
  id: string
  name: string
  description: string | null
  event_name: string | null
  event_date: string | null
  target_audience: string | null
  created_by: string
  status: CampaignStatus
  approved_by: string | null
  approved_at: string | null
  frameworks: FrameworkType[]
  metadata: CampaignMetadata
  created_at: string
  updated_at: string
}

export interface CampaignFile {
  id: string
  campaign_id: string
  file_name: string
  file_type: string | null
  extracted_text: string | null
  file_size: number | null
  uploaded_by: string
  created_at: string
}

export interface CampaignChannel {
  id: string
  campaign_id: string
  channel_type: ChannelType
  framework: FrameworkType
  content: ChannelContent
  status: ChannelApprovalStatus
  approved_by: string | null
  approved_at: string | null
  created_at: string
  updated_at: string
}

export interface CampaignContactScript {
  id: string
  campaign_id: string
  channel_id: string
  contact_name: string
  contact_title: string | null
  company: string
  module_stack: string[]
  company_size: string | null
  industry: string | null
  personalized_content: PersonalizedContent
  created_at: string
}

/* ─── Structured Content Types ─── */

export interface CampaignMetadata {
  event_details?: string
  key_themes?: string[]
  value_props?: string[]
  integration_angles?: Record<string, string>
  brand_voice?: string
  total_files?: number
  generated_at?: string
}

// Union type for channel content — varies by channel_type
export type ChannelContent =
  | ColdCallContent
  | VoicemailContent
  | EmailSequenceContent
  | LinkedInContent
  | ObjectionHandlingContent

export interface ColdCallContent {
  opener: string
  value_prop: string
  binary_ask: string
  closing: string
  module_variants: Record<string, { opener: string; value_prop: string; binary_ask: string }>
}

export interface VoicemailContent {
  script: string
  duration_target: string
  module_variants: Record<string, string>
}

export interface EmailSequenceContent {
  emails: Array<{
    subject: string
    body: string
    send_day: number
    purpose: string
  }>
}

export interface LinkedInContent {
  connection_request: string
  inmail: string
  follow_up: string
  video_inmail_script: string
}

export interface ObjectionHandlingContent {
  objections: Array<{
    objection: string
    response: string
    follow_up_question: string
    reframe: string
  }>
}

export interface PersonalizedContent {
  cold_call?: string
  voicemail?: string
  email?: string
  linkedin?: string
  notes?: string
}

/* ─── Display Helpers ─── */

export const CHANNEL_LABELS: Record<ChannelType, string> = {
  cold_call: 'Cold Call Script',
  voicemail: 'Voicemail Drop',
  email_sequence: 'Email Sequence',
  linkedin: 'LinkedIn Messaging',
  objection_handling: 'Objection Handling',
}

export const CHANNEL_ICONS: Record<ChannelType, string> = {
  cold_call: 'Phone',
  voicemail: 'Voicemail',
  email_sequence: 'Mail',
  linkedin: 'Linkedin',
  objection_handling: 'Shield',
}

export const FRAMEWORK_LABELS: Record<FrameworkType, string> = {
  maniac_method: 'The Maniac Method',
}

export const STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: 'Draft',
  generating: 'Generating...',
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  active: 'Active',
  archived: 'Archived',
}

export const CHANNEL_ORDER: ChannelType[] = [
  'cold_call',
  'voicemail',
  'email_sequence',
  'linkedin',
  'objection_handling',
]

// ServiceNow modules that contacts might use
export const SN_MODULES = [
  'ITSM',
  'HRSD',
  'CSM',
  'SecOps',
  'IRM',
  'ITOM',
  'App Engine',
  'Strategic Portfolio Management',
] as const

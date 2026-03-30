/**
 * Seed script: ServiceNow K26 Campaign
 * Creates the campaign, inserts extracted PDF text, ready for AI generation.
 *
 * Usage: node scripts/seed-k26-campaign.mjs
 *
 * Prerequisites: Run migration 009_campaigns.sql in Supabase first.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env.local
const envPath = resolve(__dirname, '..', '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const env = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) env[match[1].trim()] = match[2].trim()
})

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ─── Extracted text from all 7 ServiceNow PDFs ───

const files = [
  {
    file_name: 'Data-Sheet-Vbrick-ServiceNow-Now-Assist.pdf',
    file_type: 'application/pdf',
    file_size: 317084,
    extracted_text: `VIDEO KNOWLEDGE FOR NOW ASSIST

BEFORE: Now Assist brings generative AI to your business with features like AI Search, Virtual Agent, Custom Skills, and Agentic Workflows. But that leaves a major gap: Video. Training sessions, town halls, customer meetings, SME roundtables, and recorded support calls contain critical operational insight — yet most organizations can't easily use video as a knowledge source for AI.

AFTER: Vbrick changes that. Vbrick transforms enterprise video libraries into structured, searchable knowledge to fuel Now Assist.

TURN ENTERPRISE VIDEO INTO AI-READY KNOWLEDGE
With the Vbrick AI Search Connector, Now Assist can:
- Surface relevant videos directly in AI Search
- Generate Genius Results using video as a cited source
- Enhance Virtual Agent responses with video-backed answers, citations, and links
- Enable custom Now Assist skills powered by video insights inside Agent Workspace and workflows

BETTER ANSWERS, FASTER RESOLUTION, AND GREATER NOW ASSIST ROI
When Now Assist uses video as a knowledge source, everyone benefits:
- More accurate answers grounded in real training and communications
- Faster resolution by instantly pointing employees and agents to the right video
- Improved self-service and case deflection by expanding the knowledge base beyond text and tickets
- Higher Now Assist ROI by leveraging and activating information contained in videos already created

SEAMLESS INTEGRATION WITH NOW ASSIST
Vbrick makes your video library searchable and usable across ServiceNow, including employee portals, ITSM, CRM, and agentic workflows, while keeping video access governed by enterprise policies.

HOW IT WORKS:
1. Vbrick indexes video using transcripts, metadata, and AI enrichment
2. Now Assist uses video knowledge to generate answers with citations and links
3. Users jump directly to the right moment in the video without leaving ServiceNow

POWER NOW ASSIST WITH ENTERPRISE VIDEO INTELLIGENCE
Your video library may be the most valuable knowledge source Now Assist cannot yet use. Vbrick makes that knowledge accessible to Now Assist.

Learn more: vbrick.com/servicenow/nowassist`
  },
  {
    file_name: 'Data-Sheet-Vbrick-AI-Search-in-ServiceNow.pdf',
    file_type: 'application/pdf',
    file_size: 347232,
    extracted_text: `VBRICK VIDEO EXPANDS THE POWER OF AI SEARCH IN SERVICENOW

Faster and Smarter Ways to Engage with Video
AI Search now surfaces intelligent videos, delivering rich content instantly while driving the highest levels of user engagement.

Put Video Everywhere Work Is Done
Embed videos into ServiceNow pages, portals, knowledge articles, and workflows to greatly enhance your teams' operations.

Easily Manage Videos
Manage and organize your video assets in a single platform that's seamlessly integrated into every corner of ServiceNow.

THE VALUE OF VBRICK VIDEO: BETTER OUTCOMES

Engaged Employees — Deliver media-rich experiences that employees and customers will love.

Fewer Cases — Empower users with self-service videos, reducing the need to submit cases in ServiceNow.

Faster Resolutions — Equip support teams with video content to drive faster, more efficient incident resolution.

GET STARTED WITH VBRICK + SERVICENOW: www.vbrick.com/servicenow-demo`
  },
  {
    file_name: 'Data-Sheet-Vbrick-Video-Connector-for-ServiceNow.pdf',
    file_type: 'application/pdf',
    file_size: 309985,
    extracted_text: `VBRICK VIDEO CONNECTOR FOR SERVICENOW

It's no surprise that automation and video go hand-in-hand in the digital era. As your enterprise reimagines traditional ways of working, harness this powerful combination to remove complexity, enhance experiences, and unleash new possibilities.

With Vbrick Video Connector, available in the ServiceNow store, securely deliver your Vbrick-hosted videos directly into users' ServiceNow experiences — without re-provisioning access rights.

The integration available with these two leading platforms makes it possible for IT, HR, and corporate communications teams to embed live video and incorporate recordings stored in your Vbrick tenant on the ServiceNow pages they create. From broadcasting executives' announcements to streamlining onboarding with self-service tech tutorials to educating employees on new open enrollment benefits, your enterprise can ensure that the right users have access to the right content — at just the right times.

SECURELY INTEGRATE YOUR VBRICK-HOSTED VIDEOS INTO SERVICENOW PAGES AND PORTALS
- Engage and inform large, global audiences by integrating video into everyday applications and tools.
- Enhance communication and improve efficiency with video assets that are easily accessible.
- Increase productivity by delivering valuable and timely content directly within familiar experiences.
- Protect your data and meet security requirements by automatically applying your Vbrick-based access controls (via JSON Web Token authentication).
- Make the most of your ServiceNow investment and scale your video communication strategy with ease.

HOW IT WORKS:
1. Find Vbrick Video on the ServiceNow store.
2. Provision the app to integrate your Vbrick tenant with your ServiceNow instance.
3. Embed live or recorded video directly in your ServiceNow pages and portals.
4. Deliver content to viewers based on their existing permissions in Vbrick.

LEARN MORE: www.vbrick.com/servicenow or email: contactus@vbrick.com`
  },
  {
    file_name: 'Data-Sheet-Vbrick-Video-Content-Embedding-in-ServiceNow.pdf',
    file_type: 'application/pdf',
    file_size: 253989,
    extracted_text: `SUPERCHARGE ITSM WITH AI-POWERED VIDEO

VBRICK'S GEN AI AUTOMATICALLY DELIVERS VIDEO INTO SERVICENOW WORKFLOWS

As video use continues to explode within the enterprise, organizations have created massive amounts of video — promotional videos, employee-generated content, and especially recorded meetings and events. Using Vbrick to aggregate these videos is the key to unlocking the goldmine of value they contain.

TRANSFORM SERVICE DELIVERY WITH VIDEO
Vbrick Enterprise Video Platform (EVP) unifies and securely distributes recorded video. When integrated with ServiceNow, Vbrick's enhanced and generative AI automates the delivery of video, placing relevant content in front of the right person, at the right time, as part of the business process.

Within ServiceNow Workflows, this combination provides a streamlined user experience that transforms knowledge sharing, increases self-service opportunities, and speeds time to resolution.

HOW IT WORKS (for agents using IT Service Manager / ITSM):
- When an issue is logged, Vbrick's AI automatically serves a curated list of relevant videos based on the ticket details.
- Each video has a description and transcript with timestamps showing when the support topic is discussed.
- Authentication happens behind the scenes and granular viewing permissions control which videos are made available.
- Clicking on a video launches the player right within ServiceNow.
- A transcript of the content is displayed in an interactive panel.
- Searching by keyword identifies where the topic is mentioned.
- Metadata shows the video's owner, upload date, and ratings.
- Using the video assistant, ask questions to pinpoint specific details.

Improve employee experiences by automatically and intelligently bringing video into any ServiceNow Workflow. Revolutionize the way your teams work by putting information they can see right at their fingertips to streamline processes and increase productivity.

READY TO LEARN MORE? Request a demo to see the AI in action. www.vbrick.com/servicenow`
  },
  {
    file_name: 'Data-Sheet-Vbrick-Video-on-Demand-for-ServiceNow.pdf',
    file_type: 'application/pdf',
    file_size: 323158,
    extracted_text: `SECURELY ADD VIDEO INTO YOUR DIGITAL WORKPLACE

USE VBRICK VIDEO ON DEMAND TO GET EVEN MORE FROM YOUR SERVICENOW INVESTMENT

ServiceNow is a powerful platform for automating processes, reducing costs, and improving employee experiences. Add relevant video content to your pages and portals and watch those benefits grow exponentially.

A SECURE VAULT FOR EMBEDDING INTELLIGENT VIDEO IN SERVICENOW
Vbrick, the leading enterprise video platform provider, is trusted by the world's largest brands to meet their end-to-end video needs. We bring our years of experience in managing and safeguarding corporate video content to ServiceNow by offering Vbrick Video on Demand. It's an AI-driven, on-demand video platform that lets you create and store videos in one secure, consolidated library and easily embed them in ServiceNow portals or pages for users throughout the enterprise.

Key Capabilities:
- Engage and inform large, global audiences at scale. HR, corporate communications, and IT teams can securely embed videos within their ServiceNow pages or portals to improve knowledge sharing.
- Increase productivity and employee experiences. Deliver valuable and timely content — enriched with industry-leading AI capabilities such as transcription, translation, summaries, and a video assistant — directly within familiar experiences.
- Enhance self-service initiatives. Minimize ticket submissions and optimize resources by embedding video on the pages people regularly visit for information.
- Automate video capture. Users can easily upload or create new videos with native webcam and screenshare capabilities — all protected by strict security policies.
- Meet compliance and regulatory requirements. Maintain video-based data confidentiality, integrity, and availability by establishing viewer roles and permissions and defining governance rules to automatically manage content so the right messages are seen by the right people, at the right time (and for the right duration).
- Simplify video analytics. Surface and track powerful video insights, including video viewing details, on a single platform.

ENABLE SMARTER WORK, EXCEPTIONAL EXPERIENCES, AND TRANSFORMATIVE OUTCOMES
With your ServiceNow implementation, your organization is well on its way to digital transformation. By adding Vbrick Video on Demand, you can accelerate the benefits of ServiceNow by bringing intelligent video to the pages and portals your teams access every day — all while protecting confidential content.
- Augment and enhance knowledge sharing by providing relevant video content
- Improve processes across the enterprise by harnessing the power of video
- Create an ecosystem that eliminates friction and accelerates growth
- Deliver a unified experience where information is available for the right users, when they need it

Use Video to Drive More Value from ServiceNow for Your Entire Organization:

Engage Employees — Create and embed videos in division or company-wide intranet sites in Employee Center to improve employee communications and engagement. Examples: HR's new open enrollment benefits explainer video, IT's hot desk policy review, Corp comm's latest townhall recording.

Improve Operational Efficiency — Publish videos and knowledge management articles in Service Portal to reduce ticket volume and IT burden. Examples: Instructions for installing new software, Steps to update passwords, Process for creating/submitting tickets.

Enrich Customer Experiences — Create a secure, centralized video vault where end users (internal employees, partners, and/or customers) can easily search for and access video content in a knowledge base or portal. Examples: How-to and promotional videos, Service overviews, Product support.

COMBINE THE POWER OF TWO INDUSTRY-LEADING ENTERPRISE PLATFORMS
The integration with ServiceNow and Vbrick Video on Demand lets you create rich and compelling content experiences that include video to increase employee engagement, reduce the volume of service requests, and keep your organization's video safe and secure.`
  },
  {
    file_name: 'Vbrick-vs-Other-Video-Integrations-in-ServiceNow.pdf',
    file_type: 'application/pdf',
    file_size: 163545,
    extracted_text: `THE DIFFERENCE BETWEEN "GOOD ENOUGH" AND VBRICK VIDEO, A CERTIFIED APP FOR SERVICENOW

You may feel that your video integration with ServiceNow is "good enough." But when you factor in the effort to build, maintain, secure, and scale it — along with the user experience — the gaps become clear.

Stop Settling for Workarounds. Get Seamless Video, Right in ServiceNow.

Vbrick is the only AI-powered enterprise video platform with a certified, pre-built integration for ServiceNow that's purpose-built to scale with your organization. While disparate video player alternatives rely on workarounds, Vbrick delivers secure video natively — anywhere in ServiceNow.

With Vbrick's integration, searching, embedding, and viewing video content just works. There's no linking to external platforms, siloed systems, extra logins, or piecing together analytics. Video becomes seamless, searchable, and integrated into the fabric of everyday work.

VBRICK ADVANTAGE vs OTHER ALTERNATIVES:

Installation: Fast (out-of-the-box, pre-built integration) vs Tedious, time-consuming custom development and testing.
Native Integration: Only certified video app available on the ServiceNow Store vs No certified integration.
Update Compatibility: Testing conducted as standard practice with each release vs Custom software updates and testing required for every release.
Maintenance Effort: Vendor-supported vs High (continuous in-house or third-party development required).
Security and Compliance: Enterprise-grade security and role-based access controls vs Custom code must be hardened and ongoing maintenance.
Cost of Ownership: Low costs (predictable and controlled) vs High costs (building, reworking, and ongoing support).
User Experience: Fully secure with seamless JWT authentication — no additional user logins required. In-platform video playback. Easy-to-use AI-powered features for search, discovery, and accessibility. vs May require additional login. Users may be redirected outside ServiceNow. Limited or no integrated AI capabilities for video content.

SEE THE DIFFERENCE — Request a demo: vbrick.com/servicenow-demo`
  },
  {
    file_name: 'Data-Sheet-Vbrick-ServiceNow-Employee-Center-Pro.pdf',
    file_type: 'application/pdf',
    file_size: 3424572,
    extracted_text: `VBRICK BRINGS AI-POWERED VIDEO TO EMPLOYEE CENTER PRO

Discover a new era of employee engagement and productivity with Vbrick's seamless integration into ServiceNow's Employee Center Pro. By embedding live broadcasts and recorded videos into the heart of your company's information hub, you provide employees with engaging, informative content right where it's needed, when it's needed.

PLACE VIDEO WHERE IT MATTERS MOST
Revolutionize the employee experience by delivering secure, high-quality video content at scale within a single, unified platform. Whether it's a company-wide live broadcast or a recorded announcement, Vbrick ensures your confidential information remains protected with end-to-end enterprise security. By centralizing all your video content in one place, employees can easily access the resources they need to streamline their daily tasks and enhance productivity.

REIMAGINE YOUR EMPLOYEE EXPERIENCE PLATFORM:
- Remote Engagement: Reach a wider audience with live-streamed executive updates, fireside chats, and departmental meetings.
- Learning and Development: Offer professional development videos to support continuous learning and skill enhancement and track completion for compliance purposes.
- Efficient HR Processes: Provide video tutorials for routine HR tasks such as PTO requests, payroll updates, and performance evaluations.
- Showcase Company Culture: Use video to attract and retain top talent by showcasing your unique company culture and career opportunities.
- Inclusive and Accessible Content: Automatically create transcriptions and translations for all videos to ensure inclusivity.
- Promote Collaboration: Share testimonials and success stories to foster a sense of community and collaboration.
- Strengthen Corporate Identity: Highlight your DE&I initiatives, community projects, and employee resource groups through engaging video content.
- Simplify Benefits Enrollment: Guide employees through benefits enrollment with clear, instructional videos.
- Streamlined Onboarding: Create comprehensive instructional videos to ease new hires into their roles.

FUEL A MORE PRODUCTIVE AND ENGAGED WORKFORCE
With AI-powered video integrated into Employee Center Pro, you can boost knowledge sharing, accelerate workflows, and enhance overall employee engagement.
- Video-Powered Company Intranet: Boost engagement with high-quality video content in a unified platform that makes it easy for employees to find the resources they need, streamlining their tasks and elevating productivity.
- Rich Content Editor: Incorporate video seamlessly when creating dynamic web pages, news pages, and articles. Use an intuitive drag-and-drop interface to enrich your content without needing IT support.
- Intelligent Video Management: Create summaries, titles, chapters, and tags with a single click, saving valuable time and enhancing metadata to improve video discoverability.
- Dynamic Embedding Options: Embed on-demand videos, live broadcasts, and playlists. Customize your portal and page layouts with video sliders, film strips, or galleries.
- Secured Viewing: Enjoy secure and uninterrupted video viewing with automatic user authentication between platforms. Manage access to specific video content with enterprise-grade controls to protect internal communications.
- Customizable Playlists: Choose between curated static playlists or keep content fresh with dynamic playlists that update automatically based on preset smart search filters.
- Robust Analytics: Access valuable viewer insights and metrics such as viewing time, drop-off, and completion rates.

ENHANCE YOUR DIGITAL EMPLOYEE EXPERIENCE WITH AI-POWERED FEATURES:
- Video Assistant: Ask a virtual assistant questions to extract insights and specific information from video files, providing instant access to key details.
- Transcript Search: Watch in your preferred language and easily search through video transcripts to pinpoint specific information or speaker appearances, saving time and improving efficiency.
- Smart Summaries and Chapters: Glance through summaries for a preview of the video contents and navigate to chapters to quickly find the information you need.

CREATE MORE CONNECTED, ENGAGED TEAMS WITH VBRICK
Visit: www.vbrick.com/servicenow-demo`
  },
]

// ─── Create campaign and insert files ───

async function seed() {
  console.log('Creating ServiceNow K26 campaign...')

  // Create the campaign
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .insert({
      name: 'ServiceNow K26 — Booth Campaign',
      description: 'Drive booth traffic and meeting conversion at ServiceNow Knowledge 26. Vbrick is the only AI-powered enterprise video platform with a certified, pre-built integration for ServiceNow. Use case focus: Now Assist video knowledge, AI Search video, ITSM workflow embedding, Employee Center Pro, Video on Demand, and Video Connector.',
      event_name: 'ServiceNow Knowledge 26 (K26)',
      target_audience: 'ServiceNow customers and prospects — IT leaders, ITSM managers, HR/employee experience leaders, CIO/CTO, internal communications teams — who already run ServiceNow and want to add enterprise video into their workflows, Employee Center Pro, Service Portal, and Now Assist AI.',
      created_by: 'jeff@forgetime.ai',
      status: 'draft',
      frameworks: ['jmm', 'career_maniacs'],
    })
    .select()
    .single()

  if (campaignError) {
    console.error('Failed to create campaign:', campaignError.message)
    process.exit(1)
  }

  console.log(`Campaign created: ${campaign.id}`)

  // Insert all 7 file records
  const fileRecords = files.map(f => ({
    campaign_id: campaign.id,
    file_name: f.file_name,
    file_type: f.file_type,
    file_size: f.file_size,
    extracted_text: f.extracted_text,
    uploaded_by: 'jeff@forgetime.ai',
  }))

  const { data: insertedFiles, error: filesError } = await supabase
    .from('campaign_files')
    .insert(fileRecords)
    .select()

  if (filesError) {
    console.error('Failed to insert files:', filesError.message)
    process.exit(1)
  }

  console.log(`Inserted ${insertedFiles.length} file records with extracted text.`)
  console.log('')
  console.log('Campaign ID:', campaign.id)
  console.log('Status: draft (ready for generation)')
  console.log('')
  console.log('Next steps:')
  console.log('1. Go to the app → Campaigns → click "ServiceNow K26 — Booth Campaign"')
  console.log('2. Click "Generate Messaging" to trigger AI generation across all 5 channels x 2 frameworks')
  console.log('3. Review and approve the generated content')
  console.log('')
  console.log('Or trigger generation via API:')
  console.log(`   POST /api/vbrick/campaigns/${campaign.id}/generate`)
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})

import { Length } from '@prisma/client';

export interface PromptParams {
  resumeContent?: string;
  jobDescription?: string;
  companyDescription?: string;
  length: Length;
  recipientName?: string;
  positionTitle?: string;
  companyName?: string;
  previousMessage?: string;
  messageType?: 'NEW' | 'FOLLOW_UP';
}

/**
 * Length modifiers for AI prompts
 */
const lengthInstructions: Record<Length, string> = {
  CONCISE: 'Keep it very concise and brief (under 150 words).',
  MEDIUM: 'Use a moderate length (150-250 words).',
  LONG: 'Provide a comprehensive response (250-400 words).',
};

/**
 * Default cover letter prompt
 */
export function getCoverLetterPrompt(params: PromptParams): { system: string; user: string } {
  const { resumeContent, jobDescription, companyDescription, length } = params;

  const system = `You are an expert cover letter writer with years of experience helping job seekers land their dream roles. Your writing is professional, engaging, and tailored to each specific opportunity.

Key principles:
- Highlight the most relevant experience and skills from the resume
- Show genuine enthusiasm for the role and company
- Use a professional yet personable tone
- Be specific and avoid generic statements
- Use proper business letter format
- ${lengthInstructions[length]}`;

  const user = `Please write a compelling cover letter for the following job opportunity:

JOB DESCRIPTION:
${jobDescription || 'Not provided'}

${companyDescription ? `COMPANY INFORMATION:\n${companyDescription}\n` : ''}
MY RESUME:
${resumeContent || 'Not provided'}

Create a cover letter that effectively showcases why I'm an excellent fit for this role.`;

  return { system, user };
}

/**
 * Default LinkedIn message prompt
 */
export function getLinkedInPrompt(params: PromptParams): { system: string; user: string } {
  const {
    resumeContent,
    jobDescription,
    companyDescription,
    length,
    recipientName,
    positionTitle,
    companyName,
    previousMessage,
    messageType,
  } = params;

  const system = `You are an expert at writing professional LinkedIn outreach messages. Your messages are personable, engaging, and effective at opening doors to new opportunities.

Key principles:
- Professional yet conversational tone
- Reference specific details from the job or company when available
- Show genuine interest and value proposition
- Include a clear call to action
- Appropriate length for LinkedIn platform
- Not overly salesy or desperate
- ${lengthInstructions[length]}`;

  let user = '';

  if (messageType === 'FOLLOW_UP' && previousMessage) {
    user = `Please write a professional follow-up LinkedIn message.

PREVIOUS MESSAGE:
${previousMessage}

CONTEXT:
- Recipient: ${recipientName || 'Hiring Manager'}
- Position: ${positionTitle} at ${companyName}
${companyDescription ? `- Company Info: ${companyDescription}` : ''}

Write a polite follow-up that:
1. References the previous message
2. Adds value or new information
3. Gently prompts for a response
4. Maintains professional courtesy`;
  } else {
    user = `Please write a professional LinkedIn outreach message for the following opportunity:

RECIPIENT: ${recipientName || 'Hiring Manager'}
POSITION: ${positionTitle} at ${companyName}

${jobDescription ? `JOB DESCRIPTION:\n${jobDescription}\n` : ''}
${companyDescription ? `COMPANY INFORMATION:\n${companyDescription}\n` : ''}
MY BACKGROUND:
${resumeContent || 'Not provided'}

Create a compelling message that will encourage ${recipientName || 'them'} to respond and consider my application.`;
  }

  return { system, user };
}

/**
 * Default email prompt
 */
export function getEmailPrompt(params: PromptParams): { system: string; user: string } {
  const {
    resumeContent,
    jobDescription,
    companyDescription,
    length,
    recipientName,
    positionTitle,
    companyName,
    previousMessage,
    messageType,
  } = params;

  const system = `You are an expert at writing professional job application emails. Your emails are well-structured, compelling, and effective at securing interviews.

Key principles:
- Compelling subject line that gets opened
- Professional email format with proper greeting and closing
- Clear and concise communication
- Show value proposition
- Include a clear call to action
- Proper email etiquette
- ${lengthInstructions[length]}

IMPORTANT: Format your response as:
Subject: [your subject line]

[email body with greeting and closing]`;

  let user = '';

  if (messageType === 'FOLLOW_UP' && previousMessage) {
    user = `Please write a professional follow-up email.

PREVIOUS EMAIL:
${previousMessage}

CONTEXT:
- Recipient: ${recipientName || 'Hiring Manager'}
- Position: ${positionTitle} at ${companyName}
${companyDescription ? `- Company Info: ${companyDescription}` : ''}

Write a polite follow-up email that:
1. References the previous email
2. Adds value or expresses continued interest
3. Gently prompts for a response
4. Maintains professional courtesy`;
  } else {
    user = `Please write a professional job application email for the following opportunity:

RECIPIENT: ${recipientName || 'Hiring Manager'}
POSITION: ${positionTitle} at ${companyName}

${jobDescription ? `JOB DESCRIPTION:\n${jobDescription}\n` : ''}
${companyDescription ? `COMPANY INFORMATION:\n${companyDescription}\n` : ''}
MY BACKGROUND:
${resumeContent || 'Not provided'}

Create a compelling email (with subject line) that will encourage ${recipientName || 'them'} to review my application and invite me for an interview.`;
  }

  return { system, user };
}

/**
 * Builds a custom prompt by replacing variables
 */
export function buildCustomPrompt(template: string, params: PromptParams): string {
  let prompt = template;

  // Replace all variables
  const variables: Record<string, string> = {
    '{resumeContent}': params.resumeContent || 'Not provided',
    '{jobDescription}': params.jobDescription || 'Not provided',
    '{companyDescription}': params.companyDescription || 'Not provided',
    '{length}': params.length,
    '{lengthInstruction}': lengthInstructions[params.length],
    '{recipientName}': params.recipientName || 'Hiring Manager',
    '{positionTitle}': params.positionTitle || 'the position',
    '{companyName}': params.companyName || 'the company',
    '{previousMessage}': params.previousMessage || 'Not available',
    '{messageType}': params.messageType || 'NEW',
  };

  Object.entries(variables).forEach(([key, value]) => {
    prompt = prompt.replaceAll(key, value);
  });

  return prompt;
}

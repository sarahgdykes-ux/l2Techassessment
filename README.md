# Customer Inbox Triage App

## Overview

The Customer Inbox Triage app is a lightweight AI-powered tool that helps classify customer support messages and recommend actions. It uses Groq AI to categorize messages, applies rule-based urgency scoring, and suggests next steps based on predefined templates.

## Problem Statement

Support teams waste time manually reading and triaging customer messages. This tool provides an automated first pass at classification to help prioritize and route messages more efficiently.

## Assessment Findings

### Top 3 areas for improvement

1. **Urgency scoring relied on weak signals**
   - The original scorer increased urgency for every exclamation point and decreased it for short messages, questions, polite language, weekends, and after-hours messages.
   - This created obvious false positives/negatives: "Server down now" could be Low because it is short, while a long thank-you message could be High because it contains multiple exclamation points.
   - **Implemented:** urgency is now driven by explicit incident and failure language first, with positive feedback and simple informational questions treated as lower priority. Time of day, day of week, punctuation count, and general message length are no longer used as urgency penalties.

2. **LLM category parsing is too loose**
   - The app asks the model for free-form text and then infers the category by searching the response for words such as "billing", "technical", or "feature".
   - This can produce inconsistent categories when the model's explanation contains multiple category terms.
   - **Proposed solution:** constrain the model to a fixed category schema and parse structured JSON rather than searching free-form reasoning text.

3. **Recommended actions are not sufficiently category-specific**
   - The current Feature Request template tells customers to check the billing portal, which does not match the customer's intent.
   - Technical issues also receive the same generic browser-restart advice regardless of severity.
   - **Proposed solution:** create intent-specific response templates and include urgency/context when selecting the recommended next step.

## Urgency Improvement Test

The updated scorer was tested against representative edge cases:

| Message | Expected urgency | Result |
|---|---|---|
| "Database connection lost" | High | Pass |
| "Server down now" | High | Pass |
| "Our production server is down" | High | Pass |
| "My payment failed and now I can't access the dashboard." | High | Pass |
| "Thank you so much! Your team has been incredibly helpful..." | Low | Pass |
| "hi" | Low | Pass |
| "What are your business hours?" | Low | Pass |
| "The dashboard is working slowly today." | Medium | Pass |
| "Could you add an export to CSV feature?" | Medium | Pass |

The goal of the change is not to make every short message urgent; it is to prevent high-confidence incidents from being downgraded simply because the customer wrote a short message.

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **AI**: Groq API (Llama 3.3 70B - Free tier)
- **Runtime**: Browser-based (local development only)

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Groq API key (FREE - get from https://console.groq.com)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "L2 assessment"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Groq API Key**
   
   Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Groq API key:
   ```
   VITE_GROQ_API_KEY=gsk_your-actual-key-here
   ```
   
   Get your FREE API key from: https://console.groq.com/keys

4. **Run the application**
   ```bash
   npm run dev
   ```

## How It Works

1. **Paste Message**: User pastes a customer support message into the text area
2. **Analyze**: Click "Analyze Message" to process the input
3. **Classification**: The app runs three processes:
   - **Category Classification** (LLM): Uses Groq AI (Llama 3.3 70B) to categorize messages
   - **Urgency Scoring** (Rule-based): Uses explicit incident/failure signals to determine urgency
   - **Recommendation** (Template-based): Maps category to a recommended action
4. **Display Results**: Shows category, urgency tag, recommended action, and AI reasoning
5. **History**: All analyses are saved to localStorage and viewable in the History tab

## Example Test Messages

### Example 1: Production Issue
```
Our production server is down
```

### Example 2: Customer Feedback
```
Hi there! I just wanted to say thank you for your amazing customer service. I've been using your product for three years now and I'm really happy with it. Keep up the great work!
```

### Example 3: Feature Request
```
I would love to see a dark mode option in the app. It would be much easier on my eyes during night time usage.
```

### Example 4: Payment Issue
```
I tried to update my payment method but the page keeps loading forever. Is this a known issue?
```

### Example 5: Billing Question
```
Can I upgrade my subscription to the pro plan?
```

### Example 6: Technical Support
```
The dashboard won't load when I try to access it. I've tried refreshing but it keeps timing out.
```

## Security Note

⚠️ **Warning**: This application exposes the Groq API key in the browser (using `dangerouslyAllowBrowser: true`). This is acceptable for local development only but should **NEVER** be done in production. In a real application, API calls should be made from a secure backend server.

## Why Groq?

- ✅ **Fast Inference**
- ✅ **High Quality**
- ✅ **Easy local development**

## License

This project is for educational purposes only.

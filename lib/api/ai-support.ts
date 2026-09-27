import { delay } from "@/lib/utils";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const KEYWORD_REPLIES: { keywords: string[]; reply: string }[] = [
  {
    keywords: ["wallet", "fund", "balance", "top up", "topup"],
    reply:
      "You can fund your wallet from the Wallet tab via bank transfer, debit card, or your dedicated virtual account. Transfers to your virtual account reflect instantly. Want me to walk you through it?",
  },
  {
    keywords: ["airtime"],
    reply:
      "To buy airtime: go to Services → Airtime, pick your network, enter the phone number and amount, then confirm. It lands in a few seconds. Minimum purchase is ₦50.",
  },
  {
    keywords: ["data", "bundle", "megabyte", "gigabyte", "gb", "mb"],
    reply:
      "For data, head to Services → Data, choose your network, pick a plan, and confirm — most bundles activate within seconds of payment.",
  },
  {
    keywords: ["electricity", "meter", "disco", "prepaid", "postpaid", "token"],
    reply:
      "For electricity: select your distribution company, enter your meter number and tap Verify to confirm the customer name, then choose an amount. Prepaid meters get a token instantly on the receipt screen.",
  },
  {
    keywords: ["fail", "failed", "refund", "reversed", "reversal"],
    reply:
      "If a transaction fails after your wallet is debited, we auto-retry it. If it still fails, the amount is refunded to your wallet instantly — no ticket needed. If you're not seeing a refund after a few minutes, share your transaction reference and I'll flag it.",
  },
  {
    keywords: ["pin", "password", "otp", "2fa", "security", "login"],
    reply:
      "For account security: you can set or reset your transaction PIN and password from Profile → Security. If you're stuck on an OTP, check Profile → Security → Two-factor authentication, or use 'Resend code' on the verification screen.",
  },
  {
    keywords: ["agent", "margin", "commission", "reseller"],
    reply:
      "Agents buy at wholesale rates and set their own resale price — the markup lands in your wallet the moment a customer pays. You can apply from the 'Become an Agent' page.",
  },
  {
    keywords: ["statement", "history", "download", "receipt", "export"],
    reply:
      "You can download a full statement of account from Profile → Statement of Account — pick a date range and export it as CSV. Individual transaction receipts can be shared or downloaded from the transaction details page.",
  },
  {
    keywords: ["human", "agent support", "talk to someone", "representative", "complaint"],
    reply:
      "I hear you — I can escalate this to our human support team. Please share a brief summary and your transaction reference (if any), and someone will follow up by email within a few hours.",
  },
];

const FALLBACK_REPLIES = [
  "Got it — could you tell me a bit more about what you're trying to do (e.g. airtime, wallet, electricity)?",
  "I want to make sure I get this right — are you having trouble with a payment, your wallet, or something else?",
  "Thanks for the details. Let me point you in the right direction — what service is this about?",
];

export const aiSupportApi = {
  async getReply(message: string, _history: ChatMessage[]): Promise<string> {
    await delay(900 + Math.random() * 700);

    const lower = message.toLowerCase();
    for (const entry of KEYWORD_REPLIES) {
      if (entry.keywords.some((k) => lower.includes(k))) {
        return entry.reply;
      }
    }
    return FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)];
  },
};

"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Rocket, CreditCard, Code } from "lucide-react"

const faqs = [
  {
    category: "Getting Started",
    icon: Rocket,
    questions: [
      {
        q: "How do I get my API key?",
        a: "Your API key is automatically generated when you sign up. You can view it on the API Keys page in your dashboard.",
      },
      {
        q: "What are credits and how do they work?",
        a: "Credits are used to track API usage. Each API call costs 1 credit. Your monthly credit limit depends on your plan (Free: 1,000, x402: 25,000, Enterprise: Custom).",
      },
      {
        q: "How do I make my first API call?",
        a: "Use the API Playground in your dashboard to test endpoints, or check out our documentation for code examples in various languages.",
      },
    ],
  },
  {
    category: "Billing & Plans",
    icon: CreditCard,
    questions: [
      {
        q: "What happens when I run out of credits?",
        a: "When you reach your monthly credit limit, API calls will be rate-limited. Wait for the next billing cycle to reset your credits.",
      },
      {
        q: "Can I upgrade/downgrade anytime?",
        a: "Plan upgrades are currently being finalized. Please contact support for more information about plan changes.",
      },
      {
        q: "Do unused credits roll over?",
        a: "No, credits reset at the beginning of each month and do not roll over.",
      },
    ],
  },
  {
    category: "Technical",
    icon: Code,
    questions: [
      {
        q: "What are the rate limits?",
        a: "Rate limits vary by plan: Free (10 req/min), x402 (100 req/min), Enterprise (Custom). Rate limits are based on query complexity, not just request count.",
      },
      {
        q: "Which protocols are supported?",
        a: "We support all major Solana DeFi protocols including Jupiter, Raydium, Orca, Drift, Kamino, Meteora, and more. See our documentation for the full list.",
      },
      {
        q: "How do I handle errors?",
        a: "All errors return standard HTTP status codes. Check the error message in the response body for details. Common errors include rate limiting (429) and invalid queries (400).",
      },
    ],
  },
]

export function FAQAccordion() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Frequently Asked Questions</CardTitle>
        <CardDescription>Find answers to common questions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {faqs.map((category) => (
            <div key={category.category}>
              <div className="mb-4 flex items-center gap-2">
                <category.icon className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold">{category.category}</h3>
              </div>
              <Accordion type="single" collapsible className="w-full">
                {category.questions.map((faq, index) => (
                  <AccordionItem key={index} value={`${category.category}-${index}`}>
                    <AccordionTrigger>{faq.q}</AccordionTrigger>
                    <AccordionContent>{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Link as LinkIcon, BarChart3, MessageCircle, Twitter, Github } from "lucide-react"
import Link from "next/link"

const links = [
  { icon: BookOpen, label: "Full Documentation", href: "https://docs.solixdb.xyz" },
  { icon: LinkIcon, label: "API Reference", href: "https://docs.solixdb.xyz/api" },
  { icon: BarChart3, label: "Status Page", href: "https://status.solixdb.xyz" },
  { icon: MessageCircle, label: "Discord Community", href: "https://discord.gg/solixdb" },
  { icon: Twitter, label: "Twitter/X", href: "https://twitter.com/solixdb" },
  { icon: Github, label: "GitHub", href: "https://github.com/solixdb" },
]

export function QuickLinks() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-accent"
            >
              <link.icon className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">{link.label}</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { animations } from "@/config/animation.config"
import { toast } from "sonner"

interface EnterpriseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EnterpriseForm({ open, onOpenChange }: EnterpriseFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    expectedUsage: "",
    useCase: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // TODO: Send to sales team (email/webhook)
      toast.success("Thank you! Our sales team will contact you shortly.")
      onOpenChange(false)
      setFormData({
        name: "",
        email: "",
        company: "",
        expectedUsage: "",
        useCase: "",
      })
    } catch (error) {
      toast.error("Failed to submit form")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent asChild className="sm:max-w-[600px]">
        <motion.div
          initial={animations.modal.initial}
          animate={animations.modal.animate}
          exit={animations.modal.exit}
          transition={animations.modal.transition}
        >
          <DialogHeader>
            <DialogTitle>Contact Sales - Enterprise Plan</DialogTitle>
            <DialogDescription>
              Fill out the form below and our sales team will get back to you within 4 hours.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expectedUsage">Expected Monthly Usage (credits) *</Label>
              <Input
                id="expectedUsage"
                type="number"
                required
                placeholder="e.g., 100000"
                value={formData.expectedUsage}
                onChange={(e) => setFormData({ ...formData, expectedUsage: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="useCase">Use Case *</Label>
              <Textarea
                id="useCase"
                required
                placeholder="Tell us about your use case..."
                value={formData.useCase}
                onChange={(e) => setFormData({ ...formData, useCase: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  "Submit"
                )}
              </Button>
            </DialogFooter>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

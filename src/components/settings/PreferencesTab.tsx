"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function PreferencesTab() {
  const handleSave = () => {
    toast.success("Preferences saved")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>Configure your notification and display preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">Email Notifications</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Choose which emails you want to receive
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Usage Alerts</Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified when you reach 80%, 90%, and 100% of your monthly credits
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Security Alerts</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive notifications about security-related events
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Product Updates</Label>
                  <p className="text-xs text-muted-foreground">
                    Stay informed about new features and updates
                  </p>
                </div>
                <input type="checkbox" className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
        <Button onClick={handleSave}>Save Preferences</Button>
      </CardContent>
    </Card>
  )
}

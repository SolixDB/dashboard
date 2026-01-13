"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-4xl font-bold text-foreground">404</h1>
        <p className="text-lg text-muted-foreground">
          The page you are looking for does not exist.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
          <Button onClick={() => router.push("/")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
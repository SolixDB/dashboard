"use client";

import { useEffect } from "react";
import Image from "next/image";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SignInPage() {
  const { login, authenticated, ready } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (authenticated && ready) {
      router.push("/");
    }
  }, [authenticated, ready, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen h-full flex items-center justify-center z-20 w-full relative bg-black">
        {" "}
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(120, 180, 255, 0.25), transparent 70%), #000000",
          }}
        />
         {/* Your Content/Components */}
         <div className="relative z-40 flex w-full h-full flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <Card className="bg-[#010610] shadow-sm">
            <CardHeader className="space-y-4 pb-8 pt-8">
              {/* Title */}
              <div className="space-y-2 text-center">
                <CardTitle className="text-2xl font-semibold tracking-wide ">
                  Sign in
                </CardTitle>
                <CardDescription className="text-sm text-gray-400">
                  Access your dashboard and API keys
                </CardDescription>
              </div>

              <div className="flex justify-center">
                <div className="flex  items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="SolixDB"
                    width={140}
                    height={140}
                    className="h-16 w-auto"
                    priority
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pb-8 ">
              {/* Primary Sign In Button */}
              <Button
                variant="default"
                className="w-full bg-primary hover:bg-gray-900 text-white h-11 text-sm font-medium"
                onClick={login}
              >
                Get started
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>      
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
        }}
      />
      </>
  );
}

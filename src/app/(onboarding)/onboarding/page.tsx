"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { INTEREST_TAGS } from "@/lib/utils/constants";
import { CheckCircle2, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";

const STEPS = ["Welcome", "Profile", "Interests", "Get Started"];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const progress = ((step + 1) / STEPS.length) * 100;

  const toggleInterest = (tag: string) => {
    setInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.length < 20 ? [...prev, tag] : prev
    );
  };

  const handleComplete = async () => {
    setLoading(true);
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        linkedin_url: linkedinUrl || null,
        interests,
        onboarding_completed: true,
      })
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to save profile");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  const canProceed = () => {
    switch (step) {
      case 0: return true;
      case 1: return fullName.length >= 2;
      case 2: return interests.length >= 1;
      case 3: return true;
      default: return false;
    }
  };

  return (
    <div className="space-y-6">
      <Progress value={progress} className="h-2" />
      <div className="flex justify-between text-xs text-muted-foreground">
        {STEPS.map((label, i) => (
          <span key={label} className={i === step ? "text-primary font-medium" : ""}>
            {label}
          </span>
        ))}
      </div>

      {step === 0 && (
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Welcome to hyped.today</CardTitle>
            <CardDescription className="text-base">
              The engagement exchange platform for LinkedIn. Earn credits by supporting others, spend them to boost your own content.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="p-4 rounded-lg bg-muted">
                <div className="font-semibold mb-1">Create</div>
                <div className="text-muted-foreground">Launch campaigns for your posts</div>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <div className="font-semibold mb-1">Engage</div>
                <div className="text-muted-foreground">Complete tasks to earn credits</div>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <div className="font-semibold mb-1">Grow</div>
                <div className="text-muted-foreground">Get real engagement on your content</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>Tell us about yourself</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn Profile URL (optional)</Label>
              <Input
                id="linkedin"
                placeholder="https://linkedin.com/in/yourprofile"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Interests</CardTitle>
            <CardDescription>Select at least one topic you&apos;re interested in</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {INTEREST_TAGS.map((tag) => (
                <Badge
                  key={tag}
                  variant={interests.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer text-sm py-2 px-3"
                  onClick={() => toggleInterest(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              {interests.length} selected
            </p>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>You&apos;re all set!</CardTitle>
            <CardDescription>Here&apos;s how to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold">1</span>
                </div>
                <div>
                  <div className="font-medium">Browse the Feed</div>
                  <div className="text-sm text-muted-foreground">Find tasks from other users&apos; campaigns and start earning credits</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold">2</span>
                </div>
                <div>
                  <div className="font-medium">Complete Tasks</div>
                  <div className="text-sm text-muted-foreground">Like, comment, or share LinkedIn posts to earn credits</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold">3</span>
                </div>
                <div>
                  <div className="font-medium">Create Campaigns</div>
                  <div className="text-sm text-muted-foreground">Spend credits to get engagement on your own LinkedIn posts</div>
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 rounded-lg bg-muted">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>You start with <strong>20 free credits</strong> to launch your first campaign!</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed()}
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleComplete} disabled={loading}>
            {loading ? "Setting up..." : "Go to Dashboard"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

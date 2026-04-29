import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles,
  Target,
  Shield,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Zap,
  Users,
  Coins,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <nav className="border-b">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-xl">hyped.today</span>
          <div className="flex items-center gap-4">
            <Link href="/login"><Button variant="ghost">Sign in</Button></Link>
            <Link href="/signup"><Button>Get Started</Button></Link>
          </div>
        </div>
      </nav>

      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4" variant="secondary">Launch Offer: 20 Free Credits</Badge>
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            Boost Your LinkedIn Engagement,<br />
            <span className="text-primary">Organically</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get real engagement from real professionals. Create campaigns, complete tasks, and grow your LinkedIn presence with verified interactions.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/signup"><Button size="lg" className="text-lg px-8">Get Started Free <ArrowRight className="ml-2 h-5 w-5" /></Button></Link>
            <Link href="#how-it-works"><Button size="lg" variant="outline" className="text-lg px-8">Learn More</Button></Link>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 px-6 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="pt-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">1. Create Campaign</h3>
                <p className="text-muted-foreground">Share your LinkedIn post URL, choose engagement actions, and set your budget using credits.</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">2. Engage & Earn</h3>
                <p className="text-muted-foreground">Complete tasks from other members to earn credits. Like, comment, share — get rewarded.</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">3. Grow</h3>
                <p className="text-muted-foreground">Receive verified engagement on your posts. Build your professional network organically.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "Verified Engagement", desc: "AI-powered verification ensures real, quality interactions" },
              { icon: Coins, title: "Credit Economy", desc: "Fair credit system — earn by helping others, spend to boost your content" },
              { icon: BarChart3, title: "Analytics", desc: "Track campaign performance with detailed completion analytics" },
              { icon: Zap, title: "Trust System", desc: "Build your trust score for faster approvals and higher limits" },
            ].map((f, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <f.icon className="h-10 w-10 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">For Everyone</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">For Content Creators</h3>
                <ul className="space-y-3">
                  {["Launch engagement campaigns for any LinkedIn post", "Choose specific actions: likes, comments, reposts", "Pay only for verified completions", "Track results with detailed analytics"].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">For Supporters</h3>
                <ul className="space-y-3">
                  {["Earn credits by engaging with quality content", "Build your trust score for premium rewards", "Discover interesting posts from your industry", "Start with 20 free credits"].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">FAQ</h2>
          <div className="space-y-6">
            {[
              { q: "Is this free?", a: "Yes! You start with 20 free credits. Earn more by completing tasks from other members." },
              { q: "How is engagement verified?", a: "We use an AI-powered verification engine that checks multiple signals including dwell time, click patterns, and trust scores." },
              { q: "What platforms are supported?", a: "Currently focused on LinkedIn. More platforms coming soon." },
              { q: "Is my data safe?", a: "Absolutely. We use Supabase with row-level security. Your credentials are never stored." },
              { q: "How does the credit system work?", a: "Credits are the currency of hyped.today. You earn them by completing tasks and spend them to create campaigns for your own content." },
            ].map((faq, i) => (
              <div key={i}>
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-muted-foreground text-sm">{faq.a}</p>
                {i < 4 && <Separator className="mt-6" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Boost Your LinkedIn?</h2>
          <p className="text-lg opacity-90 mb-8">Join hundreds of professionals growing their engagement organically.</p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="py-8 px-6 border-t">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-sm text-muted-foreground">hyped.today</span>
          <span className="text-sm text-muted-foreground">Engagement Exchange Platform</span>
        </div>
      </footer>
    </div>
  );
}

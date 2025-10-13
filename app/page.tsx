import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { Hero } from "@/components/hero"
import { FeatureCard } from "@/components/feature-card"
import ChatHelpline from "@/components/chat-helpline"

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/placeholder-logo.svg" alt="AI Support" className="h-6 w-6" />
            <span className="font-medium tracking-tight">AI Customer Support</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <a href="#features" aria-label="View features">
                Features
              </a>
            </Button>
            <Button asChild>
              <a href="#demo" aria-label="Open demo">
                Open Demo
              </a>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <Hero />
      </section>

      <section id="features" className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            title="FAQ Intelligence"
            description="Ground responses with your FAQs for fast, helpful answers."
          />
          <FeatureCard
            title="Session Memory"
            description="Retains context to keep conversations coherent across turns."
          />
          <FeatureCard
            title="Smart Escalation"
            description="Escalates to a human or creates a ticket when confidence is low."
          />
        </div>
      </section>

      <section id="demo" className="mx-auto max-w-6xl px-4 pb-20">
        <Card className="hover-elevate">
          <CardHeader>
            <CardTitle className="text-pretty">Helpline Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <ChatHelpline />
          </CardContent>
        </Card>
      </section>

      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-muted-foreground">
          <p className="text-pretty">Built with the Vercel AI SDK and Upstash Redis for session management.</p>
        </div>
      </footer>
    </main>
  )
}

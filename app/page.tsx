import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/hero";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full border-b border-b-foreground/10">
        <div className="max-w-5xl mx-auto flex justify-between items-center p-4">
          <div className="font-semibold">Landing Page Generator</div>
          <div className="flex gap-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <Hero />
        
        <div className="flex flex-col items-center gap-6 mt-8">
          <h2 className="text-2xl font-bold">
            Create AI-powered landing pages with ease
          </h2>
          <p className="text-muted-foreground max-w-md text-center">
            Generate stunning landing pages using structured prompts. 
            Save, organize, and manage all your projects in one place.
          </p>
          <div className="flex gap-4 mt-4">
            <Button size="lg" asChild>
              <Link href="/auth/sign-up">Start Creating Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </main>

      <footer className="w-full border-t py-8">
        <div className="max-w-5xl mx-auto text-center text-sm text-muted-foreground">
          Powered by Supabase and Next.js
        </div>
      </footer>
    </div>
  );
}

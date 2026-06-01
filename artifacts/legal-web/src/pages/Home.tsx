import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Logo" className="h-8 w-8" />
            <span className="font-serif text-xl font-bold tracking-tight">Lexon & Associates</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Client Portal</Button>
            </Link>
          </div>
        </div>
      </header>
      
      <main>
        <section className="py-24 bg-primary text-primary-foreground text-center px-4">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">Excellence in Legal Advocacy</h1>
            <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
              Providing sophisticated legal representation and strategic counsel for complex corporate, family, and civil matters.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/sign-up">
                <Button size="lg" variant="secondary" className="font-semibold">New Client Registration</Button>
              </Link>
              <Link href="/sign-in">
                <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  Access Portal
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 container mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold text-center mb-12">Our Practice Areas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="p-6 border border-border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold mb-3 font-serif">Corporate Law</h3>
              <p className="text-muted-foreground leading-relaxed">Comprehensive legal strategies for businesses, from formation to complex mergers and acquisitions.</p>
            </div>
            <div className="p-6 border border-border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold mb-3 font-serif">Family Law</h3>
              <p className="text-muted-foreground leading-relaxed">Compassionate and discreet representation in divorce, custody, and complex marital estate matters.</p>
            </div>
            <div className="p-6 border border-border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold mb-3 font-serif">Civil Litigation</h3>
              <p className="text-muted-foreground leading-relaxed">Aggressive advocacy in high-stakes disputes, dedicated to protecting our clients' rights and interests.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-muted py-12 border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Logo" className="h-6 w-6 opacity-50 grayscale" />
            <span className="font-serif font-semibold">Lexon & Associates Law Firm</span>
          </div>
          <p>&copy; {new Date().getFullYear()} Lexon & Associates. All rights reserved.</p>
          <p className="text-sm mt-2">The information on this website is for general information purposes only. Nothing on this site should be taken as legal advice.</p>
        </div>
      </footer>
    </div>
  );
}
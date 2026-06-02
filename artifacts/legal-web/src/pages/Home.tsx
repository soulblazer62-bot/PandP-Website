import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Logo" className="h-8 w-8" />
            <span className="font-serif text-xl font-bold tracking-tight">P and P Associates</span>
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

        {/* Courts Section */}
        <section className="py-16 bg-muted/40 border-y border-border">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-serif font-bold text-center mb-4">Courts We Appear In</h2>
            <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
              Our advocates are experienced practitioners across all levels of the Indian judicial system.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="p-6 bg-card border border-border rounded-lg text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">⚖️</div>
                <h3 className="text-lg font-bold font-serif mb-2">District Court</h3>
                <p className="text-sm text-muted-foreground">Civil and criminal matters at district and sessions court level.</p>
              </div>
              <div className="p-6 bg-card border border-primary/30 rounded-lg text-center shadow-sm hover:shadow-md transition-shadow ring-1 ring-primary/20">
                <div className="text-3xl mb-3">🏛️</div>
                <h3 className="text-lg font-bold font-serif mb-2">High Court</h3>
                <p className="text-sm text-muted-foreground">Appeals, writs, and original jurisdiction matters before the High Court.</p>
              </div>
              <div className="p-6 bg-card border border-border rounded-lg text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">🔱</div>
                <h3 className="text-lg font-bold font-serif mb-2">Supreme Court</h3>
                <p className="text-sm text-muted-foreground">SLPs, constitutional matters and apex court representation.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Practice Areas */}
        <section className="py-20 container mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold text-center mb-4">Our Practice Areas</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            We cover every area of law — from personal matters to complex corporate disputes.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="p-6 border border-border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold mb-2 font-serif">Criminal Law</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Defence and prosecution in criminal cases at all court levels including bail, trials and appeals.</p>
            </div>
            <div className="p-6 border border-border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold mb-2 font-serif">Civil Law</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Property disputes, contracts, recovery suits, injunctions and civil litigation at all courts.</p>
            </div>
            <div className="p-6 border border-border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold mb-2 font-serif">Family Law</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Divorce, custody, maintenance, succession, and matrimonial property matters handled with care.</p>
            </div>
            <div className="p-6 border border-border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold mb-2 font-serif">Corporate Law</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Company formation, mergers, acquisitions, shareholder disputes and regulatory compliance.</p>
            </div>
            <div className="p-6 border border-border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold mb-2 font-serif">Property Law</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Real estate transactions, title disputes, landlord-tenant matters and property documentation.</p>
            </div>
            <div className="p-6 border border-border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold mb-2 font-serif">Employment Law</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Labour disputes, wrongful termination, service matters and employment contract advisory.</p>
            </div>
            <div className="p-6 border border-border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold mb-2 font-serif">Constitutional Law</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Writ petitions, fundamental rights, public interest litigation and constitutional challenges.</p>
            </div>
            <div className="p-6 border border-border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold mb-2 font-serif">Immigration Law</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Visa, citizenship, OCI, NRI matters and cross-border legal issues.</p>
            </div>
            <div className="p-6 border border-border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold mb-2 font-serif">Consumer & Other Matters</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Consumer forums, arbitration, taxation, banking disputes and all other legal matters.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-muted py-12 border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Logo" className="h-6 w-6 opacity-50 grayscale" />
            <span className="font-serif font-semibold">P and P Associates Law Firm</span>
          </div>
          <p>&copy; {new Date().getFullYear()} P and P Associates. All rights reserved.</p>
          <p className="text-sm mt-2">The information on this website is for general information purposes only. Nothing on this site should be taken as legal advice.</p>
        </div>
      </footer>
    </div>
  );
}
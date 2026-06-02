import { AppLayout } from "@/components/layout/AppLayout";
import { useGetContactInfo } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Phone, Mail, Clock, Building2 } from "lucide-react";

export default function Contact() {
  const { data: contact, isLoading } = useGetContactInfo();
  const contactAny = contact as typeof contact & { phone2?: string };

  return (
    <AppLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">Contact Us</h1>
          <p className="text-muted-foreground text-sm mt-1">Reach out to our team — we're here to help.</p>
        </div>

        {isLoading ? (
          <div className="space-y-4"><Skeleton className="h-64" /></div>
        ) : (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-6 space-y-5">

              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Firm</p>
                  <p className="font-semibold">{contactAny?.firmName}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Address</p>
                  <p className="text-sm leading-relaxed">
                    {contactAny?.address}<br />
                    {contactAny?.city}, {contactAny?.state} – {contactAny?.zip}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Phone</p>
                  <div className="space-y-1">
                    <a
                      href={`tel:${contactAny?.phone}`}
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <span>{contactAny?.phone}</span>
                    </a>
                    {contactAny?.phone2 && (
                      <a
                        href={`tel:${contactAny.phone2}`}
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <span>{contactAny.phone2}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Email</p>
                  <a href={`mailto:${contactAny?.email}`} className="text-sm text-primary hover:underline">{contactAny?.email}</a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Office Hours</p>
                  <p className="text-sm leading-relaxed">{contactAny?.hours}</p>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                For urgent legal matters, please call us directly. For general queries, you can also{" "}
                <a href="/queries/new" className="text-primary hover:underline">submit a query</a>{" "}
                through our client portal and we'll respond at the earliest.
              </p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

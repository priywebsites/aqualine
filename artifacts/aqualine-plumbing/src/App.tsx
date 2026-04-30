import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Droplets,
  Menu,
  X,
  Phone,
  CheckCircle2,
  Clock,
  Wrench,
  ShieldCheck,
  MapPin,
  Droplet,
  Hammer,
  Bath,
  Shield,
  FileText,
  ArrowRight,
  Loader2,
  Mail,
} from "lucide-react";
import heroImg from "@assets/newhero_1777572182165.png";
import secondImg from "@assets/newsecond_1777572182165.png";
import quoteImg from "@assets/newquote_1777572182164.png";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const queryClient = new QueryClient();

// --- CONFIG BLOCK ---
// AquaLine Winnipeg Plumbing — single source of truth for business info.
// Update phone, email, business name, and address here.
const PHONE_DISPLAY = "431-997-3415";
const PHONE_TEL = "4319973415";
const EMAIL = "priypatel008@gmail.com";
const BUSINESS_NAME = "AquaLine Winnipeg Plumbing";
const BUSINESS_SHORT = "AquaLine";
const SERVICE_AREA = "Winnipeg, Manitoba";
const ADDRESS_LINE_1 = "1700 Corydon Ave";
const ADDRESS_LINE_2 = "Winnipeg, MB R3N 1M1";
const ADDRESS_FULL = `${ADDRESS_LINE_1}, ${ADDRESS_LINE_2}`;
// Use just the street address (no business name) so the embed drops a single
// pin on our location instead of showing search results for nearby plumbers.
const MAP_QUERY = encodeURIComponent(`${ADDRESS_LINE_1}, ${ADDRESS_LINE_2}`);
// --------------------

const formSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
  service: z.string().min(1, "Please select a service"),
  description: z.string().optional(),
  dateNeeded: z.string().optional(),
  urgency: z.string().min(1, "Please select an urgency level"),
});

type FormValues = z.infer<typeof formSchema>;

// Inline AquaLine logo mark — a stylized water droplet with a soft inner
// highlight. Renders crisp at any size and inherits primary color.
function AquaDropletLogo({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 2.5c0 0 7 7.4 7 12.2A7 7 0 1 1 5 14.7C5 9.9 12 2.5 12 2.5Z"
        fill="currentColor"
      />
      <path
        d="M9 14.5c0 1.6 1 3 2.6 3.4"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
}

function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [didSubmit, setDidSubmit] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      service: "",
      description: "",
      dateNeeded: "",
      urgency: "",
    },
  });

  // ---------------------------------------------------------------------------
  // Lead submission
  //
  // Posts to POST /api/contact — a Vercel serverless function that lives at
  //   artifacts/aqualine-plumbing/api/contact.js
  // and uses Nodemailer + Gmail SMTP to email the lead to LEAD_TO_EMAIL.
  //
  // Contract:
  //   200 → { success: true }
  //   405 → { success: false, error: "Method not allowed" }
  //   500 → { success: false, error: "Email failed to send" }
  //
  // SMTP credentials live in Vercel env vars (SMTP_USER, SMTP_PASS,
  // LEAD_TO_EMAIL) and never touch the browser.
  // ---------------------------------------------------------------------------
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const resp = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          source:
            typeof window !== "undefined"
              ? `AquaLine Winnipeg website (${window.location.pathname})`
              : "AquaLine Winnipeg website",
        }),
      });
      const json = (await resp.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
      };
      if (!resp.ok || !json.success) {
        throw new Error(json?.error || "Request failed");
      }
      setDidSubmit(true);
      toast.success(
        `Thanks — your request has been received. We'll be in touch shortly. For urgent issues, please call ${PHONE_DISPLAY}.`,
      );
      form.reset();
    } catch (err) {
      toast.error(
        `Something went wrong sending your request. Please call ${PHONE_DISPLAY} so we can help right away.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollTo = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
              <AquaDropletLogo className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg hidden sm:inline-block tracking-tight">
              {BUSINESS_NAME}
            </span>
            <span className="font-bold text-lg sm:hidden tracking-tight">
              {BUSINESS_SHORT}
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button
              onClick={() => scrollTo("services")}
              className="hover:text-primary transition-colors"
            >
              Services
            </button>
            <button
              onClick={() => scrollTo("how-it-works")}
              className="hover:text-primary transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollTo("request-service")}
              className="hover:text-primary transition-colors"
            >
              Book Online
            </button>
            <button
              onClick={() => scrollTo("contact")}
              className="hover:text-primary transition-colors"
            >
              Contact
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <Button
              asChild
              variant="default"
              className="hidden sm:flex shadow-md"
            >
              <a href={`tel:${PHONE_TEL}`}>
                <Phone className="mr-2 h-4 w-4" />
                Call Now
              </a>
            </Button>

            {/* Mobile tap-to-call icon button */}
            <Button
              asChild
              variant="default"
              size="icon"
              className="sm:hidden h-9 w-9"
            >
              <a href={`tel:${PHONE_TEL}`}>
                <Phone className="h-4 w-4" />
              </a>
            </Button>

            <button
              className="md:hidden p-2 -mr-2 text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-background p-4 flex flex-col gap-4 shadow-lg absolute w-full">
            <button
              onClick={() => scrollTo("services")}
              className="text-left font-medium py-2"
            >
              Services
            </button>
            <button
              onClick={() => scrollTo("how-it-works")}
              className="text-left font-medium py-2"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollTo("request-service")}
              className="text-left font-medium py-2"
            >
              Book Online
            </button>
            <button
              onClick={() => scrollTo("contact")}
              className="text-left font-medium py-2"
            >
              Contact
            </button>
            <Button asChild className="w-full mt-2">
              <a href={`tel:${PHONE_TEL}`}>
                <Phone className="mr-2 h-4 w-4" />
                Call {PHONE_DISPLAY}
              </a>
            </Button>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-slate-50 pt-16 pb-24 lg:pt-24 lg:pb-32">
          <div className="absolute inset-0 z-0">
            <img
              src={heroImg}
              alt="AquaLine plumber repairing a kitchen sink in a Winnipeg home"
              className="w-full h-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-background/10" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/0 to-background/60 md:hidden" />
          </div>

          <div className="container relative z-10 mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl"
            >
              <Badge
                variant="outline"
                className="mb-4 bg-background/60 backdrop-blur-sm border-primary/20 text-primary px-3 py-1 text-sm"
              >
                Local Winnipeg Residential Plumbers
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 leading-tight">
                Looking for a Plumber Near You in Winnipeg?
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-xl">
                {BUSINESS_SHORT} handles residential plumbing across Winnipeg —
                from drippy faucets and clogged drains to water heaters, sump
                pumps, and after-hours emergencies.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  asChild
                  size="lg"
                  className="text-base h-14 shadow-lg shadow-primary/20"
                >
                  <a href={`tel:${PHONE_TEL}`}>
                    <Phone className="mr-2 h-5 w-5" />
                    Call {PHONE_DISPLAY}
                  </a>
                </Button>
                <Button
                  onClick={() => scrollTo("request-service")}
                  size="lg"
                  variant="outline"
                  className="text-base h-14 bg-background/80 backdrop-blur-sm"
                >
                  Book Online
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-y-2 gap-x-6 text-sm font-medium text-slate-600">
                <div className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-primary" />
                  Serving all of Winnipeg
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-primary" />
                  Same-day appointments when possible
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-primary" />
                  Upfront pricing — no surprises
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Urgent Call Banner */}
        <section className="bg-primary text-primary-foreground py-4 shadow-inner relative z-20">
          <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center text-center sm:text-left">
              <Clock className="h-5 w-5 mr-3 hidden sm:block opacity-80" />
              <p className="font-medium text-lg">
                Burst pipe or no hot water? Call now for emergency plumber
                service in Winnipeg.
              </p>
            </div>
            <Button
              asChild
              variant="secondary"
              className="w-full sm:w-auto font-bold text-primary whitespace-nowrap bg-white hover:bg-slate-100"
            >
              <a href={`tel:${PHONE_TEL}`}>Call {PHONE_DISPLAY}</a>
            </Button>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-20 lg:py-28 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Residential Plumbing Services in Winnipeg
              </h2>
              <p className="text-lg text-muted-foreground">
                From a quick faucet swap to a full basement bathroom rough-in,
                {" "}
                {BUSINESS_SHORT} covers everyday plumbing for Winnipeg
                homeowners.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 max-w-6xl mx-auto">
              {[
                {
                  icon: Droplet,
                  title: "Water Heater Repair & Install",
                  desc: "Tank and tankless water heater diagnostics, repair, and replacement for Winnipeg homes.",
                },
                {
                  icon: Shield,
                  title: "Sump Pumps & Backup Systems",
                  desc: "New sump pump installs, battery backups, and basement flood-prevention upgrades.",
                },
                {
                  icon: Droplets,
                  title: "Water Softeners & Filtration",
                  desc: "Whole-home softener and filtration solutions to tackle hard Winnipeg water.",
                },
                {
                  icon: Bath,
                  title: "Bathroom Plumbing",
                  desc: "Toilet repairs, shower valves, vanity hookups, tubs, and fixture upgrades.",
                },
                {
                  icon: Wrench,
                  title: "Kitchen Plumbing",
                  desc: "Sink installs, garburators, dishwasher and ice-maker connections, and supply line fixes.",
                },
                {
                  icon: Droplet,
                  title: "Leak Detection & Pipe Repair",
                  desc: "Tracking down hidden leaks, thawing frozen pipes, and replacing aging supply lines.",
                },
                {
                  icon: Hammer,
                  title: "Basement Bathroom Rough-Ins",
                  desc: "Complete plumbing rough-ins and finishes for new basement bathrooms.",
                },
                {
                  icon: Wrench,
                  title: "Fixture Replacement",
                  desc: "Professional install of faucets, toilets, and fixtures — yours or supplied for you.",
                },
                {
                  icon: Wrench,
                  title: "General Plumbing Repairs",
                  desc: "Diagnosing and fixing the everyday plumbing issues that pop up around your home.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <Card
                  key={title}
                  className="shadow-sm border-slate-200 hover:shadow-md hover:border-primary/30 transition-all group"
                >
                  <CardContent className="p-4 md:p-5 flex gap-3 md:gap-4 items-start">
                    <div className="h-10 w-10 md:h-11 md:w-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base md:text-[17px] font-semibold leading-snug mb-1">
                        {title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-snug">
                        {desc}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-6 md:mt-8 max-w-6xl mx-auto">
              <Card className="border-primary bg-primary/5">
                <CardContent className="p-4 md:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                  <div>
                    <h3 className="text-base md:text-lg font-bold">
                      Don't see your issue? Give us a ring.
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      If it involves water, drains, or pipes in your home, we
                      can probably help.
                    </p>
                  </div>
                  <Button asChild className="flex-shrink-0">
                    <a href={`tel:${PHONE_TEL}`}>
                      <Phone className="mr-2 h-4 w-4" />
                      Call {PHONE_DISPLAY}
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Featured Service Photo — Done right the first time. */}
        <section className="bg-slate-900">
          <div className="container mx-auto px-4 py-10 md:py-16">
            <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-800 max-w-6xl mx-auto bg-slate-900 grid grid-cols-1 md:grid-cols-5">
              <div className="md:col-span-3 relative">
                <img
                  src={secondImg}
                  alt={`${BUSINESS_SHORT} plumber working on a Winnipeg bathroom vanity`}
                  className="w-full h-[260px] sm:h-[340px] md:h-full md:min-h-[420px] object-cover block"
                  loading="lazy"
                />
                <div className="hidden md:block absolute inset-y-0 right-0 w-24 bg-gradient-to-r from-transparent to-slate-900" />
              </div>
              <div className="md:col-span-2 p-6 sm:p-8 md:p-10 text-white flex flex-col justify-center">
                <Badge className="mb-4 bg-primary/90 hover:bg-primary border-0 w-fit">
                  Repairs · Replacements · Installs
                </Badge>
                <h3 className="text-2xl sm:text-3xl font-bold leading-tight mb-3">
                  Done right the first time, by people who care.
                </h3>
                <p className="text-sm md:text-base text-slate-300 mb-6 leading-relaxed">
                  Whether it's a leaking shut-off valve or a tired water heater,
                  our Winnipeg plumbers explain the fix in plain English and
                  quote it before any tools come out.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild size="lg" className="h-11 md:h-12">
                    <a href={`tel:${PHONE_TEL}`}>
                      <Phone className="mr-2 h-4 w-4" />
                      Call {PHONE_DISPLAY}
                    </a>
                  </Button>
                  <Button
                    onClick={() => scrollTo("request-service")}
                    size="lg"
                    variant="secondary"
                    className="h-11 md:h-12"
                  >
                    Book Online
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section
          id="how-it-works"
          className="py-16 md:py-24 lg:py-28 bg-slate-50 border-y border-slate-200"
        >
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                How It Works
              </h2>
              <p className="text-base md:text-lg text-muted-foreground">
                Four simple steps from "I think I need a plumber" to a finished
                fix.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8 max-w-5xl mx-auto">
              {[
                {
                  n: 1,
                  icon: Phone,
                  text: "Call or send a quick request describing the issue",
                },
                {
                  n: 2,
                  icon: FileText,
                  text: "We confirm details, scheduling, and a tentative window",
                },
                {
                  n: 3,
                  icon: ShieldCheck,
                  text: "Our plumber arrives, diagnoses, and quotes the work upfront",
                },
                {
                  n: 4,
                  icon: CheckCircle2,
                  text: "Job is completed, tested, and your home is left tidy",
                },
              ].map(({ n, icon: Icon, text }) => (
                <div
                  key={n}
                  className="flex md:flex-col items-center md:items-center gap-4 md:gap-0 md:text-center bg-white md:bg-transparent rounded-xl md:rounded-none border md:border-0 border-slate-200 p-4 md:p-0 shadow-sm md:shadow-none"
                >
                  <div className="flex items-center gap-3 md:flex-col md:gap-3 flex-shrink-0">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg md:text-xl font-bold shadow-md flex-shrink-0">
                      {n}
                    </div>
                    <div className="bg-primary/10 p-2.5 md:p-3 rounded-full flex-shrink-0">
                      <Icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                    </div>
                  </div>
                  <p className="font-medium text-base md:text-lg leading-snug text-left md:text-center md:mt-4">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quote / Local Pros Section — uses newquote image */}
        <section className="py-10 md:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5 }}
                className="relative order-2 lg:order-1"
              >
                <div className="rounded-2xl overflow-hidden shadow-xl shadow-slate-300/40 border border-slate-200">
                  <img
                    src={quoteImg}
                    alt={`${BUSINESS_SHORT} plumber walking a Winnipeg homeowner through a plumbing quote`}
                    className="w-full h-auto block"
                    loading="lazy"
                  />
                </div>
                <div className="absolute -bottom-3 -right-2 sm:-bottom-5 sm:-right-5 bg-primary text-primary-foreground rounded-xl px-3 py-2 sm:px-5 sm:py-3 shadow-lg shadow-primary/20 flex items-center gap-2 sm:gap-3 max-w-[80%]">
                  <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                  <div>
                    <div className="text-[10px] sm:text-xs uppercase tracking-wide opacity-80 leading-tight">
                      Upfront Quote
                    </div>
                    <div className="font-bold text-xs sm:text-sm leading-tight">
                      Always before the work starts
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="order-1 lg:order-2">
                <Badge
                  variant="outline"
                  className="w-fit mb-4 text-primary border-primary/20 bg-primary/5"
                >
                  Friendly Winnipeg Plumbers
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-5 leading-tight">
                  Honest advice and clean work — no pressure, no surprises.
                </h2>
                <p className="text-base md:text-lg text-slate-600 mb-6 leading-relaxed">
                  {BUSINESS_NAME} matches you with experienced plumbers who
                  walk through what's wrong, what your options are, and what
                  the fix will cost — before they pick up a wrench. Whether
                  you're searching for a "plumber near me" or planning a
                  bigger upgrade, we're here to help.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">
                      Clear, jargon-free explanations
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">
                      Pricing locked in before any work begins
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">
                      Boots covered, area cleaned up, home respected
                    </span>
                  </li>
                </ul>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild size="lg" className="h-12">
                    <a href={`tel:${PHONE_TEL}`}>
                      <Phone className="mr-2 h-4 w-4" />
                      Call {PHONE_DISPLAY}
                    </a>
                  </Button>
                  <Button
                    onClick={() => scrollTo("request-service")}
                    size="lg"
                    variant="outline"
                    className="h-12"
                  >
                    Book Online
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us & Form Section side-by-side on desktop */}
        <section id="request-service" className="py-20 lg:py-28 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
              {/* Why Choose Us */}
              <div className="lg:col-span-5 flex flex-col justify-center">
                <Badge
                  variant="outline"
                  className="w-fit mb-4 text-primary border-primary/20 bg-primary/5"
                >
                  Why Choose AquaLine
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                  The Winnipeg Plumber Homeowners Recommend
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Plumbing repair in Winnipeg shouldn't be stressful. We focus
                  on doing the job properly the first time and making the
                  experience easy from start to finish.
                </p>

                <ul className="space-y-6">
                  <li className="flex">
                    <div className="flex-shrink-0 mt-1">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div className="ml-4">
                      <p className="text-lg font-medium">
                        100% local — serving every Winnipeg neighbourhood
                      </p>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="flex-shrink-0 mt-1">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div className="ml-4">
                      <p className="text-lg font-medium">
                        Quick response for urgent and emergency calls
                      </p>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="flex-shrink-0 mt-1">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="ml-4">
                      <p className="text-lg font-medium">
                        Written quote before any work begins
                      </p>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="flex-shrink-0 mt-1">
                      <Wrench className="h-6 w-6 text-primary" />
                    </div>
                    <div className="ml-4">
                      <p className="text-lg font-medium">
                        Repairs, replacements, installs, and full upgrades
                      </p>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="flex-shrink-0 mt-1">
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    </div>
                    <div className="ml-4">
                      <p className="text-lg font-medium">
                        Easy to book — phone, text, or this online form
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Lead Form */}
              <div className="lg:col-span-7">
                <Card className="border-slate-200 shadow-lg shadow-slate-200/50">
                  <CardContent className="p-6 md:p-8">
                    <div className="mb-8">
                      <h3 className="text-2xl font-bold mb-2">
                        Book Your Plumbing Service
                      </h3>
                      <p className="text-slate-500">
                        Tell us a bit about the issue and we'll get back to you
                        to lock in a time and confirm details.
                      </p>
                    </div>

                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Alex Martin"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number *</FormLabel>
                                <FormControl>
                                  <Input
                                    type="tel"
                                    placeholder="431-123-4567"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address *</FormLabel>
                                <FormControl>
                                  <Input
                                    type="email"
                                    placeholder="alex@example.com"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="urgency"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Urgency *</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select urgency level" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Emergency / Same Day">
                                      Emergency / Same Day
                                    </SelectItem>
                                    <SelectItem value="Within 1–2 Days">
                                      Within 1–2 Days
                                    </SelectItem>
                                    <SelectItem value="This Week">
                                      This Week
                                    </SelectItem>
                                    <SelectItem value="Flexible">
                                      Flexible
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="service"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Service Needed *</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a service" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Water Heater Repair & Install">
                                    Water Heater Repair & Install
                                  </SelectItem>
                                  <SelectItem value="Sump Pumps & Backup Systems">
                                    Sump Pumps & Backup Systems
                                  </SelectItem>
                                  <SelectItem value="Water Softeners & Filtration">
                                    Water Softeners & Filtration
                                  </SelectItem>
                                  <SelectItem value="Bathroom Plumbing">
                                    Bathroom Plumbing
                                  </SelectItem>
                                  <SelectItem value="Kitchen Plumbing">
                                    Kitchen Plumbing
                                  </SelectItem>
                                  <SelectItem value="Leak Detection & Pipe Repair">
                                    Leak Detection & Pipe Repair
                                  </SelectItem>
                                  <SelectItem value="Basement Bathroom Rough-Ins">
                                    Basement Bathroom Rough-Ins
                                  </SelectItem>
                                  <SelectItem value="Fixture Replacement">
                                    Fixture Replacement
                                  </SelectItem>
                                  <SelectItem value="General Plumbing Repairs">
                                    General Plumbing Repairs
                                  </SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Describe the issue (optional)
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Tell us what's going on — when it started, what you've noticed, any photos you'd like to share later..."
                                  className="min-h-[100px] resize-y"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="dateNeeded"
                          render={({ field }) => (
                            <FormItem className="sm:w-1/2">
                              <FormLabel>Preferred Date (Optional)</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          size="lg"
                          disabled={isSubmitting}
                          className="w-full text-base h-12 mt-4"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : didSubmit ? (
                            <>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Send Another Request
                            </>
                          ) : (
                            <>
                              Book My Plumber{" "}
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                        <p className="text-xs text-center text-slate-500 mt-4">
                          For an emergency plumber in Winnipeg, please call{" "}
                          <a
                            href={`tel:${PHONE_TEL}`}
                            className="text-primary font-medium hover:underline"
                          >
                            {PHONE_DISPLAY}
                          </a>{" "}
                          directly instead of using this form.
                        </p>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Service Area & Map Section */}
        <section className="py-20 bg-slate-50 border-t border-slate-200">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                  Plumbing Service Across All of Winnipeg
                </h2>
                <p className="text-lg text-slate-600 mb-6">
                  {BUSINESS_SHORT} provides residential plumbing in every
                  corner of {SERVICE_AREA} — Corydon Village, River Heights,
                  Tuxedo, Linden Woods, St. James, St. Vital, Transcona, the
                  North End, and everything in between.
                </p>
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-3 bg-white border border-slate-200 rounded-full px-5 py-3 shadow-sm">
                    <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="font-semibold text-slate-800">
                      {ADDRESS_FULL}
                    </span>
                  </div>
                  <div className="block">
                    <a
                      href={`tel:${PHONE_TEL}`}
                      className="inline-flex items-center gap-3 bg-white border border-slate-200 rounded-full px-5 py-3 shadow-sm hover:border-primary/30 transition-colors"
                    >
                      <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="font-semibold text-slate-800">
                        {PHONE_DISPLAY}
                      </span>
                    </a>
                  </div>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden shadow-md h-[400px] border border-slate-200">
                <iframe
                  src={`https://www.google.com/maps?q=${MAP_QUERY}&z=16&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Map showing ${BUSINESS_NAME} at ${ADDRESS_FULL}`}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section
          id="contact"
          className="py-20 lg:py-28 bg-slate-900 text-slate-50"
        >
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <div className="inline-flex items-center justify-center p-3 bg-primary/20 rounded-full mb-6 text-primary">
              <AquaDropletLogo className="h-8 w-8" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white">
              Contact {BUSINESS_NAME}
            </h2>

            <div className="flex flex-col md:flex-row justify-center gap-8 mb-12">
              <a
                href={`tel:${PHONE_TEL}`}
                className="flex flex-col items-center group"
              >
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                  <Phone className="h-6 w-6" />
                </div>
                <span className="text-sm text-slate-400 mb-1">Call Us</span>
                <span className="text-xl font-bold text-white group-hover:text-primary-foreground transition-colors">
                  {PHONE_DISPLAY}
                </span>
              </a>

              <a
                href={`mailto:${EMAIL}`}
                className="flex flex-col items-center group"
              >
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                  <Mail className="h-6 w-6" />
                </div>
                <span className="text-sm text-slate-400 mb-1">Email Us</span>
                <span className="text-lg font-medium text-white group-hover:text-primary-foreground transition-colors">
                  {EMAIL}
                </span>
              </a>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6" />
                </div>
                <span className="text-sm text-slate-400 mb-1">Visit Us</span>
                <span className="text-lg font-medium text-white">
                  {ADDRESS_LINE_1}
                </span>
                <span className="text-sm text-slate-400">
                  {ADDRESS_LINE_2}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="h-14 px-8">
                <a href={`tel:${PHONE_TEL}`}>Call Now</a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-slate-900 bg-white hover:bg-slate-100"
                onClick={() => scrollTo("request-service")}
              >
                Book Online
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4 text-white opacity-90">
            <span className="text-primary">
              <AquaDropletLogo className="h-5 w-5" />
            </span>
            <span className="font-bold text-xl">{BUSINESS_NAME}</span>
          </div>
          <p className="mb-2">
            Residential plumbing in {SERVICE_AREA} — repairs, installs,
            upgrades, and after-hours emergencies.
          </p>
          <p className="mb-8 text-sm">
            {ADDRESS_FULL} ·{" "}
            <a
              href={`tel:${PHONE_TEL}`}
              className="hover:text-white transition-colors"
            >
              {PHONE_DISPLAY}
            </a>{" "}
            ·{" "}
            <a
              href={`mailto:${EMAIL}`}
              className="hover:text-white transition-colors"
            >
              {EMAIL}
            </a>
          </p>

          <div className="max-w-4xl mx-auto mb-8 p-4 border border-slate-800 rounded-lg bg-slate-900/50 text-xs text-slate-500 text-left">
            <p>
              Disclaimer: All plumbing work is performed by qualified
              professionals. Quotes, permits, licensing requirements, and
              workmanship are the responsibility of the assigned plumbing
              contractor.
            </p>
          </div>

          <p className="text-sm">
            &copy; {new Date().getFullYear()} {BUSINESS_NAME}. All rights
            reserved.
          </p>
        </div>
      </footer>

      {/* Floating Mobile FAB */}
      <div className="fixed bottom-6 right-6 md:hidden z-50">
        <Button
          asChild
          size="icon"
          className="h-14 w-14 rounded-full shadow-xl shadow-primary/30"
        >
          <a href={`tel:${PHONE_TEL}`}>
            <Phone className="h-6 w-6" />
            <span className="sr-only">Call {PHONE_DISPLAY}</span>
          </a>
        </Button>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

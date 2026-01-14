import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingPricing } from "@/components/landing/landing-pricing";
import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingFooter } from "@/components/landing/landing-footer";

export default async function Home() {
  const supabase = createClient(cookies());
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    redirect("/overview");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <LandingNavbar />
      <main className="flex-1">
        <LandingHero />
        <LandingFeatures />
        <LandingPricing />
        <LandingFaq />
      </main>
      <LandingFooter />
    </div>
  );
}

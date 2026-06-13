import Link from "next/link";
import { CheckIcon } from "@/components/ui/icons";
import { MobileInstallBanner } from "@/components/MobileInstallBanner";

const features = [
  { title: "Smart Nutrition Calculator", desc: "Get your personalized daily calorie and macro targets based on your body, activity, and goals.", icon: "🎯" },
  { title: "AI Meal Plans", desc: "Generate complete 7-day meal plans tailored to your diet style — keto, vegan, Mediterranean, and more.", icon: "🍽️" },
  { title: "Full Recipes", desc: "Every meal comes with ingredients, step-by-step instructions, prep time, and full nutritional breakdown.", icon: "👩‍🍳" },
  { title: "Auto Grocery Lists", desc: "Turn your entire week of meals into a categorized shopping list in one click.", icon: "🛒" },
];

const dietStyles = [
  { name: "High Protein", emoji: "💪", color: "bg-red-100 text-red-700" },
  { name: "Vegan", emoji: "🌱", color: "bg-green-100 text-green-700" },
  { name: "Keto", emoji: "🥑", color: "bg-yellow-100 text-yellow-700" },
  { name: "Mediterranean", emoji: "🫒", color: "bg-blue-100 text-blue-700" },
  { name: "Vegetarian", emoji: "🥗", color: "bg-lime-100 text-lime-700" },
  { name: "Balanced", emoji: "⚖️", color: "bg-purple-100 text-purple-700" },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    features: ["Nutrition calculator", "1 AI meal plan per month", "1 grocery list per month", "Full recipes included"],
    cta: "Create Free Account",
    href: "/auth/register",
    highlight: false,
  },
  {
    name: "Premium",
    price: "$7.99",
    period: "/month",
    yearlyPrice: "$59/year",
    features: ["All Free features included", "Unlimited meal plans", "Unlimited grocery lists", "Custom diet preferences", "Priority AI generation"],
    cta: "Start Premium",
    href: "/auth/register?plan=premium",
    highlight: true,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <MobileInstallBanner />
      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🥗</span>
            <span className="font-bold text-xl text-gray-900">NutriMap AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/signin" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              Sign In
            </Link>
            <Link href="/auth/register" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">
              Sign Up Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-24 px-4 text-center bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <span>✨</span> Powered by Claude AI
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Your Personal
            <span className="text-green-600"> AI Nutritionist</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Get a personalized meal plan, full recipes, and grocery list in minutes. Tell us your goals — we&apos;ll handle the rest.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-green-700 transition-colors shadow-lg shadow-green-200">
              Create Free Account →
            </Link>
            <a href="#features" className="border border-gray-200 bg-white text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-colors">
              See How It Works
            </a>
          </div>
          <p className="text-sm text-gray-500 mt-4">Free to start. No credit card required.</p>
          <div className="mt-6">
            <a href="https://github.com/sthayes0622/nutrimapai/releases/tag/v0.1.0" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors">
              <span>🍎</span> Download Mac App
            </a>
          </div>
        </div>
      </section>

      {/* Diet styles */}
      <section className="py-12 border-y border-gray-100 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-center text-sm font-medium text-gray-500 uppercase tracking-wider mb-6">Supports your diet style</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {dietStyles.map((d) => (
              <span key={d.name} className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${d.color}`}>
                <span>{d.emoji}</span> {d.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Everything you need to eat well</h2>
          <p className="text-center text-gray-600 mb-16 max-w-xl mx-auto">From calculation to cooking — NutriMap AI handles your entire nutrition journey.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 bg-green-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">Ready in 3 steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Create your account", desc: "Sign up free. Enter your age, weight, height, activity level, and nutrition goal." },
              { step: "2", title: "Pick your diet style", desc: "Choose from High Protein, Vegan, Keto, Mediterranean, Vegetarian, or Balanced." },
              { step: "3", title: "Get your plan", desc: "Receive a 7-day meal plan with full recipes and a ready-to-shop grocery list." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-14 h-14 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">{s.step}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-600 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/auth/register" className="bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-green-700 transition-colors">
              Start Now — It&apos;s Free
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Simple pricing</h2>
          <p className="text-center text-gray-600 mb-16">Start free. Upgrade when you&apos;re ready.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {plans.map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-8 border-2 ${plan.highlight ? "border-green-600 bg-green-50" : "border-gray-200 bg-white"}`}>
                {plan.highlight && (
                  <span className="inline-block bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">MOST POPULAR</span>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period && <span className="text-gray-500">{plan.period}</span>}
                </div>
                {plan.yearlyPrice && <p className="text-sm text-gray-500 mb-6">or {plan.yearlyPrice} (save 38%)</p>}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-gray-700">
                      <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className={`block w-full text-center py-3 rounded-xl font-semibold transition-colors ${plan.highlight ? "bg-green-600 text-white hover:bg-green-700" : "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50"}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🥗</span>
            <span className="font-bold text-gray-900">NutriMap AI</span>
          </div>
          <p className="text-sm text-gray-500">© 2025 NutriMap AI. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-900">Privacy</a>
            <a href="#" className="hover:text-gray-900">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

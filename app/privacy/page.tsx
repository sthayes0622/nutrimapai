export default function PrivacyPolicy() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px", fontFamily: "system-ui, sans-serif", color: "#111827", lineHeight: 1.7 }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ color: "#6b7280", marginBottom: 32 }}>Last updated: June 13, 2025</p>

      <p>NutriMap AI ("we", "our", or "us") operates the NutriMap AI mobile application and website (nutrimapai.vercel.app). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service.</p>

      <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>Information We Collect</h2>
      <p>We collect information you provide directly to us when you use the app:</p>
      <ul>
        <li><strong>Profile Information:</strong> Age, sex, height, weight, activity level, and health goals you enter during onboarding.</li>
        <li><strong>Dietary Preferences:</strong> Diet style, food allergies, dislikes, and cuisine preferences.</li>
        <li><strong>Account Information:</strong> Email address if you create an account.</li>
        <li><strong>Usage Data:</strong> How you interact with the app, including meal plans generated and diary entries.</li>
      </ul>

      <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>How We Use Your Information</h2>
      <ul>
        <li>To generate personalized meal plans and nutrition recommendations</li>
        <li>To calculate your daily calorie and macro targets</li>
        <li>To improve and personalize your experience</li>
        <li>To send push notifications (only if you opt in)</li>
        <li>To process payments for premium features</li>
      </ul>

      <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>AI-Generated Content</h2>
      <p>Meal plans and nutrition recommendations are generated using Claude AI (by Anthropic). Your profile data is sent to Anthropic's API to generate personalized content. Anthropic's privacy policy applies to data processed by their API. NutriMap AI is not a medical service and does not provide medical advice.</p>

      <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>Data Storage</h2>
      <p>Your profile and meal plan data is stored locally on your device and, if you create an account, in our secure database. We do not sell your personal data to third parties.</p>

      <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>Third-Party Services</h2>
      <ul>
        <li><strong>Anthropic Claude API</strong> — generates meal plans from your profile data</li>
        <li><strong>Stripe</strong> — processes payments for premium subscriptions</li>
        <li><strong>Vercel</strong> — hosts our web application</li>
      </ul>

      <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>Children's Privacy</h2>
      <p>Our Service is not directed to children under 13. We do not knowingly collect personal information from children under 13.</p>

      <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>Your Rights</h2>
      <p>You may request deletion of your account and associated data at any time by contacting us. You can also clear all locally stored data by uninstalling the app.</p>

      <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>Changes to This Policy</h2>
      <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>

      <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>Contact Us</h2>
      <p>If you have questions about this Privacy Policy, contact us at: <a href="mailto:sthayes.0622@gmail.com" style={{ color: "#16a34a" }}>sthayes.0622@gmail.com</a></p>
    </main>
  );
}

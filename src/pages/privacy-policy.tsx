import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link to="/" className="text-2xl font-bold text-primary">
            Ikshā Naturopathy
          </Link>
          <Link 
            to="/" 
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-primary">Privacy Policy</h1>
        
        <div className="prose prose-neutral max-w-none space-y-6">
          <p className="text-muted-foreground text-lg">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              At Ikshā Naturopathy, we collect information to provide you with the best possible natural healing experience:
            </p>
            <ul className="list-disc ml-6 text-muted-foreground space-y-2">
              <li><strong>Personal Information:</strong> Name, contact details, date of birth, emergency contacts</li>
              <li><strong>Health Information:</strong> Medical history, current health conditions, symptoms, treatment preferences</li>
              <li><strong>Treatment Records:</strong> Session notes, treatment plans, progress tracking</li>
              <li><strong>Communication Data:</strong> Emails, phone calls, and other correspondence</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">2. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use your information to:
            </p>
            <ul className="list-disc ml-6 text-muted-foreground space-y-2">
              <li>Provide personalized naturopathic treatments and care</li>
              <li>Develop comprehensive treatment plans tailored to your needs</li>
              <li>Track your progress and adjust treatments accordingly</li>
              <li>Communicate with you about appointments and treatment updates</li>
              <li>Ensure your safety and monitor for any adverse reactions</li>
              <li>Maintain accurate treatment records as required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Information Sharing and Disclosure</h2>
            <p className="text-muted-foreground leading-relaxed">
              We respect your privacy and do not sell, trade, or rent your personal information. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc ml-6 text-muted-foreground space-y-2">
              <li>With your explicit written consent</li>
              <li>When required by law or legal process</li>
              <li>In case of medical emergencies requiring immediate care</li>
              <li>With healthcare providers involved in your care (with your consent)</li>
              <li>For insurance or billing purposes (when applicable)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate security measures to protect your personal and health information:
            </p>
            <ul className="list-disc ml-6 text-muted-foreground space-y-2">
              <li>Secure storage of physical and digital records</li>
              <li>Access restrictions to authorized personnel only</li>
              <li>Regular security assessments and updates</li>
              <li>Encrypted transmission of sensitive data</li>
              <li>Secure disposal of outdated records</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              You have the right to:
            </p>
            <ul className="list-disc ml-6 text-muted-foreground space-y-2">
              <li>Access your personal and health information</li>
              <li>Request corrections to inaccurate information</li>
              <li>Request restrictions on the use of your information</li>
              <li>Withdraw consent for certain uses (where applicable)</li>
              <li>Receive a copy of your treatment records</li>
              <li>File a complaint about our privacy practices</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Retention of Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your information for as long as necessary to provide you with services and as required by applicable laws and regulations. Treatment records are typically maintained for a minimum period as mandated by healthcare regulations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Cookies and Website Data</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our website may use cookies to enhance your browsing experience. We collect minimal website usage data to improve our online services. You can disable cookies in your browser settings if preferred.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may use third-party services for appointment scheduling, communication, or practice management. These providers are bound by strict confidentiality agreements and comply with healthcare privacy regulations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">9. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. Any changes will be posted on our website with an updated effective date. We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">10. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div className="bg-muted p-4 rounded-lg mt-4">
              <p className="text-foreground font-medium">Ikshā Naturopathy</p>
              <p className="text-muted-foreground">Email: privacy@ikshanaturopathy.com</p>
              <p className="text-muted-foreground">Phone: [Contact Number]</p>
              <p className="text-muted-foreground">Address: [Clinic Address]</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
import { Link } from "react-router-dom";

const TermsAndConditions = () => {
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
        <h1 className="text-4xl font-bold mb-8 text-primary">Terms and Conditions</h1>
        
        <div className="prose prose-neutral max-w-none space-y-6">
          <p className="text-muted-foreground text-lg">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using the services provided by Ikshā Naturopathy, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Services Description</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ikshā Naturopathy provides natural healing services including but not limited to:
            </p>
            <ul className="list-disc ml-6 text-muted-foreground space-y-2">
              <li>Naturopathy consultations and treatments</li>
              <li>Hydrotherapy, chromotherapy, and earthen mud therapy</li>
              <li>Yoga therapy and mindfulness practices</li>
              <li>Acupuncture and acupressure treatments</li>
              <li>Counseling and mind calming therapies</li>
              <li>Lifestyle and dietary guidance</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Medical Disclaimer</h2>
            <p className="text-muted-foreground leading-relaxed">
              The information and services provided by Ikshā Naturopathy are not intended to diagnose, treat, cure, or prevent any disease. Our naturopathic treatments are complementary and should not replace conventional medical care. Always consult with your healthcare provider before starting any new treatment program.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Client Responsibilities</h2>
            <p className="text-muted-foreground leading-relaxed">
              Clients are responsible for:
            </p>
            <ul className="list-disc ml-6 text-muted-foreground space-y-2">
              <li>Providing accurate and complete health information</li>
              <li>Following prescribed treatment protocols</li>
              <li>Informing us of any adverse reactions or concerns</li>
              <li>Arriving on time for scheduled appointments</li>
              <li>Paying for services as agreed upon</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Cancellation Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Appointments must be cancelled at least 24 hours in advance. Late cancellations or no-shows may result in charges. We understand that emergencies occur and will work with clients on a case-by-case basis.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Confidentiality</h2>
            <p className="text-muted-foreground leading-relaxed">
              All client information is treated with strict confidentiality in accordance with applicable privacy laws. We will not share personal health information without explicit consent, except as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ikshā Naturopathy and its practitioners shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from the use of our services or any information provided.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Modifications to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these terms at any time. Changes will be posted on our website and will be effective immediately upon posting.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">9. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms and Conditions, please contact us through our website or visit our center.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default TermsAndConditions;
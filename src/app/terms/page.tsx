import React from 'react';

const TermsPage = () => {
  return (
    <div className="container mx-auto py-12 px-4 md:px-8">
      <section className="mb-12 text-center">
        <h1 className="heading-display mb-4 animate-in fade-in slide-in-from-top-4 duration-700">Terms of Service</h1>
        <p className="body-text-large text-muted-foreground animate-in fade-in duration-1000 delay-200">
          Understanding your rights and responsibilities.
        </p>
      </section>

      <div className="my-12 h-px bg-border animate-in fade-in duration-1000 delay-400" />

      <section className="mb-12 animate-in fade-in duration-700 delay-300">
        <h2 className="heading-primary mb-4">Introduction</h2>
        <p className="body-text mb-4">
          Welcome to PokeStories. These Terms of Service (&quot;Terms&quot;) govern your access to and use of the PokeStories application and services (collectively, the &quot;Service&quot;). By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.
        </p>
      </section>

      <section className="mb-12 animate-in fade-in duration-700 delay-400">
        <h2 className="heading-primary mb-4">Acceptance of Terms</h2>
        <p className="body-text mb-4">
          Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users and others who access or use the Service.
        </p>
      </section>

      <section className="mb-12 animate-in fade-in duration-700 delay-500">
        <h2 className="heading-primary mb-4">Use of the Service</h2>
        <p className="body-text mb-4">
          The Service is provided for your personal, non-commercial use. You agree to use the Service only for lawful purposes and in a way that does not infringe the rights of, restrict or inhibit anyone else&apos;s use and enjoyment of the Service.
        </p>
      </section>

      <section className="mb-12 animate-in fade-in duration-700 delay-600">
        <h2 className="heading-primary mb-4">User Conduct</h2>
        <p className="body-text mb-2">
          You agree not to:
        </p>
        <ul className="list-disc list-inside body-text ml-4">
          <li className="mb-1">Use the Service in any way that causes, or may cause, damage to the Service or impairment of the availability or accessibility of the Service.</li>
          <li className="mb-1">Use the Service in any way which is unlawful, illegal, fraudulent or harmful, or in connection with any unlawful, illegal, fraudulent or harmful purpose or activity.</li>
          <li className="mb-1">Engage in any data mining, data harvesting, data extracting or any other similar activity in relation to this Service.</li>
        </ul>
      </section>

      <section className="mb-12 animate-in fade-in duration-700 delay-700">
        <h2 className="heading-primary mb-4">Intellectual Property</h2>
        <p className="body-text mb-4">
          The Service and its original content (excluding content provided by users), features and functionality are and will remain the exclusive property of PokeStories and its licensors. The Service is protected by copyright, trademark, and other laws of both the Chile and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of PokeStories.
        </p>
      </section>

      <section className="mb-12 animate-in fade-in duration-700 delay-800">
        <h2 className="heading-primary mb-4">Disclaimers</h2>
        <p className="body-text mb-4">
          Your use of the Service is at your sole risk. The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.
        </p>
      </section>

      <section className="mb-12 animate-in fade-in duration-700 delay-900">
        <h2 className="heading-primary mb-4">Limitation of Liability</h2>
        <p className="body-text mb-4">
          In no event shall PokeStories, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage, and even if a remedy set forth herein is found to have failed of its essential purpose.
        </p>
      </section>

      <section className="mb-12 animate-in fade-in duration-700 delay-1000">
        <h2 className="heading-primary mb-4">Governing Law</h2>
        <p className="body-text mb-4">
          These Terms shall be governed and construed in accordance with the laws of Chile, without regard to its conflict of law provisions.
        </p>
      </section>

      <section className="mb-12 animate-in fade-in duration-700 delay-1100">
        <h2 className="heading-primary mb-4">Changes to Terms</h2>
        <p className="body-text mb-4">
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
        </p>
      </section>

      <section className="mb-12 animate-in fade-in duration-700 delay-1200">
        <h2 className="heading-primary mb-4">Contact Information</h2>
        <p className="body-text">
          If you have any questions about these Terms, please contact us:
        </p>
        <ul className="list-disc list-inside body-text ml-4 mt-2">
          <li>By email: joaquin.gonzalezparada@gmail.com</li>
          <li>By visiting this page on our website: <a href="/contact" className="text-primary hover:underline">/contact</a></li>
        </ul>
      </section>
    </div>
  );
};

export default TermsPage;
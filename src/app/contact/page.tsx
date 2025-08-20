import React from 'react';

const ContactPage = () => {
  return (
    <div className="container mx-auto py-12 px-4 md:px-8">
      <section className="mb-12 text-center">
        <h1 className="heading-display mb-4 animate-in fade-in slide-in-from-top-4 duration-700">Contact Us</h1>
        <p className="body-text-large text-muted-foreground animate-in fade-in duration-1000 delay-200">
          We&apos;d love to hear from you!
        </p>
      </section>

      <div className="my-12 h-px bg-border animate-in fade-in duration-1000 delay-400" />

      <section className="max-w-2xl mx-auto animate-in fade-in duration-700 delay-500">
        <div className="bg-card p-8 rounded-lg shadow-lg border border-border">
          <p className="body-text mb-6 text-center">
            Have a question, feedback, or just want to say hello? Fill out the form below and we&apos;ll get back to you as soon as possible.
          </p>

          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="label-text block mb-2 text-foreground">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                className="input flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Your Name"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="label-text block mb-2 text-foreground">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className="input flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="message" className="label-text block mb-2 text-foreground">Message</label>
              <textarea
                id="message"
                name="message"
                rows={5}
                className="input flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Your message..."
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="button-text bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors duration-200 w-full md:w-auto"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>

      <section className="text-center mt-16 animate-in fade-in duration-1000 delay-600">
        <p className="caption-text">
          We look forward to connecting with you.
        </p>
      </section>
    </div>
  );
};

export default ContactPage;
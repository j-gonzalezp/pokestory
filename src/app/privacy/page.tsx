import React from 'react';

const PrivacyPage = () => {
    return (
        <main className="container mx-auto py-12 px-4 md:px-8">
            <section className="mb-12 text-center">
                <h1 className="heading-display mb-4 animate-in fade-in slide-in-from-top-4 duration-700">Privacy Policy</h1>
                <p className="body-text-large text-muted-foreground animate-in fade-in duration-1000 delay-200">
                    Your privacy is important to us.
                </p>
            </section>

            <div className="my-12 h-px bg-border animate-in fade-in duration-1000 delay-400" />

            <section className="mb-12 animate-in fade-in duration-700 delay-300">
                <h2 className="heading-primary mb-4">Introduction</h2>
                <p className="body-text mb-4">
                    This Privacy Policy describes how PokeStories collects, uses, and discloses your information when you use our application. By accessing or using PokeStories, you agree to the collection and use of information in accordance with this policy.
                </p>
            </section>

            <section className="mb-12 animate-in fade-in duration-700 delay-400">
                <h2 className="heading-primary mb-4">Information We Collect</h2>
                <p className="body-text mb-2">
                    We collect various types of information for various purposes to provide and improve our service to you.
                </p>
                <ul className="list-disc list-inside body-text ml-4">
                    <li className="mb-1">
                        <span className="font-semibold">Usage Data:</span> We may collect information on how the Service is accessed and used (&quot;Usage Data&quot;). This Usage Data may include information such as your computer&apos;s Internet Protocol address (e.g., IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers and other diagnostic data.
                    </li>
                    <li className="mb-1">
                        <span className="font-semibold">Personal Data:</span> While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you (&quot;Personal Data&quot;). This might include, but is not limited to, your email address if you choose to contact us.
                    </li>
                </ul>
            </section>

            <section className="mb-12 animate-in fade-in duration-700 delay-500">
                <h2 className="heading-primary mb-4">How We Use Your Information</h2>
                <p className="body-text mb-2">
                    PokeStories uses the collected data for various purposes:
                </p>
                <ul className="list-disc list-inside body-text ml-4">
                    <li className="mb-1">To provide and maintain our Service.</li>
                    <li className="mb-1">To notify you about changes to our Service.</li>
                    <li className="mb-1">To allow you to participate in interactive features of our Service when you choose to do so.</li>
                    <li className="mb-1">To provide customer support.</li>
                    <li className="mb-1">To monitor the usage of our Service.</li>
                    <li className="mb-1">To detect, prevent and address technical issues.</li>
                </ul>
            </section>

            <section className="mb-12 animate-in fade-in duration-700 delay-600">
                <h2 className="heading-primary mb-4">Data Security</h2>
                <p className="body-text mb-4">
                    The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
                </p>
            </section>

            <section className="mb-12 animate-in fade-in duration-700 delay-700">
                <h2 className="heading-primary mb-4">Your Rights</h2>
                <p className="body-text mb-4">
                    Depending on your location, you may have certain rights regarding your personal data, such as the right to access, update, or delete the information we hold about you. Please contact us to exercise these rights.
                </p>
            </section>

            <section className="mb-12 animate-in fade-in duration-700 delay-800">
                <h2 className="heading-primary mb-4">Changes to This Policy</h2>
                <p className="body-text mb-4">
                    We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
                </p>
            </section>

            <section className="mb-12 animate-in fade-in duration-700 delay-900">
                <h2 className="heading-primary mb-4">Contact Us</h2>
                <p className="body-text">
                    If you have any questions about this Privacy Policy, please contact us:
                </p>
                <ul className="list-disc list-inside body-text ml-4 mt-2">
                    <li>By email: joaquin.gonzalezparada@gmail.com</li>
                    <li>By visiting this page on our website: <a href="/contact" className="text-primary hover:underline">/contact</a></li>
                </ul>
            </section>
        </main>
    );
};

export default PrivacyPage;

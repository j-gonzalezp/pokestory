import React from 'react';
import Image from 'next/image';

const AboutPage = () => {
  return (
    <div className="container mx-auto py-12 px-4 md:px-8">
      <section className="mb-12 text-center">
        <h1 className="heading-display mb-4 animate-in fade-in slide-in-from-top-4 duration-700">About PokeStory</h1>
        <p className="body-text-large text-muted-foreground animate-in fade-in duration-1000 delay-200">
          Transforming the Pokémon experience with innovation and narrative.
        </p>
      </section>

      <div className="my-12 h-px bg-border animate-in fade-in duration-1000 delay-400" />

      <section className="grid md:grid-cols-2 gap-12 items-center mb-12">
        <div className="animate-in fade-in slide-in-from-left-4 duration-700 delay-300">
          <h2 className="heading-primary mb-4">Our Vision: An Interactive Pokedex</h2>
          <p className="body-text mb-4">
           
            &quot;PokeStories&quot; is born from the vision of transforming a traditional Pokedex into an interactive and enriching experience. This project goes beyond being a simple Pokémon database; it aspires to be a dynamic RPG and encyclopedia that comes to life through generated narratives, offering users a unique way to explore the vast Pokémon universe.
          </p>
          <p className="body-text">
            Imagine a platform where each Pokémon not only has its stats and descriptions but also unique stories that unfold as you interact with the application.
          </p>
        </div>
        <div className="relative w-full h-64 bg-muted rounded-lg flex items-center justify-center animate-in fade-in slide-in-from-right-4 duration-700 delay-400 overflow-hidden">
          <Image
            src="/pokedex.png"
            alt="Interactive Pokedex"
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </section>

      <div className="my-12 h-px bg-border animate-in fade-in duration-1000 delay-500" />

      <section className="grid md:grid-cols-2 gap-12 items-center mb-12">
        <div className="relative w-full h-64 bg-muted rounded-lg flex items-center justify-center order-2 md:order-1 animate-in fade-in slide-in-from-left-4 duration-700 delay-600 overflow-hidden">
          <Image
            src="/ai picture.png"
            alt="Abstract image of AI/LLMs"
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="order-1 md:order-2 animate-in fade-in slide-in-from-right-4 duration-700 delay-700">
          <h2 className="heading-primary mb-4">Powered by Artificial Intelligence</h2>
          <p className="body-text mb-4">
            Driven by a deep interest in artificial intelligence, this project integrates the Gemini SDK and Large Language Models (LLMs) to generate captivating stories. This functionality allows Pokedex information to be intertwined with personalized narratives, creating an immersive experience where each Pokémon has its own story.
          </p>
          <p className="body-text">
            The application is built with <span className="code-text bg-muted p-1 rounded">Next.js</span>, which facilitates agile and efficient deployment on platforms like <span className="code-text bg-muted p-1 rounded">Vercel</span>, and also enables robust use of server-side functions to ensure the security of sensitive API keys, such as Gemini&apos;s. 
          </p>
        </div>
      </section>

      <div className="my-12 h-px bg-border animate-in fade-in duration-1000 delay-800" />

      <section className="mb-12 text-center">
        <h2 className="heading-primary mb-4 animate-in fade-in slide-in-from-top-4 duration-700 delay-900">Purpose and Audience</h2>
        <p className="body-text-large max-w-3xl mx-auto mb-6 animate-in fade-in duration-1000 delay-1000">
          The main goal of PokeStories is to provide an engaging and educational platform for Pokémon enthusiasts.
        </p>
        <div className="relative w-full h-64 bg-muted rounded-lg flex items-center justify-center mx-auto max-w-2xl animate-in fade-in duration-700 delay-1100 overflow-hidden">
          <Image
            src="/pokestories (1).png"
            alt="User enjoying the app"
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 700px, 800px"
          />
        </div>
        <p className="body-text mt-6 max-w-3xl mx-auto animate-in fade-in duration-1000 delay-1200">
          Whether to spend a pleasant time, learn interesting facts, or delve into new stories, the application is designed to enrich the experience of the Pokémon community, offering a fresh and dynamic perspective on their favorite creatures. We hope you enjoy exploring the Pokémon universe in a whole new way.
        </p>
      </section>

      <section className="text-center mt-16 animate-in fade-in duration-1000 delay-1300">
        <p className="caption-text">
          Developed with passion by j-gonzalezp.
        </p>
      </section>
    </div>
  );
};

export default AboutPage;
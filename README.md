# PokeStory RPG 🎮

> An AI-powered Pokémon role-playing game where every story is uniquely generated through advanced narrative algorithms and Google Gemini AI.

![PokeStory Banner](public/pokestories%20(1).png)

## 🌟 Overview

**PokeStory RPG** is a revolutionary web-based Pokémon adventure game that combines traditional RPG mechanics with cutting-edge AI storytelling. Players embark on epic, procedurally generated journeys where every decision shapes their Pokémon's destiny through an innovative narrative framework inspired by sacred geometry.

## ✨ Key Features

### 🎭 AI-Powered Dynamic Storytelling
- **Google Gemini Integration**: Advanced AI generates unique, context-aware narratives
- **Geometric Narrative Framework**: Stories follow sophisticated 10-step progression (Tetrahedron → Octahedron → Icosahedron → Dodecahedron)
- **Decision-Based Plot**: Every choice influences story direction and character development
- **Multi-language Support**: Full Spanish and English localization

### 🏆 Comprehensive RPG System
- **Pokémon Adoption**: Build your team with up to 3 unique companions
- **Advanced Stat System**: Track HP, morale, experience, and personality traits
- **Dynamic Leveling**: Pokémon grow and evolve based on choices and experiences
- **Trait Development**: Earn defining characteristics through meaningful decisions

### 🎨 Immersive User Experience
- **Interactive Story Map**: Visual journey progression with animated nodes
- **Real-time Typewriter Effects**: Cinematic text reveals for story segments
- **Modern UI Components**: Responsive design with smooth Framer Motion animations
- **Pokédex Integration**: Complete Pokémon database with detailed information

### 💾 Game Persistence
- **Story Saving**: Preserve your epic adventures with custom titles
- **Team Management**: Adopt, release, and manage your Pokémon companions
- **Progress Tracking**: Resume stories from any point in the journey
- **Local Storage**: Secure, client-side data persistence

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **AI Integration**: Google Generative AI (Gemini 1.5 Flash)
- **Animations**: Framer Motion for smooth, professional transitions
- **UI Components**: Custom component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── pokedex/           # Pokédex pages
│   ├── about/             # About page
│   ├── contact/           # Contact page
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── ui/               # Base UI primitives
│   ├── pokedex/          # Pokédex-specific components
│   ├── pokestory/        # Story game components
│   └── animations/       # Animation utilities
├── services/             # Business logic services
│   ├── gemini.ts         # AI story generation
│   ├── persistence.ts    # Data storage management
│   ├── pokeapi.ts        # Pokémon API integration
│   └── gameLogic.ts      # Game mechanics
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and constants
└── types/                # TypeScript type definitions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, pnpm, or bun
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pokestory-rpg
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Environment Setup**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎮 How to Play

1. **Configure Your Adventure**: Select Pokémon generations and choose your language
2. **Choose Your Companion**: Adopt a Pokémon from the available pool or use a previously adopted one
3. **Name Your Partner**: Give your Pokémon a unique nickname
4. **Embark on Your Journey**: Experience AI-generated stories that adapt to your choices
5. **Make Decisions**: Each choice affects your Pokémon's stats, traits, and story progression
6. **Track Progress**: Follow your journey on the interactive story map
7. **Save Your Story**: Preserve memorable adventures with custom titles

## 🎯 Game Mechanics

### Narrative System
The game uses a sophisticated 10-step narrative framework:
- **Phase I (Tetrahedron - Fire)**: Story setup and inciting incident
- **Phase II (Cube - Earth)**: World-building and resistance to change
- **Phase III (Octahedron - Air)**: Trials, allies, and character growth
- **Phase IV (Icosahedron - Water)**: Crisis and transformation
- **Phase V (Dodecahedron - Ether)**: Climax and resolution

### Decision Consequences
Every choice has measurable impacts:
- **XP Gain**: Rewards for brave/clever actions (0-100 points)
- **Health Changes**: Risk/reward system for combat encounters
- **Morale Effects**: Psychological impact of decisions
- **Trait Acquisition**: Personality development through defining moments

### Pokémon Stats
- **HP**: Physical health and combat readiness
- **Morale**: Mental state and motivation
- **Level/XP**: Growth and progression system
- **Traits**: Unique personality characteristics

## 🎨 Design Philosophy

### Modern, Accessible UI
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Dark/Light Theme**: System preference detection with manual override
- **Inclusive Colors**: WCAG-compliant color schemes
- **Smooth Animations**: Performance-optimized transitions

### Immersive Storytelling
- **Cinematic Presentation**: Typewriter text effects and scene transitions
- **Visual Story Mapping**: Journey visualization with progress indicators
- **Dynamic Content**: Context-aware UI that adapts to story state
- **Emotional Engagement**: Sound design and visual feedback

## 🔧 Development

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm test         # Run Jest tests
```

### Testing
The project uses Jest with React Testing Library:
```bash
npm test
npm run test:watch
```

### Code Quality
- **TypeScript**: Strict type checking for maintainability
- **ESLint**: Code linting and formatting
- **Prettier**: Consistent code formatting
- **Tailwind CSS**: Utility-first styling approach

## 🌐 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push

### Other Platforms
The app can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- AWS Amplify
- DigitalOcean App Platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Pokémon Data**: Powered by [PokeAPI](https://pokeapi.co/)
- **AI Engine**: Google Generative AI (Gemini)
- **Icons**: [Lucide React](https://lucide.dev/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Fonts**: [Google Fonts](https://fonts.google.com/)

## 📞 Contact

- **Project**: [GitHub Repository](https://github.com/yourusername/pokestory-rpg)
- **Issues**: [Report Bugs](https://github.com/yourusername/pokestory-rpg/issues)
- **Features**: [Request Features](https://github.com/yourusername/pokestory-rpg/issues)

---

**Built with ❤️ using Next.js, TypeScript, and the power of AI**

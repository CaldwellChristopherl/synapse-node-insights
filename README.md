# Synapse Node Insights

A sophisticated personality-based quiz application that matches players to One Page Rules (OPR) Grimdark Future and Age of Fantasy factions. Discover your tactical playstyle, get personalized faction recommendations, and auto-generate army lists tailored to your personality.

![Synapse Node Insights](https://img.shields.io/badge/OPR-Grimdark%20Future-red) ![Synapse Node Insights](https://img.shields.io/badge/OPR-Age%20of%20Fantasy-emerald)

## ✨ Features

### 🧠 Personality Analysis
- **30-Question Quiz**: Comprehensive assessment across 15 personality dimensions
- **Dimension Scoring**: Each dimension is scored from -5 to +5, providing nuanced personality insights
- **Archetype Detection**: Automatic identification of your tactical playstyle archetype
- **Detailed Personality Profile**: Visual breakdown of your tactical preferences

### 🎯 Faction Matching
- **Smart Matching Algorithm**: Calculates compatibility with all OPR factions
- **Percentage-Based Rankings**: See exactly how well each faction matches your personality
- **Thematic Analysis**: Understand why factions match your playstyle
- **Cross-Game Support**: Works with both Grimdark Future and Age of Fantasy

### ⚔️ Army Builder
- **Auto-Generate Lists**: Builds balanced armies based on your personality and faction choice
- **Force Organization Compliance**: Follows OPR's official force organization rules
- **Point Budget Control**: Set any point limit (500-3000+ points)
- **Personality-Optimized Units**: Units prioritized based on your tactical preferences
- **Interactive Army List**: View unit details, costs, and quantities

### 💾 Save & Export
- **Local Storage**: Save up to 10 quiz results locally
- **Load Previous Results**: Quickly restore saved quizzes
- **Export for AI**: Generate JSON exports compatible with AI analysis tools
- **Result History**: Track your quiz results over time

## 🚀 Getting Started

### Prerequisites

- **Node.js** 16 or higher
- **npm** or **yarn**

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd opr-army-quiz-v3

# Install dependencies
npm install
```

### Development

```bash
# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

```bash
# Build for production
npm run build

# Preview the production build
npm run preview
```

## 🎮 Usage

### Taking the Quiz

1. **Select Game System**: Choose between Grimdark Future or Age of Fantasy
2. **Answer Questions**: Progress through 30 personality-based questions
3. **View Results**: See your faction matches and personality profile
4. **Build Army**: Select a faction to generate your personalized army list

### Personality Dimensions

The quiz analyzes 15 key personality dimensions:

| Dimension | Description |
|-----------|-------------|
| **Patience** | Slow & methodical vs fast & aggressive |
| **Collective** | Individual heroes vs massed hordes |
| **Order** | Structured tactics vs chaotic flexibility |
| **Tech** | Technology preference (ranged vs melee) |
| **Elite** | Elite units vs horde armies |
| **Honor** | Honorable combat vs ruthless tactics |
| **Faith** | Religious/mystical vs secular/scientific |
| **Subtlety** | Stealth & deception vs brute force |
| **Tradition** | Traditional methods vs innovation |
| **Purity** | Purist vs flexible/mutated forces |
| **Speed** | Slow & steady vs fast & mobile |
| **Mystery** | Known entities vs mysterious forces |
| **Versatility** | Specialized vs adaptable units |
| **Humanity** | Human-centric vs alien/monstrous |
| **Leadership** | Centralized command vs distributed forces |

### Archetypes

Common tactical archetypes include:
- **The General**: Strategic, orderly, patient
- **The Warlord**: Aggressive, elite-focused, direct
- **The Trickster**: Subtle, deceptive, fast
- **The Machine**: Orderly, tech-focused, collective
- **The Berserker**: Chaos, melee, aggressive
- **And many more...**

## 📁 Project Structure

```
src/
├── App.jsx                      # Main application component
├── main.jsx                     # Application entry point
├── data/
│   ├── factions/                # Faction data and unit information
│   │   ├── units/
│   │   │   ├── grimdark-future/ # Grimdark Future unit JSONs
│   │   │   ├── age-of-fantasy/  # Age of Fantasy unit JSONs
│   │   │   └── index.jsx        # Faction data export
│   │   ├── grim-dark-future.jsx # Grimdark Future faction database
│   │   ├── age-of-fantasy.jsx   # Age of Fantasy faction database
│   │   └── index.jsx
│   ├── personality/
│   │   ├── archetypes.jsx       # Personality archetypes definitions
│   │   ├── dimension-info.jsx   # Dimension descriptions and styling
│   │   └── tag-to-dimension.jsx # Unit tag mapping
│   ├── game/
│   │   └── point-presets.jsx    # Common point size presets
│   └── questions.jsx            # Quiz questions database
├── helper/
│   ├── game/
│   │   └── get-force-org-limits.jsx  # Force organization rules
│   └── unit-score/
│       ├── extract-tags.jsx     # Extract unit tags from rules
│       └── score-unit.jsx       # Score units by personality match
└── index.css                    # Global styles
```

## 🎯 How It Works

### Matching Algorithm

1. **Calculate User Scores**: Aggregate answers across each dimension
2. **Compare to Faction Ideals**: Calculate absolute differences between user scores and faction profiles
3. **Generate Match Percentage**: Convert total difference to a percentage (lower difference = higher match)
4. **Rank Factions**: Sort all factions by match percentage

### Army Building Algorithm

1. **Determine Force Organization**: Apply OPR rules based on point limit
2. **Score Each Unit**: Calculate personality compatibility for each unit
3. **Prioritize Units**: Sort units by personality match and tactical value
4. **Fill Army**: Add units within force organization limits until point budget is reached
5. **Optimize Composition**: Ensure balanced army with required roles

## 📊 Data Sources

- **Faction & Unit Data**: Sourced from the official OPR Army Forge API
- **Quiz Dimensions**: Custom-designed based on OPR gameplay mechanics
- **Personality Archetypes**: Analyzed from common OPR playstyles
- **Force Organization Rules**: Based on official OPR documentation

## 🔧 Customization

### Adding New Questions

Edit `src/data/questions.jsx`:

```javascript
{
  id: 'q31',
  dimension: 'patience',
  text: 'Your question here?',
  options: [
    { text: 'Option 1', value: -5 },
    { text: 'Option 2', value: 0 },
    { text: 'Option 3', value: 5 }
  ]
}
```

### Adding New Archetypes

Edit `src/data/personality/archetypes.jsx`:

```javascript
{
  name: 'Your Archetype',
  description: 'Description of the playstyle',
  playstyle: 'Brief playstyle summary',
  icon: '🎯',
  conditions: (scores) => scores.patience > 2 && scores.order > 2
}
```

### Modifying Faction Data

Faction profiles are in `src/data/factions/`. Each faction has ideal scores for all dimensions.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is not affiliated with or endorsed by One Page Rules. All OPR-related data is used for educational and entertainment purposes.

## 🙏 Acknowledgments

- **One Page Rules** for the excellent game system and Army Forge API
- The OPR community for inspiration and feedback
- All contributors and users of this application

## 📞 Support

For issues, questions, or suggestions, please open an issue on the repository.

---

**Made with ❤️ for the OPR community**

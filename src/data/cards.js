// Simplified tarot card data
export const tarotCards = [
  {
    id: "fool",
    name: "The Fool",
    image: "/images/fool.jpg",
    uprightMeaning: "New beginnings, innocence, spontaneity",
    reversedMeaning: "Recklessness, risk-taking, bad decisions",
  },
  {
    id: "magician",
    name: "The Magician",
    image: "/images/magician.jpg",
    uprightMeaning: "Manifestation, resourcefulness, power",
    reversedMeaning: "Manipulation, untapped talents, poor planning",
  },
  {
    id: "high-priestess",
    name: "The High Priestess",
    image: "/images/high-priestess.jpg",
    uprightMeaning: "Intuition, unconscious, inner voice",
    reversedMeaning: "Secrets, disconnection, withdrawal",
  },
  {
    id: "empress",
    name: "The Empress",
    image: "/images/empress.jpg",
    uprightMeaning: "Femininity, beauty, abundance",
    reversedMeaning: "Creative block, dependence, emptiness",
  },
  {
    id: "emperor",
    name: "The Emperor",
    image: "/images/emperor.jpg",
    uprightMeaning: "Authority, structure, control",
    reversedMeaning: "Domination, rigidity, lack of discipline",
  },
  // Add more cards as needed
];

// Random shuffling function
export const shuffleCards = () => {
  return [...tarotCards].sort(() => Math.random() - 0.5);
};

// Different spread types
export const spreadTypes = {
  SINGLE: "single",
  TWO_CARD: "two-card",
  THREE_CARD: "three-card",
};

// Function to determine appropriate spread based on query
export const determineSpread = (query) => {
  // Simple logic for demo purposes - would be replaced by AI logic
  // if (query.includes('future') || query.includes('path')) {
  //   return spreadTypes.THREE_CARD;
  // } else if (query.includes('choice') || query.includes('decision')) {
  //   return spreadTypes.TWO_CARD;
  // } else {
  //   return spreadTypes.SINGLE;
  // }

  // Only three card spread for now for testing purposes
  return spreadTypes.THREE_CARD;
};

// Generate placeholder reading
export const generateReading = (cards, spreadType, query) => {
  // This would be replaced by actual AI-generated content
  let reading = `Based on your query: "${query}"\n\n`;

  if (spreadType === spreadTypes.SINGLE) {
    reading += `Your card is ${cards[0].name}.\n`;
    reading += `This signifies ${cards[0].uprightMeaning}.\n`;
    reading += `This suggests that you should trust your instincts and embrace new opportunities.`;
  } else if (spreadType === spreadTypes.TWO_CARD) {
    reading += `Your cards are ${cards[0].name} and ${cards[1].name}.\n`;
    reading += `The first card represents your current situation: ${cards[0].uprightMeaning}.\n`;
    reading += `The second card represents potential outcomes: ${cards[1].uprightMeaning}.\n`;
    reading += `This suggests that by embracing your current circumstances, you'll find the clarity you seek.`;
  } else {
    reading += `Your cards are ${cards[0].name}, ${cards[1].name}, and ${cards[2].name}.\n`;
    reading += `Past: ${cards[0].name} - ${cards[0].uprightMeaning}\n`;
    reading += `Present: ${cards[1].name} - ${cards[1].uprightMeaning}\n`;
    reading += `Future: ${cards[2].name} - ${cards[2].uprightMeaning}\n`;
    reading += `This spread suggests a journey from ${cards[0].uprightMeaning} through current ${cards[1].uprightMeaning} leading ultimately to ${cards[2].uprightMeaning}.`;
  }

  return reading;
};

export type ProduceCategory =
  | 'vegetables'
  | 'fruits'
  | 'grains'
  | 'pulses'
  | 'herbs'
  | 'other'

// Ordered so the more-specific categories match first when produce_name is ambiguous.
const RULES: { category: ProduceCategory; keywords: string[] }[] = [
  {
    category: 'pulses',
    keywords: [
      'dal', 'daal', 'lentil', 'chana', 'chickpea', 'moong', 'urad', 'arhar',
      'toor', 'masoor', 'rajma', 'kidney bean', 'black gram', 'green gram',
    ],
  },
  {
    category: 'grains',
    keywords: [
      'rice', 'basmati', 'wheat', 'atta', 'corn', 'maize', 'jowar', 'bajra',
      'ragi', 'oats', 'barley', 'millet', 'quinoa',
    ],
  },
  {
    category: 'herbs',
    keywords: [
      'curry', 'mint', 'pudina', 'coriander', 'dhania', 'basil', 'tulsi',
      'turmeric', 'haldi', 'cardamom', 'elaichi', 'cumin', 'jeera', 'pepper',
      'clove', 'cinnamon', 'fennel', 'saunf', 'bay leaf', 'fenugreek', 'methi',
    ],
  },
  {
    category: 'fruits',
    keywords: [
      'apple', 'banana', 'mango', 'orange', 'grape', 'papaya', 'pineapple',
      'watermelon', 'muskmelon', 'melon', 'pomegranate', 'guava', 'strawberry',
      'kiwi', 'lemon', 'lime', 'litchi', 'lychee', 'pear', 'peach', 'plum',
      'apricot', 'cherry', 'jackfruit', 'coconut', 'dates', 'fig', 'sapota',
      'chikoo', 'custard apple', 'sitaphal', 'jamun', 'ber',
    ],
  },
  {
    category: 'vegetables',
    keywords: [
      'tomato', 'potato', 'aloo', 'onion', 'pyaz', 'carrot', 'gajar',
      'cabbage', 'patta gobi', 'cauliflower', 'phool gobi', 'brinjal',
      'eggplant', 'baingan', 'okra', 'bhindi', 'ladies finger', 'spinach',
      'palak', 'beetroot', 'chukandar', 'cucumber', 'kheera', 'pumpkin',
      'kaddu', 'chilli', 'chili', 'mirchi', 'capsicum', 'bell pepper',
      'ginger', 'adrak', 'garlic', 'lehsun', 'radish', 'mooli', 'peas',
      'matar', 'bean', 'lettuce', 'gourd', 'lauki', 'karela', 'bitter',
      'tinda', 'drumstick', 'sweet potato', 'yam', 'shakarkand', 'zucchini',
      'broccoli', 'greens', 'sag', 'saag', 'colocasia', 'arbi', 'plantain',
      'raw banana',
    ],
  },
]

export function categoriseProduce(name: string): ProduceCategory {
  const n = name.toLowerCase()
  for (const { category, keywords } of RULES) {
    if (keywords.some((k) => n.includes(k))) return category
  }
  return 'other'
}

export const CATEGORY_ORDER: ProduceCategory[] = [
  'vegetables', 'fruits', 'grains', 'pulses', 'herbs', 'other',
]

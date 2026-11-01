export type ChoiceQuestion = {
  id: string;
  label: string;
  title: string;
  options: string[];
};

export type PackQuestion = { id: string; text: string; options?: string[] };

export type QuestionPack = {
  id: string;
  title: string;
  subtitle: string;
  type: 'text' | 'choice';
  questions: PackQuestion[];
};

export const STARTER_QUESTIONS: ChoiceQuestion[] = [
  {
    id: 'starter_1',
    label: 'İlişkiniz',
    title: 'İlişkinizi en iyi hangisi anlatır?',
    options: [
      'Maceracı ve spontane',
      'Sakin ve huzurlu',
      'Eğlenceli, kahkaha dolu',
      'Derin ve romantik',
    ],
  },
  {
    id: 'starter_2',
    label: 'Sevgi dili',
    title: 'Sevgini en çok nasıl gösterirsin?',
    options: [
      'Güzel sözlerle',
      'Birlikte vakit geçirerek',
      'Küçük sürprizlerle',
      'Sarılarak, dokunarak',
      'Yardım ederek',
    ],
  },
];

export const PACKS: QuestionPack[] = [
  {
    id: 'deep',
    title: 'Derin Sohbetler',
    subtitle: 'Birbirinizi daha yakından tanıyın',
    type: 'text',
    questions: [
      { id: 'deep_1', text: 'Bana âşık olduğunu ilk ne zaman fark ettin?' },
      { id: 'deep_2', text: 'Birlikte geçirdiğimiz en sevdiğin gün hangisiydi?' },
      { id: 'deep_3', text: 'Benimle ilgili hâlâ merak ettiğin bir şey var mı?' },
      { id: 'deep_4', text: 'Beş yıl sonra bizi nerede hayal ediyorsun?' },
      { id: 'deep_5', text: 'Sana kendini en sevilmiş hissettiren şey ne?' },
      { id: 'deep_6', text: 'Birlikte öğrenmek istediğin bir şey var mı?' },
    ],
  },
  {
    id: 'which',
    title: 'Hangisi?',
    subtitle: 'Hızlı seçimler, eğlenceli sonuçlar',
    type: 'choice',
    questions: [
      { id: 'which_1', text: 'Hafta sonu kaçamağı', options: ['Dağ evi', 'Sahil kasabası'] },
      { id: 'which_2', text: 'Akşam planı', options: ['Evde film', 'Dışarıda yemek'] },
      { id: 'which_3', text: 'Tatil tarzı', options: ['Plansız keşif', 'Her şey planlı'] },
      { id: 'which_4', text: 'Kahvaltı', options: ['Erken ve hafif', 'Geç ve uzun'] },
      { id: 'which_5', text: 'Hediye', options: ['Sürpriz', 'İstediğim şey'] },
      { id: 'which_6', text: 'Tartışmadan sonra', options: ['Hemen konuşalım', 'Biraz zaman'] },
    ],
  },
];

export function findQuestion(qid: string) {
  for (const p of PACKS) {
    const q = p.questions.find(x => x.id === qid);
    if (q) {
      return { pack: p, question: q };
    }
  }
  return null;
}

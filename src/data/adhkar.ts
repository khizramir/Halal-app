import type { DhikrSet } from '../types'

export const ADHKAR_SETS: DhikrSet[] = [
  {
    id: 'morning',
    title: 'Morning Adhkar',
    items: [
      {
        id: 'morning-1',
        arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ',
        transliteration: 'Asbahna wa asbahal mulku lillah, walhamdu lillah',
        translation: 'We have entered the morning and the dominion belongs to Allah, and praise is for Allah.',
        repeat: 1,
      },
      {
        id: 'morning-2',
        arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
        transliteration: 'Subhan Allahi wa bihamdihi',
        translation: 'Glory is to Allah and praise is to Him.',
        repeat: 100,
      },
      {
        id: 'morning-3',
        arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ',
        transliteration: 'Allahumma bika asbahna, wa bika amsayna, wa bika nahya, wa bika namutu wa ilaykan-nushur',
        translation: 'O Allah, by Your leave we have reached the morning and by Your leave we reach the evening, by Your leave we live and die, and unto You is our resurrection.',
        repeat: 1,
      },
    ],
  },
  {
    id: 'evening',
    title: 'Evening Adhkar',
    items: [
      {
        id: 'evening-1',
        arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ',
        transliteration: 'Amsayna wa amsal mulku lillah, walhamdu lillah',
        translation: 'We have entered the evening and the dominion belongs to Allah, and praise is for Allah.',
        repeat: 1,
      },
      {
        id: 'evening-2',
        arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
        transliteration: "A'udhu bikalimatillahi at-tammati min sharri ma khalaq",
        translation: 'I seek refuge in the perfect words of Allah from the evil of what He has created.',
        repeat: 3,
      },
      {
        id: 'evening-3',
        arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ',
        transliteration: "Allahumma inni as'aluka al-'afiyata fid-dunya wal-akhirah",
        translation: 'O Allah, I ask You for well-being in this world and the Hereafter.',
        repeat: 1,
      },
    ],
  },
  {
    id: 'after-prayer',
    title: 'After-Prayer Adhkar',
    items: [
      {
        id: 'prayer-1',
        arabic: 'أَسْتَغْفِرُ اللَّهَ',
        transliteration: 'Astaghfirullah',
        translation: 'I seek forgiveness from Allah.',
        repeat: 3,
      },
      {
        id: 'prayer-2',
        arabic: 'سُبْحَانَ اللَّهِ',
        transliteration: 'SubhanAllah',
        translation: 'Glory be to Allah.',
        repeat: 33,
      },
      {
        id: 'prayer-3',
        arabic: 'الْحَمْدُ لِلَّهِ',
        transliteration: 'Alhamdulillah',
        translation: 'All praise is due to Allah.',
        repeat: 33,
      },
      {
        id: 'prayer-4',
        arabic: 'اللَّهُ أَكْبَرُ',
        transliteration: 'Allahu Akbar',
        translation: 'Allah is the Greatest.',
        repeat: 34,
      },
    ],
  },
]

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Listing, User, Report } from './types';

export const mockUsers: Record<string, User> = {
  'user-1': {
    id: 'user-1',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    phone: '+1 (555) 019-2834',
    accountType: 'personal',
    verificationStatus: 'verified',
    trustScore: 94,
    createdAt: '2026-01-15T08:30:00Z'
  },
  'user-2': {
    id: 'user-2',
    name: 'Al-Noor Investments',
    email: 'info@alnoor-inv.com',
    phone: '+971 4 555 9832',
    accountType: 'business',
    verificationStatus: 'verified',
    trustScore: 98,
    createdAt: '2025-11-02T11:45:00Z'
  },
  'user-3': {
    id: 'user-3',
    name: 'Moustafa El-Sayed',
    email: 'moustafa.sayed@gmail.com',
    phone: '+20 100 234 5678',
    accountType: 'personal',
    verificationStatus: 'pending',
    trustScore: 75,
    createdAt: '2026-05-10T14:20:00Z'
  },
  'user-4': {
    id: 'user-4',
    name: 'Global Tech Recruiting',
    email: 'careers@globaltech.io',
    phone: '+1 (415) 555-0142',
    accountType: 'business',
    verificationStatus: 'verified',
    trustScore: 90,
    createdAt: '2026-02-28T09:00:00Z'
  },
  'user-5': {
    id: 'user-5',
    name: 'John Doe (Admin)',
    email: 'mohdussain79@gmail.com', // user's email matching metadata for premium feel
    phone: '+1 (555) 777-8888',
    accountType: 'personal',
    verificationStatus: 'verified',
    trustScore: 100,
    createdAt: '2025-01-01T00:00:00Z'
  }
};

export const initialListings: Listing[] = [
  {
    id: 'list-1',
    title: '2024 Porsche 911 Carrera S - Mint Condition',
    description: 'Selling a pristine 2024 Porsche 911 Carrera S with only 4,500 miles. Crayon grey exterior, black leather interior, carbon fiber packages, sport chrono, and premium Bose sound system. Fully serviced at authorized Porsche dealers. Always garaged and ceramic coated. Looking for serious buyers.',
    category: 'vehicles',
    location: 'Dubai, UAE',
    price: 135000,
    images: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=800'
    ],
    contactOptions: {
      phone: '+971 50 123 4567',
      email: 'sarah.j@example.com',
      whatsapp: '+971501234567'
    },
    ownerId: 'user-1',
    isPremium: true,
    status: 'active',
    aiTags: ['porsche', 'sports car', 'luxury car', '911', 'carrera', 'dubai cars'],
    originalLanguage: 'en',
    translations: {
      ar: {
        title: 'بورش ٩١١ كاريرا إس ٢٠٢٤ - حالة ممتازة',
        description: 'للبيع بورش ٩١١ كاريرا إس ٢٠٢٤ بحالة ممتازة، قطعت ٤,٥٠٠ ميل فقط. لون رمادي كرايون خارجي، جلد أسود داخلي، باقة ألياف الكربون، نظام سبورت كرونو، ونظام صوتي بوز فاخر. صيانة كاملة لدى الوكيل المعتمد بورش. مخزنة دائماً بالمرآب ومحمية بطبقة سيراميك. للمشترين الجادين فقط.'
      }
    },
    viewsCount: 342,
    createdAt: '2026-06-25T10:00:00Z',
    updatedAt: '2026-06-25T10:00:00Z'
  },
  {
    id: 'list-2',
    title: 'Premium Sea-View Villa in Palm Jumeirah',
    description: 'Stunning 5-bedroom luxury villa on the Palm Jumeirah Fronds. High ceiling, private beach access, infinity pool, smart home automation, and panoramic views of the Dubai Marina skyline. Fully furnished with high-end designer Italian furniture. Perfect investment or family residence.',
    category: 'real-estate',
    location: 'Dubai, Palm Jumeirah',
    price: 8900000,
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800'
    ],
    contactOptions: {
      phone: '+971 4 555 9832',
      email: 'info@alnoor-inv.com',
      whatsapp: '+97145559832'
    },
    ownerId: 'user-2',
    isPremium: true,
    status: 'active',
    aiTags: ['palm jumeirah', 'luxury villa', 'dubai real estate', 'beachfront property', '5 bedroom'],
    originalLanguage: 'en',
    translations: {
      ar: {
        title: 'فيلا فاخرة مطلة على البحر في نخلة جميرا',
        description: 'فيلا مذهلة تحتوي على ٥ غرف نوم فاخرة في نخلة جميرا. سقف مرتفع، مدخل خاص للشاطئ، مسبح لامتناهي، نظام أتمتة للمنزل الذكي، وإطلالات بانورامية على أفق دبي مارينا. مؤثثة بالكامل بأثاث إيطالي فاخر من تصميم مصممين عالميين. فرصة استثمارية مثالية أو سكن عائلي راقٍ.'
      }
    },
    viewsCount: 1250,
    createdAt: '2026-06-01T12:00:00Z',
    updatedAt: '2026-06-15T15:30:00Z'
  },
  {
    id: 'list-3',
    title: 'Senior Full-Stack Developer (MERN / Next.js)',
    description: 'We are seeking a highly skilled Senior Full Stack Developer to lead our core marketplace team. Required: 5+ years experience with React, Next.js, Node.js, Express, and cloud databases (Firestore / PostgreSQL). Experience in AI APIs is highly appreciated. Remote position with attractive salary and stock options.',
    category: 'jobs',
    location: 'Riyadh, Saudi Arabia (Remote)',
    price: 7500, // Monthly salary in USD
    images: [
      'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=1200'
    ],
    contactOptions: {
      phone: '+1 (415) 555-0142',
      email: 'careers@globaltech.io',
      whatsapp: '+14155550142'
    },
    ownerId: 'user-4',
    isPremium: false,
    status: 'active',
    aiTags: ['remote job', 'developer', 'react', 'next.js', 'saudi tech jobs', 'full stack'],
    originalLanguage: 'en',
    translations: {
      ar: {
        title: 'مطور برمجيات أول للواجهات والخلفيات (MERN / Next.js)',
        description: 'نبحث عن مطور برمجيات أول ذو مهارات عالية لقيادة فريق تطوير السوق الأساسي لدينا. المتطلبات: خبرة تزيد عن ٥ سنوات في العمل مع React و Next.js و Node.js و Express وقواعد البيانات السحابية (Firestore / PostgreSQL). نثمن عالياً الخبرة في التعامل مع واجهات الذكاء الاصطناعي. وظيفة عن بعد براتب مجزٍ وخيارات أسهم.'
      }
    },
    viewsCount: 512,
    createdAt: '2026-07-01T09:15:00Z',
    updatedAt: '2026-07-01T09:15:00Z'
  },
  {
    id: 'list-4',
    title: 'فرصة للاستثمار في مصنع تمور آلي بالكامل',
    description: 'نعرض فرصة استثمارية مميزة للمشاركة أو الاستحواذ على مصنع تعبئة وتغليف تمور قائم وآلي بالكامل في منطقة القصيم بالمملكة العربية السعودية. المصنع مجهز بأحدث خطوط الإنتاج الألمانية، ولديه عقود توريد محلية ودولية قائمة. تبلغ الطاقة الإنتاجية السنوية ١,٥٠٠ طن. يرجى التواصل للشركاء الجادين والشركات الاستثمارية للاطلاع على دراسة الجدوى والبيانات المالية المعمدة.',
    category: 'investment-opportunities',
    location: 'Al-Qassim, Saudi Arabia',
    price: 450000,
    images: [
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=1200'
    ],
    contactOptions: {
      phone: '+966 55 987 6543',
      email: 'moustafa.sayed@gmail.com',
      whatsapp: '+966559876543'
    },
    ownerId: 'user-3',
    isPremium: false,
    status: 'active',
    aiTags: ['القصيم', 'استثمار', 'مصنع تمور', 'السعودية', 'فرص تجارية', 'إنتاج زراعي'],
    originalLanguage: 'ar',
    translations: {
      en: {
        title: 'Investment Opportunity in Fully Automated Date Factory',
        description: 'We present a unique investment opportunity for partnership or acquisition of an existing fully automated date packaging factory in Al-Qassim region, Saudi Arabia. The factory is equipped with state-of-the-art German production lines, with established domestic and international supply contracts. Annual production capacity is 1,500 tons. Serious partners and investment firms are invited to review the feasibility study and certified financial audits.'
      }
    },
    viewsCount: 189,
    createdAt: '2026-07-03T16:00:00Z',
    updatedAt: '2026-07-03T16:00:00Z'
  },
  {
    id: 'list-5',
    title: 'iPhone 15 Pro Max - 256GB Natural Titanium',
    description: 'Selling my iPhone 15 Pro Max 256GB in Natural Titanium. Battery health is 98%, completely free of scratches or dents. Comes with original box, unused USB-C cable, and 3 premium cases. Under AppleCare warranty until December 2026. Price is non-negotiable.',
    category: 'electronics',
    location: 'Riyadh, Saudi Arabia',
    price: 900,
    images: [
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=1200'
    ],
    contactOptions: {
      phone: '+966 55 987 6543',
      email: 'moustafa.sayed@gmail.com',
      whatsapp: '+966559876543'
    },
    ownerId: 'user-3',
    isPremium: false,
    status: 'active',
    aiTags: ['iphone 15 pro max', 'apple', 'mobile phone', 'riyadh mobile', 'electronics'],
    originalLanguage: 'en',
    translations: {
      ar: {
        title: 'آيفون ١٥ برو ماكس - ٢٥٦ جيجابايت تيتانيوم طبيعي',
        description: 'أبيع هاتف آيفون ١٥ برو ماكس ٢٥٦ جيجابايت باللون التيتانيوم الطبيعي. صحة البطارية ٩٨٪، خالٍ تماماً من الخدوش أو الصدمات. يأتي مع الصندوق الأصلي وكابل USB-C غير مستخدم و٣ أغطية فاخرة. الهاتف تحت ضمان آبل كير حتى ديسمبر ٢٠٢٦. السعر غير قابل للتفاوض.'
      }
    },
    viewsCount: 94,
    createdAt: '2026-07-05T12:00:00Z',
    updatedAt: '2026-07-05T12:00:00Z'
  },
  {
    id: 'list-6',
    title: 'Suspicious Cheap Rolex Daytona Watch',
    description: 'Brand new Rolex Daytona gold watch, fully authentic with papers, only selling because I need quick cash! Price is only $150. Immediate shipping worldwide. Do not ask questions, just transfer money via wire transfer first.',
    category: 'electronics',
    location: 'New York, USA',
    price: 150, // Suspect! Rolex Daytona for $150
    images: [
      'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=1200'
    ],
    contactOptions: {
      phone: '+1 (555) 999-1111',
      email: 'spammer@scampool.com',
      whatsapp: '+15559991111'
    },
    ownerId: 'user-4',
    isPremium: false,
    status: 'active', // Will be reported and flaggable as fraud
    aiTags: ['rolex', 'gold watch', 'cheap deal'],
    originalLanguage: 'en',
    translations: {
      ar: {
        title: 'ساعة رولكس دايتونا رخيصة مشبوهة',
        description: 'ساعة رولكس دايتونا ذهبية جديدة تماماً، أصلية بالكامل مع الأوراق، أبيعها فقط لأنني بحاجة إلى نقد سريع! السعر ١٥٠ دولاراً فقط. شحن فوري لجميع أنحاء العالم. لا تطرح أسئلة، فقط قم بتحويل الأموال عبر التحويل البرقي أولاً.'
      }
    },
    viewsCount: 15,
    createdAt: '2026-07-07T10:00:00Z',
    updatedAt: '2026-07-07T10:00:00Z'
  }
];

export const initialReports: Report[] = [
  {
    id: 'rep-1',
    listingId: 'list-6',
    reporterId: 'user-1',
    reason: 'Suspicious listing: Selling a authentic Gold Rolex Daytona for $150. Wire transfer payment request is an obvious phishing fraud scam.',
    status: 'pending',
    createdAt: '2026-07-07T18:30:00Z'
  }
];

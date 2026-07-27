export interface CountryOption {
  code: string;
  flag: string;
  labelEn: string;
  labelAr: string;
}

export const COUNTRY_OPTIONS: CountryOption[] = [
  { code: 'AF', flag: '🇦🇫', labelEn: 'Afghanistan', labelAr: 'أفغانستان' },
  { code: 'AL', flag: '🇦🇱', labelEn: 'Albania', labelAr: 'ألبانيا' },
  { code: 'DZ', flag: '🇩🇿', labelEn: 'Algeria', labelAr: 'الجزائر' },
  { code: 'AD', flag: '🇦🇩', labelEn: 'Andorra', labelAr: 'أندورا' },
  { code: 'AO', flag: '🇦🇴', labelEn: 'Angola', labelAr: 'أنغولا' },
  { code: 'AG', flag: '🇦🇬', labelEn: 'Antigua and Barbuda', labelAr: 'أنتيغوا وبربودا' },
  { code: 'AR', flag: '🇦🇷', labelEn: 'Argentina', labelAr: 'الأرجنتين' },
  { code: 'AM', flag: '🇦🇲', labelEn: 'Armenia', labelAr: 'أرمينيا' },
  { code: 'AU', flag: '🇦🇺', labelEn: 'Australia', labelAr: 'أستراليا' },
  { code: 'AT', flag: '🇦🇹', labelEn: 'Austria', labelAr: 'النمسا' },
  { code: 'AZ', flag: '🇦🇿', labelEn: 'Azerbaijan', labelAr: 'أذربيجان' },
  { code: 'BS', flag: '🇧🇸', labelEn: 'Bahamas', labelAr: 'البهاما' },
  { code: 'BH', flag: '🇧🇭', labelEn: 'Bahrain', labelAr: 'البحرين' },
  { code: 'BD', flag: '🇧🇩', labelEn: 'Bangladesh', labelAr: 'بنغلاديش' },
  { code: 'BB', flag: '🇧🇧', labelEn: 'Barbados', labelAr: 'بربادوس' },
  { code: 'BY', flag: '🇧🇾', labelEn: 'Belarus', labelAr: 'بيلاروسيا' },
  { code: 'BE', flag: '🇧🇪', labelEn: 'Belgium', labelAr: 'بلجيكا' },
  { code: 'BZ', flag: '🇧🇿', labelEn: 'Belize', labelAr: 'بليز' },
  { code: 'BJ', flag: '🇧🇯', labelEn: 'Benin', labelAr: 'بنين' },
  { code: 'BT', flag: '🇧🇹', labelEn: 'Bhutan', labelAr: 'بوتان' },
  { code: 'BO', flag: '🇧🇴', labelEn: 'Bolivia', labelAr: 'بوليفيا' },
  { code: 'BA', flag: '🇧🇦', labelEn: 'Bosnia and Herzegovina', labelAr: 'البوسنة والهرسك' },
  { code: 'BW', flag: '🇧🇼', labelEn: 'Botswana', labelAr: 'بوتسوانا' },
  { code: 'BR', flag: '🇧🇷', labelEn: 'Brazil', labelAr: 'البرازيل' },
  { code: 'BN', flag: '🇧🇳', labelEn: 'Brunei', labelAr: 'بروناي' },
  { code: 'BG', flag: '🇧🇬', labelEn: 'Bulgaria', labelAr: 'بلغاريا' },
  { code: 'BF', flag: '🇧🇫', labelEn: 'Burkina Faso', labelAr: 'بوركينا فاسو' },
  { code: 'BI', flag: '🇧🇮', labelEn: 'Burundi', labelAr: 'بوروندي' },
  { code: 'CV', flag: '🇨🇻', labelEn: 'Cabo Verde', labelAr: 'الرأس الأخضر' },
  { code: 'KH', flag: '🇰🇭', labelEn: 'Cambodia', labelAr: 'كمبوديا' },
  { code: 'CM', flag: '🇨🇲', labelEn: 'Cameroon', labelAr: 'الكاميرون' },
  { code: 'CA', flag: '🇨🇦', labelEn: 'Canada', labelAr: 'كندا' },
  { code: 'CF', flag: '🇨🇫', labelEn: 'Central African Republic', labelAr: 'جمهورية أفريقيا الوسطى' },
  { code: 'TD', flag: '🇹🇩', labelEn: 'Chad', labelAr: 'تشاد' },
  { code: 'CL', flag: '🇨🇱', labelEn: 'Chile', labelAr: 'تشيلي' },
  { code: 'CN', flag: '🇨🇳', labelEn: 'China', labelAr: 'الصين' },
  { code: 'CO', flag: '🇨🇴', labelEn: 'Colombia', labelAr: 'كولومبيا' },
  { code: 'KM', flag: '🇰🇲', labelEn: 'Comoros', labelAr: 'جزر القمر' },
  { code: 'CG', flag: '🇨🇬', labelEn: 'Congo', labelAr: 'الكونغو' },
  { code: 'CD', flag: '🇨🇩', labelEn: 'Congo (DRC)', labelAr: 'جمهورية الكونغو الديمقراطية' },
  { code: 'CR', flag: '🇨🇷', labelEn: 'Costa Rica', labelAr: 'كوستاريكا' },
  { code: 'CI', flag: '🇨🇮', labelEn: 'Côte d\'Ivoire', labelAr: 'ساحل العاج' },
  { code: 'HR', flag: '🇭🇷', labelEn: 'Croatia', labelAr: 'كرواتيا' },
  { code: 'CU', flag: '🇨🇺', labelEn: 'Cuba', labelAr: 'كوبا' },
  { code: 'CY', flag: '🇨🇾', labelEn: 'Cyprus', labelAr: 'قبرص' },
  { code: 'CZ', flag: '🇨🇿', labelEn: 'Czechia', labelAr: 'التشيك' },
  { code: 'DK', flag: '🇩🇰', labelEn: 'Denmark', labelAr: 'الدنمارك' },
  { code: 'DJ', flag: '🇩🇯', labelEn: 'Djibouti', labelAr: 'جيبوتي' },
  { code: 'DM', flag: '🇩🇲', labelEn: 'Dominica', labelAr: 'دومينيكا' },
  { code: 'DO', flag: '🇩🇴', labelEn: 'Dominican Republic', labelAr: 'الجمهورية الدومينيكية' },
  { code: 'EC', flag: '🇪🇨', labelEn: 'Ecuador', labelAr: 'الإكوادور' },
  { code: 'EG', flag: '🇪🇬', labelEn: 'Egypt', labelAr: 'مصر' },
  { code: 'SV', flag: '🇸🇻', labelEn: 'El Salvador', labelAr: 'السلفادور' },
  { code: 'GQ', flag: '🇬🇶', labelEn: 'Equatorial Guinea', labelAr: 'غينيا الاستوائية' },
  { code: 'ER', flag: '🇪🇷', labelEn: 'Eritrea', labelAr: 'إريتريا' },
  { code: 'EE', flag: '🇪🇪', labelEn: 'Estonia', labelAr: 'إستونيا' },
  { code: 'SZ', flag: '🇸🇿', labelEn: 'Eswatini', labelAr: 'إسواتيني' },
  { code: 'ET', flag: '🇪🇹', labelEn: 'Ethiopia', labelAr: 'إثيوبيا' },
  { code: 'FJ', flag: '🇫🇯', labelEn: 'Fiji', labelAr: 'فيجي' },
  { code: 'FI', flag: '🇫🇮', labelEn: 'Finland', labelAr: 'فنلندا' },
  { code: 'FR', flag: '🇫🇷', labelEn: 'France', labelAr: 'فرنسا' },
  { code: 'GA', flag: '🇬🇦', labelEn: 'Gabon', labelAr: 'الغابون' },
  { code: 'GM', flag: '🇬🇲', labelEn: 'Gambia', labelAr: 'غامبيا' },
  { code: 'GE', flag: '🇬🇪', labelEn: 'Georgia', labelAr: 'جورجيا' },
  { code: 'DE', flag: '🇩🇪', labelEn: 'Germany', labelAr: 'ألمانيا' },
  { code: 'GH', flag: '🇬🇭', labelEn: 'Ghana', labelAr: 'غانا' },
  { code: 'GR', flag: '🇬🇷', labelEn: 'Greece', labelAr: 'اليونان' },
  { code: 'GD', flag: '🇬🇩', labelEn: 'Grenada', labelAr: 'غرينادا' },
  { code: 'GT', flag: '🇬🇹', labelEn: 'Guatemala', labelAr: 'غواتيمالا' },
  { code: 'GN', flag: '🇬🇳', labelEn: 'Guinea', labelAr: 'غينيا' },
  { code: 'GW', flag: '🇬🇼', labelEn: 'Guinea-Bissau', labelAr: 'غينيا بيساو' },
  { code: 'GY', flag: '🇬🇾', labelEn: 'Guyana', labelAr: 'غيانا' },
  { code: 'HT', flag: '🇭🇹', labelEn: 'Haiti', labelAr: 'هايتي' },
  { code: 'HN', flag: '🇭🇳', labelEn: 'Honduras', labelAr: 'هندوراس' },
  { code: 'HU', flag: '🇭🇺', labelEn: 'Hungary', labelAr: 'المجر' },
  { code: 'IS', flag: '🇮🇸', labelEn: 'Iceland', labelAr: 'آيسلندا' },
  { code: 'IN', flag: '🇮🇳', labelEn: 'India', labelAr: 'الهند' },
  { code: 'ID', flag: '🇮🇩', labelEn: 'Indonesia', labelAr: 'إندونيسيا' },
  { code: 'IR', flag: '🇮🇷', labelEn: 'Iran', labelAr: 'إيران' },
  { code: 'IQ', flag: '🇮🇶', labelEn: 'Iraq', labelAr: 'العراق' },
  { code: 'IE', flag: '🇮🇪', labelEn: 'Ireland', labelAr: 'أيرلندا' },
  { code: 'IT', flag: '🇮🇹', labelEn: 'Italy', labelAr: 'إيطاليا' },
  { code: 'JM', flag: '🇯🇲', labelEn: 'Jamaica', labelAr: 'جامايكا' },
  { code: 'JP', flag: '🇯🇵', labelEn: 'Japan', labelAr: 'اليابان' },
  { code: 'JO', flag: '🇯🇴', labelEn: 'Jordan', labelAr: 'الأردن' },
  { code: 'KZ', flag: '🇰🇿', labelEn: 'Kazakhstan', labelAr: 'كازاخستان' },
  { code: 'KE', flag: '🇰🇪', labelEn: 'Kenya', labelAr: 'كينيا' },
  { code: 'KI', flag: '🇰🇮', labelEn: 'Kiribati', labelAr: 'كيريباتي' },
  { code: 'KW', flag: '🇰🇼', labelEn: 'Kuwait', labelAr: 'الكويت' },
  { code: 'KG', flag: '🇰🇬', labelEn: 'Kyrgyzstan', labelAr: 'قيرغيزستان' },
  { code: 'LA', flag: '🇱🇦', labelEn: 'Laos', labelAr: 'لاوس' },
  { code: 'LV', flag: '🇱🇻', labelEn: 'Latvia', labelAr: 'لاتفيا' },
  { code: 'LB', flag: '🇱🇧', labelEn: 'Lebanon', labelAr: 'لبنان' },
  { code: 'LS', flag: '🇱🇸', labelEn: 'Lesotho', labelAr: 'ليسوتو' },
  { code: 'LR', flag: '🇱🇷', labelEn: 'Liberia', labelAr: 'ليبيريا' },
  { code: 'LY', flag: '🇱🇾', labelEn: 'Libya', labelAr: 'ليبيا' },
  { code: 'LI', flag: '🇱🇮', labelEn: 'Liechtenstein', labelAr: 'ليختنشتاين' },
  { code: 'LT', flag: '🇱🇹', labelEn: 'Lithuania', labelAr: 'ليتوانيا' },
  { code: 'LU', flag: '🇱🇺', labelEn: 'Luxembourg', labelAr: 'لوكسمبورغ' },
  { code: 'MG', flag: '🇲🇬', labelEn: 'Madagascar', labelAr: 'مدغشقر' },
  { code: 'MW', flag: '🇲🇼', labelEn: 'Malawi', labelAr: 'ملاوي' },
  { code: 'MY', flag: '🇲🇾', labelEn: 'Malaysia', labelAr: 'ماليزيا' },
  { code: 'MV', flag: '🇲🇻', labelEn: 'Maldives', labelAr: 'المالديف' },
  { code: 'ML', flag: '🇲🇱', labelEn: 'Mali', labelAr: 'مالي' },
  { code: 'MT', flag: '🇲🇹', labelEn: 'Malta', labelAr: 'مالطا' },
  { code: 'MH', flag: '🇲🇭', labelEn: 'Marshall Islands', labelAr: 'جزر مارشال' },
  { code: 'MR', flag: '🇲🇷', labelEn: 'Mauritania', labelAr: 'موريتانيا' },
  { code: 'MU', flag: '🇲🇺', labelEn: 'Mauritius', labelAr: 'موريشيوس' },
  { code: 'MX', flag: '🇲🇽', labelEn: 'Mexico', labelAr: 'المكسيك' },
  { code: 'FM', flag: '🇫🇲', labelEn: 'Micronesia', labelAr: 'ميكرونيزيا' },
  { code: 'MD', flag: '🇲🇩', labelEn: 'Moldova', labelAr: 'مولدوفا' },
  { code: 'MC', flag: '🇲🇨', labelEn: 'Monaco', labelAr: 'موناكو' },
  { code: 'MN', flag: '🇲🇳', labelEn: 'Mongolia', labelAr: 'منغوليا' },
  { code: 'ME', flag: '🇲🇪', labelEn: 'Montenegro', labelAr: 'الجبل الأسود' },
  { code: 'MA', flag: '🇲🇦', labelEn: 'Morocco', labelAr: 'المغرب' },
  { code: 'MZ', flag: '🇲🇿', labelEn: 'Mozambique', labelAr: 'موزمبيق' },
  { code: 'MM', flag: '🇲🇲', labelEn: 'Myanmar', labelAr: 'ميانمار' },
  { code: 'NA', flag: '🇳🇦', labelEn: 'Namibia', labelAr: 'ناميبيا' },
  { code: 'NR', flag: '🇳🇷', labelEn: 'Nauru', labelAr: 'ناورو' },
  { code: 'NP', flag: '🇳🇵', labelEn: 'Nepal', labelAr: 'نيبال' },
  { code: 'NL', flag: '🇳🇱', labelEn: 'Netherlands', labelAr: 'هولندا' },
  { code: 'NZ', flag: '🇳🇿', labelEn: 'New Zealand', labelAr: 'نيوزيلندا' },
  { code: 'NI', flag: '🇳🇮', labelEn: 'Nicaragua', labelAr: 'نيكاراغوا' },
  { code: 'NE', flag: '🇳🇪', labelEn: 'Niger', labelAr: 'النيجر' },
  { code: 'NG', flag: '🇳🇬', labelEn: 'Nigeria', labelAr: 'نيجيريا' },
  { code: 'KP', flag: '🇰🇵', labelEn: 'North Korea', labelAr: 'كوريا الشمالية' },
  { code: 'MK', flag: '🇲🇰', labelEn: 'North Macedonia', labelAr: 'شمال مقدونيا' },
  { code: 'NO', flag: '🇳🇴', labelEn: 'Norway', labelAr: 'النرويج' },
  { code: 'OM', flag: '🇴🇲', labelEn: 'Oman', labelAr: 'عُمان' },
  { code: 'PK', flag: '🇵🇰', labelEn: 'Pakistan', labelAr: 'باكستان' },
  { code: 'PW', flag: '🇵🇼', labelEn: 'Palau', labelAr: 'بالاو' },
  { code: 'PA', flag: '🇵🇦', labelEn: 'Panama', labelAr: 'بنما' },
  { code: 'PG', flag: '🇵🇬', labelEn: 'Papua New Guinea', labelAr: 'بابوا غينيا الجديدة' },
  { code: 'PY', flag: '🇵🇾', labelEn: 'Paraguay', labelAr: 'باراغواي' },
  { code: 'PE', flag: '🇵🇪', labelEn: 'Peru', labelAr: 'بيرو' },
  { code: 'PH', flag: '🇵🇭', labelEn: 'Philippines', labelAr: 'الفلبين' },
  { code: 'PL', flag: '🇵🇱', labelEn: 'Poland', labelAr: 'بولندا' },
  { code: 'PT', flag: '🇵🇹', labelEn: 'Portugal', labelAr: 'البرتغال' },
  { code: 'QA', flag: '🇶🇦', labelEn: 'Qatar', labelAr: 'قطر' },
  { code: 'RO', flag: '🇷🇴', labelEn: 'Romania', labelAr: 'رومانيا' },
  { code: 'RU', flag: '🇷🇺', labelEn: 'Russia', labelAr: 'روسيا' },
  { code: 'RW', flag: '🇷🇼', labelEn: 'Rwanda', labelAr: 'رواندا' },
  { code: 'KN', flag: '🇰🇳', labelEn: 'Saint Kitts and Nevis', labelAr: 'سانت كيتس ونيفيس' },
  { code: 'LC', flag: '🇱🇨', labelEn: 'Saint Lucia', labelAr: 'سانت لوسيا' },
  { code: 'VC', flag: '🇻🇨', labelEn: 'Saint Vincent and the Grenadines', labelAr: 'سانت فنسنت والغرينادين' },
  { code: 'WS', flag: '🇼🇸', labelEn: 'Samoa', labelAr: 'ساموا' },
  { code: 'SM', flag: '🇸🇲', labelEn: 'San Marino', labelAr: 'سان مارينو' },
  { code: 'ST', flag: '🇸🇹', labelEn: 'Sao Tome and Principe', labelAr: 'ساو تومي وبرينسيبي' },
  { code: 'SA', flag: '🇸🇦', labelEn: 'Saudi Arabia', labelAr: 'المملكة العربية السعودية' },
  { code: 'SN', flag: '🇸🇳', labelEn: 'Senegal', labelAr: 'السنغال' },
  { code: 'RS', flag: '🇷🇸', labelEn: 'Serbia', labelAr: 'صربيا' },
  { code: 'SC', flag: '🇸🇨', labelEn: 'Seychelles', labelAr: 'سيشل' },
  { code: 'SL', flag: '🇸🇱', labelEn: 'Sierra Leone', labelAr: 'سيراليون' },
  { code: 'SG', flag: '🇸🇬', labelEn: 'Singapore', labelAr: 'سنغافورة' },
  { code: 'SK', flag: '🇸🇰', labelEn: 'Slovakia', labelAr: 'سلوفاكيا' },
  { code: 'SI', flag: '🇸🇮', labelEn: 'Slovenia', labelAr: 'سلوفينيا' },
  { code: 'SB', flag: '🇸🇧', labelEn: 'Solomon Islands', labelAr: 'جزر سليمان' },
  { code: 'SO', flag: '🇸🇴', labelEn: 'Somalia', labelAr: 'الصومال' },
  { code: 'ZA', flag: '🇿🇦', labelEn: 'South Africa', labelAr: 'جنوب أفريقيا' },
  { code: 'KR', flag: '🇰🇷', labelEn: 'South Korea', labelAr: 'كوريا الجنوبية' },
  { code: 'SS', flag: '🇸🇸', labelEn: 'South Sudan', labelAr: 'جنوب السودان' },
  { code: 'ES', flag: '🇪🇸', labelEn: 'Spain', labelAr: 'إسبانيا' },
  { code: 'LK', flag: '🇱🇰', labelEn: 'Sri Lanka', labelAr: 'سريلانكا' },
  { code: 'SD', flag: '🇸🇩', labelEn: 'Sudan', labelAr: 'السودان' },
  { code: 'SR', flag: '🇸🇷', labelEn: 'Suriname', labelAr: 'سورينام' },
  { code: 'SE', flag: '🇸🇪', labelEn: 'Sweden', labelAr: 'السويد' },
  { code: 'CH', flag: '🇨🇭', labelEn: 'Switzerland', labelAr: 'سويسرا' },
  { code: 'SY', flag: '🇸🇾', labelEn: 'Syria', labelAr: 'سوريا' },
  { code: 'TJ', flag: '🇹🇯', labelEn: 'Tajikistan', labelAr: 'طاجيكستان' },
  { code: 'TZ', flag: '🇹🇿', labelEn: 'Tanzania', labelAr: 'تنزانيا' },
  { code: 'TH', flag: '🇹🇭', labelEn: 'Thailand', labelAr: 'تايلاند' },
  { code: 'TL', flag: '🇹🇱', labelEn: 'Timor-Leste', labelAr: 'تيمور الشرقية' },
  { code: 'TG', flag: '🇹🇬', labelEn: 'Togo', labelAr: 'توغو' },
  { code: 'TO', flag: '🇹🇴', labelEn: 'Tonga', labelAr: 'تونغا' },
  { code: 'TT', flag: '🇹🇹', labelEn: 'Trinidad and Tobago', labelAr: 'ترينيداد وتوباغو' },
  { code: 'TN', flag: '🇹🇳', labelEn: 'Tunisia', labelAr: 'تونس' },
  { code: 'TR', flag: '🇹🇷', labelEn: 'Turkey', labelAr: 'تركيا' },
  { code: 'TM', flag: '🇹🇲', labelEn: 'Turkmenistan', labelAr: 'تركمانستان' },
  { code: 'TV', flag: '🇹🇻', labelEn: 'Tuvalu', labelAr: 'توفالو' },
  { code: 'UG', flag: '🇺🇬', labelEn: 'Uganda', labelAr: 'أوغندا' },
  { code: 'UA', flag: '🇺🇦', labelEn: 'Ukraine', labelAr: 'أوكرانيا' },
  { code: 'AE', flag: '🇦🇪', labelEn: 'United Arab Emirates', labelAr: 'الإمارات العربية المتحدة' },
  { code: 'GB', flag: '🇬🇧', labelEn: 'United Kingdom', labelAr: 'المملكة المتحدة' },
  { code: 'US', flag: '🇺🇸', labelEn: 'United States', labelAr: 'الولايات المتحدة' },
  { code: 'UY', flag: '🇺🇾', labelEn: 'Uruguay', labelAr: 'أوروغواي' },
  { code: 'UZ', flag: '🇺🇿', labelEn: 'Uzbekistan', labelAr: 'أوزبكستان' },
  { code: 'VU', flag: '🇻🇺', labelEn: 'Vanuatu', labelAr: 'فانواتو' },
  { code: 'VA', flag: '🇻🇦', labelEn: 'Vatican City', labelAr: 'الفاتيكان' },
  { code: 'VE', flag: '🇻🇪', labelEn: 'Venezuela', labelAr: 'فنزويلا' },
  { code: 'VN', flag: '🇻🇳', labelEn: 'Vietnam', labelAr: 'فيتنام' },
  { code: 'YE', flag: '🇾🇪', labelEn: 'Yemen', labelAr: 'اليمن' },
  { code: 'ZM', flag: '🇿🇲', labelEn: 'Zambia', labelAr: 'زامبيا' },
  { code: 'ZW', flag: '🇿🇼', labelEn: 'Zimbabwe', labelAr: 'زيمبابوي' }
];

const normalize = (value: string) => value.toLowerCase().trim();

const COUNTRY_ALIASES: Record<string, string[]> = {
  ae: ['uae', 'dubai', 'abu dhabi', 'sharjah', 'ajman', 'ras al khaimah', 'fujairah', 'umm al quwain'],
  eg: ['egypt', 'cairo', 'alexandria', 'giza', 'luxor', 'aswan'],
  sa: ['saudi arabia', 'riyadh', 'jeddah', 'mecca', 'medina', 'dammam'],
  gb: ['uk', 'united kingdom', 'england', 'london', 'manchester', 'birmingham'],
  us: ['usa', 'united states', 'america', 'new york', 'los angeles', 'chicago'],
  fr: ['france', 'paris', 'lyon', 'marseille'],
  de: ['germany', 'berlin', 'munich', 'hamburg'],
  it: ['italy', 'rome', 'milan', 'florence'],
  es: ['spain', 'madrid', 'barcelona', 'valencia'],
  tr: ['turkey', 'istanbul', 'ankara', 'izmir']
};

export const getCountryMatches = (value: string) => {
  const normalized = normalize(value);
  if (!normalized) return [];

  return COUNTRY_OPTIONS.filter((country) => {
    const english = normalize(country.labelEn);
    const arabic = normalize(country.labelAr);
    const code = normalize(country.code);
    return english.includes(normalized) || arabic.includes(normalized) || code.includes(normalized);
  });
};

export const matchesCountryFilter = (text: string, filter: string) => {
  if (!filter) return true;
  const normalizedFilter = normalize(filter);
  if (!normalizedFilter) return true;

  const haystack = normalize(text);
  const countryMatch = getCountryMatches(normalizedFilter);

  if (countryMatch.length === 0) {
    return haystack.includes(normalizedFilter);
  }

  return countryMatch.some((country) => {
    const english = normalize(country.labelEn);
    const arabic = normalize(country.labelAr);
    const code = normalize(country.code);
    const aliases = COUNTRY_ALIASES[code] || [];
    const lookupTerms = [english, arabic, code, ...aliases.map(normalize)];
    return lookupTerms.some((term) => haystack.includes(term));
  });
};

# हार्डवेयर काम नहीं कर रहा — दूसरे options

Boom barrier, RFID reader, ANPR camera, loop detector, या ticket dispenser अटक जाए / महंगा पड़े / install delayed हो, तो operation बंद रखने की जरूरत नहीं। नीचे के options सिर्फ software + फोन से चलते हैं।

## 1. Phone / tablet desk (अभी का ऐप) — सबसे तेज़

गेट पर एक आदमी। एंट्री पर नंबर डालो, एग्जिट पर रकम लो।

- **फायदा:** आज से चालू, ₹0 कैपेक्स
- **नुकसान:** गेट पर स्टाफ चाहिए
- **किसके लिए:** सोसाइटी, वर्कशॉप, होटल, छोटा मॉल, टोल बूथ

## 2. QR + UPI self-pay

एंट्री पर QR दिखाओ / WhatsApp पर टिकट भेजो। ड्राइवर UPI से पे करता है, स्टाफ सिर्फ चेक करता है।

- **फायदा:** कैश हैंडल कम
- **नुकसान:** नेट और UPI चाहिए
- **बाद में:** thermal printer जोड़ सकते हो, barrier नहीं भी

## 3. WhatsApp / SMS booking

सोसाइटी या ऑफिस विज़िटर पहले से स्लॉट ले। गेट पर लिस्ट देखकर छोड़ो।

- **फायदा:** भीड़ कम, visitor log बन जाता है
- **नुकसान:** walk-in के लिए backup desk चाहिए

## 4. Phone-camera ANPR (software)

फोन से नंबर प्लेट की फोटो → ऐप नंबर पढ़े → टिकट बने। अलग ANPR कैमरा बॉक्स नहीं।

- **फायदा:** टाइपिंग कम
- **नुकसान:** रात/गंदी प्लेट पर miss हो सकता है; पहले desk के साथ backup रखो

## 5. GPS / app check-in (टोल के लिए)

फोन geofence से एंट्री-एग्जिट। हाईवे पर barrier की जगह account से कटौती — Salik-style wallet बाद में।

- **फायदा:** लेन पर मशीन नहीं
- **नुकसान:** ऐप adoption, GPS accuracy, enforcement policy

## 6. Hardware बाद में, software पहले

रेट, शिफ्ट, रिपोर्ट, UPI पहले software में पक्का करो। जब barrier/RFID आए, वही टिकट ID हार्डवेयर से जोड़ देना।

**न नियम:** पहले पैसे और प्रोसेस, मशीन बाद में। उल्टा करने से साइट अटकती है।

## क्या न करें

- Camera + barrier का इंतज़ार करते हुए गेट बंद न रखो
- एक ही वेंडर के proprietary controller पर lock-in
- बिना शिफ्ट रिपोर्ट के नकद कलेक्ट

## SAEPL Desk कहाँ बैठता है

यह repo **Option 1** है, और Option 2/6 की नींव भी: टिकट ID, वाहन क्लास, रेट कार्ड, पेमेंट मेथड, CSV। अगला कदम QR/UPI deep-link या WhatsApp template हो सकता है — हार्डवेयर नहीं।

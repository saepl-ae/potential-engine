# Potential Engine — SAEPL Desk

Hardware (boom barrier, RFID, camera, ticket machine) अगर काम नहीं कर रहा, तो **software desk** से parking और toll चला सकते हो। सिर्फ फोन या टैबलेट चाहिए।

## अभी क्या चलता है

- **Parking desk:** गाड़ी एंट्री → टिकट कोड → एग्जिट पर घंटे के हिसाब से रकम → नकद / UPI / कार्ड
- **Toll desk:** क्लास चुनो, फ्लैट फीस कलेक्ट करो
- **Reports:** आज की शिफ्ट + CSV
- **Setup:** साइट नाम, INR/AED, हिंदी/English, रेट कार्ड
- डेटा फोन पर `localStorage` में रहता है — सर्वर या हार्डवेयर नहीं चाहिए

## हार्डवेयर के बदले options

पूरी सूची: [docs/OPTIONS.md](docs/OPTIONS.md)

| Option | कब यूज़ करें | हार्डवेयर |
| --- | --- | --- |
| 1. Phone desk (यह ऐप) | गेट पर आदमी बैठा है | कोई नहीं |
| 2. QR / UPI ticket | ड्राइवर खुद पे करता है | प्रिंटर optional |
| 3. WhatsApp / SMS slot | सोसाइटी, छोटा लॉट | कोई नहीं |
| 4. Phone camera ANPR | नंबर प्लेट फोटो से | सिर्फ फोन कैमरा |
| 5. GPS / geofence | हाईवे टोल, बाद में | फोन GPS |
| 6. Hardware बाद में जोड़ो | पैसा/साइट तैयार हो | barrier बाद में |

## चलाने का तरीका

```bash
npm install
npm test
npm run dev
```

फोन से खोलो: वही Wi-Fi, ब्राउज़र में `http://<computer-ip>:5173`

## Build

```bash
npm run build
npm run preview
```

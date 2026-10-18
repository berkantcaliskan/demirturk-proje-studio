// Demirtürk Yapı İnşaat Karasu - Başlangıç Proje ve Kat Planı Verileri
// Eklenen 8 PPTX dosyasındaki tüm katlar, daireler, fiyatlar ve koordinatlarla birebir uyumludur.

const INITIAL_PROJECTS = [
  {
    "id": "proje-1104-14",
    "name": "Aziziye 1104 Ada 14 Parsel",
    "subtitle": "DEMİRTÜRK YAPI KARASU",
    "neighborhood": "Aziziye Mahallesi",
    "adaParsel": "Ada: 1104 Parsel: 14",
    "deliveryDate": "25.09.2026",
    "paymentPlan": "Peşinat = 1.000.000 ₺",
    "templateType": "template-1104",
    "compass": {
      "top": "Kuzey",
      "right": "Doğu",
      "bottom": "Güney",
      "left": "Batı"
    },
    "floors": [
      {
        "id": "zemin",
        "name": "ZEMİN KAT",
        "apartments": [
          {
            "id": "p1-z-d4",
            "block": "Tek Blok",
            "number": "DAİRE 4",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "slot": "top-left"
          },
          {
            "id": "p1-z-d1",
            "block": "Tek Blok",
            "number": "DAİRE 1",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "slot": "top-right"
          },
          {
            "id": "p1-z-d3",
            "block": "Tek Blok",
            "number": "DAİRE 3",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILDI",
            "slot": "bottom-left"
          },
          {
            "id": "p1-z-d2",
            "block": "Tek Blok",
            "number": "DAİRE 2",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILDI",
            "slot": "bottom-right"
          }
        ]
      },
      {
        "id": "kat1",
        "name": "BİRİNCİ KAT",
        "apartments": [
          {
            "id": "p1-1-d8",
            "block": "Tek Blok",
            "number": "DAİRE 8",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "slot": "top-left"
          },
          {
            "id": "p1-1-d5",
            "block": "Tek Blok",
            "number": "DAİRE 5",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "slot": "top-right"
          },
          {
            "id": "p1-1-d7",
            "block": "Tek Blok",
            "number": "DAİRE 7",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "slot": "bottom-left"
          },
          {
            "id": "p1-1-d6",
            "block": "Tek Blok",
            "number": "DAİRE 6",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "slot": "bottom-right"
          }
        ]
      },
      {
        "id": "kat2",
        "name": "İKİNCİ KAT",
        "apartments": [
          {
            "id": "p1-2-d12",
            "block": "Tek Blok",
            "number": "DAİRE 12",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "slot": "top-left"
          },
          {
            "id": "p1-2-d9",
            "block": "Tek Blok",
            "number": "DAİRE 9",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "slot": "top-right"
          },
          {
            "id": "p1-2-d11",
            "block": "Tek Blok",
            "number": "DAİRE 11",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "slot": "bottom-left"
          },
          {
            "id": "p1-2-d10",
            "block": "Tek Blok",
            "number": "DAİRE 10",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "slot": "bottom-right"
          }
        ]
      }
    ]
  },
  {
    "id": "proje-asel-4",
    "name": "ASEL DOĞA EVLERİ 4",
    "subtitle": "DEMİRTÜRK YAPI | İNŞAAT",
    "neighborhood": "Aşağıaziziye Mahallesi",
    "adaParsel": "1105 Ada 13 Parsel",
    "deliveryDate": "Eylül 2027",
    "paymentPlan": "1.250.000 ₺ Peşin / 36 Ay Vade",
    "templateType": "template-asel4",
    "compass": {
      "top": "KUZEY",
      "right": "DOĞU",
      "bottom": "GÜNEY",
      "left": "BATI"
    },
    "floors": [
      {
        "id": "zemin",
        "name": "ZEMİN KAT",
        "apartments": [
          {
            "id": "p2-z-a1",
            "block": "A Giriş",
            "number": "DAİRE 1",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "slot": "a-top-right"
          },
          {
            "id": "p2-z-a2",
            "block": "A Giriş",
            "number": "DAİRE 2",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "slot": "a-bottom-mid"
          },
          {
            "id": "p2-z-a3",
            "block": "A Giriş",
            "number": "DAİRE 3",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "slot": "a-bottom-left"
          },
          {
            "id": "p2-z-b2",
            "block": "B Giriş",
            "number": "DAİRE 2",
            "rooms": "1+1",
            "price": 3750000,
            "status": "SATILIK",
            "slot": "b-top-left"
          },
          {
            "id": "p2-z-b1",
            "block": "B Giriş",
            "number": "DAİRE 1",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "slot": "b-right"
          }
        ]
      },
      {
        "id": "kat1",
        "name": "1. KAT",
        "apartments": [
          {
            "id": "p2-1-a4",
            "block": "A Giriş",
            "number": "DAİRE 4",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "slot": "a-top-right"
          },
          {
            "id": "p2-1-a5",
            "block": "A Giriş",
            "number": "DAİRE 5",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "slot": "a-bottom-mid"
          },
          {
            "id": "p2-1-a6",
            "block": "A Giriş",
            "number": "DAİRE 6",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "slot": "a-bottom-left"
          },
          {
            "id": "p2-1-b4",
            "block": "B Giriş",
            "number": "DAİRE 4",
            "rooms": "1+1",
            "price": 3750000,
            "status": "SATILIK",
            "slot": "b-top-left"
          },
          {
            "id": "p2-1-b3",
            "block": "B Giriş",
            "number": "DAİRE 3",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "slot": "b-right"
          }
        ]
      },
      {
        "id": "kat2",
        "name": "2. KAT",
        "apartments": [
          {
            "id": "p2-2-a7",
            "block": "A Giriş",
            "number": "DAİRE 7",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "slot": "a-top-right"
          },
          {
            "id": "p2-2-a8",
            "block": "A Giriş",
            "number": "DAİRE 8",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "slot": "a-bottom-mid"
          },
          {
            "id": "p2-2-a9",
            "block": "A Giriş",
            "number": "DAİRE 9",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "slot": "a-bottom-left"
          },
          {
            "id": "p2-2-b6",
            "block": "B Giriş",
            "number": "DAİRE 6",
            "rooms": "1+1",
            "price": 3750000,
            "status": "SATILDI",
            "slot": "b-top-left"
          },
          {
            "id": "p2-2-b5",
            "block": "B Giriş",
            "number": "DAİRE 5",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "slot": "b-right"
          }
        ]
      }
    ]
  },
  {
    "id": "proje-asel-2",
    "name": "ASEL DOĞA EVLERİ 2",
    "subtitle": "DEMİRTÜRK YAPI KARASU",
    "neighborhood": "Yukarıaziziye Mh.",
    "adaParsel": "1233 Ada / 8 Parsel",
    "deliveryDate": "15.07.2026",
    "paymentPlan": "1.250.000 ₺ Peşinat / 36 Ay Vade",
    "templateType": "template-asel2",
    "compass": {
      "top": "Batı",
      "right": "Kuzey",
      "bottom": "Doğu",
      "left": "Güney"
    },
    "floors": [
      {
        "id": "zemin",
        "name": "ZEMİN KAT",
        "apartments": [
          {
            "id": "p3-z-b1",
            "block": "B Giriş",
            "number": "DAİRE 1",
            "rooms": "2+1",
            "price": 4500000,
            "status": "KAPORA",
            "slot": "b-left"
          },
          {
            "id": "p3-z-b2",
            "block": "B Giriş",
            "number": "DAİRE 2",
            "rooms": "2+1",
            "price": 4300000,
            "status": "SATILIK",
            "slot": "b-right"
          },
          {
            "id": "p3-z-a1",
            "block": "A Giriş",
            "number": "DAİRE 1",
            "rooms": "2+1",
            "price": 4300000,
            "status": "SATILIK",
            "slot": "a-left"
          },
          {
            "id": "p3-z-a2",
            "block": "A Giriş",
            "number": "DAİRE 2",
            "rooms": "2+1",
            "price": 4500000,
            "status": "PESINAT",
            "slot": "a-right"
          }
        ]
      },
      {
        "id": "kat1",
        "name": "1. KAT",
        "apartments": [
          {
            "id": "p3-1-b3",
            "block": "B Giriş",
            "number": "DAİRE 3",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "b-left"
          },
          {
            "id": "p3-1-b4",
            "block": "B Giriş",
            "number": "DAİRE 4",
            "rooms": "2+1",
            "price": 4300000,
            "status": "SATILDI",
            "slot": "b-right"
          },
          {
            "id": "p3-1-a3",
            "block": "A Giriş",
            "number": "DAİRE 3",
            "rooms": "2+1",
            "price": 4300000,
            "status": "SATILIK",
            "slot": "a-left"
          },
          {
            "id": "p3-1-a4",
            "block": "A Giriş",
            "number": "DAİRE 4",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILIK",
            "slot": "a-right"
          }
        ]
      },
      {
        "id": "kat2",
        "name": "2. KAT",
        "apartments": [
          {
            "id": "p3-2-b5",
            "block": "B Giriş",
            "number": "DAİRE 5",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "b-left"
          },
          {
            "id": "p3-2-b6",
            "block": "B Giriş",
            "number": "DAİRE 6",
            "rooms": "2+1",
            "price": 4300000,
            "status": "SATILDI",
            "slot": "b-right"
          },
          {
            "id": "p3-2-a5",
            "block": "A Giriş",
            "number": "DAİRE 5",
            "rooms": "2+1",
            "price": 4300000,
            "status": "SATILIK",
            "slot": "a-left"
          },
          {
            "id": "p3-2-a6",
            "block": "A Giriş",
            "number": "DAİRE 6",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILIK",
            "slot": "a-right"
          }
        ]
      }
    ]
  },
  {
    "id": "proje-asel-1",
    "name": "ASEL DOĞA EVLERİ",
    "subtitle": "DEMİRTÜRK YAPI KARASU",
    "neighborhood": "Aşağıaziziye Mh.",
    "adaParsel": "1067 Ada 4 Parsel",
    "deliveryDate": "15.07.2026",
    "paymentPlan": "1.500.000 TL Peşin / 24 Ay Taksit",
    "templateType": "template-asel1",
    "compass": {
      "top": "KUZEY",
      "right": "DOĞU",
      "bottom": "GÜNEY",
      "left": "BATI"
    },
    "floors": [
      {
        "id": "zemin",
        "name": "ZEMİN KAT",
        "apartments": [
          {
            "id": "p4-z-b2",
            "block": "B Giriş",
            "number": "DAİRE NO: 2",
            "rooms": "2+1",
            "price": 3900000,
            "status": "SATILDI",
            "slot": "b-top-left"
          },
          {
            "id": "p4-z-b1",
            "block": "B Giriş",
            "number": "DAİRE NO: 1",
            "rooms": "2+1",
            "price": 3700000,
            "status": "SATILDI",
            "slot": "b-bottom-left"
          },
          {
            "id": "p4-z-b3",
            "block": "B Giriş",
            "number": "DAİRE NO: 3",
            "rooms": "2+1",
            "price": 4300000,
            "status": "SATILDI",
            "slot": "b-right-tall"
          },
          {
            "id": "p4-z-a1",
            "block": "A Giriş",
            "number": "DAİRE NO: 1",
            "rooms": "2+1",
            "price": 4300000,
            "status": "SATILDI",
            "slot": "a-left-tall"
          },
          {
            "id": "p4-z-a2",
            "block": "A Giriş",
            "number": "DAİRE NO: 2",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "a-top-right"
          },
          {
            "id": "p4-z-a3",
            "block": "A Giriş",
            "number": "DAİRE NO: 3",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "a-bottom-right"
          }
        ]
      },
      {
        "id": "kat1",
        "name": "1. KAT",
        "apartments": [
          {
            "id": "p4-1-b5",
            "block": "B Giriş",
            "number": "DAİRE NO: 5",
            "rooms": "2+1",
            "price": 3900000,
            "status": "SATILDI",
            "slot": "b-top-left"
          },
          {
            "id": "p4-1-b4",
            "block": "B Giriş",
            "number": "DAİRE NO: 4",
            "rooms": "2+1",
            "price": 3900000,
            "status": "SATILDI",
            "slot": "b-bottom-left"
          },
          {
            "id": "p4-1-b6",
            "block": "B Giriş",
            "number": "DAİRE NO: 6",
            "rooms": "2+1",
            "price": 3900000,
            "status": "SATILDI",
            "slot": "b-right-tall"
          },
          {
            "id": "p4-1-a4",
            "block": "A Giriş",
            "number": "DAİRE NO: 4",
            "rooms": "2+1",
            "price": 4300000,
            "status": "SATILIK",
            "slot": "a-left-tall"
          },
          {
            "id": "p4-1-a5",
            "block": "A Giriş",
            "number": "DAİRE NO: 5",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILIK",
            "slot": "a-top-right"
          },
          {
            "id": "p4-1-a6",
            "block": "A Giriş",
            "number": "DAİRE NO: 6",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "a-bottom-right"
          }
        ]
      },
      {
        "id": "kat2",
        "name": "2. KAT",
        "apartments": [
          {
            "id": "p4-2-b8",
            "block": "B Giriş",
            "number": "DAİRE NO: 8",
            "rooms": "2+1",
            "price": 3900000,
            "status": "SATILDI",
            "slot": "b-top-left"
          },
          {
            "id": "p4-2-b7",
            "block": "B Giriş",
            "number": "DAİRE NO: 7",
            "rooms": "2+1",
            "price": 3900000,
            "status": "SATILDI",
            "slot": "b-bottom-left"
          },
          {
            "id": "p4-2-b9",
            "block": "B Giriş",
            "number": "DAİRE NO: 9",
            "rooms": "2+1",
            "price": 4300000,
            "status": "SATILDI",
            "slot": "b-right-tall"
          },
          {
            "id": "p4-2-a7",
            "block": "A Giriş",
            "number": "DAİRE NO: 7",
            "rooms": "2+1",
            "price": 3900000,
            "status": "SATILDI",
            "slot": "a-left-tall"
          },
          {
            "id": "p4-2-a8",
            "block": "A Giriş",
            "number": "DAİRE NO: 8",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILIK",
            "slot": "a-top-right"
          },
          {
            "id": "p4-2-a9",
            "block": "A Giriş",
            "number": "DAİRE NO: 9",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "a-bottom-right"
          }
        ]
      }
    ]
  },
  {
    "id": "proje-almina-2",
    "name": "ALMİNA 2 SİTESİ",
    "subtitle": "DEMİRTÜRK YAPI KARASU",
    "neighborhood": "Aşağıincilli Mh.",
    "adaParsel": "996 Ada / 12 Parsel",
    "deliveryDate": "12.07.2026",
    "paymentPlan": "1.500.000₺ Peşinat / 36 Ay Vade",
    "templateType": "template-almina2",
    "compass": {
      "top": "Kuzey",
      "right": "Doğu",
      "bottom": "Güney",
      "left": "Batı"
    },
    "floors": [
      {
        "id": "zemin",
        "name": "ZEMİN KAT",
        "apartments": [
          {
            "id": "p5-z-b1",
            "block": "B Giriş",
            "number": "DAİRE 1",
            "rooms": "2+1",
            "price": 5500000,
            "status": "SATILDI",
            "slot": "b-1"
          },
          {
            "id": "p5-z-b2",
            "block": "B Giriş",
            "number": "DAİRE 2",
            "rooms": "2+1",
            "price": 5500000,
            "status": "SATILDI",
            "slot": "b-2"
          },
          {
            "id": "p5-z-b3",
            "block": "B Giriş",
            "number": "DAİRE 3",
            "rooms": "2+1",
            "price": 5500000,
            "status": "SATILIK",
            "slot": "b-3"
          },
          {
            "id": "p5-z-a1",
            "block": "A Giriş",
            "number": "DAİRE 1",
            "rooms": "2+1",
            "price": 5500000,
            "status": "SATILDI",
            "slot": "a-top"
          },
          {
            "id": "p5-z-a3",
            "block": "A Giriş",
            "number": "DAİRE 3",
            "rooms": "2+1",
            "price": 5500000,
            "status": "SATILDI",
            "slot": "a-bottom-left"
          },
          {
            "id": "p5-z-a2",
            "block": "A Giriş",
            "number": "DAİRE 2",
            "rooms": "2+1",
            "price": 5500000,
            "status": "SATILDI",
            "slot": "a-bottom-right"
          }
        ]
      },
      {
        "id": "kat1",
        "name": "BİRİNCİ KAT",
        "apartments": [
          {
            "id": "p5-1-b4",
            "block": "B Giriş",
            "number": "DAİRE 4",
            "rooms": "2+1",
            "price": 5500000,
            "status": "SATILIK",
            "slot": "b-1"
          },
          {
            "id": "p5-1-b5",
            "block": "B Giriş",
            "number": "DAİRE 5",
            "rooms": "2+1",
            "price": 5500000,
            "status": "SATILIK",
            "slot": "b-2"
          },
          {
            "id": "p5-1-b6",
            "block": "B Giriş",
            "number": "DAİRE 6",
            "rooms": "2+1",
            "price": 5500000,
            "status": "SATILIK",
            "slot": "b-3"
          },
          {
            "id": "p5-1-a4",
            "block": "A Giriş",
            "number": "DAİRE 4",
            "rooms": "2+1",
            "price": 5500000,
            "status": "SATILIK",
            "slot": "a-top"
          },
          {
            "id": "p5-1-a6",
            "block": "A Giriş",
            "number": "DAİRE 6",
            "rooms": "2+1",
            "price": 5500000,
            "status": "SATILDI",
            "slot": "a-bottom-left"
          },
          {
            "id": "p5-1-a5",
            "block": "A Giriş",
            "number": "DAİRE 5",
            "rooms": "2+1",
            "price": 5500000,
            "status": "SATILIK",
            "slot": "a-bottom-right"
          }
        ]
      },
      {
        "id": "kat2",
        "name": "İKİNCİ KAT",
        "apartments": [
          {
            "id": "p5-2-b7",
            "block": "B Giriş",
            "number": "DAİRE 7",
            "rooms": "2+1",
            "price": 5500000,
            "status": "SATILIK",
            "slot": "b-1"
          },
          {
            "id": "p5-2-b8",
            "block": "B Giriş",
            "number": "DAİRE 8",
            "rooms": "2+1",
            "price": 5500000,
            "status": "SATILIK",
            "slot": "b-2"
          },
          {
            "id": "p5-2-b9",
            "block": "B Giriş",
            "number": "DAİRE 9",
            "rooms": "2+1",
            "price": 5500000,
            "status": "SATILIK",
            "slot": "b-3"
          },
          {
            "id": "p5-2-a7",
            "block": "A Giriş",
            "number": "DAİRE 7",
            "rooms": "2+1",
            "price": 5500000,
            "status": "SATILIK",
            "slot": "a-top"
          },
          {
            "id": "p5-2-a9",
            "block": "A Giriş",
            "number": "DAİRE 9",
            "rooms": "2+1",
            "price": 5500000,
            "status": "SATILDI",
            "slot": "a-bottom-left"
          },
          {
            "id": "p5-2-a8",
            "block": "A Giriş",
            "number": "DAİRE 8",
            "rooms": "2+1",
            "price": 5500000,
            "status": "SATILIK",
            "slot": "a-bottom-right"
          }
        ]
      }
    ]
  },
  {
    "id": "proje-yenisehir-3",
    "name": "YENİŞEHİR 3. ETAP",
    "subtitle": "Güneş Paneli – Su Deposu – Sığınak – Çocuk Oyun Alanı – Fitness – Araç Şarj İstasyonu",
    "neighborhood": "Aşağıincilli Mh.",
    "adaParsel": "1326 Ada 3 Parsel",
    "deliveryDate": "13.07.2026",
    "paymentPlan": "1.500.000₺ PEŞİNAT – 36 AY VADE",
    "templateType": "template-yenisehir3",
    "compass": {
      "top": "K",
      "right": "D",
      "bottom": "G",
      "left": "B"
    },
    "floors": [
      {
        "id": "zemin",
        "name": "ZEMİN KAT",
        "apartments": [
          {
            "id": "p6-z-a-b3",
            "block": "A Blok (B Giriş)",
            "number": "Daire 3",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILDI",
            "x": 21,
            "y": 209,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-a-b4",
            "block": "A Blok (B Giriş)",
            "number": "Daire 4",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILDI",
            "x": 125,
            "y": 209,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-a-b2",
            "block": "A Blok (B Giriş)",
            "number": "Daire 2",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 21,
            "y": 285,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-a-b1",
            "block": "A Blok (B Giriş)",
            "number": "Daire 1",
            "rooms": "1+1",
            "price": 4250000,
            "status": "SATILDI",
            "x": 125,
            "y": 285,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-a-b5",
            "block": "A Blok (B Giriş)",
            "number": "Daire 5",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 21,
            "y": 361,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-a-b6",
            "block": "A Blok (B Giriş)",
            "number": "Daire 6",
            "rooms": "1+1",
            "price": 4250000,
            "status": "SATILDI",
            "x": 125,
            "y": 361,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-a-a4",
            "block": "A Blok (A Giriş)",
            "number": "Daire 4",
            "rooms": "1+1",
            "price": 3750000,
            "status": "SATILIK",
            "x": 21,
            "y": 437,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-a-a1",
            "block": "A Blok (A Giriş)",
            "number": "Daire 1",
            "rooms": "1+1",
            "price": 4000000,
            "status": "SATILIK",
            "x": 125,
            "y": 437,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-a-a3",
            "block": "A Blok (A Giriş)",
            "number": "Daire 3",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILDI",
            "x": 21,
            "y": 514,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-a-a2",
            "block": "A Blok (A Giriş)",
            "number": "Daire 2",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILDI",
            "x": 125,
            "y": 514,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-b-c4",
            "block": "B Blok (C Giriş)",
            "number": "Daire 4",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "x": 248,
            "y": 129,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-b-c1",
            "block": "B Blok (C Giriş)",
            "number": "Daire 1",
            "rooms": "1+1",
            "price": 3750000,
            "status": "SATILIK",
            "x": 353,
            "y": 129,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-b-b4",
            "block": "B Blok (B Giriş)",
            "number": "Daire 4",
            "rooms": "1+1",
            "price": 3750000,
            "status": "SATILIK",
            "x": 455,
            "y": 129,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-b-b1",
            "block": "B Blok (B Giriş)",
            "number": "Daire 1",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 560,
            "y": 129,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-b-a6",
            "block": "B Blok (A Giriş)",
            "number": "Daire 6",
            "rooms": "1+1",
            "price": 4000000,
            "status": "SATILIK",
            "x": 660,
            "y": 129,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-b-a1",
            "block": "B Blok (A Giriş)",
            "number": "Daire 1",
            "rooms": "1+1",
            "price": 3750000,
            "status": "SATILIK",
            "x": 764,
            "y": 129,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-b-a2",
            "block": "B Blok (A Giriş)",
            "number": "Daire 2",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILDI",
            "x": 868,
            "y": 129,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-b-c3",
            "block": "B Blok (C Giriş)",
            "number": "Daire 3",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "x": 248,
            "y": 205,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-b-c2",
            "block": "B Blok (C Giriş)",
            "number": "Daire 2",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 353,
            "y": 205,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-b-b3",
            "block": "B Blok (B Giriş)",
            "number": "Daire 3",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "x": 455,
            "y": 205,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-b-b2",
            "block": "B Blok (B Giriş)",
            "number": "Daire 2",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 560,
            "y": 205,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-b-a5",
            "block": "B Blok (A Giriş)",
            "number": "Daire 5",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 660,
            "y": 205,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-b-a4",
            "block": "B Blok (A Giriş)",
            "number": "Daire 4",
            "rooms": "1+1",
            "price": 3750000,
            "status": "SATILIK",
            "x": 764,
            "y": 205,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-b-a3",
            "block": "B Blok (A Giriş)",
            "number": "Daire 3",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "x": 868,
            "y": 205,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-c-c2",
            "block": "C Blok (C Giriş)",
            "number": "Daire 2",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILDI",
            "x": 246,
            "y": 493,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-c-c3",
            "block": "C Blok (C Giriş)",
            "number": "Daire 3",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILDI",
            "x": 350,
            "y": 493,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-c-b2",
            "block": "C Blok (B Giriş)",
            "number": "Daire 2",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 453,
            "y": 493,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-c-b3",
            "block": "C Blok (B Giriş)",
            "number": "Daire 3",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 557,
            "y": 493,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-c-a2",
            "block": "C Blok (A Giriş)",
            "number": "Daire 2",
            "rooms": "2+1",
            "price": 5250000,
            "status": "SATILIK",
            "x": 657,
            "y": 493,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-c-a3",
            "block": "C Blok (A Giriş)",
            "number": "Daire 3",
            "rooms": "1+1",
            "price": 4000000,
            "status": "SATILDI",
            "x": 761,
            "y": 493,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-c-a4",
            "block": "C Blok (A Giriş)",
            "number": "Daire 4",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILDI",
            "x": 865,
            "y": 493,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-c-c1",
            "block": "C Blok (C Giriş)",
            "number": "Daire 1",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILDI",
            "x": 246,
            "y": 569,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-c-c4",
            "block": "C Blok (C Giriş)",
            "number": "Daire 4",
            "rooms": "1+1",
            "price": 3750000,
            "status": "SATILIK",
            "x": 350,
            "y": 569,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-c-b1",
            "block": "C Blok (B Giriş)",
            "number": "Daire 1",
            "rooms": "1+1",
            "price": 3750000,
            "status": "SATILIK",
            "x": 453,
            "y": 569,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-c-b4",
            "block": "C Blok (B Giriş)",
            "number": "Daire 4",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILDI",
            "x": 557,
            "y": 569,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-c-a1",
            "block": "C Blok (A Giriş)",
            "number": "Daire 1",
            "rooms": "1+1",
            "price": 4000000,
            "status": "SATILDI",
            "x": 657,
            "y": 569,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-c-a6",
            "block": "C Blok (A Giriş)",
            "number": "Daire 6",
            "rooms": "1+1",
            "price": 3750000,
            "status": "SATILIK",
            "x": 761,
            "y": 569,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-c-a5",
            "block": "C Blok (A Giriş)",
            "number": "Daire 5",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILDI",
            "x": 865,
            "y": 569,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-d-b4",
            "block": "D Blok (B Giriş)",
            "number": "Daire 4",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 990,
            "y": 189,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-d-b5",
            "block": "D Blok (B Giriş)",
            "number": "Daire 5",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILDI",
            "x": 1094,
            "y": 189,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-d-b3",
            "block": "D Blok (B Giriş)",
            "number": "Daire 3",
            "rooms": "2+1",
            "price": 5250000,
            "status": "SATILIK",
            "x": 990,
            "y": 265,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-d-b6",
            "block": "D Blok (B Giriş)",
            "number": "Daire 6",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "x": 1094,
            "y": 265,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-d-b2",
            "block": "D Blok (B Giriş)",
            "number": "Daire 2",
            "rooms": "2+1",
            "price": 5250000,
            "status": "SATILDI",
            "x": 990,
            "y": 340,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-d-b1",
            "block": "D Blok (B Giriş)",
            "number": "Daire 1",
            "rooms": "1+1",
            "price": 4000000,
            "status": "SATILDI",
            "x": 1094,
            "y": 340,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-d-a5",
            "block": "D Blok (A Giriş)",
            "number": "Daire 5",
            "rooms": "2+1",
            "price": 5250000,
            "status": "KAPORA",
            "x": 990,
            "y": 416,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-d-a6",
            "block": "D Blok (A Giriş)",
            "number": "Daire 6",
            "rooms": "1+1",
            "price": 4000000,
            "status": "SATILDI",
            "x": 1094,
            "y": 416,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-d-a4",
            "block": "D Blok (A Giriş)",
            "number": "Daire 4",
            "rooms": "2+1",
            "price": 5250000,
            "status": "SATILIK",
            "x": 990,
            "y": 492,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-d-a1",
            "block": "D Blok (A Giriş)",
            "number": "Daire 1",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "x": 1094,
            "y": 492,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-d-a3",
            "block": "D Blok (A Giriş)",
            "number": "Daire 3",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILDI",
            "x": 990,
            "y": 567,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-z-d-a2",
            "block": "D Blok (A Giriş)",
            "number": "Daire 2",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILDI",
            "x": 1094,
            "y": 567,
            "w": 104,
            "h": 76
          }
        ]
      },
      {
        "id": "kat1",
        "name": "BİRİNCİ KAT",
        "apartments": [
          {
            "id": "p6-1-a-b7",
            "block": "A Blok (B Giriş)",
            "number": "Daire 7",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 21,
            "y": 209,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-a-b8",
            "block": "A Blok (B Giriş)",
            "number": "Daire 8",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILDI",
            "x": 125,
            "y": 209,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-a-b6",
            "block": "A Blok (B Giriş)",
            "number": "Daire 6",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 21,
            "y": 285,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-a-b5",
            "block": "A Blok (B Giriş)",
            "number": "Daire 5",
            "rooms": "2+1",
            "price": 5250000,
            "status": "SATILDI",
            "x": 125,
            "y": 285,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-a-b11",
            "block": "A Blok (B Giriş)",
            "number": "Daire 11",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 21,
            "y": 361,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-a-b12",
            "block": "A Blok (B Giriş)",
            "number": "Daire 12",
            "rooms": "2+1",
            "price": 5250000,
            "status": "SATILDI",
            "x": 125,
            "y": 361,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-a-a10",
            "block": "A Blok (A Giriş)",
            "number": "Daire 10",
            "rooms": "1+1",
            "price": 3750000,
            "status": "SATILIK",
            "x": 21,
            "y": 437,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-a-a7",
            "block": "A Blok (A Giriş)",
            "number": "Daire 7",
            "rooms": "1+1",
            "price": 4000000,
            "status": "SATILIK",
            "x": 125,
            "y": 437,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-a-a9",
            "block": "A Blok (A Giriş)",
            "number": "Daire 9",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "x": 21,
            "y": 514,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-a-a8",
            "block": "A Blok (A Giriş)",
            "number": "Daire 8",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 125,
            "y": 514,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-b-c8",
            "block": "B Blok (C Giriş)",
            "number": "Daire 8",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "x": 248,
            "y": 129,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-b-c5",
            "block": "B Blok (C Giriş)",
            "number": "Daire 5",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 353,
            "y": 129,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-b-b8",
            "block": "B Blok (B Giriş)",
            "number": "Daire 8",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "x": 455,
            "y": 129,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-b-b5",
            "block": "B Blok (B Giriş)",
            "number": "Daire 5",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 560,
            "y": 129,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-b-a12",
            "block": "B Blok (A Giriş)",
            "number": "Daire 12",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 660,
            "y": 129,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-b-a7",
            "block": "B Blok (A Giriş)",
            "number": "Daire 7",
            "rooms": "1+1",
            "price": 3750000,
            "status": "SATILIK",
            "x": 764,
            "y": 129,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-b-a8",
            "block": "B Blok (A Giriş)",
            "number": "Daire 8",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "x": 868,
            "y": 129,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-b-c7",
            "block": "B Blok (C Giriş)",
            "number": "Daire 7",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "x": 248,
            "y": 205,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-b-c6",
            "block": "B Blok (C Giriş)",
            "number": "Daire 6",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 353,
            "y": 205,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-b-b7",
            "block": "B Blok (B Giriş)",
            "number": "Daire 7",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "x": 455,
            "y": 205,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-b-b6",
            "block": "B Blok (B Giriş)",
            "number": "Daire 6",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 560,
            "y": 205,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-b-a11",
            "block": "B Blok (A Giriş)",
            "number": "Daire 11",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 660,
            "y": 205,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-b-a10",
            "block": "B Blok (A Giriş)",
            "number": "Daire 10",
            "rooms": "1+1",
            "price": 3750000,
            "status": "SATILIK",
            "x": 764,
            "y": 205,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-b-a9",
            "block": "B Blok (A Giriş)",
            "number": "Daire 9",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "x": 868,
            "y": 205,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-c-c6",
            "block": "C Blok (C Giriş)",
            "number": "Daire 6",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILDI",
            "x": 246,
            "y": 493,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-c-c7",
            "block": "C Blok (C Giriş)",
            "number": "Daire 7",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 350,
            "y": 493,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-c-b6",
            "block": "C Blok (B Giriş)",
            "number": "Daire 6",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILDI",
            "x": 453,
            "y": 493,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-c-b7",
            "block": "C Blok (B Giriş)",
            "number": "Daire 7",
            "rooms": "2+1",
            "price": 5250000,
            "status": "SATILIK",
            "x": 557,
            "y": 493,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-c-a8",
            "block": "C Blok (A Giriş)",
            "number": "Daire 8",
            "rooms": "2+1",
            "price": 5250000,
            "status": "SATILIK",
            "x": 657,
            "y": 493,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-c-a9",
            "block": "C Blok (A Giriş)",
            "number": "Daire 9",
            "rooms": "1+1",
            "price": 3750000,
            "status": "SATILDI",
            "x": 761,
            "y": 493,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-c-a10",
            "block": "C Blok (A Giriş)",
            "number": "Daire 10",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 865,
            "y": 493,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-c-c5",
            "block": "C Blok (C Giriş)",
            "number": "Daire 5",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "x": 246,
            "y": 569,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-c-c8",
            "block": "C Blok (C Giriş)",
            "number": "Daire 8",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "x": 350,
            "y": 569,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-c-b5",
            "block": "C Blok (B Giriş)",
            "number": "Daire 5",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILDI",
            "x": 453,
            "y": 569,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-c-b8",
            "block": "C Blok (B Giriş)",
            "number": "Daire 8",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 557,
            "y": 569,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-c-a7",
            "block": "C Blok (A Giriş)",
            "number": "Daire 7",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 657,
            "y": 569,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-c-a12",
            "block": "C Blok (A Giriş)",
            "number": "Daire 12",
            "rooms": "1+1",
            "price": 3750000,
            "status": "SATILIK",
            "x": 761,
            "y": 569,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-c-a11",
            "block": "C Blok (A Giriş)",
            "number": "Daire 11",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "x": 865,
            "y": 569,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-d-b10",
            "block": "D Blok (B Giriş)",
            "number": "Daire 10",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 990,
            "y": 189,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-d-b11",
            "block": "D Blok (B Giriş)",
            "number": "Daire 11",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 1094,
            "y": 189,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-d-b9",
            "block": "D Blok (B Giriş)",
            "number": "Daire 9",
            "rooms": "2+1",
            "price": 5250000,
            "status": "SATILIK",
            "x": 990,
            "y": 265,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-d-b12",
            "block": "D Blok (B Giriş)",
            "number": "Daire 12",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "x": 1094,
            "y": 265,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-d-b8",
            "block": "D Blok (B Giriş)",
            "number": "Daire 8",
            "rooms": "2+1",
            "price": 5250000,
            "status": "SATILDI",
            "x": 990,
            "y": 340,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-d-b7",
            "block": "D Blok (B Giriş)",
            "number": "Daire 7",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 1094,
            "y": 340,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-d-a11",
            "block": "D Blok (A Giriş)",
            "number": "Daire 11",
            "rooms": "2+1",
            "price": 5250000,
            "status": "SATILIK",
            "x": 990,
            "y": 416,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-d-a12",
            "block": "D Blok (A Giriş)",
            "number": "Daire 12",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 1094,
            "y": 416,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-d-a10",
            "block": "D Blok (A Giriş)",
            "number": "Daire 10",
            "rooms": "2+1",
            "price": 5250000,
            "status": "SATILIK",
            "x": 990,
            "y": 492,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-d-a7",
            "block": "D Blok (A Giriş)",
            "number": "Daire 7",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "x": 1094,
            "y": 492,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-d-a9",
            "block": "D Blok (A Giriş)",
            "number": "Daire 9",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "x": 990,
            "y": 567,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-1-d-a8",
            "block": "D Blok (A Giriş)",
            "number": "Daire 8",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "x": 1094,
            "y": 567,
            "w": 104,
            "h": 76
          }
        ]
      },
      {
        "id": "kat2",
        "name": "İKİNCİ KAT",
        "apartments": [
          {
            "id": "p6-2-a-b11",
            "block": "A Blok (B Giriş)",
            "number": "Daire 11",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 21,
            "y": 209,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-a-b12",
            "block": "A Blok (B Giriş)",
            "number": "Daire 12",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 125,
            "y": 209,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-a-b10",
            "block": "A Blok (B Giriş)",
            "number": "Daire 10",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 21,
            "y": 285,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-a-b9",
            "block": "A Blok (B Giriş)",
            "number": "Daire 9",
            "rooms": "2+1",
            "price": 5250000,
            "status": "SATILDI",
            "x": 125,
            "y": 285,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-a-b17",
            "block": "A Blok (B Giriş)",
            "number": "Daire 17",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 21,
            "y": 361,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-a-b18",
            "block": "A Blok (B Giriş)",
            "number": "Daire 18",
            "rooms": "2+1",
            "price": 5250000,
            "status": "SATILDI",
            "x": 125,
            "y": 361,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-a-a16",
            "block": "A Blok (A Giriş)",
            "number": "Daire 16",
            "rooms": "1+1",
            "price": 3750000,
            "status": "SATILIK",
            "x": 21,
            "y": 437,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-a-a13",
            "block": "A Blok (A Giriş)",
            "number": "Daire 13",
            "rooms": "1+1",
            "price": 4000000,
            "status": "SATILIK",
            "x": 125,
            "y": 437,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-a-a15",
            "block": "A Blok (A Giriş)",
            "number": "Daire 15",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "x": 21,
            "y": 514,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-a-a14",
            "block": "A Blok (A Giriş)",
            "number": "Daire 14",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 125,
            "y": 514,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-b-c12",
            "block": "B Blok (C Giriş)",
            "number": "Daire 12",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "x": 248,
            "y": 129,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-b-c9",
            "block": "B Blok (C Giriş)",
            "number": "Daire 9",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "x": 353,
            "y": 129,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-b-b12",
            "block": "B Blok (B Giriş)",
            "number": "Daire 12",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "x": 455,
            "y": 129,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-b-b9",
            "block": "B Blok (B Giriş)",
            "number": "Daire 9",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 560,
            "y": 129,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-b-a18",
            "block": "B Blok (A Giriş)",
            "number": "Daire 18",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 660,
            "y": 129,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-b-a13",
            "block": "B Blok (A Giriş)",
            "number": "Daire 13",
            "rooms": "1+1",
            "price": 3750000,
            "status": "SATILIK",
            "x": 764,
            "y": 129,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-b-a14",
            "block": "B Blok (A Giriş)",
            "number": "Daire 14",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "x": 868,
            "y": 129,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-b-c11",
            "block": "B Blok (C Giriş)",
            "number": "Daire 11",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "x": 248,
            "y": 205,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-b-c10",
            "block": "B Blok (C Giriş)",
            "number": "Daire 10",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "x": 353,
            "y": 205,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-b-b11",
            "block": "B Blok (B Giriş)",
            "number": "Daire 11",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "x": 455,
            "y": 205,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-b-b10",
            "block": "B Blok (B Giriş)",
            "number": "Daire 10",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 560,
            "y": 205,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-b-a17",
            "block": "B Blok (A Giriş)",
            "number": "Daire 17",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 660,
            "y": 205,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-b-a16",
            "block": "B Blok (A Giriş)",
            "number": "Daire 16",
            "rooms": "1+1",
            "price": 3750000,
            "status": "SATILIK",
            "x": 764,
            "y": 205,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-b-a15",
            "block": "B Blok (A Giriş)",
            "number": "Daire 15",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "x": 868,
            "y": 205,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-c-c10",
            "block": "C Blok (C Giriş)",
            "number": "Daire 10",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILDI",
            "x": 246,
            "y": 493,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-c-c11",
            "block": "C Blok (C Giriş)",
            "number": "Daire 11",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 350,
            "y": 493,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-c-b10",
            "block": "C Blok (B Giriş)",
            "number": "Daire 10",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 453,
            "y": 493,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-c-b11",
            "block": "C Blok (B Giriş)",
            "number": "Daire 11",
            "rooms": "2+1",
            "price": 5250000,
            "status": "SATILIK",
            "x": 557,
            "y": 493,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-c-a14",
            "block": "C Blok (A Giriş)",
            "number": "Daire 14",
            "rooms": "2+1",
            "price": 5250000,
            "status": "SATILIK",
            "x": 657,
            "y": 493,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-c-a15",
            "block": "C Blok (A Giriş)",
            "number": "Daire 15",
            "rooms": "1+1",
            "price": 3750000,
            "status": "SATILDI",
            "x": 761,
            "y": 493,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-c-a16",
            "block": "C Blok (A Giriş)",
            "number": "Daire 16",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 865,
            "y": 493,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-c-c9",
            "block": "C Blok (C Giriş)",
            "number": "Daire 9",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "x": 246,
            "y": 569,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-c-c12",
            "block": "C Blok (C Giriş)",
            "number": "Daire 12",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "x": 350,
            "y": 569,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-c-b9",
            "block": "C Blok (B Giriş)",
            "number": "Daire 9",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "x": 453,
            "y": 569,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-c-b12",
            "block": "C Blok (B Giriş)",
            "number": "Daire 12",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 557,
            "y": 569,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-c-a13",
            "block": "C Blok (A Giriş)",
            "number": "Daire 13",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 657,
            "y": 569,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-c-a18",
            "block": "C Blok (A Giriş)",
            "number": "Daire 18",
            "rooms": "1+1",
            "price": 3750000,
            "status": "SATILIK",
            "x": 761,
            "y": 569,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-c-a17",
            "block": "C Blok (A Giriş)",
            "number": "Daire 17",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "x": 865,
            "y": 569,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-d-b16",
            "block": "D Blok (B Giriş)",
            "number": "Daire 16",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 990,
            "y": 189,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-d-b17",
            "block": "D Blok (B Giriş)",
            "number": "Daire 17",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 1094,
            "y": 189,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-d-b15",
            "block": "D Blok (B Giriş)",
            "number": "Daire 15",
            "rooms": "2+1",
            "price": 5250000,
            "status": "SATILIK",
            "x": 990,
            "y": 265,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-d-b18",
            "block": "D Blok (B Giriş)",
            "number": "Daire 18",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "x": 1094,
            "y": 265,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-d-b14",
            "block": "D Blok (B Giriş)",
            "number": "Daire 14",
            "rooms": "2+1",
            "price": 5250000,
            "status": "SATILIK",
            "x": 990,
            "y": 340,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-d-b13",
            "block": "D Blok (B Giriş)",
            "number": "Daire 13",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 1094,
            "y": 340,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-d-a17",
            "block": "D Blok (A Giriş)",
            "number": "Daire 17",
            "rooms": "2+1",
            "price": 5250000,
            "status": "SATILIK",
            "x": 990,
            "y": 416,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-d-a18",
            "block": "D Blok (A Giriş)",
            "number": "Daire 18",
            "rooms": "2+1",
            "price": 5000000,
            "status": "SATILIK",
            "x": 1094,
            "y": 416,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-d-a16",
            "block": "D Blok (A Giriş)",
            "number": "Daire 16",
            "rooms": "2+1",
            "price": 5250000,
            "status": "SATILIK",
            "x": 990,
            "y": 492,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-d-a13",
            "block": "D Blok (A Giriş)",
            "number": "Daire 13",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "x": 1094,
            "y": 492,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-d-a15",
            "block": "D Blok (A Giriş)",
            "number": "Daire 15",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "x": 990,
            "y": 567,
            "w": 104,
            "h": 76
          },
          {
            "id": "p6-2-d-a14",
            "block": "D Blok (A Giriş)",
            "number": "Daire 14",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "x": 1094,
            "y": 567,
            "w": 104,
            "h": 76
          }
        ]
      }
    ]
  },
  {
    "id": "proje-demirturk-1etap",
    "name": "DEMİRTÜRK İNŞAAT [1. ETAP]",
    "subtitle": "KARASU DEMİRTÜRK İNŞAAT [1. ETAP]",
    "neighborhood": "Aşağıincilli Mah.",
    "adaParsel": "1324 Ada 1 Parsel",
    "deliveryDate": "10.07.2026",
    "paymentPlan": "24 AY VADE / 2.000.000₺ PEŞİNAT",
    "templateType": "template-etap1",
    "compass": {
      "top": "KUZEY",
      "right": "DOĞU",
      "bottom": "GÜNEY",
      "left": "BATI"
    },
    "floors": [
      {
        "id": "zemin",
        "name": "ZEMİN KAT",
        "apartments": [
          {
            "id": "p7-z-a18",
            "block": "A Blok",
            "number": "DAİRE 18",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "a-top-1"
          },
          {
            "id": "p7-z-a19",
            "block": "A Blok",
            "number": "DAİRE 19",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "a-top-2"
          },
          {
            "id": "p7-z-a20",
            "block": "A Blok",
            "number": "DAİRE 20",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "a-top-3"
          },
          {
            "id": "p7-z-a24",
            "block": "A Blok",
            "number": "DAİRE 24",
            "rooms": "1+1",
            "price": 3300000,
            "status": "SATILDI",
            "slot": "a-mid-1"
          },
          {
            "id": "p7-z-a1",
            "block": "A Blok",
            "number": "DAİRE 1",
            "rooms": "1+1",
            "price": 3300000,
            "status": "SATILDI",
            "slot": "a-mid-2"
          },
          {
            "id": "p7-z-a23",
            "block": "A Blok",
            "number": "DAİRE 23",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "a-bot-1"
          },
          {
            "id": "p7-z-a22",
            "block": "A Blok",
            "number": "DAİRE 22",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "a-bot-2"
          },
          {
            "id": "p7-z-a21",
            "block": "A Blok",
            "number": "DAİRE 21",
            "rooms": "2+1",
            "price": 3250000,
            "status": "SATILIK",
            "slot": "a-bot-3"
          },
          {
            "id": "p7-z-b22",
            "block": "B Blok",
            "number": "DAİRE 22",
            "rooms": "2+1",
            "price": 4300000,
            "status": "SATILDI",
            "slot": "b-top-1"
          },
          {
            "id": "p7-z-b23",
            "block": "B Blok",
            "number": "DAİRE 23",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "b-top-2"
          },
          {
            "id": "p7-z-b24",
            "block": "B Blok",
            "number": "DAİRE 24",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "b-top-3"
          },
          {
            "id": "p7-z-b1",
            "block": "B Blok",
            "number": "DAİRE 1",
            "rooms": "1+1",
            "price": 3300000,
            "status": "SATILDI",
            "slot": "b-mid-1"
          },
          {
            "id": "p7-z-b18",
            "block": "B Blok",
            "number": "DAİRE 18",
            "rooms": "1+1",
            "price": 3300000,
            "status": "SATILDI",
            "slot": "b-mid-2"
          },
          {
            "id": "p7-z-b21",
            "block": "B Blok",
            "number": "DAİRE 21",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "b-bot-1"
          },
          {
            "id": "p7-z-b20",
            "block": "B Blok",
            "number": "DAİRE 20",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "b-bot-2"
          },
          {
            "id": "p7-z-b19",
            "block": "B Blok",
            "number": "DAİRE 19",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "b-bot-3"
          }
        ]
      },
      {
        "id": "kat1",
        "name": "1. KAT",
        "apartments": [
          {
            "id": "p7-1-a2",
            "block": "A Blok",
            "number": "DAİRE 2",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "a-top-1"
          },
          {
            "id": "p7-1-a3",
            "block": "A Blok",
            "number": "DAİRE 3",
            "rooms": "2+1",
            "price": 4300000,
            "status": "SATILDI",
            "slot": "a-top-2"
          },
          {
            "id": "p7-1-a4",
            "block": "A Blok",
            "number": "DAİRE 4",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "a-top-3"
          },
          {
            "id": "p7-1-a9",
            "block": "A Blok",
            "number": "DAİRE 9",
            "rooms": "1+1",
            "price": 3500000,
            "status": "SATILDI",
            "slot": "a-mid-1"
          },
          {
            "id": "p7-1-a5",
            "block": "A Blok",
            "number": "DAİRE 5",
            "rooms": "1+1",
            "price": 3500000,
            "status": "SATILDI",
            "slot": "a-mid-2"
          },
          {
            "id": "p7-1-a8",
            "block": "A Blok",
            "number": "DAİRE 8",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "slot": "a-bot-1"
          },
          {
            "id": "p7-1-a7",
            "block": "A Blok",
            "number": "DAİRE 7",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "a-bot-2"
          },
          {
            "id": "p7-1-a6",
            "block": "A Blok",
            "number": "DAİRE 6",
            "rooms": "2+1",
            "price": 4300000,
            "status": "SATILDI",
            "slot": "a-bot-3"
          },
          {
            "id": "p7-1-b7",
            "block": "B Blok",
            "number": "DAİRE 7",
            "rooms": "2+1",
            "price": 4300000,
            "status": "SATILDI",
            "slot": "b-top-1"
          },
          {
            "id": "p7-1-b8",
            "block": "B Blok",
            "number": "DAİRE 8",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "b-top-2"
          },
          {
            "id": "p7-1-b9",
            "block": "B Blok",
            "number": "DAİRE 9",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILIK",
            "slot": "b-top-3"
          },
          {
            "id": "p7-1-b6",
            "block": "B Blok",
            "number": "DAİRE 6",
            "rooms": "1+1",
            "price": 3500000,
            "status": "SATILDI",
            "slot": "b-mid-1"
          },
          {
            "id": "p7-1-b2",
            "block": "B Blok",
            "number": "DAİRE 2",
            "rooms": "1+1",
            "price": 3500000,
            "status": "SATILDI",
            "slot": "b-mid-2"
          },
          {
            "id": "p7-1-b5",
            "block": "B Blok",
            "number": "DAİRE 5",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "b-bot-1"
          },
          {
            "id": "p7-1-b4",
            "block": "B Blok",
            "number": "DAİRE 4",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "b-bot-2"
          },
          {
            "id": "p7-1-b3",
            "block": "B Blok",
            "number": "DAİRE 3",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILIK",
            "slot": "b-bot-3"
          }
        ]
      },
      {
        "id": "kat2",
        "name": "2. KAT",
        "apartments": [
          {
            "id": "p7-2-a10",
            "block": "A Blok",
            "number": "DAİRE 10",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "slot": "a-top-1"
          },
          {
            "id": "p7-2-a11",
            "block": "A Blok",
            "number": "DAİRE 11",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "a-top-2"
          },
          {
            "id": "p7-2-a12",
            "block": "A Blok",
            "number": "DAİRE 12",
            "rooms": "2+1",
            "price": 4300000,
            "status": "SATILDI",
            "slot": "a-top-3"
          },
          {
            "id": "p7-2-a17",
            "block": "A Blok",
            "number": "DAİRE 17",
            "rooms": "1+1",
            "price": 3050000,
            "status": "SATILDI",
            "slot": "a-mid-1"
          },
          {
            "id": "p7-2-a13",
            "block": "A Blok",
            "number": "DAİRE 13",
            "rooms": "1+1",
            "price": 3300000,
            "status": "SATILDI",
            "slot": "a-mid-2"
          },
          {
            "id": "p7-2-a16",
            "block": "A Blok",
            "number": "DAİRE 16",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILIK",
            "slot": "a-bot-1"
          },
          {
            "id": "p7-2-a15",
            "block": "A Blok",
            "number": "DAİRE 15",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "a-bot-2"
          },
          {
            "id": "p7-2-a14",
            "block": "A Blok",
            "number": "DAİRE 14",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILIK",
            "slot": "a-bot-3"
          },
          {
            "id": "p7-2-b15",
            "block": "B Blok",
            "number": "DAİRE 15",
            "rooms": "2+1",
            "price": 4300000,
            "status": "SATILDI",
            "slot": "b-top-1"
          },
          {
            "id": "p7-2-b16",
            "block": "B Blok",
            "number": "DAİRE 16",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "b-top-2"
          },
          {
            "id": "p7-2-b17",
            "block": "B Blok",
            "number": "DAİRE 17",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILIK",
            "slot": "b-top-3"
          },
          {
            "id": "p7-2-b14",
            "block": "B Blok",
            "number": "DAİRE 14",
            "rooms": "1+1",
            "price": 3500000,
            "status": "SATILDI",
            "slot": "b-mid-1"
          },
          {
            "id": "p7-2-b10",
            "block": "B Blok",
            "number": "DAİRE 10",
            "rooms": "1+1",
            "price": 3500000,
            "status": "SATILIK",
            "slot": "b-mid-2"
          },
          {
            "id": "p7-2-b13",
            "block": "B Blok",
            "number": "DAİRE 13",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "b-bot-1"
          },
          {
            "id": "p7-2-b12",
            "block": "B Blok",
            "number": "DAİRE 12",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILIK",
            "slot": "b-bot-2"
          },
          {
            "id": "p7-2-b11",
            "block": "B Blok",
            "number": "DAİRE 11",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILIK",
            "slot": "b-bot-3"
          }
        ]
      }
    ]
  },
  {
    "id": "proje-demirturk-2etap",
    "name": "DEMİRTÜRK İNŞAAT [2. ETAP]",
    "subtitle": "KARASU DEMİRTÜRK İNŞAAT [2. ETAP]",
    "neighborhood": "Aşağıincilli Mah.",
    "adaParsel": "1325 Ada 1 Parsel",
    "deliveryDate": "15.07.2026",
    "paymentPlan": "24 AY ELDEN TAKSİTLİ / 2.000.000₺ PEŞİNAT",
    "templateType": "template-etap2",
    "compass": {
      "top": "KUZEY",
      "right": "DOĞU",
      "bottom": "GÜNEY",
      "left": "BATI"
    },
    "floors": [
      {
        "id": "zemin",
        "name": "ZEMİN KAT",
        "apartments": [
          {
            "id": "p8-z-a18",
            "block": "A Blok",
            "number": "DAİRE 18",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "a-top-1"
          },
          {
            "id": "p8-z-a19",
            "block": "A Blok",
            "number": "DAİRE 19",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "a-top-2"
          },
          {
            "id": "p8-z-a20",
            "block": "A Blok",
            "number": "DAİRE 20",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "a-top-3"
          },
          {
            "id": "p8-z-a24",
            "block": "A Blok",
            "number": "DAİRE 24",
            "rooms": "1+1",
            "price": 3500000,
            "status": "SATILDI",
            "slot": "a-mid-1"
          },
          {
            "id": "p8-z-a1",
            "block": "A Blok",
            "number": "DAİRE 1",
            "rooms": "1+1",
            "price": 3500000,
            "status": "SATILDI",
            "slot": "a-mid-2"
          },
          {
            "id": "p8-z-a23",
            "block": "A Blok",
            "number": "DAİRE 23",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "a-bot-1"
          },
          {
            "id": "p8-z-a22",
            "block": "A Blok",
            "number": "DAİRE 22",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "a-bot-2"
          },
          {
            "id": "p8-z-a21",
            "block": "A Blok",
            "number": "DAİRE 21",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "a-bot-3"
          },
          {
            "id": "p8-z-b19",
            "block": "B Blok",
            "number": "DAİRE 19",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "b-r1-c1"
          },
          {
            "id": "p8-z-b20",
            "block": "B Blok",
            "number": "DAİRE 20",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "b-r1-c2"
          },
          {
            "id": "p8-z-b2",
            "block": "B Blok",
            "number": "DAİRE 2",
            "rooms": "2+1",
            "price": 3700000,
            "status": "SATILDI",
            "slot": "b-r2-c1"
          },
          {
            "id": "p8-z-b21",
            "block": "B Blok",
            "number": "DAİRE 21",
            "rooms": "1+1",
            "price": 3500000,
            "status": "SATILDI",
            "slot": "b-r2-c2"
          },
          {
            "id": "p8-z-b1",
            "block": "B Blok",
            "number": "DAİRE 1",
            "rooms": "1+1",
            "price": 3500000,
            "status": "SATILDI",
            "slot": "b-r3-c1"
          },
          {
            "id": "p8-z-b22",
            "block": "B Blok",
            "number": "DAİRE 22",
            "rooms": "1+1",
            "price": 3500000,
            "status": "SATILDI",
            "slot": "b-r3-c2"
          },
          {
            "id": "p8-z-b24",
            "block": "B Blok",
            "number": "DAİRE 24",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "b-r4-c1"
          },
          {
            "id": "p8-z-b23",
            "block": "B Blok",
            "number": "DAİRE 23",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "b-r4-c2"
          }
        ]
      },
      {
        "id": "kat1",
        "name": "ARA KAT",
        "apartments": [
          {
            "id": "p8-1-a6",
            "block": "A Blok",
            "number": "DAİRE 6",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILDI",
            "slot": "a-top-1"
          },
          {
            "id": "p8-1-a7",
            "block": "A Blok",
            "number": "DAİRE 7",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "a-top-2"
          },
          {
            "id": "p8-1-a8",
            "block": "A Blok",
            "number": "DAİRE 8",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "a-top-3"
          },
          {
            "id": "p8-1-a5",
            "block": "A Blok",
            "number": "DAİRE 5",
            "rooms": "1+1",
            "price": 3500000,
            "status": "SATILDI",
            "slot": "a-mid-1"
          },
          {
            "id": "p8-1-a9",
            "block": "A Blok",
            "number": "DAİRE 9",
            "rooms": "1+1",
            "price": 3500000,
            "status": "SATILDI",
            "slot": "a-mid-2"
          },
          {
            "id": "p8-1-a4",
            "block": "A Blok",
            "number": "DAİRE 4",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILDI",
            "slot": "a-bot-1"
          },
          {
            "id": "p8-1-a3",
            "block": "A Blok",
            "number": "DAİRE 3",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "a-bot-2"
          },
          {
            "id": "p8-1-a2",
            "block": "A Blok",
            "number": "DAİRE 2",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "a-bot-3"
          },
          {
            "id": "p8-1-b5",
            "block": "B Blok",
            "number": "DAİRE 5",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "b-r1-c1"
          },
          {
            "id": "p8-1-b6",
            "block": "B Blok",
            "number": "DAİRE 6",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "b-r1-c2"
          },
          {
            "id": "p8-1-b4",
            "block": "B Blok",
            "number": "DAİRE 4",
            "rooms": "2+1",
            "price": 3900000,
            "status": "SATILDI",
            "slot": "b-r2-c1"
          },
          {
            "id": "p8-1-b7",
            "block": "B Blok",
            "number": "DAİRE 7",
            "rooms": "2+1",
            "price": 4300000,
            "status": "SATILIK",
            "slot": "b-r2-c2"
          },
          {
            "id": "p8-1-b3",
            "block": "B Blok",
            "number": "DAİRE 3",
            "rooms": "1+1",
            "price": 3300000,
            "status": "SATILDI",
            "slot": "b-r3-c1"
          },
          {
            "id": "p8-1-b8",
            "block": "B Blok",
            "number": "DAİRE 8",
            "rooms": "1+1",
            "price": 3500000,
            "status": "SATILDI",
            "slot": "b-r3-c2"
          },
          {
            "id": "p8-1-b10",
            "block": "B Blok",
            "number": "DAİRE 10",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "b-r4-c1"
          },
          {
            "id": "p8-1-b9",
            "block": "B Blok",
            "number": "DAİRE 9",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "b-r4-c2"
          }
        ]
      },
      {
        "id": "kat2",
        "name": "ÜST KAT",
        "apartments": [
          {
            "id": "p8-2-a14",
            "block": "A Blok",
            "number": "DAİRE 14",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILDI",
            "slot": "a-top-1"
          },
          {
            "id": "p8-2-a15",
            "block": "A Blok",
            "number": "DAİRE 15",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "a-top-2"
          },
          {
            "id": "p8-2-a16",
            "block": "A Blok",
            "number": "DAİRE 16",
            "rooms": "2+1",
            "price": 3700000,
            "status": "SATILDI",
            "slot": "a-top-3"
          },
          {
            "id": "p8-2-a13",
            "block": "A Blok",
            "number": "DAİRE 13",
            "rooms": "1+1",
            "price": 3500000,
            "status": "SATILDI",
            "slot": "a-mid-1"
          },
          {
            "id": "p8-2-a17",
            "block": "A Blok",
            "number": "DAİRE 17",
            "rooms": "1+1",
            "price": 3500000,
            "status": "SATILDI",
            "slot": "a-mid-2"
          },
          {
            "id": "p8-2-a12",
            "block": "A Blok",
            "number": "DAİRE 12",
            "rooms": "2+1",
            "price": 4750000,
            "status": "SATILDI",
            "slot": "a-bot-1"
          },
          {
            "id": "p8-2-a11",
            "block": "A Blok",
            "number": "DAİRE 11",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "a-bot-2"
          },
          {
            "id": "p8-2-a10",
            "block": "A Blok",
            "number": "DAİRE 10",
            "rooms": "2+1",
            "price": 4300000,
            "status": "SATILDI",
            "slot": "a-bot-3"
          },
          {
            "id": "p8-2-b13",
            "block": "B Blok",
            "number": "DAİRE 13",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "b-r1-c1"
          },
          {
            "id": "p8-2-b14",
            "block": "B Blok",
            "number": "DAİRE 14",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "b-r1-c2"
          },
          {
            "id": "p8-2-b12",
            "block": "B Blok",
            "number": "DAİRE 12",
            "rooms": "2+1",
            "price": 3900000,
            "status": "SATILDI",
            "slot": "b-r2-c1"
          },
          {
            "id": "p8-2-b15",
            "block": "B Blok",
            "number": "DAİRE 15",
            "rooms": "2+1",
            "price": 3900000,
            "status": "SATILDI",
            "slot": "b-r2-c2"
          },
          {
            "id": "p8-2-b11",
            "block": "B Blok",
            "number": "DAİRE 11",
            "rooms": "1+1",
            "price": 3500000,
            "status": "SATILDI",
            "slot": "b-r3-c1"
          },
          {
            "id": "p8-2-b16",
            "block": "B Blok",
            "number": "DAİRE 16",
            "rooms": "1+1",
            "price": 3500000,
            "status": "SATILDI",
            "slot": "b-r3-c2"
          },
          {
            "id": "p8-2-b18",
            "block": "B Blok",
            "number": "DAİRE 18",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "b-r4-c1"
          },
          {
            "id": "p8-2-b17",
            "block": "B Blok",
            "number": "DAİRE 17",
            "rooms": "2+1",
            "price": 4500000,
            "status": "SATILDI",
            "slot": "b-r4-c2"
          }
        ]
      }
    ]
  }
];

if (typeof window !== "undefined") {
  window.INITIAL_PROJECTS = INITIAL_PROJECTS;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { INITIAL_PROJECTS };
}


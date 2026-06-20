const basePrices = [
  {
    id: 1,
    companyId: 1,
    company: "SJC",
    name: "Vàng SJC 1L, 10L, 1KG",
    area: "Hà Nội",
    buy: 15600000,
    sell: 15800000,
    buyChange: -170000,
    sellChange: -170000,
    updatedAt: "03/06/2026 15:30",
  },
  {
    id: 2,
    companyId: 1,
    company: "SJC",
    name: "Vàng SJC 5 chỉ",
    area: "Hà Nội",
    buy: 15600000,
    sell: 15802000,
    buyChange: -170000,
    sellChange: -170000,
    updatedAt: "03/06/2026 15:30",
  },
  {
    id: 3,
    companyId: 1,
    company: "SJC",
    name: "Vàng SJC 0.5 chỉ, 1 chỉ, 2 chỉ",
    area: "Hà Nội",
    buy: 15600000,
    sell: 15780000,
    buyChange: -170000,
    sellChange: -170000,
    updatedAt: "03/06/2026 15:30",
  },
  {
    id: 4,
    companyId: 1,
    company: "SJC",
    name: "Vàng nhẫn SJC 99,99%",
    area: "Hà Nội",
    buy: 15110000,
    sell: 15350000,
    buyChange: -200000,
    sellChange: -180000,
    updatedAt: "03/06/2026 15:30",
  },
  {
    id: 5,
    companyId: 2,
    company: "DOJI",
    name: "Vàng miếng DOJI",
    area: "Hà Nội",
    buy: 15580000,
    sell: 15790000,
    buyChange: -120000,
    sellChange: -130000,
    updatedAt: "03/06/2026 15:28",
  },
  {
    id: 6,
    companyId: 2,
    company: "DOJI",
    name: "Nhẫn tròn DOJI Hưng Thịnh Vượng",
    area: "Hà Nội",
    buy: 15080000,
    sell: 15320000,
    buyChange: -90000,
    sellChange: -100000,
    updatedAt: "03/06/2026 15:28",
  },
  {
    id: 7,
    companyId: 3,
    company: "PNJ",
    name: "Vàng miếng PNJ",
    area: "Hà Nội",
    buy: 15490000,
    sell: 15710000,
    buyChange: 80000,
    sellChange: 50000,
    updatedAt: "03/06/2026 15:20",
  },
  {
    id: 8,
    companyId: 3,
    company: "PNJ",
    name: "Nhẫn trơn PNJ 9999",
    area: "Hà Nội",
    buy: 15050000,
    sell: 15280000,
    buyChange: 70000,
    sellChange: 60000,
    updatedAt: "03/06/2026 15:20",
  },
];
const mockCompanies = [
  { id: 1, code: "SJC", name: "Vàng Bạc Đá Quý Sài Gòn" },
  { id: 2, code: "DOJI", name: "Tập đoàn Vàng bạc Đá quý DOJI" },
  { id: 3, code: "PNJ", name: "Công ty Vàng bạc Đá quý Phú Nhuận" },
];
const mockAreas = ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Cần Thơ", "Hải Phòng", "Nha Trang"];
const mockProducts = [
  "Vàng miếng",
  "Vàng nhẫn",
  "Vàng 1 chỉ",
  "Vàng 2 chỉ",
  "Vàng 5 chỉ",
  "Vàng 1 lượng",
  "Vàng thần tài",
  "Vàng nữ trang",
  "Vàng 24K",
  "Vàng 18K",
];
const generatedPrices = [];
let nextId = 9;
mockCompanies.forEach((c) => {
  mockAreas.forEach((area) => {
    mockProducts.forEach((p, i) => {
      const buy = 14500000 + c.id * 200000 + i * 45000;
      const sell = buy + 250000 + i * 12000;
      generatedPrices.push({
        id: nextId++,
        companyId: c.id,
        company: c.code,
        name: `${p} ${c.code}`,
        area,
        buy,
        sell,
        buyChange: i % 2 === 0 ? -50000 - i * 5000 : 40000 + i * 5000,
        sellChange: i % 2 === 0 ? -45000 - i * 5000 : 35000 + i * 5000,
        updatedAt: "03/06/2026 15:30",
      });
    });
  });
});
const createChartData = ({ days, startBuy, startSell, buyStep, sellStep }) =>
  Array.from({ length: days }, (_, i) => {
    const day = days === 7 ? 28 + i : days === 15 ? 20 + i : 5 + i;
    const isNext = day > 31;
    return {
      date: `${String(isNext ? day - 31 : day).padStart(2, "0")}/${isNext ? "06" : "05"}`,
      buy: startBuy + i * buyStep,
      sell: startSell + i * sellStep,
    };
  });
export const goldMockData = {
  home: {
    title: "Giá vàng hôm nay",
    subtitle: "Cập nhật giá vàng SJC, DOJI, PNJ theo dữ liệu mock",
    updatedAt: "03/06/2026 15:30",
    today: "03/06/2026",
    featuredCompanies: [
      {
        id: 1,
        code: "SJC",
        name: "Vàng Bạc Đá Quý Sài Gòn",
        buy: 15600000,
        sell: 15800000,
        buyChange: -170000,
        sellChange: -170000,
      },
      {
        id: 2,
        code: "DOJI",
        name: "Tập đoàn Vàng bạc Đá quý DOJI",
        buy: 15580000,
        sell: 15790000,
        buyChange: -120000,
        sellChange: -130000,
      },
      {
        id: 3,
        code: "PNJ",
        name: "Công ty Vàng bạc Đá quý Phú Nhuận",
        buy: 15490000,
        sell: 15710000,
        buyChange: 80000,
        sellChange: 50000,
      },
      
    ],

     featureMarketOverview: [
      {
        id: 1,
        code: "SJC",
        name: "Vàng Bạc Đá Quý Sài Gòn",
        buy: 15600000,
        sell: 15800000,
        buyChange: -170000,
        sellChange: -170000,
      },
      {
        id: 2,
        code: "DOJI",
        name: "Tập đoàn Vàng bạc Đá quý DOJI",
        buy: 15580000,
        sell: 15790000,
        buyChange: -120000,
        sellChange: -130000,
      },
      {
        id: 3,
        code: "PNJ",
        name: "Công ty Vàng bạc Đá quý Phú Nhuận",
        buy: 15490000,
        sell: 15710000,
        buyChange: 80000,
        sellChange: 50000,
      },
      {
        id: 4,
        code: "BTMC",
        name: "Công ty TNHH BẢO TÍN MINH CHÂU",
        buy: 15490000,
        sell: 15710000,
        buyChange: 80000,
        sellChange: 50000,
      },
      {
        id: 5,
        code: "BTMH",
        name: "Công ty TNHH BẢO TÍN MẠNH HẢI",
        buy: 15490000,
        sell: 15710000,
        buyChange: 80000,
        sellChange: 50000,
      },
      
    ],

   
  },
  companies: [
    {
      id: 1,
      code: "SJC",
      name: "Vàng Bạc Đá Quý Sài Gòn",
      fullName: "Công ty TNHH MTV Vàng bạc Đá quý Sài Gòn",
      website: "https://sjc.com.vn",
      phone: "028 3929 3388",
      address: "Hà Nội",
    },
    {
      id: 2,
      code: "DOJI",
      name: "Tập đoàn Vàng bạc Đá quý DOJI",
      fullName: "DOJI Gold & Gems Group",
      website: "https://doji.vn",
      phone: "1900 1168",
      address: "Hà Nội",
    },
    {
      id: 3,
      code: "PNJ",
      name: "Công ty Vàng bạc Đá quý Phú Nhuận",
      fullName: "Phu Nhuan Jewelry Joint Stock Company",
      website: "https://pnj.com.vn",
      phone: "1800 5454 57",
      address: "Hà Nội",
    },
  ],
  prices: [...basePrices, ...generatedPrices],
  sjcCharts: {
    7: createChartData({
      days: 7,
      startBuy: 16400000,
      startSell: 16500000,
      buyStep: -133000,
      sellStep: -116000,
    }),
    15: createChartData({
      days: 15,
      startBuy: 16600000,
      startSell: 16700000,
      buyStep: -71000,
      sellStep: -64000,
    }),
    30: createChartData({
      days: 30,
      startBuy: 16800000,
      startSell: 16900000,
      buyStep: -41000,
      sellStep: -38000,
    }),
  },
  forecasts: (() => {
  const companies = [
    {
      id: 1,
      code: "SJC",
      name: "Vàng Bạc Đá Quý Sài Gòn",
    },
    {
      id: 2,
      code: "DOJI",
      name: "Tập đoàn Vàng bạc Đá quý DOJI",
    },
    {
      id: 3,
      code: "PNJ",
      name: "Công ty Vàng bạc Đá quý Phú Nhuận",
    },
    {
      id: 4,
      code: "BTMC",
      name: "Bảo Tín Minh Châu",
    },
  ];

  const goldTypes = [
    "Vàng SJC 1L,10L,1KG",
    "Vàng SJC 5 chỉ",
    "Vàng SJC 0.5 chỉ",
    "Vàng nhẫn 9999",
    "Nhẫn ép vỉ",
    "Nhẫn trơn",
    "Nữ trang 9999",
    "Nữ trang 99%",
    "Nữ trang 75%",
    "Nữ trang 68%",
    "Nữ trang 61%",
    "Nữ trang 58.3%",
  ];

  const result = [];

  companies.forEach((company) => {
    for (let i = 1; i <= 30; i++) {
      goldTypes.forEach((goldType, index) => {
        const isUp = (i + index) % 3 !== 0;

        const buy =
          14500000 +
          company.id * 250000 +
          index * 50000 +
          i * 15000;

        const sell =
          buy +
          180000 +
          index * 5000;

        result.push({
          companyId: company.id,

          companyCode: company.code,

          companyName: company.name,

          goldType: `${company.code.toLowerCase()}-${index}-${i}`,

          goldTypeName:
            i === 1
              ? goldType
              : `${goldType} mẫu ${i}`,

          date: "11/06/2026",

          buy,

          sell,

          buyChange: isUp
            ? 30000 + i * 1500
            : -(20000 + i * 1000),

          sellChange: isUp
            ? 35000 + i * 1500
            : -(25000 + i * 1000),

          confidence: Math.max(
            70,
            95 - (i % 15)
          ),

          trend: isUp ? "UP" : "DOWN",

          note: `Dự báo dựa trên lịch sử biến động của ${goldType}.`,
        });
      });
    }

    return company;
  });

  return result;
})(),

  goldTypes: [
  {
    id: "sjc-gold-bar",
    companyId: 1,
    label: "SJC vàng miếng",
  },
  {
    id: "sjc-ring",
    companyId: 1,
    label: "SJC vàng nhẫn",
  },
  {
    id: "sjc-jewelry-9999",
    companyId: 1,
    label: "SJC nữ trang 9999",
  },
  {
    id: "doji-gold-bar",
    companyId: 2,
    label: "DOJI vàng miếng",
  },
  {
    id: "doji-ring",
    companyId: 2,
    label: "DOJI nhẫn tròn",
  },
  {
    id: "pnj-gold-bar",
    companyId: 3,
    label: "PNJ vàng miếng",
  },
  {
    id: "pnj-ring",
    companyId: 3,
    label: "PNJ nhẫn trơn 9999",
  },
],

  news: [
    {
      id: 1,
      title: "Giá vàng trong nước biến động mạnh",
      summary:
        "Thị trường vàng ghi nhận nhiều phiên biến động do ảnh hưởng từ tỷ giá và giá vàng thế giới.",
      publishedAt: "03/06/2026",
    },
    {
      id: 2,
      title: "Nhu cầu vàng nhẫn tiếp tục tăng",
      summary: "Vàng nhẫn 9999 được nhiều nhà đầu tư cá nhân quan tâm vì biên độ mua bán thấp hơn.",
      publishedAt: "02/06/2026",
    },
    {
      id: 3,
      title: "Nhà đầu tư thận trọng khi giá vàng cao",
      summary: "Chuyên gia khuyến nghị chia nhỏ vốn và theo dõi sát biến động trước khi mua bán.",
      publishedAt: "01/06/2026",
    },
  ],
};

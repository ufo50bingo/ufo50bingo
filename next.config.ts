import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  async redirects() {
    return [
      {
        source: "/league",
        destination:
          "https://docs.google.com/spreadsheets/d/1ptNQfJw39CCtHBrGldZ8ln0OrTUUSjAw8QVQHQI1LBU/edit?usp=sharing",
        permanent: true,
      },
      {
        source: "/signup",
        destination:
          "https://docs.google.com/forms/d/e/1FAIpQLSfXdceuQF1_5mh-mBmwLp6uhk_S0GlMHzjvs0aiP-v3fbumFA/viewform",
        permanent: true,
      },
      {
        source: "/underground",
        destination:
          "https://docs.google.com/spreadsheets/d/1OocDHEbrJC3BqO8qrPFCYxyy2nzqAaTT6Hmix076Ea0/edit?gid=467172056#gid=467172056",
        permanent: true,
      },
      {
        source: "/spicy",
        destination:
          "https://docs.google.com/spreadsheets/d/1oQktL5q8eVWrI_Zbacjv-supFhuQI4h63tiVcMkan4E/edit?gid=1916787881#gid=1916787881",
        permanent: true,
      },
      {
        source: "/cast/:id",
        destination: "/room/:id",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

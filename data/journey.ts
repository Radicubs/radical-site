export type JourneySeason = {
  year: number;
  game: string;
  summary: string;
  record: string;
  districtRank?: string;
  awards: string[];
  image?: string;
  imageNote?: string;
  tbaUrl: string;
};

export const journeySeasons: JourneySeason[] = [
  {
    year: 2019,
    game: "Destination: Deep Space",
    summary: "Our first season took us to Greenville and Plano. We finished as the highest-seeded rookie at both events.",
    record: "10–14 official",
    districtRank: "FIT #105",
    awards: ["Rookie All Star at Greenville", "Highest Rookie Seed at Greenville", "Highest Rookie Seed at Plano", "Rookie Inspiration Award at Plano"],
    image: "https://i.imgur.com/VEdyLge.jpeg",
    tbaUrl: "https://www.thebluealliance.com/team/7503/2019"
  },
  {
    year: 2020,
    game: "Infinite Recharge",
    summary: "We captained an alliance at Plano, a big step up from our rookie year. Then COVID cut the season short.",
    record: "9–6 official",
    districtRank: "FIT #55",
    awards: ["Entrepreneurship Award at Plano"],
    image: "https://i.imgur.com/AAs9W3i.jpeg",
    tbaUrl: "https://www.thebluealliance.com/team/7503/2020"
  },
  {
    year: 2021,
    game: "Infinite Recharge At Home",
    summary: "There were no in-person events, so we took on the at-home and innovation challenges instead. We placed 18th in the Sodium Group.",
    record: "At-home season",
    awards: [],
    imageNote: "No robot photo from 2021.",
    tbaUrl: "https://www.thebluealliance.com/team/7503/2021"
  },
  {
    year: 2022,
    game: "Rapid React",
    summary: "It felt good to be back at events. We made the playoffs at Fort Worth.",
    record: "9–20 official",
    districtRank: "FIT #100",
    awards: ["Gracious Professionalism Award at Irving"],
    imageNote: "No robot photo from 2022 on The Blue Alliance yet.",
    tbaUrl: "https://www.thebluealliance.com/team/7503/2022"
  },
  {
    year: 2023,
    game: "Charged Up",
    summary: "We played three events, captained Alliance 8 in Dallas, and qualified for the FIRST in Texas District Championship.",
    record: "14–26 official",
    districtRank: "FIT #80",
    awards: ["Judges’ Award at Fort Worth"],
    imageNote: "Our 2023 photos are on Instagram, not The Blue Alliance.",
    tbaUrl: "https://www.thebluealliance.com/team/7503/2023"
  },
  {
    year: 2024,
    game: "Crescendo",
    summary: "We returned to the district championship and picked up Team Spirit Awards in Plano and Fort Worth. Counting the offseason, we played five events.",
    record: "17–25 official",
    districtRank: "FIT #79",
    awards: ["Team Spirit Award at Plano", "Team Spirit Award at Fort Worth"],
    imageNote: "No robot photo from 2024 on The Blue Alliance yet.",
    tbaUrl: "https://www.thebluealliance.com/team/7503/2024"
  },
  {
    year: 2025,
    game: "Reefscape",
    summary: "We competed in Belton and Fort Worth. At Belton, we won the Team Sustainability Award for the work that keeps our team going year after year.",
    record: "8–16 official",
    districtRank: "FIT #167",
    awards: ["Team Sustainability Award at Belton"],
    image: "https://i.imgur.com/p9N0L1A.jpeg",
    tbaUrl: "https://www.thebluealliance.com/team/7503/2025"
  },
  {
    year: 2026,
    game: "Rebuilt",
    summary: "Our strongest district-points season in years took us to the Mercury Division at the district championship. We also earned Creativity and Team Spirit Awards.",
    record: "21–22 official",
    districtRank: "FIT #61",
    awards: ["Team Spirit Award at Fort Worth", "Creativity Award at Farmersville"],
    image: "https://i.imgur.com/QOM5kgx.jpeg",
    tbaUrl: "https://www.thebluealliance.com/team/7503/2026"
  }
];

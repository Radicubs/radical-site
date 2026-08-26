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
    summary: "Radicubs entered FRC as a rookie team and immediately established a competitive foundation across two Texas district events.",
    record: "10–14 official",
    districtRank: "FIT #105",
    awards: ["Rookie All Star at Greenville", "Highest Rookie Seed at Greenville", "Highest Rookie Seed at Plano", "Rookie Inspiration Award at Plano"],
    image: "https://i.imgur.com/VEdyLge.jpeg",
    tbaUrl: "https://www.thebluealliance.com/team/7503/2019"
  },
  {
    year: 2020,
    game: "Infinite Recharge",
    summary: "The team made a major competitive step forward, captaining an alliance at Plano before the remainder of the season was disrupted.",
    record: "9–6 official",
    districtRank: "FIT #55",
    awards: ["Entrepreneurship Award at Plano"],
    image: "https://i.imgur.com/AAs9W3i.jpeg",
    tbaUrl: "https://www.thebluealliance.com/team/7503/2020"
  },
  {
    year: 2021,
    game: "Infinite Recharge At Home",
    summary: "With normal events paused, Radicubs continued through the at-home and innovation challenge formats and finished 18th in the Sodium Group challenge.",
    record: "At-home season",
    awards: [],
    imageNote: "The Blue Alliance has no robot photo for Team 7503 in 2021.",
    tbaUrl: "https://www.thebluealliance.com/team/7503/2021"
  },
  {
    year: 2022,
    game: "Rapid React",
    summary: "Radicubs returned to full in-person competition, reached the Fort Worth playoffs, and rebuilt the team’s event rhythm after the at-home season.",
    record: "9–20 official",
    districtRank: "FIT #100",
    awards: ["Gracious Professionalism Award at Irving"],
    imageNote: "The Blue Alliance currently asks users to add a robot image for Team 7503 in 2022.",
    tbaUrl: "https://www.thebluealliance.com/team/7503/2022"
  },
  {
    year: 2023,
    game: "Charged Up",
    summary: "The team expanded its competitive footprint to three official events, captained Alliance 8 in Dallas, and reached the FIRST In Texas District Championship.",
    record: "14–26 official",
    districtRank: "FIT #80",
    awards: ["Judges’ Award at Fort Worth"],
    imageNote: "TBA lists 2023 media as an Instagram embed rather than a direct robot image.",
    tbaUrl: "https://www.thebluealliance.com/team/7503/2023"
  },
  {
    year: 2024,
    game: "Crescendo",
    summary: "Radicubs reached the district championship again and earned Team Spirit honors at both Plano and Fort Worth during a broader five-event season including offseason play.",
    record: "17–25 official",
    districtRank: "FIT #79",
    awards: ["Team Spirit Award at Plano", "Team Spirit Award at Fort Worth"],
    imageNote: "The Blue Alliance currently has no photos or videos for Team 7503’s 2024 season.",
    tbaUrl: "https://www.thebluealliance.com/team/7503/2024"
  },
  {
    year: 2025,
    game: "Reefscape",
    summary: "The team continued developing its engineering and organizational systems across Belton and Fort Worth, earning recognition for long-term sustainability.",
    record: "8–16 official",
    districtRank: "FIT #167",
    awards: ["Team Sustainability Award at Belton"],
    image: "https://i.imgur.com/p9N0L1A.jpeg",
    tbaUrl: "https://www.thebluealliance.com/team/7503/2025"
  },
  {
    year: 2026,
    game: "Rebuilt",
    summary: "Radicubs produced its strongest recent district-points season, reached the Mercury Division at the FIRST In Texas District Championship, and added both creativity and team-spirit honors.",
    record: "21–22 official",
    districtRank: "FIT #61",
    awards: ["Team Spirit Award at Fort Worth", "Creativity Award at Farmersville"],
    image: "https://i.imgur.com/QOM5kgx.jpeg",
    tbaUrl: "https://www.thebluealliance.com/team/7503/2026"
  }
];

export type BlogImage = { src: string; alt: string };
export type BlogBlock =
  | { kind: "text"; text: string }
  | { kind: "code"; code: string; lang?: string }
  | { kind: "list"; ordered: boolean; items: string[] }
  | { kind: "image"; src: string; alt: string };
export type BlogSection = { heading: string; paragraphs: string[]; images?: BlogImage[]; blocks?: BlogBlock[] };
export type BlogPost = {
  slug: string;
  date: string;
  title: string;
  excerpt: string;
  cover?: string;
  sections?: BlogSection[];
  sourceUrl?: string;
  external?: boolean;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "week-8-rebuilt-2026",
    date: "March 2, 2026",
    title: "Week 8 | REBUILT™ 2026",
    excerpt: "2026 Build Season Week 8",
    cover: "/blog/pxl_20260301_230136982_720_466f4eef51.jpg",
    sections: [
      { heading: "Mechanical", paragraphs: ["This week, we disassembled Chimera V1 and began construction on our rebuilt robot. We marked and prepared a new electrical board and repositioned the belly pan lower using 1.5-inch standoffs to better clear the intake belts. By the end of the week, we had the intake and transfer half-built, completed a new 90-degree gearbox, and got the pivot working, which was a major milestone for the team!", "Next week, we hope to finish assembling the intake and transfer, mount the shooter, and continue wiring the robot."] },
      { heading: "Programming", paragraphs: ["This week, our programming team focused on debugging the transfer system and reconfiguring components to fit the new robot constraints. With the rebuild underway, the team stayed focused on preparing our software systems so they would be ready the moment the hardware came together.", "We look forward to getting the robot fully wired and beginning subsystem testing next week!"] },
      { heading: "Business & Media", paragraphs: ["This week, our team focused on contacting STEM professionals to host a FIRST Ladies event."] }
    ]
  },
  {
    slug: "week-7-rebuilt-2026",
    date: "February 28, 2026",
    title: "Week 7 | REBUILT™ 2026",
    excerpt: "2026 Build Season Week 7",
    cover: "/blog/IMG_1142_49277160a9.jpg",
    sections: [
      { heading: "Mechanical & CAD", paragraphs: ["This week, we acquired SRPP and rigorously tested our robot to find potential faults that need to be fixed in Chimera V2. We also designed and built a telescoping arm that we may attach to the robot in the future. In addition, we improved our CAD for multiple subsystems, which include the shooter, intake, and transfer. A belly pan was also manufactured, and we completed shooter testing along with driving practice.", "Next week, we hope to finish assembling the robot and complete manufacturing all the remaining parts."] },
      { heading: "Programming", paragraphs: ["This week, our programming team focused primarily on tuning PID for all of our subsystems. While untuned, our shooter was slightly inconsistent, which was a major concern as shooting consistency is one of the top priorities for our robot. After our programming team tuned PID and feedforward values, shooting accuracy became much more consistent. We saw similar improvements in smoothness after PID and feedforward tuning in our intake and transfer subsystems.", "With us starting construction of our final robot next week, we look forward to planning and setting up the new electrical board configuration."] },
      { heading: "Business & Media", paragraphs: ["Our team focused on creating posts to gain points towards our FIRST Ladies regional partnership, submitting grants, and updating our Instagram page."] }
    ]
  },
  {
    slug: "week-6-rebuilt-2026",
    date: "February 21, 2026",
    title: "Week 6 | REBUILT™ 2026",
    excerpt: "2026 Build Season Week 6",
    cover: "/blog/Screenshot_2026_02_23_at_8_20_17_PM_4c46cf9b51.png",
    sections: [
      { heading: "Mechanical", paragraphs: ["This week, we completed several major subsystems that includes our double-barrel shooter, tri-roller intake, and indexer system. We also designed and manufactured custom pulleys for both the intake and indexer systems. We've encountered a lot of trial and error with our intake system, and it requires more improvements. In addition, we built a test bumper and began re-brainstorming our climb mechanism design.", "With the shooter, intake, and indexer now added to the robot, it is mostly playable. Over the next few weeks, we plan to refine and tune our shooter. Our next goals include adding an expandable hopper and incorporating a fully functional climb system into the robot."] },
      { heading: "Programming", paragraphs: ["This week, our programming team focused primarily on wiring the robot chassis. With the new addition of the shooter and transfer systems, we had a lot of new components to make functional. After cleaning up the wiring for our swerve, we finished the necessary wiring to make intake, transfer, and shooter work! After this, we took our robot for a test drive, where it worked very well.", "Next, our programming team can look forward to actually programming these new subsystems, along with further development of our autonomous paths."] },
      { heading: "Business & Media", paragraphs: ["We are currently working on our impact board designs. Additionally, we are working on ordering team merch of shirts and sweatshirts! We posted more content on our Instagram and Tiktok page. Follow @radicubs!"] }
    ]
  },
  {
    slug: "week-5-rebuilt-2026",
    date: "February 14, 2026",
    title: "Week 5 | REBUILT™ 2026",
    excerpt: "2026 Build Season Week 5",
    cover: "/blog/img_0914_25f074c5be.jpg",
    sections: [
      { heading: "Mechanical", paragraphs: ["This week, we finalized our chassis size and began building our bumper. We also completed a working intake mechanism and started improving our shooter. For the intake, we will use a three-roller over the bumper design; we added an extra roller to help guide the game piece over our high bumper more smoothly.", "Our shooter will be a double-barreled design, and after several adjustments, we refined it to achieve better intake and shooting performance. Both the shooter and intake will run on belts with custom-made pulleys. For our transfer system, we will also be using belts. In addition, we fully completed all field elements and prototyped a climb mechanism."] },
      { heading: "Programming", paragraphs: ["This week, our programming team focused more on electrical, and mechanical engineering tasks. We helped out the mechanical team with a variety of different tasks, and we primarily focused on wiring the electronics within the robot so it can properly function. As we knew the layout of the electronics would most likely be subject to change due to the likely change of our robot design, we wired the robot with this in mind, making sure it would be easy to reconfigure later.", "We hope to finalize the wiring of our robot, so we can soon begin programming our new subsystems!"] },
      { heading: "Business & Media", paragraphs: ["We finished working on our Impact responses and submitted! We have begun working on our presentation and creating our boards."] }
    ]
  },
  {
    slug: "week-4-rebuilt-2026",
    date: "February 7, 2026",
    title: "Week 4 | REBUILT™ 2026",
    excerpt: "2026 Build Season Week 4",
    cover: "/blog/IMG_3339_d5fd783599.PNG",
    sections: [
      { heading: "Mechanical & CAD", paragraphs: ["This week, we solidified systems such as intake and shooter. We began cutting our final intake system and are almost done with assembly. With the intake and shooter coming together, our next focus was the indexing system. We decided to use belts and pulleys running across the entire mid-section of our chassis. CAD was a major point of focus this week as we made our designs precise. We added our redesigned intake system into CAD and worked through issues such as mounting it onto our chassis.", "We also added supports for our shooter and planned out the placement for electrical components."] },
      { heading: "Programming", paragraphs: ["This week, our programming subteam continued working on path planning/ autos algorithms, modifying our hub lock-on code to lock on to April tags (making it extremely useful for competition), and fixing some vision odometry issues. Though our programming progress was limited due to priority focus on mechanical tasks, like prototyping and testing, we plan to continue working to perfect our hub lock-on, and to continue our path planning progress."] },
      { heading: "Business & Media", paragraphs: ["This week, our subteam finished creating our shirt and sweatshirt designs and posted content on Instagram. We also started working on our Impact Award Submission!"] }
    ]
  },
  {
    slug: "week-3-rebuilt-2026",
    date: "January 31, 2026",
    title: "Week 3 | REBUILT™ 2026",
    excerpt: "2026 Build Season Week 3",
    cover: "/blog/Screenshot_2026_02_02_at_7_04_19_PM_fc3a4f10b9.png",
    sections: [
      { heading: "Mechanical & CAD", paragraphs: ["Despite the harsh weather this week, the mechanical team made strong progress across several subsystems! We refocused and efficiently designed multiple working prototypes. We faced challenges with dimension limitations with our intake system, so we refined it through adjustments and by adding a motorized bottom roller. This resulted in a more compact, reliable build that prevented game pieces from getting stuck.", "Simultaneously, the team finished assembling field elements, including the hub and bump, which allowed us to test our shooter mechanism! We also developed an early indexer mechanism using belts and pulleys.", "The team also continued shooter development, testing different configurations to improve consistency and performance. Shooter prototyping advanced significantly, improving scoring flexibility and allowing for controlled passing. We also started testing pneumatics, which were successfully tested using a simple control setup. Overall, the mechanical team ended the week with multiple working prototypes and a clearer path toward final designs!", "This week, our CAD team completed detailed models for several of our major subsystems. While working closely with the mechanical subteam and iterating through multiple intake concepts, we decided on a design that best balanced performance and ease of integration. CAD has also completed designing our storage system, drawing inspiration from Ri3D teams and proven designs such as Team 254’s 2017 robot. Shooter development also progressed, with the team successfully designing a motorized dual shooter."] },
      { heading: "Programming", paragraphs: ["After last week’s completion and implementation of swerve onto our new robot, we focused primarily on Photonvision this week. We calibrated our new camera, and started thinking about an automatic hub-based rotation system using April tags, designed to aid our shooting accuracy. We also made some important fixes, such as fixing deprecations in our logging and vision scripts, and verifying the health of our robot batteries for competition."] },
      { heading: "Business & Media", paragraphs: ["This week, the business sub-team remained hard at work on writing grants, submitting two grants. Additionally, we worked on revising two more grants to submit next week. Media has been active with creating content and is posting consistently. Along with content creation, we are almost done with designing this year’s merchandise! Soon, we’ll begin preparing for the Impact Award Submission and presentation!"] }
    ]
  },
  {
    slug: "week-2-rebuilt-2026",
    date: "January 24, 2026",
    title: "Week 2 | REBUILT™ 2026",
    excerpt: "2026 Build Season Week 2",
    cover: "/blog/Screenshot_2026_01_25_at_3_51_06_PM_4931e0655f.png",
    sections: [
      { heading: "Mechanical & CAD", paragraphs: ["Refining our prototypes was our biggest focus this week. After finishing our intake system from last week, we looked into how to integrate and mount it on our chassis. We drew inspiration from WCP’s robot and its rotating intake! Our shooter went through multiple rounds of modification as we designed both a rotating shooter and double-barrel shooter. We also revised our original prototype from last week, changing wheel diameter, spacing, and shaft placement to improve consistency.", "As for our field, we began working on the bump and almost finished building the hub. We have also made progress on our robot cart! With Joel’s guidance, we have completely finished the bottom deck with wheels and researched handle types."] },
      { heading: "Programming", paragraphs: ["After last week’s completion and implementation of swerve onto our new robot, we focused primarily on Photonvision this week. We calibrated our new camera, and started thinking about an automatic hub-based rotation system using April tags, designed to aid our shooting accuracy. We also made some important fixes, such as fixing deprecations in our logging and vision scripts, and verifying the health of our robot batteries for competition."] },
      { heading: "Business & Media", paragraphs: ["With most of the team focused on mechanical and programming work, our business sub team stayed active as well! This week, we centered on funding and branding. We worked on grant applications and submitted three. We also began designing our T-shirts for this year!"] }
    ]
  },
  {
    slug: "week-1-rebuilt-2026",
    date: "January 17, 2026",
    title: "Week 1 | REBUILT™ 2026",
    excerpt: "2026 Build Season Week 1",
    cover: "/blog/IMG_3058_a17e1df5f1.PNG",
    sections: [
      { heading: "Kickoff", paragraphs: ["Kickoff went smoothly this year! Alumni and mentors joined us bringing experience and fresh perspective. After the game animation, our kickoff crew came back from Plano ISD Academy and all our members dissected the game manual and presented each section. Members shared ideas freely and built off each other’s thoughts! Canes also sponsored us by providing sweet tea, keeping us fueled through long discussions!", "We also added these 3D printed safety glasses holders in our workspace!"] },
      { heading: "Mechanical", paragraphs: ["The first week after the game release moved fast, but our mechanical team moved faster. We began developing an intake system, experimenting with different wheel sizes and heights, and worked on storage designs to optimize ball handling. We finalized our intake subsystem prototype and began to CAD it. After finishing our intake, we started building a shooter prototype to test different angles and consistency.", "In addition to robot prototypes, we worked on field construction in parallel, completing the base of the hub and starting work on the bump. The team drew inspiration from Ri3D teams and notable robots from previous years, and all rookie members contributed ideas, building on each other’s suggestions to improve designs. We also continued brainstorming concepts for climbing mechanisms, indexing systems, and other design improvements to prepare for full-scale testing.", "Adjacently, we continued our offseason project of a new robot cart. We added notches to join pieces, and finished the entire bottom deck. Catch us and our new robot cart at competition!"] },
      { heading: "Programming", paragraphs: ["In the first week after kickoff, the programming sub-team has made significant headway on our robot chassis and is currently working on the Robot Rebuilt 2026 code project. Prior to the released game animation, we built a 30x30in chassis with our new SWFYT aluminum. However, the game manual has limitations on the chassis size, so we had to cut down to a 27.5x27.5 in. chassis.", "Adding to the chassis, we have completed the first iteration of the robot electrical board and have cleanly and successfully wired the swerve drive base and other related components. This year has also been one of our cleanest in terms of wiring and electrical robustness.", "For our codebase, we have set up the project, installed vendor dependencies, assigned CAN IDs to all devices, updated firmware, fixed CANCoder offsets, and tuned swerve feedforward values. Our plan moving forward is to finish wiring the vision subsystems and update any legacy code that relies on deprecated methods."] }
    ]
  },
  { slug: "2025-robot-reveal-poncho", date: "March 25, 2025", title: "2025 Robot Reveal: Poncho", excerpt: "FRC Team Radicubs 7503 proudly presents the reveal of our 2025 robot: Poncho.", cover: "/blog/2025-robot-reveal-poncho.jpg", sourceUrl: "https://www.youtube.com/watch?v=w2W5IIu_oYk", external: true },
  { slug: "build-season-week-5-reefscape-2025", date: "February 3, 2025", title: "Build Season Week 5 | REEFSCAPE℠ 2025", excerpt: "2025 Build Season Week 5", cover: "/blog/IMG_7164_4833cd5246.jpg" },
  { slug: "build-season-week-4-reefscape-2025", date: "January 27, 2025", title: "Build Season Week 4 | REEFSCAPE℠ 2025", excerpt: "2025 Build Season Week 4", cover: "/blog/IMG_9517_b8b66374c5.jpg" },
  { slug: "build-season-week-3-reefscape-2025", date: "January 20, 2025", title: "Build Season Week 3 | REEFSCAPE℠ 2025", excerpt: "2025 Build Season Week 3", cover: "/blog/IMG_6990_a5fb62f71e.JPG" },
  { slug: "build-season-week-2-reefscape-2025", date: "January 13, 2025", title: "Build Season Week 2 | REEFSCAPE℠ 2025", excerpt: "2025 Build Season Week 2", cover: "/blog/IMG_6858_4018b4aa47.JPG" },
  { slug: "story-of-edith-clarke", date: "January 8, 2025", title: "The Story of Edith Clarke", excerpt: "The first female electrical engineer.", cover: "/blog/Edith_Clarke_Blog_36d0c970db.png" },
  { slug: "build-season-week-1-reefscape-2025", date: "January 6, 2025", title: "Build Season Week 1 | REEFSCAPE℠ 2025", excerpt: "2025 Build Season Week 1", cover: "/blog/IMG_5881_b0f89fb828.jpg" },
  { slug: "importance-of-katherine-johnson", date: "October 16, 2024", title: "The Importance of Katherine Johnson", excerpt: "Highlighting an important woman in the STEM field.", cover: "/blog/UPDATED_Katherine_Johnson_Banner_bbf551b04d.png" },
  { slug: "fit-district-championship", date: "April 29, 2024", title: "FIT District Championship", excerpt: "Radicubs competed in the FIRST in Texas District Championship.", cover: "/blog/fit-district-championship.jpg", sourceUrl: "https://www.youtube.com/watch?v=wcMhRnlMbxI&t=21s", external: true },
  { slug: "interview-caitlin-fukumoto", date: "March 26, 2024", title: "Interview With Caitlin Fukumoto, Radicubs Founder", excerpt: "A Radicubs member interviewed founding member Caitlin Fukumoto.", cover: "/blog/Black_and_White_Modern_Business_Podcast_Cover_Twitter_Post_b662121eb9.png" },
  { slug: "fit-fort-worth-district-event", date: "March 26, 2024", title: "FIT Fort Worth District Event", excerpt: "A look back at the FIRST Robotics Competition Fort Worth event.", cover: "/blog/fit-fort-worth-district-event.jpg", sourceUrl: "https://www.youtube.com/watch?v=AxENzEoPl3U", external: true },
  { slug: "fit-plano-district-event", date: "March 12, 2024", title: "FIT Plano District Event", excerpt: "Competition highlights and thanks to supporters.", cover: "/blog/fit-plano-district-event.jpg", sourceUrl: "https://www.youtube.com/watch?v=jn38bUwh1mA", external: true },
  { slug: "interview-jessica-ouyang", date: "February 26, 2024", title: "Interview With Assistant Professor Jessica Ouyang", excerpt: "An interview about the Computer Science field.", cover: "/blog/green_and_black_modern_gym_banner_1_7423065760.png" },
  { slug: "crescendo-week-four-2024", date: "February 7, 2024", title: "CRESCENDO℠ 2024: Build Season Week Four", excerpt: "Week four brought pneumatics, a workspace, and rapid prototyping.", cover: "/blog/IMG_9731_1dbf220cff.JPG" },
  { slug: "new-radicubs-website", date: "February 6, 2024", title: "New Radicubs Website!", excerpt: "The process of building the new Radicubs website.", cover: "/blog/radicubs_com_f2d099f261.png" },
  { slug: "crescendo-week-three-2024", date: "January 30, 2024", title: "CRESCENDO℠ 2024: Build Season Week Three", excerpt: "Prototyping, autonomous, and Impact preparation.", cover: "/blog/IMG_9004_1_ce28fca88f.jpg" },
  { slug: "crescendo-week-two-2024", date: "January 22, 2024", title: "CRESCENDO℠ 2024: Build Season Week Two", excerpt: "Hard work, iteration, and new ideas in week two.", cover: "/blog/IMG_8497_9c196bd98f.jpg" },
  { slug: "crescendo-week-one-2024", date: "January 19, 2024", title: "CRESCENDO℠ 2024: Build Season Week One", excerpt: "The first week of the 2024 build season.", cover: "/blog/D8_F8_AD_4_D_BCBD_4_B3_B_80_F1_9_E84867_CD_812_357c9c5844.JPG" },
  { slug: "2023-2024-offseason-recap", date: "January 11, 2024", title: "2023-2024 Offseason Recap", excerpt: "A look back at workshops, outreach, offseason competitions, and mentoring.", cover: "/blog/20240106_165653_3710c31f05.jpg" },
  { slug: "charged-up-week-three-four", date: "February 4, 2023", title: "Charged Up: Week Three and Four (feat. Snow Week)", excerpt: "Progress across programming, business, and robot development.", cover: "/blog/b9358b_353440bb84c24dbc896acb1ccf860d2f_mv2_ca0a518b61.jpg" },
  { slug: "charged-up-week-two", date: "January 27, 2023", title: "Charged Up 2023: Build Season Week Two", excerpt: "A productive second week after FRC kickoff.", cover: "/blog/b9358b_bf04317f2e6d42f189ca76c246e5b31e_mv2_88a54ead3a.png" },
  { slug: "charged-up-week-one", date: "January 14, 2023", title: "Charged Up 2023: Build Season Week One", excerpt: "The start of the 2023 season.", cover: "/blog/b9358b_a3e668105c6d4d84b912f40e3410eae6_mv2_04e559119e.jpg" },
  { slug: "off-season-updates", date: "October 20, 2022", title: "Off Season Updates", excerpt: "Programming, CAD, grants, sponsorship outreach, and community STEM work.", cover: "/blog/b9358b_d6e8468e5d9d494ab7913bb2b32355f2_mv2_ad5a419e3c.png" },
  { slug: "radiblog-is-back", date: "June 26, 2022", title: "Radiblog is back!!", excerpt: "The 2022-2023 FRC offseason begins.", cover: "/blog/b9358b_a387a44fdc7e4db999d21e3a270f8999_mv2_d577c1a91e.png" },
  { slug: "lets-catch-up", date: "February 23, 2020", title: "Let's Catch Up", excerpt: "An early team update from the 2020 season.", cover: "/blog/b9358b_00e454bd626a4a03befbe34eaa543184_mv2_afd84ab33d.jpg" },
  { slug: "welcome", date: "January 6, 2020", title: "Welcome!", excerpt: "3, 2, 1...go! Build Season has officially started.", cover: "/blog/b9358b_fa0181958afd4ca1a5dcef24ac9d45e6_mv2_6b35751041.png" }
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

const teamMembers = [
  {
    name: "Corey Golcman",
    role: "Senior Captain",
    image:
      "https://static.wixstatic.com/media/94ab15_b6c5ef804fdf40eabbf2b49420a37450~mv2.png/v1/crop/x_1,y_0,w_287,h_288/fill/w_216,h_217,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/IMG_5073_heic.png"
  },
  {
    name: "Niharika Sule",
    role: "Senior Captain",
    image:
      "https://static.wixstatic.com/media/b9358b_7ca380e9d3e9411bb1a37f5d68ba8814~mv2.jpg/v1/crop/x_441,y_178,w_1227,h_1233/fill/w_216,h_217,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/IMG_6282_JPG.jpg"
  },
  {
    name: "Jacob Baumel",
    role: "Junior Captain",
    image:
      "https://static.wixstatic.com/media/94ab15_c2690698bf7643a3bb036fa0270a97e1~mv2.png/v1/crop/x_39,y_0,w_246,h_247/fill/w_216,h_217,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/Screen%20Shot%202022-06-20%20at%206_37_42%20PM.png"
  },
  {
    name: "Adiv Padgilwar",
    role: "Co-Mechanical Lead",
    image:
      "https://static.wixstatic.com/media/74b6c0_ba1feca6da2b4809abeea000434f0a51~mv2.jpg/v1/fill/w_216,h_217,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/IMG_2430_edited_edited.jpg"
  },
  {
    name: "Angel Pilli",
    role: "Co-Mechanical Lead",
    image:
      "https://static.wixstatic.com/media/b9358b_ea01d160c4774fc19dbeef351a4fb256~mv2.jpg/v1/crop/x_202,y_81,w_1530,h_1538/fill/w_216,h_217,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/Image%20from%20iOS_edited.jpg"
  },
  {
    name: "Nimisha Mishra",
    role: "Programming Lead",
    image:
      "https://static.wixstatic.com/media/b9358b_5edccd945f2144e099910cf54c8a1f48~mv2.jpg/v1/crop/x_184,y_68,w_558,h_561/fill/w_216,h_217,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/WhatsApp%20Image%202022-06-24%20at%205_edited.jpg"
  },
  {
    name: "Siri Ganapathineedi",
    role: "Business Lead",
    image:
      "https://static.wixstatic.com/media/b9358b_5edccd945f2144e099910cf54c8a1f48~mv2.jpg/v1/crop/x_184,y_68,w_558,h_561/fill/w_216,h_217,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/WhatsApp%20Image%202022-06-24%20at%205_edited.jpg"
  },
  {
    name: "Tania Bobbili",
    role: "Media Lead",
    image:
      "https://static.wixstatic.com/media/b9358b_1962c21fa4354d9a8e396f656fecfe3c~mv2.jpg/v1/fill/w_216,h_217,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/2.jpg"
  },
  {
    name: "Lakshana Natamai",
    role: "Junior",
    image:
      "https://static.wixstatic.com/media/b9358b_1454b69b6cff44ca8360ee237ad8b646~mv2.jpg/v1/crop/x_289,y_246,w_1836,h_1843/fill/w_216,h_217,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/IMG08875_Original_JPG.jpg"
  },
  {
    name: "Akhil Chutkay",
    role: "Junior",
    image:
      "https://static.wixstatic.com/media/b9358b_efac497e995d4d02996e7609d6c0c2c4~mv2.jpg/v1/crop/x_0,y_179,w_1546,h_1552/fill/w_216,h_217,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/20220811_165927.jpg"
  },
  {
    name: "Alicia Munch",
    role: "Sophomore",
    image:
      "https://static.wixstatic.com/media/b237ac_50b5a10b0d9448daa54acd0f2eec4c4d~mv2.jpg/v1/crop/x_2,y_0,w_254,h_255/fill/w_216,h_217,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/2.jpg"
  },
  {
    name: "Ananya Swaminathan",
    role: "Junior",
    image:
      "https://static.wixstatic.com/media/b237ac_50b5a10b0d9448daa54acd0f2eec4c4d~mv2.jpg/v1/fill/w_216,h_217,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/2.jpg"
  },
  {
    name: "Ankit Majumder",
    role: "Junior",
    image:
      "https://static.wixstatic.com/media/b9358b_891124bb541e41028f52484bd8ae11ef~mv2.jpg/v1/crop/x_127,y_10,w_347,h_349/fill/w_216,h_217,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/pic.jpg"
  },
  {
    name: "Kavin Raj",
    role: "Junior",
    image:
      "https://static.wixstatic.com/media/b237ac_50b5a10b0d9448daa54acd0f2eec4c4d~mv2.jpg/v1/fill/w_216,h_217,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/2.jpg"
  },
  {
    name: "Ethan Zheng",
    role: "Sophomore",
    image:
      "https://static.wixstatic.com/media/b237ac_50b5a10b0d9448daa54acd0f2eec4c4d~mv2.jpg/v1/crop/x_2,y_0,w_254,h_255/fill/w_216,h_217,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/2.jpg"
  },
  {
    name: "Niyonika Sharma",
    role: "Sophomore",
    image:
      "https://static.wixstatic.com/media/b237ac_50b5a10b0d9448daa54acd0f2eec4c4d~mv2.jpg/v1/crop/x_2,y_0,w_254,h_255/fill/w_216,h_217,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/2.jpg"
  },
  {
    name: "George Washington - Hajnal",
    role: "Sophomore",
    image:
      "https://static.wixstatic.com/media/b237ac_50b5a10b0d9448daa54acd0f2eec4c4d~mv2.jpg/v1/crop/x_2,y_0,w_254,h_255/fill/w_216,h_217,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/2.jpg"
  },
  {
    name: "Mann Bellani",
    role: "Sophomore",
    image:
      "https://static.wixstatic.com/media/b9358b_8262cc532f8345229c2fc7f5c05b9c83~mv2.png/v1/crop/x_27,y_51,w_598,h_600/fill/w_216,h_217,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/IMG_3228_PNG.png"
  },
  {
    name: "Rithvik Sonwalkar",
    role: "Sophomore",
    image:
      "https://static.wixstatic.com/media/b237ac_50b5a10b0d9448daa54acd0f2eec4c4d~mv2.jpg/v1/crop/x_2,y_0,w_254,h_255/fill/w_216,h_217,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/2.jpg"
  },
  {
    name: "Sid Darapuram",
    role: "Sophomore",
    image:
      "https://static.wixstatic.com/media/b237ac_50b5a10b0d9448daa54acd0f2eec4c4d~mv2.jpg/v1/crop/x_2,y_0,w_254,h_255/fill/w_216,h_217,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/2.jpg"
  },
  {
    name: "Sathvik Yechuri",
    role: "Sophomore",
    image:
      "https://static.wixstatic.com/media/b9358b_a2fc2355053943fe9c9e01e73c34c53b~mv2.jpg/v1/crop/x_0,y_681,w_1247,h_1252/fill/w_216,h_217,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/IMG_3259_edited_edited.jpg"
  },
  {
    name: "Airlia Vivekanand",
    role: "Freshman",
    image:
      "https://static.wixstatic.com/media/b9358b_a2fc2355053943fe9c9e01e73c34c53b~mv2.jpg/v1/crop/x_0,y_681,w_1247,h_1252/fill/w_216,h_217,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/IMG_3259_edited_edited.jpg"
  },
  {
    name: "Anthony Hom",
    role: "Freshman",
    image:
      "https://static.wixstatic.com/media/b9358b_74bd7306b13341828278300cb3e5b4ad~mv2.jpg/v1/crop/x_176,y_104,w_593,h_596/fill/w_216,h_217,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/IMG_5024_edited_edited.jpg"
  },
  {
    name: "Mihir Sood",
    role: "Freshman",
    image:
      "https://static.wixstatic.com/media/b237ac_50b5a10b0d9448daa54acd0f2eec4c4d~mv2.jpg/v1/crop/x_2,y_0,w_254,h_255/fill/w_216,h_217,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/2.jpg"
  },
  {
    name: "Raghav Ramprasad",
    role: "Freshman",
    image:
      "https://static.wixstatic.com/media/b237ac_50b5a10b0d9448daa54acd0f2eec4c4d~mv2.jpg/v1/crop/x_2,y_0,w_254,h_255/fill/w_216,h_217,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/2.jpg"
  },
  {
    name: "Rishi Alluri",
    role: "Freshman",
    image:
      "https://static.wixstatic.com/media/b237ac_50b5a10b0d9448daa54acd0f2eec4c4d~mv2.jpg/v1/crop/x_2,y_0,w_254,h_255/fill/w_216,h_217,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/2.jpg"
  },
  {
    name: "Sathvik Surisetty",
    role: "Freshman",
    image:
      "https://static.wixstatic.com/media/b237ac_50b5a10b0d9448daa54acd0f2eec4c4d~mv2.jpg/v1/crop/x_2,y_0,w_254,h_255/fill/w_216,h_217,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/2.jpg"
  }
];

const STRAPI_URL = "https://cms.radicubs.com";
const STRAPI_API_TOKEN =
  "fabd7605d8e399e7fc97309b61e9fe607cd353c4fd9363098f5d8184fb616362861e924c6b3da4332b7f824dd295c9df3373a3def795896a920ac8fd0e6c1716c4656b6559046a4a4f5abd90b2cd6730a9d2d754cbe2131c98cd28cd0ae7058d77faac4530c0f91281dc59515a06f3e4944fe40370928cd3de4cc9184c3324dc";

for (const teamMember of teamMembers) {
  const form = new FormData();
  form.append("data", JSON.stringify({ name: teamMember.name, role: teamMember.role, year: 2022 }));

  if (teamMember.image && !teamMember.image.includes("50b5a10b0d9448daa54acd0f2eec4c4d")) {
    const photoBuf = await fetch(teamMember.image).then(res => res.blob());
    form.append("files.avatar", photoBuf, teamMember.image.split("/v1/").shift().split("/").pop());
  }

  const res = await fetch(`${STRAPI_URL}/api/team-members`, {
    method: "POST",
    body: form,
    headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
  });

  const json = await res.json();
  console.log(json);
}

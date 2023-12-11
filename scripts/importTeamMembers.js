const teamMembers = [
  {
    name: "Sahil Jain",
    role: "Senior Captain",
    image:
      "https://static.wixstatic.com/media/b9358b_1962c21fa4354d9a8e396f656fecfe3c~mv2.jpg/v1/crop/x_2,y_0,w_254,h_255/fill/w_216,h_217,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/2.jpg"
  },
  {
    name: "Caitlin Fukumoto",
    role: "Junior Captain",
    image:
      "https://static.wixstatic.com/media/b9358b_1962c21fa4354d9a8e396f656fecfe3c~mv2.jpg/v1/fill/w_216,h_217,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/2.jpg"
  },
  {
    name: "Abhishek Sule",
    role: "Senior",
    image:
      "https://static.wixstatic.com/media/b9358b_1962c21fa4354d9a8e396f656fecfe3c~mv2.jpg/v1/crop/x_2,y_0,w_254,h_255/fill/w_216,h_217,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/2.jpg"
  },
  {
    name: "Anikait Kolluri",
    role: "Junior",
    image:
      "https://static.wixstatic.com/media/b9358b_1962c21fa4354d9a8e396f656fecfe3c~mv2.jpg/v1/fill/w_216,h_217,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/2.jpg"
  },
  {
    name: "Cassidy Wisneski",
    role: "Junior",
    image:
      "https://static.wixstatic.com/media/b9358b_1962c21fa4354d9a8e396f656fecfe3c~mv2.jpg/v1/fill/w_216,h_217,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/2.jpg"
  },
  {
    name: "Ishaan Guha",
    role: "Junior",
    image:
      "https://static.wixstatic.com/media/b237ac_50b5a10b0d9448daa54acd0f2eec4c4d~mv2.jpg/v1/fill/w_216,h_217,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/2.jpg"
  },
  {
    name: "Ishva Patel",
    role: "Junior",
    image:
      "https://static.wixstatic.com/media/b9358b_1962c21fa4354d9a8e396f656fecfe3c~mv2.jpg/v1/crop/x_2,y_0,w_254,h_255/fill/w_216,h_217,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/2.jpg"
  },
  {
    name: "Neha Ganapathineedi",
    role: "Junior",
    image:
      "https://static.wixstatic.com/media/b237ac_50b5a10b0d9448daa54acd0f2eec4c4d~mv2.jpg/v1/fill/w_216,h_217,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/2.jpg"
  },
  {
    name: "Yesh Gutlapalli",
    role: "Junior",
    image:
      "https://static.wixstatic.com/media/b237ac_50b5a10b0d9448daa54acd0f2eec4c4d~mv2.jpg/v1/crop/x_2,y_0,w_254,h_255/fill/w_216,h_217,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/2.jpg"
  },
  {
    name: "Dave Banerjee",
    role: "Junior",
    image:
      "https://static.wixstatic.com/media/b9358b_1962c21fa4354d9a8e396f656fecfe3c~mv2.jpg/v1/crop/x_2,y_0,w_254,h_255/fill/w_216,h_217,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/2.jpg"
  },
  {
    name: "Samrat Sahoo",
    role: "Sophomore",
    image:
      "https://static.wixstatic.com/media/b9358b_1962c21fa4354d9a8e396f656fecfe3c~mv2.jpg/v1/crop/x_2,y_0,w_254,h_255/fill/w_216,h_217,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/2.jpg"
  },
  {
    name: "Shrenik Porwal",
    role: "Junior",
    image:
      "https://static.wixstatic.com/media/b9358b_1962c21fa4354d9a8e396f656fecfe3c~mv2.jpg/v1/crop/x_2,y_0,w_254,h_255/fill/w_216,h_217,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/2.jpg"
  },
  {
    name: "Sujay Vadlakonda",
    role: "Junior",
    image:
      "https://static.wixstatic.com/media/b9358b_1962c21fa4354d9a8e396f656fecfe3c~mv2.jpg/v1/crop/x_2,y_0,w_254,h_255/fill/w_216,h_217,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/2.jpg"
  },
  {
    name: "Tucker Spradley",
    role: "Junior",
    image:
      "https://static.wixstatic.com/media/b237ac_50b5a10b0d9448daa54acd0f2eec4c4d~mv2.jpg/v1/crop/x_2,y_0,w_254,h_255/fill/w_216,h_217,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/2.jpg"
  },
  {
    name: "Sierra Biddulph",
    role: "Sophomore",
    image:
      "https://static.wixstatic.com/media/b237ac_50b5a10b0d9448daa54acd0f2eec4c4d~mv2.jpg/v1/crop/x_2,y_0,w_254,h_255/fill/w_216,h_217,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/2.jpg"
  },
  {
    name: "Ananth Vivekanand",
    role: "Freshman",
    image:
      "https://static.wixstatic.com/media/b9358b_1962c21fa4354d9a8e396f656fecfe3c~mv2.jpg/v1/crop/x_2,y_0,w_254,h_255/fill/w_216,h_217,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/2.jpg"
  },
  {
    name: "Matthew Harris",
    role: "Freshman",
    image:
      "https://static.wixstatic.com/media/b9358b_1962c21fa4354d9a8e396f656fecfe3c~mv2.jpg/v1/crop/x_2,y_0,w_254,h_255/fill/w_216,h_217,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/2.jpg"
  }
];

const STRAPI_URL = "https://cms.radicubs.com";
const STRAPI_API_TOKEN = "";

for (const teamMember of teamMembers) {
  const photoBuf = await fetch(teamMember.image).then(res => res.blob());

  const form = new FormData();

  form.append("data", JSON.stringify({ name: teamMember.name, role: teamMember.role, year: 2018 }));
  form.append("files.avatar", photoBuf, teamMember.image.split("/v1/").shift().split("/").pop());

  const res = await fetch(`${STRAPI_URL}/api/team-members`, {
    method: "POST",
    body: form,
    headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
  });

  const json = await res.json();
  console.log(json);
}

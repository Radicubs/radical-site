function getImageUrls(markdownString) {
  const regex = /!\[.*?\]\((.*?)\)/g;
  const matches = [];
  let match;

  while ((match = regex.exec(markdownString)) !== null) {
    matches.push(match[1]);
  }

  return matches;
}

const STRAPI_URL = "https://cms.radicubs.com";
const STRAPI_API_TOKEN =
  "7964fa3c1a45f036a596a39fb7ec0091e9fba279cbeb2d438e8edfa7d5817c37e68bd7d65f35ffb1a6d211980d610fde8ccd325d6b32c01c06e33b5f8855fc0ae7ac6e3692045ad90f93738162460df74d9555575ebc947765f530594a7b5ef7ea72cd634eca75e4037aca2b5299b6dd14d1f092501e59c8da75de5d9398db98";

const blogPosts = await fetch(`${STRAPI_URL}/api/blog-posts`, {
  method: "get",
  headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
}).then(res => res.json());

for (const blogPost of blogPosts.data) {
  let imageUrls = getImageUrls(blogPost.attributes.content);
  for (const imageUrl of imageUrls) {
    if (imageUrl.includes("cms.radicubs.com")) {
      continue;
    }

    const res = await fetch(imageUrl);
    const form = new FormData();
    form.append("files", await res.blob());

    const [uploaded] = await fetch(`${STRAPI_URL}/api/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` },
      body: form
    }).then(res => res.json());

    console.log(uploaded.url);
    blogPost.attributes.content = blogPost.attributes.content.replaceAll(imageUrl, STRAPI_URL + uploaded.url);
  }

  await fetch(`${STRAPI_URL}/api/blog-posts/${blogPost.id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ data: { content: blogPost.attributes.content } })
  });

  // break;
}

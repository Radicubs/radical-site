export const slugify = (str: string) =>
  str
    .toLowerCase()
    .replace(/[^\w]+/g, "-")
    .replace(/^-|-$/g, "");

const youtubeVideoRegex =
  /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
export const getVideoId = (url?: string) => url && youtubeVideoRegex.exec(url)?.[1];

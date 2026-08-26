import Link from "next/link";
import Image from "next/image";
import { BlogPost } from "@/data/blog";
export function PostCard({post}:{post:BlogPost}){return <Link className="post-card" data-tilt-card href={`/blog/${post.slug}`}><div className="post-img">{post.cover?<Image src={post.cover} alt="" fill sizes="(max-width: 760px) 90vw, (max-width: 1024px) 45vw, 30vw" style={{objectFit:"cover"}}/>:<div style={{height:'100%',display:'grid',placeItems:'center',padding:30,textAlign:'center',fontWeight:900}}>{post.title}</div>}</div><div className="post-body"><div className="post-date">{post.date}</div><div className="post-title">{post.title}</div><div className="post-excerpt">{post.excerpt}</div><div className="text-link" style={{marginTop:18}}>Read post ↗</div></div></Link>}

import Image from "next/image";
import { TeamMember } from "@/data/team";

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");

export function TeamCard({ member }: { member: TeamMember }) {
  return (
    <article className="team-card" data-tilt-card>
      <div className="team-photo">
        {member.image ? (
          <Image src={member.image} alt={member.name} fill sizes="(max-width: 760px) 90vw, (max-width: 1024px) 30vw, 20vw" style={{ objectFit: "cover" }} />
        ) : (
          <span className="team-photo-fallback" aria-hidden="true">{initials(member.name)}</span>
        )}
      </div>
      <div className="team-body">
        <div className="team-name">{member.name}</div>
        <div className="team-role">{member.role}</div>
      </div>
    </article>
  );
}

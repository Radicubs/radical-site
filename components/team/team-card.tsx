import { ProfilePhoto } from "@/components/team/profile-photo";
import { teamGlowIcon, type TeamGlowIcon } from "@/lib/team-glow-icons";

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");

export function TeamCard({ member }: { member: { name: string; role: string; image?: string; glowIcon?: TeamGlowIcon | null } }) {
  return (
    <article className="team-card" data-tilt-card>
      <div className="team-photo">
        {member.image ? (
          <ProfilePhoto src={member.image} alt={member.name} icon={teamGlowIcon(member.glowIcon, member.role)} />
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

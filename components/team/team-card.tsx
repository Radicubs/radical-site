import { TeamMember } from "@/data/team";
import { ProfilePhoto } from "@/components/team/profile-photo";

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");

const ROLE_ICONS: Array<{ match: RegExp; icon: string }> = [
  { match: /program|software|code/i, icon: "/team/icons/code.png" },
  { match: /mechanical/i, icon: "/team/icons/mechanical.png" },
  { match: /\bcad\b/i, icon: "/team/icons/cad.png" },
  { match: /business/i, icon: "/team/icons/business.png" },
  { match: /media/i, icon: "/team/icons/media.png" }
];

const iconForRole = (role: string) => ROLE_ICONS.find((r) => r.match.test(role))?.icon;

export function TeamCard({ member }: { member: TeamMember }) {
  return (
    <article className="team-card" data-tilt-card>
      <div className="team-photo">
        {member.image ? (
          <ProfilePhoto src={member.image} alt={member.name} icon={iconForRole(member.role)} />
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

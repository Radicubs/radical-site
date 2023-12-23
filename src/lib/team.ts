import type { ApiTeamMemberTeamMember } from "./contentTypes";
import fetchApi from "./strapi";

const roleOrder = ["freshman", "sophomore", "junior", "senior", "lead", "captain"];
const getMemberWeight = (member: ApiTeamMemberTeamMember) => {
  let weight = 0;

  for (let i = 0; i < roleOrder.length; i++) {
    if (member.attributes.role?.toLowerCase().includes(roleOrder[i])) weight += i + 1;
  }

  return weight;
};

export function sortMembers(members: ApiTeamMemberTeamMember[]) {
  members.sort((memberA, memberB) => getMemberWeight(memberB) - getMemberWeight(memberA));
}

export async function getYears() {
  let page = 0;
  let pageSize = 1000;
  let years: number[] = [];

  while (true) {
    const nextYears = await fetchApi<ApiTeamMemberTeamMember[]>({
      endpoint: "team-members", // the content type to fetch
      wrappedByKey: "data", // the key to unwrap the response
      query: {
        fields: "year",
        sort: "year:desc",
        "pagination[page]": page.toString(),
        "pagination[pageSize]": pageSize.toString()
      }
    });

    for (const nextYear of nextYears) {
      if (!years.includes(nextYear.attributes.year)) years.push(nextYear.attributes.year);
    }

    if (nextYears.length < pageSize) {
      break;
    }

    page++;
  }

  return years;
}

// import type { Core } from '@strapi/strapi';

const seedAboutPage = async (strapi: any) => {
  const existing = await strapi.db.query('api::about-page.about-page').findOne({
    where: {},
  });

  if (existing) return;

  const originBody = [
    'In 2019, high school students Caitlin Fukumoto and Sahil Jain recognized a critical gap in Frisco, Texas: a severe lack of accessible STEM opportunities. What started as an ambitious idea at Reedy High School quickly met administrative roadblocks.',
    '> We didn\'t just want to build robots. We wanted to build a team where anyone, regardless of their background or zip code, could learn to innovate.',
    'Instead of conceding, the founders pivoted. They broke away from the school district restrictions, establishing Radicubs as an independent 501(c)(3) nonprofit organization. Today, we stand as a multi-school, community-driven FRC team, empowering students across the entire region.',
  ].join('\n\n');

  await strapi.entityService.create('api::about-page.about-page', {
    data: {
      OriginHeading: 'Our Origin',
      OriginSubheading: 'From a restricted school club to a boundless community force.',
      OriginBody: originBody,
      MissionHeading: 'Our Mission',
      MissionStatement:
        'To expand access to STEM and entrepreneurship through a rigorously student-led structure. We believe that true leadership is developed not just by writing code or machining parts, but by running an organization, mentoring peers, and giving back to the community.',
      MissionCards: [
        {
          Title: 'Student-Led',
          Icon: 'Target',
        },
        {
          Title: 'Community Focussed',
          Icon: 'Globe',
        },
      ],
      DiversityHeading: 'Diversity & Inclusion',
      DiversityCards: [
        {
          Title: '15+ Languages Spoken',
          Description:
            'Our members represent a global perspective, with a majority being first or second-generation immigrants.',
          Icon: 'Globe',
        },
        {
          Title: 'LGBTQIA+ Inclusive',
          Description:
            'A safe, welcoming environment where authenticity is celebrated alongside engineering.',
          Icon: 'Heart',
        },
        {
          Title: 'FIRST Ladies Certified',
          Description:
            'Active partners in promoting and sustaining female participation in STEM fields.',
          Icon: 'Users',
        },
      ],
      publishedAt: new Date(),
    },
  });
};

const seedSponsorsPage = async (strapi: any) => {
  const existing = await strapi.db.query('api::sponsors-page.sponsors-page').findOne({
    where: {},
  });

  if (existing) {
    const hasNewTitle = typeof (existing as any)?.Title === 'string' && (existing as any).Title.trim().length > 0;
    if (hasNewTitle) return;

    const prefix = typeof (existing as any)?.TitlePrefix === 'string' ? (existing as any).TitlePrefix : '';
    const highlight = typeof (existing as any)?.TitleHighlight === 'string' ? (existing as any).TitleHighlight : '';
    const suffix = typeof (existing as any)?.TitleSuffix === 'string' ? (existing as any).TitleSuffix : '';

    const migratedTitle = `${prefix}<${highlight}>${suffix}`.trim();

    await strapi.entityService.update('api::sponsors-page.sponsors-page', existing.id, {
      data: {
        Title: migratedTitle || 'Fuel The <Innovation>',
        TitleHighlightColor: '#5ddb27',
      },
    });

    return;
  }

  await strapi.entityService.create('api::sponsors-page.sponsors-page', {
    data: {
      Title: 'Fuel The <Innovation>',
      TitleHighlightColor: '#5ddb27',
      Body:
        "Radicubs is entirely funded by corporate sponsors, grants, and community donations. By partnering with us, you aren't just funding a robot—you are investing in the next generation of engineers, leaders, and innovators in North Texas.",
      Buttons: [
        {
          Label: 'Download Sponsorship',
          Variant: 'primary',
          Action: 'toast',
        },
        {
          Label: 'Contact Us Directly',
          Variant: 'outline',
          Action: 'link',
          Href: 'mailto:radicubs@gmail.com',
          OpenInNewTab: false,
        },
        {
          Label: 'Donate',
          Variant: 'secondary',
          Action: 'link',
          Href: '',
          HasGreenBorder: true,
        },
      ],
      LogosHeading: 'Trusted By Industry Leaders',
      WaysHeading: 'Ways to Support',
      WaysCards: [
        {
          Title: 'Donation Matching',
          Body: 'Encourage companies to match employee donations',
          ListItems: [],
        },
        {
          Title: 'Sponsorship',
          Body: 'Financial support in exchange for visibility and partnership',
          ListItems: [],
        },
        {
          Title: 'Direct Donation',
          Body: 'One-time or recurring financial contributions',
          ListItems: [],
        },
        {
          Title: 'Workspace & Tools',
          Body: 'Providing workspace, tools, or equipment to support team operations',
          ListItems: [],
        },
      ],
      BenefitsHeading: 'Sponsorship Benefits',
      BenefitsCards: [
        {
          Title: 'Brand Visibility',
          Body: '',
          ListItems: [
            { Text: 'Logo on our robot, team uniforms, and website' },
            { Text: 'Recognition at competitions and community events' },
            { Text: 'Mentions in press releases and social media' },
          ],
        },
        {
          Title: 'Community Impact',
          Body: '',
          ListItems: [
            { Text: 'Support STEM education in our community' },
            { Text: 'Help develop future engineers and innovators' },
            { Text: 'Contribute to workforce development' },
          ],
        },
        {
          Title: 'Team Engagement',
          Body: '',
          ListItems: [
            { Text: 'Opportunities for team demonstrations at your facility' },
            { Text: 'Mentorship and internship connections' },
            { Text: 'Invitations to team events and competitions' },
          ],
        },
        {
          Title: 'Tax Benefits',
          Body: '',
          ListItems: [
            { Text: 'Tax-deductible contributions' },
            { Text: 'Documentation for corporate social responsibility initiatives' },
            { Text: 'Annual impact reports for your records' },
          ],
        },
      ],
      StatisticsText: 'Statistics',
      StatisticsCards: [
        {
          Value: '2,500+',
          Label: 'Annual Reach',
          Body: 'Your brand visible at massive community events, libraries, and schools.',
          ListItems: [],
        },
        {
          Value: '501(c)(3)',
          Label: 'Tax Deductible',
          Body: 'All sponsorships and donations are fully tax-deductible contributions.',
          ListItems: [],
        },
        {
          Value: '100%',
          Label: 'Student Impact',
          Body: 'Funds go directly to parts, competition fees, and community outreach.',
          ListItems: [],
        },
      ],
      publishedAt: new Date(),
    },
  });
};

const toBlocks = (value: unknown) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return null;

  const parts = value
    .split(/\n\s*\n/g)
    .map((part) => part.trim())
    .filter(Boolean);

  const paragraphs = parts.length > 0 ? parts : [''];

  return paragraphs.map((text) => ({
    type: 'paragraph',
    children: [{ type: 'text', text }],
  }));
};

const migrateProjectDescriptions = async (strapi: any) => {
  // When Project.Description was a plain string and later changed to blocks,
  // existing records can break the admin UI/API. Convert legacy strings to blocks.
  const projects = await strapi.db.query('api::project.project').findMany({
    select: ['id', 'Description'],
    limit: 1000,
  });

  for (const project of projects) {
    const id = (project as any)?.id;
    const nextBlocks = toBlocks((project as any)?.Description);
    if (!id || !nextBlocks) continue;

    await strapi.entityService.update('api::project.project', id, {
      data: {
        Description: nextBlocks,
      },
    });
  }
};

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: any }) {
    await seedAboutPage(strapi);
    await seedSponsorsPage(strapi);
    await migrateProjectDescriptions(strapi);
  },
};

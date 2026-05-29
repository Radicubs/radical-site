import type { Schema, Struct } from '@strapi/strapi';

export interface SharedDiversityCard extends Struct.ComponentSchema {
  collectionName: 'components_shared_diversity_cards';
  info: {
    displayName: 'Diversity Card';
  };
  attributes: {
    Description: Schema.Attribute.Text & Schema.Attribute.Required;
    Icon: Schema.Attribute.Enumeration<['Target', 'Globe', 'Heart', 'Users']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'Globe'>;
    Title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedMissionCard extends Struct.ComponentSchema {
  collectionName: 'components_shared_mission_cards';
  info: {
    displayName: 'Mission Card';
  };
  attributes: {
    Icon: Schema.Attribute.Enumeration<['Target', 'Globe', 'Heart', 'Users']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'Target'>;
    Title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedRosterSpot extends Struct.ComponentSchema {
  collectionName: 'components_shared_roster_spots';
  info: {
    displayName: 'Roster Spot';
  };
  attributes: {
    members: Schema.Attribute.Relation<
      'oneToMany',
      'api::team-member.team-member'
    >;
    Role: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedSponsorsBenefitCard extends Struct.ComponentSchema {
  collectionName: 'components_shared_sponsors_benefit_cards';
  info: {
    displayName: 'Sponsors Benefit Card';
  };
  attributes: {
    Body: Schema.Attribute.Text;
    ListItems: Schema.Attribute.Component<'shared.sponsors-list-item', true>;
    Title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedSponsorsButton extends Struct.ComponentSchema {
  collectionName: 'components_shared_sponsors_buttons';
  info: {
    displayName: 'Sponsors Button';
  };
  attributes: {
    Action: Schema.Attribute.Enumeration<['link', 'toast', 'download']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'link'>;
    DownloadFilename: Schema.Attribute.String;
    HasGreenBorder: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    Href: Schema.Attribute.String;
    Label: Schema.Attribute.String & Schema.Attribute.Required;
    OpenInNewTab: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    Variant: Schema.Attribute.Enumeration<['primary', 'outline', 'secondary']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'primary'>;
  };
}

export interface SharedSponsorsListItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_sponsors_list_items';
  info: {
    displayName: 'Sponsors List Item';
  };
  attributes: {
    Text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedSponsorsStatCard extends Struct.ComponentSchema {
  collectionName: 'components_shared_sponsors_stat_cards';
  info: {
    displayName: 'Sponsors Stat Card';
  };
  attributes: {
    Body: Schema.Attribute.Text;
    Label: Schema.Attribute.String & Schema.Attribute.Required;
    ListItems: Schema.Attribute.Component<'shared.sponsors-list-item', true>;
    Value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedSponsorsSupportCard extends Struct.ComponentSchema {
  collectionName: 'components_shared_sponsors_support_cards';
  info: {
    displayName: 'Sponsors Support Card';
  };
  attributes: {
    Body: Schema.Attribute.Text;
    ListItems: Schema.Attribute.Component<'shared.sponsors-list-item', true>;
    Title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'shared.diversity-card': SharedDiversityCard;
      'shared.mission-card': SharedMissionCard;
      'shared.roster-spot': SharedRosterSpot;
      'shared.sponsors-benefit-card': SharedSponsorsBenefitCard;
      'shared.sponsors-button': SharedSponsorsButton;
      'shared.sponsors-list-item': SharedSponsorsListItem;
      'shared.sponsors-stat-card': SharedSponsorsStatCard;
      'shared.sponsors-support-card': SharedSponsorsSupportCard;
    }
  }
}

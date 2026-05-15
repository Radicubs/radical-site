import type { Schema, Struct } from '@strapi/strapi';

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

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'shared.roster-spot': SharedRosterSpot;
    }
  }
}

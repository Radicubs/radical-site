import * as migration_20260929_005858_initial from './20260929_005858_initial';
import * as migration_20260929_034108_remove_robot_assets from './20260929_034108_remove_robot_assets';
import * as migration_20261008_014722_team_season_assignments from './20261008_014722_team_season_assignments';
import * as migration_20261008_033527_recurring_team_profiles from './20261008_033527_recurring_team_profiles';
import * as migration_20261017_213824_team_member_glow_icon from './20261017_213824_team_member_glow_icon';
import * as migration_20261018_054800_impact_numbers from './20261018_054800_impact_numbers';
import * as migration_20261018_120000_enable_payload_rls from './20261018_120000_enable_payload_rls';
import * as migration_20261018_235524_page_text from './20261018_235524_page_text';

export const migrations = [
  {
    up: migration_20260929_005858_initial.up,
    down: migration_20260929_005858_initial.down,
    name: '20260929_005858_initial',
  },
  {
    up: migration_20260929_034108_remove_robot_assets.up,
    down: migration_20260929_034108_remove_robot_assets.down,
    name: '20260929_034108_remove_robot_assets',
  },
  {
    up: migration_20261008_014722_team_season_assignments.up,
    down: migration_20261008_014722_team_season_assignments.down,
    name: '20261008_014722_team_season_assignments',
  },
  {
    up: migration_20261008_033527_recurring_team_profiles.up,
    down: migration_20261008_033527_recurring_team_profiles.down,
    name: '20261008_033527_recurring_team_profiles',
  },
  {
    up: migration_20261017_213824_team_member_glow_icon.up,
    down: migration_20261017_213824_team_member_glow_icon.down,
    name: '20261017_213824_team_member_glow_icon',
  },
  {
    up: migration_20261018_054800_impact_numbers.up,
    down: migration_20261018_054800_impact_numbers.down,
    name: '20261018_054800_impact_numbers',
  },
  {
    up: migration_20261018_120000_enable_payload_rls.up,
    down: migration_20261018_120000_enable_payload_rls.down,
    name: '20261018_120000_enable_payload_rls',
  },
  {
    up: migration_20261018_235524_page_text.up,
    down: migration_20261018_235524_page_text.down,
    name: '20261018_235524_page_text'
  },
];

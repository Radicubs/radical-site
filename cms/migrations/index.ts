import * as migration_20260929_005858_initial from './20260929_005858_initial';
import * as migration_20260929_034108_remove_robot_assets from './20260929_034108_remove_robot_assets';
import * as migration_20261008_014722_team_season_assignments from './20261008_014722_team_season_assignments';
import * as migration_20261008_033527_recurring_team_profiles from './20261008_033527_recurring_team_profiles';

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
    name: '20261008_033527_recurring_team_profiles'
  },
];

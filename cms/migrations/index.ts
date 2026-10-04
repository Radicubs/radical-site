import * as migration_20260929_005858_initial from './20260929_005858_initial';
import * as migration_20260929_034108_remove_robot_assets from './20260929_034108_remove_robot_assets';

export const migrations = [
  {
    up: migration_20260929_005858_initial.up,
    down: migration_20260929_005858_initial.down,
    name: '20260929_005858_initial',
  },
  {
    up: migration_20260929_034108_remove_robot_assets.up,
    down: migration_20260929_034108_remove_robot_assets.down,
    name: '20260929_034108_remove_robot_assets'
  },
];

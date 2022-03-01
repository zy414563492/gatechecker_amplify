import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";





type LogMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type DeviceMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type GateMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type BuildingMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type UserMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

export declare class Log {
  readonly id: string;
  readonly log_id: string;
  readonly temperature?: number;
  readonly time?: string;
  readonly is_blacklist?: boolean;
  readonly deviceID?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<Log, LogMetaData>);
  static copyOf(source: Log, mutator: (draft: MutableModel<Log, LogMetaData>) => MutableModel<Log, LogMetaData> | void): Log;
}

export declare class Device {
  readonly id: string;
  readonly device_id: string;
  readonly is_entrance?: boolean;
  readonly is_using?: boolean;
  readonly last_alert_time?: string;
  readonly gateID?: string;
  readonly Logs?: (Log | null)[];
  readonly last_reset_time?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<Device, DeviceMetaData>);
  static copyOf(source: Device, mutator: (draft: MutableModel<Device, DeviceMetaData>) => MutableModel<Device, DeviceMetaData> | void): Device;
}

export declare class Gate {
  readonly id: string;
  readonly gate_id: string;
  readonly name?: string;
  readonly is_open?: boolean;
  readonly Devices?: (Device | null)[];
  readonly buildingID?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<Gate, GateMetaData>);
  static copyOf(source: Gate, mutator: (draft: MutableModel<Gate, GateMetaData>) => MutableModel<Gate, GateMetaData> | void): Gate;
}

export declare class Building {
  readonly id: string;
  readonly building_id: string;
  readonly name?: string;
  readonly location?: string;
  readonly Gates?: (Gate | null)[];
  readonly userID?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<Building, BuildingMetaData>);
  static copyOf(source: Building, mutator: (draft: MutableModel<Building, BuildingMetaData>) => MutableModel<Building, BuildingMetaData> | void): Building;
}

export declare class User {
  readonly id: string;
  readonly user_id: string;
  readonly Buildings?: (Building | null)[];
  readonly name: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<User, UserMetaData>);
  static copyOf(source: User, mutator: (draft: MutableModel<User, UserMetaData>) => MutableModel<User, UserMetaData> | void): User;
}
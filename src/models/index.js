// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Log, Device, Gate, Building, User } = initSchema(schema);

export {
  Log,
  Device,
  Gate,
  Building,
  User
};
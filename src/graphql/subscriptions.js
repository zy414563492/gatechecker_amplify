/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateLog = /* GraphQL */ `
  subscription OnCreateLog {
    onCreateLog {
      id
      log_id
      temperature
      time
      is_blacklist
      deviceID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onUpdateLog = /* GraphQL */ `
  subscription OnUpdateLog {
    onUpdateLog {
      id
      log_id
      temperature
      time
      is_blacklist
      deviceID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onDeleteLog = /* GraphQL */ `
  subscription OnDeleteLog {
    onDeleteLog {
      id
      log_id
      temperature
      time
      is_blacklist
      deviceID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onCreateDevice = /* GraphQL */ `
  subscription OnCreateDevice {
    onCreateDevice {
      id
      device_id
      is_entrance
      is_using
      last_alert_time
      gateID
      Logs {
        nextToken
        startedAt
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onUpdateDevice = /* GraphQL */ `
  subscription OnUpdateDevice {
    onUpdateDevice {
      id
      device_id
      is_entrance
      is_using
      last_alert_time
      gateID
      Logs {
        nextToken
        startedAt
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onDeleteDevice = /* GraphQL */ `
  subscription OnDeleteDevice {
    onDeleteDevice {
      id
      device_id
      is_entrance
      is_using
      last_alert_time
      gateID
      Logs {
        nextToken
        startedAt
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onCreateGate = /* GraphQL */ `
  subscription OnCreateGate {
    onCreateGate {
      id
      gate_id
      name
      is_open
      Devices {
        nextToken
        startedAt
      }
      buildingID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onUpdateGate = /* GraphQL */ `
  subscription OnUpdateGate {
    onUpdateGate {
      id
      gate_id
      name
      is_open
      Devices {
        nextToken
        startedAt
      }
      buildingID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onDeleteGate = /* GraphQL */ `
  subscription OnDeleteGate {
    onDeleteGate {
      id
      gate_id
      name
      is_open
      Devices {
        nextToken
        startedAt
      }
      buildingID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onCreateBuilding = /* GraphQL */ `
  subscription OnCreateBuilding {
    onCreateBuilding {
      id
      building_id
      name
      location
      Gates {
        nextToken
        startedAt
      }
      userID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onUpdateBuilding = /* GraphQL */ `
  subscription OnUpdateBuilding {
    onUpdateBuilding {
      id
      building_id
      name
      location
      Gates {
        nextToken
        startedAt
      }
      userID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onDeleteBuilding = /* GraphQL */ `
  subscription OnDeleteBuilding {
    onDeleteBuilding {
      id
      building_id
      name
      location
      Gates {
        nextToken
        startedAt
      }
      userID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser {
    onCreateUser {
      id
      user_id
      Buildings {
        nextToken
        startedAt
      }
      name
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser {
    onUpdateUser {
      id
      user_id
      Buildings {
        nextToken
        startedAt
      }
      name
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser {
    onDeleteUser {
      id
      user_id
      Buildings {
        nextToken
        startedAt
      }
      name
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;

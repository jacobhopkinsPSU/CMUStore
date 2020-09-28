// TODO: None
// Basic role definitions and permissions
const roleDefs = {
  unverified: {
    can: [],
  },
  verified: {
    can: ['item:purchase', 'item:view', 'user:login'],
  },
  admin: {
    can: ['item:purchase', 'item:view', 'item:modify', 'item:create', 'user:login'],
  },
};

module.exports = roleDefs;

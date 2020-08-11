// Basic role definitions and permissions
const roleDefs = {
  unverified: {
    can: [],
  },
  verified: {
    can: ['item:purchase', 'user:login'],
  },
  admin: {
    can: ['item:purchase', 'user:login', 'item:modify', 'item:create'],
  },
};

module.exports = roleDefs;

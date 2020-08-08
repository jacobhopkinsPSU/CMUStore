// Basic role definitions and permissions
const roleDefs = {
  unverified: {
    can: [],
  },
  verified: {
    can: ['item:purchase', 'user:login'],
  },
  admin: {
    can: ['item:modify', 'item:purchase', 'user:login'],
  },
};

module.exports = roleDefs;

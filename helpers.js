// ------------------------------------------ HELPER FUNCTIONS ------------------------------------------
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Return user if email is registered. Otherwise undefined.
const lookupEmail = (email, usersDatabase) => {
  return Object.values(usersDatabase).find(user => user.email === email);
};

// Return user if password matches email. Otherwise undefined.
const authenticateUser = (email, password, usersDatabase) => {
  const user = lookupEmail(email, usersDatabase);
  // console.log("this da user", user);
  if (user) {
    if (bcrypt.compareSync(password, user.hashedPassword)) {
      return user;
    }
  }
};

// Add user to users database.
const addUser = (userID, email, hashedPassword, usersDatabase) => {
  const user = {
    userID,
    email,
    hashedPassword
  };
  usersDatabase[userID] = user;
};

// Return random alphanumeric string
const generateRandomString = () => {
  return uuidv4().slice(0,6);
};

// Return object containing urls made by user (could be empty)
const urlsForUser = (id, urlDatabase) => {
  const result = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      result[key] = urlDatabase[key];
    }
  }
  return result;
};

module.exports = { lookupEmail, authenticateUser, addUser, generateRandomString, urlsForUser };
// -------------------------------------------- SETUP --------------------------------------------------

// Require necessary modules and initialize other constants
const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080;
const { lookupEmail, authenticateUser, addUser, generateRandomString, checkOwner, urlsForUser } = require('./helpers');

// Specify other setup configurations
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ["awepgkns", "walsdgjwnsf"]
}));

// Initialize url and user databases
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "aJ48lW"},
  "9sm5xK": { longURL: "http://www.google.com", userID: "aJ48lW"}
};
const usersDatabase = {};

// Create server on port 8080
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// ---------------------------------------------- ROUTERS ----------------------------------------------

// GET REQUESTS
// Read urls_index page
app.get("/", (req,res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  let templateVars = {
    urls: urlsForUser(userID, urlDatabase),
    user: usersDatabase[userID]
  };
  res.render("urls_index", templateVars);
});

// Read urls_new page
app.get("/urls/new", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: usersDatabase[req.session.user_id]
  };
  res.render("urls_new", templateVars);
});

// Read urls_show page associated to shortURL
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const userID = req.session.user_id;
  const isOwner = checkOwner(shortURL, userID, urlDatabase);
  if (isOwner === true) {
    const templateVars = {
      shortURL,
      longURL,
      user: usersDatabase[userID]
    };
    res.render("urls_show", templateVars);
  } else {
    res.send(isOwner);
  }
});

// Read longURL page associated to shortURL
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  if (!longURL.startsWith('http')) {
    longURL = `http://${longURL}`;
  };
  res.redirect(longURL);
});

// Read register page
app.get("/register", (req, res) => {
  const templateVars = { user: usersDatabase[req.session.user_id] };
  res.render("urls_register", templateVars);
});

// Read login page
app.get("/login", (req, res) => {
  const templateVars = { user: null };
  res.render("urls_login", templateVars);
});

// POST REQUESTS
// Create new shortURL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.session.user_id;
  urlDatabase[shortURL] = { longURL, userID };
  res.redirect(`/urls/${shortURL}`);
});

// Delete shortURL
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  const isOwner = checkOwner(shortURL, userID, urlDatabase);
  if (isOwner === true) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.send(isOwner);
  }
});

// Edit shortURL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  const isOwner = checkOwner(shortURL, userID, urlDatabase);
  if (isOwner === true) {
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.send(isOwner);
  }
});

// Logout current user
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/urls");
});

// Register user
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    res.status(400).send("Email or password is empty.");
  } else if (lookupEmail(email, usersDatabase)) {
    res.status(400).send("Email is already registered.");
  } else {
    addUser(userID, email, hashedPassword, usersDatabase);
    req.session.user_id = userID;
    res.redirect("/urls");
  }
});

// Login user
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = authenticateUser(email, password, usersDatabase);

  if (!lookupEmail(email, usersDatabase)) {
    res.status(403).send("Email has not been registered.");
  } else if (!user) {
    res.status(403).send("Incorrect password");
  } else {
    req.session.user_id = user.userID;
    res.redirect("/urls");
  }
});




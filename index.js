const express = require("express");
var admin = require("firebase-admin");
var validate = require("jsonschema").validate;
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
var serviceAccount = require("./cruzhacks-c8855-firebase-adminsdk-jqjtf-588cc69708.json");
// General schema used for creating new documents in database
var generalSchema = {
  type: "object",
  properties: {
    applicationType: {
      type: "string",
      enum: ["hacker", "volunteer"],
    },
    fullName: {
      type: "string",
      minLength: 1,
      maxLength: 25,
    },
    email: {
      type: "string",
      minLength: 1,
      maxLength: 25,
    },
    age: {
      type: "number",
      minimum: 1,
      maximum: 200,
    },
    gender: {
      type: "string",
      minLength: 1,
      maxLength: 50,
    },
    hacker: {
      type: "object",
      properties: {
        yearsOfGrad: {
          type: "number",
          minimum: 1900,
          maximum: 2100,
        },
        school: {
          type: "string",
          minLength: 1,
          maxLength: 50,
        },
        whyParticpate: {
          type: "string",
          minLength: 1,
          maxLength: 500,
        },
      },
      required: ["school", "whyParticipate"],
    },
    volunteer: {
      type: "object",
      properties: {
        company: {
          type: "string",
          minLength: 1,
          maxLength: 50,
        },
        whyVolunteer: {
          type: "string",
          minLength: 1,
          maxLength: 50,
        },
      },
      required: ["whyVolunteer"],
    },
  },
  anyOf: [
    {
      properties: {
        applicationType: { const: "hacker" },
      },
      required: [
        "gender",
        "age",
        "email",
        "fullName",
        "applicationType",
        "hacker",
      ],
      not: {
        required: ["volunteer"],
      },
    },
    {
      properties: {
        applicationType: { const: "volunteer" },
      },
      required: [
        "gender",
        "age",
        "email",
        "fullName",
        "applicationType",
        "volunteer",
      ],
      not: {
        required: ["hacker"],
      },
    },
  ],
};

var bodyParser = require("body-parser");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://cruzhacks-c8855-default-rtdb.firebaseio.com",
});
const db = admin.firestore();
const app = express();
const port = 3000;
app.use(bodyParser.json());

// Middleware for authentication ctoken
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    console.log(err);

    if (err) return res.sendStatus(403);

    req.user = user;

    next();
  });
}

// Route to create new user
app.post("/create", authenticateToken, async (req, res) => {
  const resp = validate(req.body, generalSchema);
  if (!resp.valid) {
    return res.send(400, { message: "Invalid JSON", error: resp.errors });
  }
  const docRef = db.collection("applicants");
  const email = await docRef.where("email", "==", req.body.email).get();
  if (!email.empty) {
    return res.send(400, {
      message: "Email already exists",
    });
  }
  const newDoc = docRef.doc(req.body.email);
  newDoc
    .set(req.body)
    .then(() => {
      return res.send(200, {
        message: "Successfully created user",
        user: res.body,
      });
    })
    .catch((e) => {
      return res.status(404).json(e.message);
    });
});

// Route to get data from 1 user
app.get("/read", authenticateToken, async (req, res) => {
  const applicantref = db.collection("applicants");
  let email;
  if (req.body.email == null) {
    return res.status(404).json({ message: "No document exists" });
  }
  emailq = await applicantref.doc(req.body.email).get();
  if (!emailq.exists) {
    return res.status(404).json({ message: "No document exists" });
  }
  return res.status(200).json(emailq.data());
});

// Route to update information for any user
app.put("/update", authenticateToken, async (req, res) => {
  const applicantref = db.collection("applicants");
  let email;
  let properties;
  if (req.body.email == null) {
    return res.status(404).json({ message: "Please specify email" });
  }
  if (req.body.properties == null) {
    return res.status(404).json({ message: "Please specify what to update" });
  }
  try {
    const t = await applicantref
      .doc(req.body.email)
      .update(req.body.properties);
  } catch (e) {
    return res.status(404).json({ message: e });
  }
  return res.status(200).json({ message: "Succesfully updated" });
});

// Route to delete information for any user
app.delete("/delete", authenticateToken, async (req, res) => {
  const applicantref = db.collection("applicants");
  try {
    const t = await applicantref.doc(req.body.email).delete();
  } catch (e) {
    return res.status(404).json({ message: e });
  }
  return res.status(200).json({ message: "Succesfully deleted" });
});

// Route to get all volunteers
app.get("/volunteers", authenticateToken, async (req, res) => {
  const applicantref = db.collection("applicants");
  const volunteerquery = await applicantref
    .where("applicationType", "==", "volunteer")
    .get();
  var volunteers = [];
  volunteerquery.forEach((doc) => {
    volunteers.push(doc.data());
    console.log(doc.data());
  });
  res.status(200).json({ message: volunteers });
});

// Route to get all hackers
app.get("/hackers", authenticateToken, async (req, res) => {
  const applicantref = db.collection("applicants");
  const volunteerquery = await applicantref
    .where("applicationType", "==", "hacker")
    .get();
  var volunteers = [];
  volunteerquery.forEach((doc) => {
    volunteers.push(doc.data());
    console.log(doc.data());
  });
  res.status(200).json({ message: volunteers });
});

// Route to get all volunteers
app.get("/applicants", authenticateToken, async (req, res) => {
  const applicantref = db.collection("applicants");
  const volunteerquery = await applicantref.get();
  var volunteers = [];
  volunteerquery.forEach((doc) => {
    volunteers.push(doc.data());
    console.log(doc.data());
  });
  res.status(200).json({ message: volunteers });
});

// Route to generate access tokens
app.get("/generateaccesstoken", (req, res) => {
  const token = jwt.sign("admin", process.env.TOKEN_SECRET);
  res.end(JSON.stringify(token));
}); // Basic Auth token. In the future can make auth tokens more secure

app.get("/", (req, res) => {
  res.send("Welcome to the backend server");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

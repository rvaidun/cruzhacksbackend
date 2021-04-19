const express = require("express");
var admin = require("firebase-admin");
var validate = require("jsonschema").validate;

var serviceAccount = require("./cruzhacks-c8855-firebase-adminsdk-jqjtf-588cc69708.json");
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
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://cruzhacks-c8855-default-rtdb.firebaseio.com",
});

var bodyParser = require("body-parser");

const db = admin.firestore();
const app = express();
const port = 3000;
app.use(bodyParser.json());

app.post("/create", async (req, res) => {
  const resp = validate(req.body, generalSchema);
  if (!resp.valid) {
    return res.send(400, { message: "Invalid JSON", error: resp.errors });
  }
  const docRef = db.collection("applicants");
  const newDoc = docRef.doc(req.body.email);
  const email = await docRef.where("email", "==", req.body.email).get();
  if (!email.empty) {
    return res.send(400, {
      message: "Email already exists",
    });
  }
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

app.get("/read", async (req, res) => {
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

app.put("/update", async (req, res) => {
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
app.get("/", (req, res) => {
  res.send("Welcome to the backend server");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

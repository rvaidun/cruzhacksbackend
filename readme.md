# Project Title

Backend server for CruzHacks

## Description

This repository is a backend server for Cruz Hacks. The server is able to perform basic CRUD operations and enforces a set of rules in order to add new documents to the database. There is basic JWT authentication for every route. The backend server stores the data in Firebase Firestore Database. The server has the following routes all of which are protected except `generateaccesstoken`

### create

Creates a new user. The route looks for JSON in request.body. The JSON must be formatted like the following:

```json
{
  "applicationType": "hacker",
  "fullName": "John Doe",
  "email": "johndoe@ucsc.edu",
  "age": 19,
  "gender": "Male",
  "hacker": {
    "yearsOfGrad": 2000,
    "school": "UC Santa Cruz",
    "whyParticipate": "I want to participate because ..."
  }
}
```

Any other format will automatically throw an error. This is to ensure consistency with all documents in the database. JSON data must also follow all rules specified in the schema

### read

This route is to get a specific users information. Pass the email in the JSON body

```json
{
  "email": "johndoe@ucsc.edu"
}
```

### update

This route is to update a specifc users information. Pass the email in the JSON body. Also pass the information that needs to be updated in properties.

```json
{
  "email": "johndoe@ucsc.edu",
  "properties": {
    "age": 15
  }
}
```

### delete

This route is to delete a specifc users information. Pass the email in the JSON body

```json
{
  "email": "johndoe@ucsc.edu"
}
```

### volunteers

This route is to get all volunteers in the database

### hackers

This route is to get all hackers in the database

### applicants

This route is to get all applicants in the database

### generateaccesstoken

This route generates an access token to use

## Getting Started

### Dependencies

- Node JS
  To install all the dependencies cd into the directory and run `npm install`
  Move the secret files into the directory

### Installing

### Executing program

- To start the development server run the following command

```bash
npm run serve
```

## Authors

Rahul Vaidun

require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const { v4: uuid } = require('uuid');

const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

function validateBearerToken(req, res, next){
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get('authorization')
  if(!authToken || authToken.split('')[1] !==apiToken){
    return res.status(401).json({error:'unauthorized request'})
  }
  next ();
}

app.post('/address', validateBearerToken);
app.delete('/address/userId', validateBearerToken)

const address = [
  {
    'id': '3c8da4d5-1597-46e7-baa1-e402aed70d80',
    'firstName': 'Matthew',
    'lastName': 'Banks',
    'address1': '441 W. Chaparral St.',
    'address2': 'optional',
    'city': 'Rialto',
    'state': 'California',
    'zip': '92376'
  }
];

// Create a GET route on /address that fetches all addresses
app.get('/address', (req, res) => {
  res
    .json(address);
});


// Create a POST route on /address that creates a new address

app.post('/address', (req, res) => {
  // get the data
  const { firstName, lastName, address1, address2=false, city, state, zip } = req.body;

  console.log(req.body);

  // All are required, check if they were sent
  if (!firstName) {
    return res
      .status(400)
      .send('First Name required');
  }

  if (!lastName) {
    return res
      .status(400)
      .send('Last name required');
  }

  if(!city){
    return res.status(400).send('city is required')

  }
  if(!state){
    return res.status(400).send('state is required')

  if (!address1) {
    return res
      .status(400)
      .send('address1 is required');
  }

  // make sure username is correctly formatted.
  if (firstName.length < 3 || firstName.length > 20) {
    return res
      .status(400)
      .send('First Name must be between 3 and 20 characters');
  }

  if (lastName.length < 3 || lastName.length > 20) {
    return res
      .status(400)
      .send('First Name must be between 3 and 20 characters');
  }

  // Valid Address
  if (address1.length < 8 || address1.length > 50) {
    return res
      .status(400)
      .send('Valid address is required');
  }

  // ALL fields except address2 are required

  // state must be exactly two characters
  // Valid State
  if (state.length < 0 || state.length > 3) {
    return res
      .status(400)
      .send('Valid address is required');
  }

  // zip must be exactly a five-digit number
  // zip code contains digit, using a regex here
  if (!zip.match(/^[0-9]{5}(?:-[0-9]{4})?$/)) {
    return res
      .status(400)
      .send('Must submit a valid zip code');
  }

  // id is auto generated
  const id = uuid();
  const newAddress = {
    id,
    firstName,
    lastName,
    address1,
    address2,
    city,
    state,
    zip
  };

  address.push(newAddress);

  res
    .status(201)
    .location(`http://localhost:8000/address/${id}`)
    .json(newAddress);
    
});

// Create a DELETE route on /address/:id
app.delete('/address/:addressId', (req, res) => {
  const { addressId } = req.params;
  const index = address.findIndex(u => u.id === addressId);

  // make sure we actually find a user with that id
  if (index === -1) {
    return res
      .status(404)
      .send('User not found');
  }

  address.splice(index, 1);

  // res.send('Deleted');
  res
    .status(204)
    .end();
});

app.get('/user', (req, res) => {
  res
    .json(address);
});

// Add Bearer Token Authorization middleware on ONLY the POST/DELETE routes



app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
import config from '../config'
import { User } from '../resources/user/user.model'
import jwt from 'jsonwebtoken'

// given a user object, this will will return a jwt based on
// the user id given i.e. user comes in, token goes out
export const newToken = user => {
  // signing token with payload of a user id
  return jwt.sign({ id: user.id }, config.secrets.jwt, {
    expiresIn: config.secrets.jwtExp
  })
}

// given a token, this will verify if the token was created with
// the same secrets (signed with the same secret) from the same server
// i.e. token goes in user comes out (payload)
export const verifyToken = token =>
  new Promise((resolve, reject) => {
    jwt.verify(token, config.secrets.jwt, (err, payload) => {
      if (err) return reject(err)
      resolve(payload)
    })
  })

// accept email and password and response back with a token
export const signup = async (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send({ message: 'Email and passwrd required.' })
  }

  try {
    const user = await User.create(req.body)
    const token = newToken(user)
    return res.status(201).send({ token })
  } catch (e) {
    console.error(e)
    return res.status(400).end()
  }
}

// checks email & password in database
// use checkPassword function of User being passed in
export const signin = async (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send({ message: 'Email and passwrd required.' })
  }
  const user = await User.findOne({ email: req.body.email }).exec()

  if (!user) {
    return res.status(401).send({ message: 'Not Auth' })
  }

  try {
    const match = await user.checkPassword(req.body.password)
    if (!match) {
      return res.status(401).send({ message: 'Not Auth' })
    }
    const token = newToken(user)
    return res.status(201).send({ token })
  } catch (e) {
    console.error(e)
    return res.status(400).send({ message: 'Not Auth' })
  }
}

// middleware to protect routes. run the verifyToken method here
export const protect = async (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).end()
  }
  let token = req.headers.authorization.split('Bearer ')[1]
  if (!token) {
    return res.status(401).end()
  }

  try {
    const payload = await verifyToken(token)
    console.log(payload)
    const user = await User.findById(payload.id)
      .select('-password')
      .lean() // converts this JSON same as user.toJSON
      .exec()
    req.user = user
    next()
  } catch (e) {
    console.error(e)
    return res.status(401).end()
  }
}

import express from 'express'
import { json, urlencoded } from 'body-parser'
import morgan from 'morgan'
import cors from 'cors'

export const app = express()

app.disable('x-powered-by')

app.use(cors())
app.use(json())
app.use(urlencoded({ extended: true }))
app.use(morgan('dev'))

const log = (req, res, next) => {
  console.log('logging')
  // next essentially is our indicator for middleware and says execute
  // the next order of middleware
  next()
}
/*
many different ways to configure middleware
*/

app.get('/', [log, log, log], (req, res) => {
  res.send({ message: ' Hello' })
})

app.post(`/`, (req, res) => {
  console.log(req.body)
  res.send({ message: 'ok' })
})

export const start = () => {
  app.listen(4000, () => {
    console.log('server is on 4000')
  })
}

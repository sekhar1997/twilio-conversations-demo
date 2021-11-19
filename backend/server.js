require('dotenv').config()
const twilio = require('twilio')
const cors = require('cors')
const express = require('express')
const app = express()

app.use(cors())
app.use(express.json())

const AccessToken = twilio.jwt.AccessToken
const ChatGrant = AccessToken.ChatGrant

const port = process.env.PORT || 3000
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioApiKey = process.env.TWILIO_CHAT_SID
const twilioApiSecret = process.env.TWILIO_CHAT_SECRET
const serviceSid = process.env.TWILIO_SERVICE_SID

app.post('/token', async (req, res) => {
  const identity = req.body.identity

  const chatGrant = new ChatGrant({
    serviceSid: serviceSid,
  });

  const token = new AccessToken(
    twilioAccountSid,
    twilioApiKey,
    twilioApiSecret,
    { identity: identity }
  );

  token.addGrant(chatGrant);

  res.json({ token: token.toJwt() })
})

app.post('/conversation', async (req, res) => {
  const client = twilio(twilioAccountSid, authToken)
  const conversation = await client.conversations.conversations
    .create({ friendlyName: 'Demo' });

  await client.conversations
    .conversations(conversation.sid)
    .participants
    .create({ identity: 'karan.bains.dev@gmail.com' })

  await client.conversations
    .conversations(conversation.sid)
    .participants
    .create({ identity: 'karan.b@axiomio.com' })

  res.json({ conversation })
})

app.listen(port, () => {
  console.log(`Listening for requests at http://localhost:${port}`)
})

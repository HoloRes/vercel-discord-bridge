// Imports
// Packages
const { Webhook, MessageBuilder } = require('discord-webhook-node');
const express = require('express');
const crypto = require('crypto');

// Local files
const config = require('./config');

// Init
const app = express();
app.listen(3000);
app.use(express.json());

const hook = new Webhook(config.discordWebhookUrl);
hook.setUsername('Vercel');
hook.setAvatar('https://i.imgur.com/teXXn5w.png');

function verifySignatureMiddleware(req, res, next) { // Based on: https://docs.github.com/en/developers/webhooks-and-events/securing-your-webhooks
  const hmac = crypto.createHmac('sha256', config.githubSecret);
  const digest = Buffer.from(`sha256=${hmac.update(JSON.stringify(req.body)).digest('hex')}`, 'utf8');
  const checksum = Buffer.from(req.get['X-Hub-Signature-256'], 'utf8')
  req.body.verified = crypto.timingSafeEqual(digest, checksum);
  next();
}

function sendEmbed(status, color) {
  const embed = new MessageBuilder()
    .setTitle(status.description)
    .setUrl(status.target_url)
    .setColor(color)
    .setDescription(`Environment: ${status.environment}`)
    .setFooter(`Deployment ID: ${status.target_url.substring(`https://${config.vercelPrefix}-`.length, `https://${config.vercelPrefix}-`.length + 9)}`)
    .setTimestamp(status.created_at ? new Date(status.created_at) : new Date());
  hook.send(embed);
}

// eslint-disable-next-line consistent-return
app.post('/webhook', verifySignatureMiddleware, (req, res) => {
  if (!req.body.verified) {
    return res.status(403).json({
      code: 'invalid_signature',
      error: "signature didn't match",
    });
  }

  if(req.body.zen) return res.status(200).send("OK");

  if (!req.body.deployment_status) return res.status('400').json({ code: 'bad_request', error: 'not a valid body' });

  const { deployment_status: status } = req.body;
  if (!status.state || !status.target_url || !status.description || !status.environment) return res.status('400').json({ code: 'bad_request', error: 'not a valid body' });

  if (status.state === 'pending') {
      sendEmbed(status, '#faf032');
      res.status(200).send("OK");
    }
  else if (status.state === 'success') {
      sendEmbed(status, '#32fc40');
      res.status(200).send("OK");
    }
  else if (status.state === 'failure' || status.state === 'error') {
      sendEmbed(status, '#ff352e');
      res.status(200).send("OK");
    }
  else return res.status('400').json({ code: 'bad_request', error: 'not a valid body' });
});

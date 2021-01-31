// Imports
// Packages
const {Webhook, MessageBuilder} = require("discord-webhook-node"),
    express = require("express"),
    crypto = require("crypto");

// Local files
const config = require("./config");

// Init
const app = express();
app.listen(3000);
app.use(express.json());

const hook = new Webhook(config.discordWebhookUrl);
hook.setUsername("Vercel");
hook.setAvatar("https://i.imgur.com/gFLQbka.png");

function verifySignatureMiddleware(req, res, next) { // Based on: https://vercel.com/docs/api#integrations/webhooks/securing-webhooks
    const signature = crypto.createHmac("sha1", config.vercelKey)
        .update(req)
        .digest("hex");
    req.body.verified = signature === req.headers["x-vercel-signature"];
    next();
}

app.post("/webhook", verifySignatureMiddleware, (req, res) => {
    if(!req.body.verified) return res.status(403).json({
        code: "invalid_signature",
        error: "signature didn't match"
      });

    console.log(JSON.stringify(req.body, null, 2));
    if(req.body.type === "deployment") {
        const embed = new MessageBuilder()
            .setTitle("New deployment created")
            .setUrl(req.body.url)
            .setColor("#faf032")
            .setDescription(`Project: ${req.body.project}`)
            .setFooter(`Deployment ID: N/A`)
            .setTimestamp();
        hook.send(embed);
    } else if(req.body.type === "deployment-ready") {
        const embed = new MessageBuilder()
            .setTitle("Deployment succesful")
            .setUrl(req.body.url)
            .setColor("#32fc40")
            .setDescription(`Project: ${req.body.project}`)
            .setFooter(`Deployment ID: N/A`)
            .setTimestamp();
        hook.send(embed);
    } else if(req.body.type === "deployment-error") {
        const embed = new MessageBuilder()
            .setTitle("Deployment failed")
            .setUrl(req.body.url)
            .setColor("#ff352e")
            .setDescription(`Project: ${req.body.project}`)
            .setFooter(`Deployment ID: N/A`)
            .setTimestamp();
        hook.send(embed);
    } else return res.status("400").json({code: "bad_request", error: "not a valid event type"})
});
import express from "express";
import { WebClient } from "@slack/web-api";

const router = express.Router({ mergeParams: true });

const sendMessageToSlackChannel = async (param) => {
	const { channel, text } = param;
	const slackClient = new WebClient(process.env.SLACK_TOKEN);
	slackClient.chat.meMessage({
		text,
		channel,
	});
};

/*
@route      /community/bug
@method     GET
@desc       Reports a bug
@access     public
*/
router.post("/bug", async (req, res) => {
	try {
		const { username, email, description, stack } = req.body;
		sendMessageToSlackChannel({
			channel: process.env.SLACK_BUG_CHANNEL,
			text:
				`${username} (${email}) reported a new bug : \n` +
				`${description} \n` +
				stack,
		});
	} finally {
		res.json();
	}
});

/*
@route      /community/feedback
@method     GET
@desc       Reports a feedback
@access     public
*/
router.post("/feedback", async (req, res) => {
	try {
		const { username, email, feedback } = req.body;
		sendMessageToSlackChannel({
			channel: process.env.SLACK_FEEDBACK_CHANNEL,
			text: `${username} (${email}) submitted a new feedback : \n` + feedback,
		});
	} finally {
		res.json();
	}
});

export default router;

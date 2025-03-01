import express, { Request, Response } from "express";
import { json } from "body-parser";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";

const app = express();

app.use(cors());

app.use(json());

app.post(
	"/call-anthropic",
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { apikey, prompt } = req.body;

			if (!apikey || !prompt) {
				return;
			}

			const anthropic = new Anthropic({
				apiKey: apikey
			});

			const msg = await anthropic.messages.create({
				model: "claude-3-5-sonnet-20241022",
				max_tokens: 1024,
				messages: [{ role: "user", content: prompt }]
			});

			res.json(msg);
		} catch (error) {
			console.error("Error calling API:", error);
			res.status(500).json({ error: "An error occurred." });
		}
	}
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

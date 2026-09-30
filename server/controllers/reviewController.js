import Review from '../models/Review.js';
import { getCached, setCache, generateCacheKey } from '../utils/cache.js';

export const createReview = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code || code.trim() === '') {
      return res.status(400).json({ error: 'Please enter some code' });
    }

    // Check Redis cache first
    const cacheKey = generateCacheKey(code);
    const cached = await getCached(cacheKey);
    if (cached) {
      return res.status(200).json({
        id: 'cached',
        review: cached,
        fromCache: true
      });
    }

    const systemPrompt = `You are an expert code reviewer with deep knowledge of 
software engineering best practices, design patterns, 
security, and performance optimization.

When given code, analyze it and respond ONLY in this 
exact JSON format with no extra text, no markdown, 
no backticks:

{
  "language": "detected programming language",
  "overall_score": <number 0-100>,
  "summary": "2-3 sentence overall assessment",
  "bugs": [
    {
      "line": <line number or null>,
      "severity": "critical/high/medium/low",
      "issue": "description of the bug",
      "fix": "how to fix it"
    }
  ],
  "security": [
    {
      "line": <line number or null>,
      "severity": "critical/high/medium/low",
      "issue": "security vulnerability description",
      "fix": "how to fix it"
    }
  ],
  "performance": [
    {
      "line": <line number or null>,
      "issue": "performance problem description",
      "fix": "how to improve it"
    }
  ],
  "best_practices": [
    {
      "issue": "what could be improved",
      "fix": "recommended approach"
    }
  ],
  "positive": [
    "things done well in the code"
  ],
  "improved_code": "complete corrected version of the code"
}`;

    let retries = 1;
    let parsedData = null;

    while (retries >= 0) {
      try {
        const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ parts: [{ text: "Review this code:\n\n" + code }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        });

        if (!apiResponse.ok) {
          if (apiResponse.status === 429) {
            throw new Error("API_QUOTA_EXCEEDED");
          }
          const errorBody = await apiResponse.text();
          throw new Error(`API error: ${apiResponse.status} ${apiResponse.statusText} - ${errorBody}`);
        }

        const data = await apiResponse.json();
        let textContent = data.candidates && data.candidates[0] ? data.candidates[0].content.parts[0].text : '';

        textContent = textContent.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedData = JSON.parse(textContent);
        break;
      } catch (err) {
        console.error('API or Parse Error:', err.message);
        
        if (err.message === "API_QUOTA_EXCEEDED") {
          return res.status(429).json({ error: "The AI service has reached its free tier usage limit. Please try again after a few minutes." });
        }

        if (retries === 0) {
          return res.status(500).json({ error: `Analysis failed: ${err.message}` });
        }
        retries--;
      }
    }

    if (!parsedData) {
      return res.status(500).json({ error: 'Review failed. Please try again.' });
    }

    // Save to Redis cache
    await setCache(cacheKey, parsedData, 3600);

    let savedReview = null;
    try {
      const reviewDoc = new Review({
        code,
        language: parsedData.language || 'Unknown',
        overall_score: parsedData.overall_score || 0,
        review: parsedData,
        userId: req.user ? req.user._id : null
      });
      savedReview = await reviewDoc.save();
    } catch (dbErr) {
      console.error('MongoDB save fail:', dbErr);
    }

    return res.status(200).json({
      id: savedReview ? savedReview._id : Date.now().toString(),
      review: parsedData
    });

  } catch (error) {
    console.error('Controller Error:', error);
    return res.status(500).json({ error: 'Review failed. Please try again.' });
  }
};

export const getHistory = async (req, res) => {
  try {
    const filter = req.user ? { userId: req.user._id } : {};
    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .limit(10)
      .select('id language overall_score createdAt');

    return res.status(200).json(reviews);
  } catch (error) {
    console.error('History Fetch Error:', error);
    return res.status(500).json({ error: 'Failed to fetch history.' });
  }
};

export const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json({ review: review.review });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch review' });
  }
};

import os
import json
from typing import List, Optional
from openai import OpenAI
from backend.core.logging import get_logger

logger = get_logger('Odyssey.ai')

class AIService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.client = OpenAI(api_key=self.api_key) if self.api_key else None
        if not self.api_key:
            logger.warning("OPENAI_API_KEY not found. AI features will be disabled.")

    def parse_smart_search(self, query: str) -> dict:
        """
        Extracts structured search parameters from a natural language query.
        Returns a dictionary with 'keyword', 'type', 'min_rating', 'open_now', etc.
        """
        if not self.client:
            return {"keyword": query}

        system_prompt = """
        You are an AI assistant for a travel app.
        Convert the user's natural language search query into structured parameters for the Google Places API.
        
        Output JSON only:
        {
            "keyword": "string (main search term)",
            "type": "string (valid Google Place type, e.g., restaurant, park, cafe)",
            "min_price": int (0-4) or null,
            "max_price": int (0-4) or null,
            "open_now": boolean or null,
            "min_rating": float (0-5) or null
        }
        Example: "cheap late night tacos" -> {"keyword": "tacos", "type": "restaurant", "max_price": 1, "open_now": true}
        """

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": query}
                ],
                response_format={"type": "json_object"},
                temperature=0
            )
            result = json.loads(response.choices[0].message.content)
            logger.info(f"AI parsed query '{query}' into: {result}")
            return result
        except Exception as e:
            logger.error(f"AI parsing failed: {e}")
            return {"keyword": query}

    def get_vibe_recommendations(self, city: str, vibe_description: str) -> List[str]:
        """
        Returns a list of place names in a city that match a specific 'vibe'.
        """
        # Implementation for "Vibe Search" to come...
        pass

# Singleton
ai_service = AIService()

from openai import OpenAI
from app.core.config import get_settings
class LLMService:
 def __init__(self,client=None):
  s=get_settings()
  if client is None and not s.openai_api_key: raise RuntimeError('OPENAI_API_KEY is required for live LLM calls.')
  self.client=client or OpenAI(api_key=s.openai_api_key);self.model=s.openai_model
 def call_llm(self,system_prompt,user_message): return self.client.responses.create(model=self.model,instructions=system_prompt,input=user_message).output_text

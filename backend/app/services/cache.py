# from supabase import create_client, Client
# import os
# from datetime import datetime, timedelta
# from typing import Optional, Dict, Any

# class CacheService:
#     def __init__(self):
#         self.supabase: Client = create_client(
#             os.getenv("SUPABASE_URL"),
#             os.getenv("SUPABASE_KEY")
#         )
#         self.CACHE_DURATION = timedelta(days=30)

#     async def get_cached_rate(self, code: str, location: str) -> Optional[Dict[str, Any]]:
#         """Retrieve cached rate for a code/location combination"""
#         try:
#             result = self.supabase.table("standardized_rates").select("*").eq(
#                 "code", code
#             ).eq(
#                 "location", location
#             ).execute()
            
#             if result.data:
#                 cached_rate = result.data[0]
#                 cache_date = datetime.fromisoformat(cached_rate['created_at'])
                
#                 if datetime.now() - cache_date < self.CACHE_DURATION:
#                     return {
#                         "code": cached_rate["code"],
#                         "description": cached_rate.get("description", ""),
#                         "standardized_rate": cached_rate["standardized_rate"],
#                         "sources": cached_rate["sources"]
#                     }
#             return None
            
#         except Exception as e:
#             print(f"Cache retrieval error: {str(e)}")
#             return None

#     async def cache_rate(self, code: str, location: str, rate_data: dict) -> bool:
#         """Store new rate in cache"""
#         try:
#             data = {
#                 "code": code,
#                 "location": location,
#                 "description": rate_data.get("description", ""),
#                 "standardized_rate": rate_data["standardized_rate"],
#                 "sources": rate_data["sources"],
#                 "created_at": datetime.now().isoformat()
#             }
#             self.supabase.table("standardized_rates").upsert(
#                 data, 
#                 on_conflict="code,location"
#             ).execute()
#             return True
            
#         except Exception as e:
#             print(f"Cache storage error: {str(e)}")
#             return False

#     async def bulk_get_cached_rates(self, codes: list[str], location: str) -> dict:
#         """Get cached rates for multiple codes at once"""
#         try:
#             result = self.supabase.table("standardized_rates").select("*").in_(
#                 "code", codes
#             ).eq(
#                 "location", location
#             ).execute()
            
#             cached_rates = {}
#             for rate in result.data:
#                 cache_date = datetime.fromisoformat(rate['created_at'])
#                 if datetime.now() - cache_date < self.CACHE_DURATION:
#                     cached_rates[rate["code"]] = {
#                         "code": rate["code"],
#                         "description": rate.get("description", ""),
#                         "standardized_rate": rate["standardized_rate"],
#                         "sources": rate["sources"]
#                     }
#             return cached_rates
            
#         except Exception as e:
#             print(f"Bulk cache retrieval error: {str(e)}")
#             return {}
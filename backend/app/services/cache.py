from supabase import create_client
import os
import json
from datetime import datetime, timedelta

supabase = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_KEY")
)

def supabase_cache(table: str, expire_hours: int = 24):
    """
    Decorator for Supabase caching
    """
    def decorator(func):
        async def wrapper(*args, **kwargs):
            cache_key = f"{func.__name__}:{':'.join(str(arg) for arg in args)}"
            
            # Check cache
            result = supabase.table('cache').select('data, created_at') \
                .eq('key', cache_key) \
                .single() \
                .execute()
            
            # If found and not expired
            if result.data:
                created_at = datetime.fromisoformat(result.data['created_at'])
                if datetime.now() - created_at < timedelta(hours=expire_hours):
                    return json.loads(result.data['data'])
            
            # If not found or expired, get new data
            result = await func(*args, **kwargs)
            
            # Update cache
            supabase.table('cache').upsert({
                'key': cache_key,
                'data': json.dumps(result),
                'created_at': datetime.now().isoformat()
            }).execute()
            
            return result
        return wrapper
    return decorator

# Usage
@supabase_cache("ucr_rates", 24)
async def search_ucr_rates(procedure_code: str):
    return await perplexity_search(procedure_code)

from openai import OpenAI
import os
# import sys
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("PERPLEXITY_API_KEY")

# Set your API key as an environment variable for security
# os.environ["PERPLEXITY_API_KEY"] = "your_api_key_here"

# Initialize the OpenAI client with Perplexity's base URL
client = OpenAI(api_key=api_key, base_url="https://api.perplexity.ai")

async def search_ucr_rates(input_text):
    messages = [
        {
            "role": "system",
            "content": "You are a skilled AI researcher that provides information about UCR rates for medical procedures in the United States of America."
        },
        {
            "role": "user",
            "content": f'''Search for the Usual, Customary, and Reasonable (UCR) cost/rate for the procedure_codes in {input_text} based on its code or description value. 
            Focus exclusively on this procedure, but do make sure to account for semantic variation in healthcare terminology.
            Here are some reputable sources to search - FAIR Health, Context4Healthcare, Centers for Medicare and Medicaid Services - but look for more if you can't find the relevant information.
            The data should reflect costs in the same city/state as the patient's visit_info.

            Once you've accumulated your data on UCR rates, calculate the average. Provide an output with only one sentence.
            It should state the standardized UCR rate (the average) for the medical procedure in the city/state the user underwent it.
            Make it clear that this is to be labelled and used as 'ucr_rate'. If you can't find any information just say that the ucr_rate is the same as what was charged in input_text 
            don't ever output 'null' or anything non-numeric, must ALWAYS be numbers.
            '''
        }
    ]

    try:
        response = client.chat.completions.create(
            model="llama-3.1-sonar-small-128k-online",
            messages=messages,
        )
        # sys.stderr(response.choices[0].message.content)
        return response.choices[0].message.content
    except Exception as e:
        return f"An error occurred: {str(e)}"


# result = search_ucr_rates(bill)
# print(result)

# Main function
# def main():
#     # Run the analysis with the provided medical bill
#     #use below code once RAG comes in
#     # filepath = sys.argv[1]
#     # with open(filepath, 'r') as file:
#     #     bill = json.load(file)
#     final_report = search_ucr_rates("thre isnt much to say")
#     print(final_report)

# Entry point for the script
# if __name__ == "__main__":
#     main()
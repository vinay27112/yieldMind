from groq import Groq
from src.config import GROQ_API_KEY

client = Groq(api_key=GROQ_API_KEY)

def explain_risk(portfolio, risk_result):
    prompt = f"""
You are a DeFi financial advisor. Explain this portfolio risk assessment in 2-3 sentences.
Be specific, mention actual numbers, and give one actionable recommendation.

Portfolio total value: ${portfolio.total_value_usd:.2f}
Risk score: {risk_result['score']}/100 (higher = riskier)
Concentration risk: {risk_result['breakdown']['concentration']}/100
Volatility risk: {risk_result['breakdown']['volatility']}/100
Dominant token: {risk_result['dominant_token']}
Flags: {', '.join(risk_result['flags']) if risk_result['flags'] else 'None'}

Respond in 2-3 sentences maximum. Be direct and specific.
"""
    
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=150,
    )
    
    return response.choices[0].message.content

def explain_strategy(strategy, amount, risk_appetite):
    prompt = f"""
You are a DeFi financial advisor. Explain this yield strategy in 2 sentences.
Be specific and mention the expected returns.

Strategy: {strategy['protocol']}
Token: {strategy['token']}
Expected APY: {strategy['expected_apy']}%
Risk score: {strategy['risk_score']}/100
Amount to invest: ${amount}
User risk appetite: {risk_appetite}

Respond in 2 sentences maximum. Be direct and encouraging.
"""
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=100,
    )
    return response.choices[0].message.content
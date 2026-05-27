VOLATILITY = {
    "ETH": 70,
    "BTC": 65,
    "SOL": 85,
    "USDC": 5,
    "DAI": 5,
    "mUSDC": 5,
}

PROTOCOL_RISK = {
    "aave": 15,
    "compound": 20,
    "mock": 10,
    "unknown": 90,
}

def compute_risk_score(portfolio):
    total_value = portfolio.total_value_usd
    
    if total_value == 0:
        return {
            "score": 0,
            "breakdown": {
                "concentration": 0,
                "volatility": 0,
                "protocol": 0
            },
            "dominant_token": None,
            "flags": []
        }
    max_concentration = 0
    dominant_token = None
    weighted_volatility = 0

    for balance in portfolio.balances:
        if balance.value_usd == 0:
            continue
        
        # What percentage of portfolio is this token?
        token_percentage = balance.value_usd / total_value
        
        # Track which token dominates
        if token_percentage > max_concentration:
            max_concentration = token_percentage
            dominant_token = balance.symbol
        
        # Get volatility for this token (default 50 if unknown)
        token_volatility = VOLATILITY.get(balance.symbol, 50)
        
        # Weighted contribution to overall volatility
        weighted_volatility += token_percentage * token_volatility

    concentration_score = max_concentration * 100
    volatility_score = weighted_volatility

    # Get protocol risk based on vault position
    vault_token = portfolio.vault_position.token.lower()
    protocol_score = PROTOCOL_RISK.get(vault_token, 90)

    # Weighted final score
    final_score = (
        (concentration_score * 0.35) +
        (volatility_score * 0.35) +
        (protocol_score * 0.30)
    )

    # Generate flags
    flags = []
    if concentration_score > 70:
        flags.append(f"High {dominant_token} concentration — consider diversifying")
    if volatility_score > 60:
        flags.append("High volatility exposure — consider adding stablecoins")
    if float(portfolio.vault_position.deposited) == 0:
        flags.append("No funds deposited in vault — missing yield opportunities")

    return {
        "score": round(final_score),
        "breakdown": {
            "concentration": round(concentration_score),
            "volatility": round(volatility_score),
            "protocol": round(protocol_score)
        },
        "dominant_token": dominant_token,
        "flags": flags
    }
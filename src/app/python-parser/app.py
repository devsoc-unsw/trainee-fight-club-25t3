from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import re
from collections import defaultdict

app = FastAPI(title="Bank Statement Analyser API")

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------
# Enhanced Categories
# ----------------------------
category_map = {
    "Income": [
        "salary", "payment from", "payroll", "wages", "deposit", "freelance", "invoice"
    ],
    "Transport": [
        "transportfornsw", "transport", "uber", "taxi", "petrol", "fuel", "parking", 
        "toll", "opal", "train", "bus", "metro"
    ],
    "Food & Dining": [
        "gyg", "guzman", "grill'd", "mcdonald", "kfc", "hungry jack", "subway",
        "coles", "woolworths", "aldi", "iga", "supermarket", "grocery",
        "restaurant", "cafe", "coffee", "chatime", "boost", "bubble tea",
        "uber eats", "menulog", "deliveroo", "doordash", "fried brothers",
        "yo-chi", "yogurt", "food", "dining", "yallah eat"
    ],
    "Entertainment": [
        "netflix", "spotify", "disney", "stan", "amazon prime", "apple music",
        "ticketek", "ticket", "movie", "cinema", "event", "concert",
        "timezone", "arcade", "game", "steam", "playstation", "xbox"
    ],
    "Shopping": [
        "amazon", "ebay", "kmart", "target", "big w", "myer", "david jones",
        "bunnings", "officeworks", "jb hi-fi", "apple store", "perfume",
        "bujairami", "retail", "shopping"
    ],
    "Health & Fitness": [
        "anytime fitness", "gym", "fitness", "yoga", "pharmacy", "chemist",
        "doctor", "medical", "dental", "physio", "health"
    ],
    "Bills & Utilities": [
        "electricity", "gas", "water", "internet", "telstra", "optus",
        "vodafone", "phone", "mobile", "utility", "council", "insurance"
    ],
    "Subscriptions": [
        "apple.com/bill", "google", "microsoft", "adobe", "patreon",
        "porkbun", "domain", "hosting", "railway", "subscription"
    ],
    "Transfers & Savings": [
        "funds tfer", "transfer to", "savings", "investment", "bpay"
    ],
    "Rent & Housing": [
        "rent", "landlord", "real estate", "property", "mortgage"
    ],
    "Personal": [
        "payment to", "mobile banking payment"
    ]
}

# ----------------------------
# Pydantic Models
# ----------------------------
class BankStatementRequest(BaseModel):
    raw_statement: str

class Transaction(BaseModel):
    date: str
    description: str
    amount: float
    category: str

class CategorySummary(BaseModel):
    category: str
    spent: float
    received: float
    count: int

class SankeyNode(BaseModel):
    name: str

class SankeyLink(BaseModel):
    source: int
    target: int
    value: float

class SankeyData(BaseModel):
    nodes: List[SankeyNode]
    links: List[SankeyLink]

class AnalysisResponse(BaseModel):
    transactions: List[Transaction]
    category_summary: List[CategorySummary]
    sankey_data: SankeyData
    total_spent: float
    total_received: float
    net_cash_flow: float
    transaction_count: int

# ----------------------------
# Helper Functions
# ----------------------------
def parse_bank_statement(raw_text: str) -> List[Dict[str, Any]]:
    """Parse raw bank statement text into structured transactions."""
    transactions = []
    lines = raw_text.split('\n')
    
    for line in lines:
        line = line.strip()
        if not line or 'Transaction Report' in line or 'Page' in line:
            continue
            
        # Look for date pattern (DD MMM or DD DEC, etc.)
        date_match = re.match(r'(\d{1,2}\s+(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC))', line, re.IGNORECASE)
        
        if date_match:
            date = date_match.group(1)
            remaining = line[len(date):].strip()
            
            # Extract description and amounts
            amount_pattern = r'\$?([\d,]+\.\d{2})\s*$'
            amounts = re.findall(amount_pattern, remaining)
            
            if amounts:
                # Remove amounts from description
                description = re.sub(amount_pattern, '', remaining).strip()
                description = re.sub(r'\s+blank\s*', ' ', description).strip()
                
                if len(amounts) == 1:
                    amount_str = amounts[0].replace(',', '')
                    amount = float(amount_str)
                    
                    # Heuristic: PAYMENT FROM, DEPOSIT, TRANSFER FROM = positive
                    if any(keyword in description.upper() for keyword in ['PAYMENT FROM', 'DEPOSIT', 'TRANSFER FROM', 'TFER TRANSFER']):
                        if 'TO' in description.upper() and 'FROM' not in description.upper():
                            amount = -amount
                    else:
                        amount = -amount
                        
                elif len(amounts) == 2:
                    withdrawal = float(amounts[0].replace(',', ''))
                    deposit = float(amounts[1].replace(',', ''))
                    amount = deposit if deposit > 0 else -withdrawal
                else:
                    continue
                
                transactions.append({
                    "date": date,
                    "description": description,
                    "amount": amount
                })
    
    return transactions

def categorize(description: str) -> str:
    """Categorize a transaction based on its description."""
    description_lower = description.lower()
    
    best_category = "Other"
    best_score = 0
    
    for category, keywords in category_map.items():
        for keyword in keywords:
            if keyword in description_lower:
                score = len(keyword)
                if score > best_score:
                    best_score = score
                    best_category = category
    
    return best_category

def generate_sankey_data(transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Generate Sankey diagram data from transactions."""
    totals = defaultdict(float)
    
    for tx in transactions:
        category = categorize(tx["description"])
        
        if tx["amount"] > 0:
            source = category
            target = "Your Account"
        else:
            source = "Your Account"
            target = category
        
        totals[(source, target)] += abs(tx["amount"])
    
    # Build nodes and links
    nodes = list({name for pair in totals.keys() for name in pair})
    node_index = {name: i for i, name in enumerate(nodes)}
    
    links = [
        {
            "source": node_index[s], 
            "target": node_index[t], 
            "value": round(v, 2)
        } 
        for (s, t), v in totals.items()
    ]
    
    return {
        "nodes": [{"name": n} for n in nodes], 
        "links": links
    }

def generate_summary(transactions: List[Dict[str, Any]]) -> Dict[str, Dict[str, float]]:
    """Generate a summary report of spending by category."""
    category_totals = defaultdict(lambda: {"spent": 0, "received": 0, "count": 0})
    
    for tx in transactions:
        category = categorize(tx["description"])
        category_totals[category]["count"] += 1
        
        if tx["amount"] > 0:
            category_totals[category]["received"] += tx["amount"]
        else:
            category_totals[category]["spent"] += abs(tx["amount"])
    
    return dict(category_totals)

# ----------------------------
# API Endpoints
# ----------------------------
@app.get("/")
def root():
    """Root endpoint with API information."""
    return {
        "message": "Bank Statement Analyzer API",
        "version": "1.0.0",
        "endpoints": {
            "POST /analyze": "Analyze a bank statement",
            "GET /categories": "Get available categories",
            "GET /health": "Health check"
        }
    }

@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

@app.get("/categories")
def get_categories():
    """Get all available transaction categories and their keywords."""
    return {"categories": category_map}

@app.post("/analyze", response_model=AnalysisResponse)
def analyze_statement(request: BankStatementRequest):
    """
    Analyze a bank statement and return categorized transactions with Sankey data.
    
    **Parameters:**
    - raw_statement: The raw text of your bank statement
    
    **Returns:**
    - Parsed transactions with categories
    - Category-wise spending summary
    - Sankey diagram data for visualization
    - Financial totals and statistics
    """
    try:
        # Parse transactions
        transactions = parse_bank_statement(request.raw_statement)
        
        if not transactions:
            raise HTTPException(
                status_code=400, 
                detail="No transactions found in the statement. Please check the format."
            )
        
        # Add categories to transactions
        categorized_transactions = []
        for tx in transactions:
            categorized_transactions.append({
                "date": tx["date"],
                "description": tx["description"],
                "amount": tx["amount"],
                "category": categorize(tx["description"])
            })
        
        # Generate summary
        summary = generate_summary(transactions)
        category_summary = [
            {
                "category": cat,
                "spent": data["spent"],
                "received": data["received"],
                "count": data["count"]
            }
            for cat, data in sorted(summary.items(), key=lambda x: x[1]["spent"], reverse=True)
        ]
        
        # Generate Sankey data
        sankey_data = generate_sankey_data(transactions)
        
        # Calculate totals
        total_spent = sum(data["spent"] for data in summary.values())
        total_received = sum(data["received"] for data in summary.values())
        
        return AnalysisResponse(
            transactions=categorized_transactions,
            category_summary=category_summary,
            sankey_data=sankey_data,
            total_spent=round(total_spent, 2),
            total_received=round(total_received, 2),
            net_cash_flow=round(total_received - total_spent, 2),
            transaction_count=len(transactions)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing statement: {str(e)}")

# ----------------------------
# Run the server
# ----------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
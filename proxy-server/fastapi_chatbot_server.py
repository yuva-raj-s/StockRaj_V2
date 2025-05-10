from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from Actual_Yf_StockRaj.AI_Chat.chatbot import IndianStockChatbot
from Actual_Yf_StockRaj.SentimentAnalysis.sentiment_analysis import analyze_asset_sentiment
import numpy as np
import pandas as pd
import yfinance as yf
import time
from functools import wraps

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

chatbot = IndianStockChatbot()  # Load models ONCE at startup

# Simple cache for yfinance data
cache_store = {}

def cache_result(ttl_seconds=120):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            key = (func.__name__, str(args), str(kwargs))
            now = time.time()
            if key in cache_store:
                result, timestamp = cache_store[key]
                if now - timestamp < ttl_seconds:
                    return result
            result = func(*args, **kwargs)
            cache_store[key] = (result, now)
            return result
        return wrapper
    return decorator

# Improved utility function to handle numpy, pandas, NaN, inf, and out-of-range floats
def to_serializable(val):
    if isinstance(val, dict):
        return {k: to_serializable(v) for k, v in val.items()}
    elif isinstance(val, list):
        return [to_serializable(v) for v in val]
    elif isinstance(val, (np.integer, np.int64, np.int32)):
        return int(val)
    elif isinstance(val, (np.floating, np.float64, np.float32)):
        if np.isnan(val) or np.isinf(val):
            return None
        return float(val)
    elif isinstance(val, (np.ndarray,)):
        return to_serializable(val.tolist())
    elif isinstance(val, pd.DataFrame):
        return to_serializable(val.to_dict())
    elif isinstance(val, pd.Series):
        return to_serializable(val.to_dict())
    elif isinstance(val, float):
        if np.isnan(val) or np.isinf(val):
            return None
        return val
    else:
        return val

class QueryRequest(BaseModel):
    query: str

class PortfolioRequest(BaseModel):
    symbols: List[str]

class WatchlistRequest(BaseModel):
    symbols: List[str]

@cache_result(ttl_seconds=120)
def get_stock_history(symbol):
    stock = yf.Ticker(symbol)
    return stock.history(period="1mo")

@app.post("/process")
def process_query(req: QueryRequest):
    response = chatbot.process_query(req.query)
    if isinstance(response, dict):
        return to_serializable(response)
    return {"text": response, "type": "text"}

@app.get("/stock/{symbol}")
def get_stock(symbol: str):
    result = chatbot.get_stock_details(symbol)
    if not result:
        raise HTTPException(status_code=404, detail=f"No data for symbol {symbol}")
    return to_serializable(result)

@app.get("/market")
def get_market():
    result = chatbot.get_market_activity()
    if not result:
        raise HTTPException(status_code=500, detail="Failed to get market data")
    return to_serializable(result)

@app.get("/analysis/{symbol}")
def get_analysis(symbol: str):
    result = chatbot.get_stock_analysis(symbol)
    if not result:
        raise HTTPException(status_code=404, detail=f"No analysis for symbol {symbol}")
    return to_serializable(result)

@app.get("/sentiment/{symbol}")
def get_sentiment(symbol: str):
    result = chatbot.get_sentiment_analysis(symbol)
    if not result:
        raise HTTPException(status_code=404, detail=f"No sentiment data for symbol {symbol}")
    return to_serializable(result)

@app.post("/portfolio")
def get_portfolio(req: PortfolioRequest):
    result = chatbot.get_portfolio_analysis(req.symbols)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to analyze portfolio")
    return to_serializable(result)

@app.post("/watchlist")
def get_watchlist(req: WatchlistRequest):
    result = chatbot.get_watchlist_analysis(req.symbols)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to analyze watchlist")
    return to_serializable(result)

@app.get("/sector/{sector_key}")
def get_sector(sector_key: str):
    result = chatbot.get_sector_analysis(sector_key)
    if not result:
        raise HTTPException(status_code=404, detail=f"No data for sector {sector_key}")
    return to_serializable(result)

@app.get("/industry/{industry_key}")
def get_industry(industry_key: str):
    result = chatbot.get_industry_analysis(industry_key)
    if not result:
        raise HTTPException(status_code=404, detail=f"No data for industry {industry_key}")
    return to_serializable(result)

@app.get("/market-indices/{symbol}")
async def get_market_indices(symbol: str):
    try:
        # Get stock data using yfinance (cached)
        hist = get_stock_history(symbol)
        if len(hist) == 0:
            raise HTTPException(status_code=404, detail=f"No data found for symbol {symbol}")
            
        # Calculate technical indicators
        # RSI
        delta = hist['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        
        # MACD
        exp1 = hist['Close'].ewm(span=12, adjust=False).mean()
        exp2 = hist['Close'].ewm(span=26, adjust=False).mean()
        macd = exp1 - exp2
        signal = macd.ewm(span=9, adjust=False).mean()
        histogram = macd - signal
        
        # Bollinger Bands
        sma = hist['Close'].rolling(window=20).mean()
        std = hist['Close'].rolling(window=20).std()
        upper_band = sma + (std * 2)
        lower_band = sma - (std * 2)
        
        # Get the latest values
        latest_rsi = rsi.iloc[-1]
        latest_macd = macd.iloc[-1]
        latest_signal = signal.iloc[-1]
        latest_histogram = histogram.iloc[-1]
        latest_upper = upper_band.iloc[-1]
        latest_middle = sma.iloc[-1]
        latest_lower = lower_band.iloc[-1]
        
        return {
            "rsi": float(latest_rsi),
            "macd": {
                "macd": float(latest_macd),
                "signal": float(latest_signal),
                "histogram": float(latest_histogram)
            },
            "bollingerBands": {
                "upper": float(latest_upper),
                "middle": float(latest_middle),
                "lower": float(latest_lower)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sentiment/market/{symbol}")
async def get_market_sentiment(symbol: str):
    try:
        # Get sentiment analysis data
        articles_df, sentiment_summary, sentiment_bar_img, sentiment_gauge, stock_chart, ticker = analyze_asset_sentiment(symbol)
        
        # Calculate sentiment percentages
        total_articles = len(articles_df)
        positive_count = len(articles_df[articles_df['Sentiment'] == '🟢 Positive'])
        neutral_count = len(articles_df[articles_df['Sentiment'] == '⚪ Neutral'])
        negative_count = len(articles_df[articles_df['Sentiment'] == '🔴 Negative'])
        
        positive_pct = (positive_count / total_articles) * 100 if total_articles > 0 else 0
        neutral_pct = (neutral_count / total_articles) * 100 if total_articles > 0 else 0
        negative_pct = (negative_count / total_articles) * 100 if total_articles > 0 else 0
        
        # Calculate overall sentiment score (0-100)
        sentiment_score = (positive_pct * 1 + neutral_pct * 0.5)  # Weighted score
        
        # Determine market consensus
        if sentiment_score >= 70:
            consensus = "Strongly Bullish"
        elif sentiment_score >= 60:
            consensus = "Moderately Bullish"
        elif sentiment_score >= 40:
            consensus = "Neutral"
        elif sentiment_score >= 30:
            consensus = "Moderately Bearish"
        else:
            consensus = "Strongly Bearish"
            
        # Calculate volume and price impact
        volume_impact = "High" if total_articles > 10 else "Medium" if total_articles > 5 else "Low"
        price_impact = "Positive" if sentiment_score >= 60 else "Negative" if sentiment_score <= 40 else "Neutral"
        
        return {
            "sentiment": {
                "news": {
                    "positive": positive_pct,
                    "neutral": neutral_pct,
                    "negative": negative_pct
                },
                "overall": consensus
            },
            "sentimentScore": sentiment_score,
            "marketImpact": {
                "volume": volume_impact,
                "price": price_impact
            },
            "confidence": 85,  # This could be calculated based on data quality
            "signalStrength": "Strong Buy" if sentiment_score >= 70 else "Buy" if sentiment_score >= 60 else "Neutral" if sentiment_score >= 40 else "Sell" if sentiment_score >= 30 else "Strong Sell",
            "totalArticles": total_articles
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sentiment/articles/{symbol}")
async def get_sentiment_articles(symbol: str):
    try:
        # Get sentiment analysis data
        articles_df, sentiment_summary, sentiment_bar_img, sentiment_gauge, stock_chart, ticker = analyze_asset_sentiment(symbol)
        
        # Convert DataFrame to list of articles
        articles = []
        for _, row in articles_df.iterrows():
            sentiment = row['Sentiment'].split()[1]  # Extract sentiment from emoji + text
            articles.append({
                "sentiment": sentiment.lower(),
                "title": row['Title'],
                "description": row['Description'],
                "date": row['Date'],
                "baseScore": float(row['Base Score']),
                "weight": float(row['Weight'].replace('x', '')),
                "totalScore": float(row['Total Score'])
            })
            
        return {
            "articles": articles
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 
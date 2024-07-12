import requests
from textblob import TextBlob


def get_news_sentiment(company):
    API_KEY = "12923f4611384ae4abb6f48bbc54067a"
    query = f"{company} Stock"
    url = f"https://newsapi.org/v2/everything?q={query}&apiKey={API_KEY}"

    response = requests.get(url)
    response.raise_for_status()
    data = response.json()

    #print("Stock News:")
    news_titles = []
    news_descriptions = []
    news_sentiments = []
    for article in data["articles"]:
        if str(company) in article["title"]: #and "stock" in article["title"]:
            sentiment = TextBlob(article["title"]).sentiment.polarity
            if sentiment != 0:
                title = article["title"]
                description = article["description"]

                news_titles.append(title)
                news_descriptions.append(description)
                news_sentiments.append(sentiment)

    zipped = zip(news_titles, news_descriptions, news_sentiments)
    # for item in zipped:
        # print(item)
        # print()
    return zipped

                # print(f"\t- {article['title']}")
                # print(f"\t\t{article['description']}")
                # print(f"Sentiment: {sentiment}")
                # print(f"Subjectivity: {subjectivity}")
                # print()

for item in get_news_sentiment("Apple"):
    print(item)

#http://10.162.210.205:5050/
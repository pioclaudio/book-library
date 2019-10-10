from requests import get
from bs4 import BeautifulSoup
from urllib.parse import urlparse
import random
import json
import time


def scrapeBookInfo(url):
    response = get(url)
    html_soup = BeautifulSoup(response.text, 'html.parser')

    title = html_soup.find('h1', class_ = 'item-page__main-title').text
    author = html_soup.find('a', class_ = 'item-contributor__link').text
    numPages = html_soup.find('span', {'class':'item-page__spec-value', 'data-a8n':"spec-value--ProductDimensionsLabel"}).text.split()[0]
    isbn = html_soup.find('span', {'class':'item-page__spec-value', 'data-a8n':"isbn-value--ISBN-10"}).text
    img_url = html_soup.find('img', class_='product-image__image--single').get('src')

    book = {
      'title': title,
      'author': author,
      'numPages': numPages,
      'isbn': isbn,
      'read': random.randint(0, 101) > 79
    }

    img_data = get(img_url).content
    with open('img/'+isbn+'.jpg', 'wb') as handler:
        handler.write(img_data)

    return book

listurl = 'https://www.chapters.indigo.ca/en-ca/nyt-bestsellers?mc=Book&lu=LeftNav_BestSellers_NewYorkTimesBestsellers'
response = get(listurl)
## SAVE TO A LOCAL FILE
# with open('sample.txt', 'wb') as f:
#     f.write(response.text.encode('UTF-8'))

parsedUrl = urlparse(listurl)
domain = parsedUrl.scheme + '://' + parsedUrl.netloc

html_soup = BeautifulSoup(response.text, 'html.parser')
## LOAD FROM LOCAL FILE
# html_soup = BeautifulSoup(open("sample.txt"), 'html.parser')
bookSoup = html_soup.find_all('a', class_='js-productImageWrap product-list__product-link--grid')

bookArray = []
for book in bookSoup:
    bookUrl = domain+book.get('href')
    print(bookUrl)
    bookInfo = scrapeBookInfo(bookUrl)
    bookArray.append(bookInfo)
    time.sleep(5)

print(bookArray)
with open('bookinfo2.json', 'w') as f:
    f.write(json.dumps(bookArray, indent=4))
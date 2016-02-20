import re
from eve import Eve

def post_get_callback(resource, request, payload):

   match = re.search('/cards/(\w+)$', request.path)

   if (payload.status_code == 404) and match:

      card_id = match.group(1)

      cards = app.data.driver.db['cards']

      card = cards.find_one({ 'id': card_id })

      if not card:
         app.data.driver.db['cards'].insert({ 'id': card_id })



if __name__ == '__main__':
   app = Eve()

   app.on_post_GET += post_get_callback

   app.run()

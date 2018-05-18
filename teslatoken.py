import requests
import datetime
import argparse

def GetToken(username, password):
    req = requests.post('https://owner-api.teslamotors.com/oauth/token', json={'grant_type': 'password', 'client_id': 'e4a9949fcfa04068f59abb5a658f2bac0a3428e4652315490b659d5ab3f35a9e', 'client_secret': 'c75f14bbadc8bee3a7594412c31416f8300256d7668ea7e6e7f06727bfb9d220', 'email': username, 'password': password})
    if req.status_code == 200:
        response = req.json()
        print 'Your token is: %s' % response['access_token']
        print 'This token will expire: %s' % (datetime.datetime.fromtimestamp(response['created_at']) + datetime.timedelta(seconds=response['expires_in']))
    elif req.status_code == 401:
        print 'Incorrect username or password'
    elif req.status_code == 404:
        print 'API server has changed, contact the developer of this script'
    elif req.status_code == 500:
        print 'An internal server error occurred. Either Tesla API is down or the API has changed since this script was developed.'
    else:
        print req.reason

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('-e', '--email', type=str, required=True, help='E-mail used for myTesla account')
    parser.add_argument('-p', '--password', type=str, required=True, help='myTesla account password')
    args = parser.parse_args()
    GetToken(args.email, args.password)


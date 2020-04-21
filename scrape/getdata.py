import asyncio
import csv
import r6sapi as api

from lxml import html
import requests

###########parameters
playerstoget = 100
region = -1   #1 europe 2 america 3 asia    -1 = all

xbox = set()
psn = set()
pc = set()
pageno = 1


while(True):
    page = requests.get('https://r6.tracker.network/leaderboards/pvp-season/all/Mmr?page=' + str(pageno) + '&region=' + str(region) + '&season=17')
    htmlfile = html.fromstring(page.content)
    htmlitems = htmlfile.xpath('body/div/div/section/div/div/table/tbody/tr/td/a/@href')

    print(pageno)
    for item in htmlitems:
        if(item.find("profile") != -1):
            second = item.find("/",2)
            third = item.find("/",second+1)
            if(str(item)[second+1:third] == "xbox"):
                xbox.add(str(item)[third+1:])
            if(str(item)[second+1:third] == "psn"):
                psn.add(str(item)[third+1:])
            if(str(item)[second+1:third] == "pc"):
                pc.add(str(item)[third+1:])
            #print(str(item)[third+1:])
            #print(str(item)[second+1:third])
            if(len(xbox) + len(pc) + len(psn) >= playerstoget):
                break

    if(len(xbox) + len(pc) + len(psn) >= playerstoget):
        break
    pageno+=1


xboxnames = list(xbox)
psnnames = list(psn)
pcnames = list(pc)

csvData = []
#firstrow = ["","doc", "twitch", "ash", "thermite", "blitz", "buck", "hibana", "kapkan", "pulse", "castle", "rook", "bandit", "smoke", "frost", "valkyrie", "tachanka", "glaz", "fuze", "sledge", "montagne", "mute", "echo", "thatcher", "capitao", "iq", "blackbeard", "jager", "caveira", "jackal", "mira", "lesion", "ying", "ela", "dokkaebi", "vigil", "zofia", "finka", "lion", "alibi", "maestro", "maverick", "clash", "nomad", "kaid", "mozzie", "gridlock", "warden", "nakk", "amaru", "goyo"]
#csvData.append(firstrow.copy())


async def collectDat(players):
    for player in players:
        playerrow = []
        print(player.name)
        playerrow.append(player.name)

        try:
            operators = await player.get_all_operators()
            for o in operators:
                #print(operators[o].name)
                #print(operators[o].time_played)
                playerrow.append(operators[o].time_played)
        except:
            print("ERROR GETTING LOADERS")
            playerrow.append("ERROR")
        csvData.append(playerrow.copy())


async def run():
    auth = api.Auth("email", "password")

    firstrow = [""]
    player = await auth.get_player("billy_yoyo", api.Platforms.UPLAY)
    operators = await player.get_all_operators()
    for o in operators:
        firstrow.append(operators[o].name)
    csvData.append(firstrow.copy())

    #if(len(xboxnames) > 0):
    #    xbplayers = await auth.get_player_batch(xboxnames, api.Platforms.XBOX)
    #    await collectDat(xbplayers)

    if(len(psnnames) > 0):
        psplayers = await auth.get_player_batch(psnnames, api.Platforms.PLAYSTATION)
        await collectDat(psplayers)

    if(len(pcnames) > 0):
        pcplayers = await auth.get_player_batch(pcnames, api.Platforms.UPLAY)
        await collectDat(pcplayers)

    await auth.close()


asyncio.get_event_loop().run_until_complete(run())

with open('data2.csv', 'w', newline='') as file:
    writer = csv.writer(file)
    writer.writerows(csvData)

import asyncio
import csv
import r6sapi as api
import time

from lxml import html
import requests

###########parameters
playerstoget = 500
batch_size = 50
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

xb_batch = []
psn_batch = []
pc_batch = []

def batchify(l, names):
    i=0
    while len(names) > 0:
        l.append([])
        while len(l[i]) < batch_size and len(names) > 0:
            l[i].append(names[0])
            names.remove(names[0])
        i += 1


print(len(xboxnames))
print(len(psnnames))
print(len(pcnames))

batchify(xb_batch, xboxnames)
batchify(psn_batch, psnnames)
batchify(pc_batch, pcnames)


print(len(xb_batch))
print(len(psn_batch))
print(len(pc_batch))
print(xb_batch)
print(psn_batch)
print(pc_batch)

csvData = []
#firstrow = ["","doc", "twitch", "ash", "thermite", "blitz", "buck", "hibana", "kapkan", "pulse", "castle", "rook", "bandit", "smoke", "frost", "valkyrie", "tachanka", "glaz", "fuze", "sledge", "montagne", "mute", "echo", "thatcher", "capitao", "iq", "blackbeard", "jager", "caveira", "jackal", "mira", "lesion", "ying", "ela", "dokkaebi", "vigil", "zofia", "finka", "lion", "alibi", "maestro", "maverick", "clash", "nomad", "kaid", "mozzie", "gridlock", "warden", "nakk", "amaru", "goyo"]
#csvData.append(firstrow.copy())

def run_batch(names, platform):
    time.sleep(5)
    asyncio.get_event_loop().run_until_complete(run(names, platform))


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


async def run(names, platform):
    auth = api.Auth("email", "password")

    print(names)
    print(platform)

    if platform == "x":
        platform = api.Platforms.XBOX
    if platform == "ps":
        platform = api.Platforms.PLAYSTATION
    if platform == "pc":
        platform = api.Platforms.UPLAY

    players = await auth.get_player_batch(names, platform)
    await collectDat(players)

    await auth.close()


async def run_first_row():
    auth = api.Auth("email", "password")
    firstrow = [""]
    player = await auth.get_player("billy_yoyo", api.Platforms.UPLAY)
    operators = await player.get_all_operators()
    for o in operators:
        firstrow.append(operators[o].name)
    csvData.append(firstrow.copy())
    await auth.close()


xbox_platform, psn_platform, pc_platform = "x","ps","pc"

asyncio.get_event_loop().run_until_complete(run_first_row())

for batch in xb_batch:
    run_batch(batch, xbox_platform)
#for batch in psn_batch:
#    run_batch(batch, psn_platform)
for batch in pc_batch:
    run_batch(batch, pc_platform)

with open('data3.csv', 'w', newline='') as file:
    writer = csv.writer(file)
    writer.writerows(csvData)

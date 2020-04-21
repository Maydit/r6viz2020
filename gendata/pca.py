import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns; sns.set()
from sklearn.decomposition import PCA

from scipy.spatial.distance import cdist,pdist
from scipy.cluster.vq import vq, kmeans, whiten

dataset = np.genfromtxt('gendata/data2.csv', delimiter=',', skip_header=1)
pca = PCA(n_components = 2)
pca.fit(dataset)
X_pca = pca.transform(dataset)

#with np.printoptions(precision=3, suppress=True):
#	print(pca.components_)
"""	
["doc","twitch","ash","thermite","blitz","buck","hibana","kapkan","pulse","castle","
rook","bandit","smoke","frost","valkyrie","tachanka","glaz","fuze","sledge","montagne",
"mute","echo","thatcher","capitao","iq","blackbeard","jager","caveira","jackal","mira",
"lesion","ying","ela","dokkaebi","vigil","zofia","finka","lion","alibi","maestro",
"maverick","clash","nomad","kaid","mozzie","gridlock","warden","nakk","amaru","goyo"];
Eigenvectors:
[-0.072  0.093  0.76  -0.123 -0.044 -0.015 -0.053 -0.053  0.084 -0.031
  -0.054  0.138 -0.06  -0.055  0.013 -0.014 -0.019 -0.031  0.043 -0.058
  -0.027 -0.056 -0.126  0.012 -0.02  -0.062  0.509 -0.    -0.106 -0.055
  -0.14  -0.016  0.047 -0.017  0.047 -0.012 -0.07  -0.032 -0.012 -0.06
  -0.035 -0.018 -0.056 -0.039 -0.056 -0.028 -0.004 -0.007 -0.005 -0.006]
  ==Twitch, ash, -therm, -thatch, bandit, blackbeard
  
[-0.139 -0.412  0.204  0.135  0.063  0.07   0.063  0.043  0.51   0.061
   0.073  0.107 -0.048  0.08   0.116  0.02   0.082  0.051  0.222  0.039
  -0.044  0.006  0.031  0.098 -0.182  0.195 -0.368  0.    -0.067  0.043
  -0.135  0.016 -0.028  0.011 -0.175 -0.25  -0.05  -0.018 -0.017 -0.08
  -0.041 -0.    -0.112 -0.03  -0.093 -0.028 -0.003 -0.004 -0.01  -0.004]
  ==-twitch, ash, thermite, valk, capitao, -vigil, -nomad
  """
  

np.random.seed((1000,2000)) #random random seed
K = range(1,20) # k's for k means
KM = [kmeans(dataset,k) for k in K]
centroids = [cent for (cent,var) in KM]
D_k = [cdist(dataset, cent, 'euclidean') for cent in centroids]
cIdx = [np.argmin(D,axis=1) for D in D_k]
dist = [np.min(D,axis=1) for D in D_k]

tot_withinss = [sum(d**2) for d in dist]  # Total within-cluster sum of squares
totss = sum(pdist(dataset)**2)/dataset.shape[0]       # The total sum of squares
betweenss = totss - tot_withinss          # The between-cluster sum of squares

##### plots #####
kIdx = 7        # K=8
mrk = 'os^p<dvh8>+x.'

# elbow curve
plt.plot(K, betweenss/totss*100, 'b*-')
plt.plot(K[kIdx], betweenss[kIdx]/totss*100, marker='o', markersize=12, 
    markeredgewidth=2, markeredgecolor='r', markerfacecolor='None')
plt.grid(True)
plt.xlabel('Number of clusters')
plt.ylabel('Percentage of variance explained (%)')
plt.title('Elbow for KMeans clustering')
plt.show();

# scatter our pca'd data
#plt.scatter(centroids[:, 0], centroids[:, 1], c='r')
#todo: color based on elbow

clr = ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#ffff99","#b15928"]
for i in range(K[kIdx]):
	ind = (cIdx[kIdx]==i)
	plt.scatter(X_pca[ind, 0], X_pca[ind, 1], c=clr[i], label='Cluster %d'%i)

#very helpful: https://stackoverflow.com/questions/6645895/calculating-the-percentage-of-variance-measure-for-k-means

plt.xlabel('component 1')
plt.ylabel('component 2')
plt.axis('equal')
plt.show();

colors = np.asarray(cIdx[kIdx])[:,None]
with_color = np.append(X_pca, colors, 1)
keys = np.asarray(range(1,with_color.shape[0]+1))[:,None]
with_keys = np.append(keys, with_color, 1)
colors2 = np.asarray(cIdx[3])[:,None]
with_colors2 = np.append(with_keys, colors2, 1)

with open('site/out.csv', 'wb') as f:
	f.write(b'key,x,y,color1,color2\n')
	np.savetxt(f, with_colors2, delimiter=",", fmt="%d,%1.9f,%1.9f,%d,%d")
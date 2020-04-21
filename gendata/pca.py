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
kIdx = 11        # K=10
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

with open('site/out.csv', 'wb') as f:
	f.write(b'key,x,y,color\n')
	np.savetxt(f, with_keys, delimiter=",", fmt="%d,%1.9f,%1.9f,%d")
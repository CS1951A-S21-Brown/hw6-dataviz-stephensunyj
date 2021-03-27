import pandas as pd


data = pd.read_csv("data/video_games.csv")

genres = data.Genre.unique()
print(genres)

genre_sales = data.groupby(['Genre']).sum().reset_index()
# print(genre_sales.sort_values(by=['JP_Sales'], ascending=False))
# print(genre_sales.sort_values(by=['JP_Sales'], ascending=False).iloc[0,0])

d = {'region':['NA','EU','JP','Other','Global'],'top_genre':[]}
for i in range(len(d['region'])):
    d['top_genre'].append(genre_sales.sort_values(by=[d['region'][i] + '_Sales'], ascending=False).iloc[0,0])
    #print(genre_sales.sort_values(by=[d['region'][i] + '_Sales'], ascending=False))
    #print(genre_sales.sort_values(by=[d['region'][i] + '_Sales'], ascending=False).iloc[0,0])

top_genre_by_region = pd.DataFrame(data=d)
print(top_genre_by_region)
top_genre_by_region.to_csv('data/top_genre_by_region.csv', index=False)

#print(data.groupby(['Genre', 'Publisher']).sum().to_string())
genre_and_publisher = data.groupby(['Genre', 'Publisher']).sum()
top_publisher_per_genre = genre_and_publisher['Global_Sales'].groupby('Genre', group_keys=False).nlargest(1).reset_index()
top_publisher_per_genre = top_publisher_per_genre.rename(columns={'Global_Sales': 'Publisher_Global_Sales'})
top_publisher_per_genre = top_publisher_per_genre.join(genre_sales['Global_Sales'])
top_publisher_per_genre['Market_Share'] = top_publisher_per_genre['Publisher_Global_Sales']/top_publisher_per_genre['Global_Sales']
print(top_publisher_per_genre)
print(genre_sales)
top_publisher_per_genre.to_csv('data/top_publisher_per_genre.csv', index=False)
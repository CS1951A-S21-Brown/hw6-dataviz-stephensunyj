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
#print(top_genre_by_region)
top_genre_by_region.to_csv('data/top_genre_by_region.csv', index=False)

#print(data.groupby(['Genre', 'Publisher']).sum().to_string())
genre_and_publisher = data.groupby(['Genre', 'Publisher']).sum()
top_publisher_per_genre = genre_and_publisher['Global_Sales'].groupby('Genre', group_keys=False).nlargest(6).reset_index()
# TODO get top 6, then change the value of the 6th - change publisher and global sales value to total - ssum of 1st 5 publishers
total_sales_by_genre = genre_sales['Global_Sales'].tolist()
#print(total_sales_by_genre)
j = 0
top_publisher_per_genre['Market_Share'] = 0.0
for i in range(5,top_publisher_per_genre.shape[0],6):
    top_publisher_per_genre.at[i, 'Publisher'] = 'Other'
    top_5_publisher_sales = top_publisher_per_genre['Global_Sales'].iloc[i-5:i]
    other_sales = total_sales_by_genre[j] - sum(top_5_publisher_sales.tolist())
    top_publisher_per_genre.at[i, 'Global_Sales'] = other_sales
    j+=1

genre_dict = dict(zip(genre_sales['Genre'].tolist(), total_sales_by_genre))
print(genre_dict)

for i in range(top_publisher_per_genre.shape[0]):
    curr_genre = top_publisher_per_genre.at[i, 'Genre']
    top_publisher_per_genre.at[i, 'Market_Share'] = top_publisher_per_genre.at[i, 'Global_Sales']/genre_dict[curr_genre]

top_publisher_per_genre = top_publisher_per_genre.rename(columns={'Global_Sales': 'Publisher_Global_Sales'})
top_publisher_per_genre = top_publisher_per_genre.round({'Publisher_Global_Sales':2, 'Market_Share':3})

print(top_publisher_per_genre.to_string())
print(genre_sales)
top_publisher_per_genre.to_csv('data/top_publisher_per_genre.csv', index=False)
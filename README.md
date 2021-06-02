# DataAccess
Machine Learning requires large amounts of data to product well-functioning models. So far data collected either stems from public sources, or large companies with access to vast amounts of user data can sell this data for profits. In addition, it leaves those who clea the data out of the picture: they receive a small compensation for providing the data once and then their curated data can be reused indefinitely.

This project aim to let data providers (individuals) and those whose data is used participate in the process:
everytime someone uses the dataset their data is in, they receive a commission.

## Terms
* DataProviderToken - an ERC20 token that is handed out to those that create records for the datasets. They entitle the holders to claim the rewards.
* DataAccessToken - an ERC20 token that can be purchased to get access to the datasets. The costs are determined by the amount of records in the dataset purchased. They get burned once used to buy access to a dataset.
* Dataset - a collection of *Records* that can be purchased. The price for access depends on the number of records in it.
* Record - an individual datum whose provisioning is rewarded in *DataProviderToken*.

## Tokenomics
* buy DataAccessTokens for x in another ERC20 token.
* buy access to a dataset, burning the DataAccessTokens, releasing the ERC20 token to the holders of DataProviderTokens.
* provide records to the datasets and receive DataProviderTokens.
* DataAccessTokens are pegged to some other token.
* DataProviderTokens are not, but can be traded for dataset buy rewards.
* there is a fee of 5% when buying datasets, meaning 95% of the price will be distributed to holders.

**Rewards can be claimed at any time**
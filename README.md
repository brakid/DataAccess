# DataAccess
**Earn royalties on your provided data**

Machine Learning requires large amounts of data to product well-functioning models. So far data collected either stems from public sources, or large companies with access to vast amounts of user data can sell this data for profits. In addition, it leaves those who clean or provide their data out of the picture: they receive a small compensation for providing the data once and then their curated data can be reused indefinitely.

This project aims to let data providers (individuals) and those whose data is used participate in the process:
everytime someone uses the dataset their data is in, they receive a commission.

## Terms
* DataProviderToken - an ERC20 token that is handed out to those that create records for the datasets. They entitle the holders to claim the rewards.
* DataAccessToken - an ERC20 token that can be purchased to get access to the datasets. The costs are determined by the amount of records in the dataset purchased. They get distributed to *DataProviderToken* holders when used to buy access to a dataset.
* Dataset - a collection of *Records* that can be purchased. The price in *DataAccessTokens* for access depends on the number of records in it.
* Record - an individual datum whose provisioning is rewarded in *DataProviderToken*.

## Tokenomics
* buy DataAccessTokens for x in another ERC20 token (minting).
* buy access to a dataset, the DataAccessTokens are transferred to a smart contract, distributing them among the holders of DataProviderTokens.
* provide records to the datasets and receive DataProviderTokens.
* DataAccessTokens are pegged to some other token and can be redeemed.
* DataProviderTokens are not, but can be traded for dataset buy rewards.
 * whoever holds a token at the moment someone buys will receive them.
* there is a fee of 5% when buying datasets, meaning 95% of the price will be distributed to holders of DataProviderTokens.

**Rewards can be claimed at any time**

### DataProviderTokens:
* provide record: private key encrypted confirmation containing (date, submitter address, number of records), store provided records to validate no duplicate token mints. Transfer tokens to submitter address if it matches the sender address
* claim reward
* buy access: send *DataAccessTokens* + number of records, emits event: event is emitted by constract and received by dApp. As the sender address is known, the dApp knows the source was the deployee contract. Sends (date, buyer address, number of records) -> backend reacts to it and grants access for dApp user if the date and wallet address match

### DataAccessTokens:
* mint: exchange for other ERC20 token
* burn: redeem deposited ERC20 token

## Known issues:
* when depositing DataProviderTokens in a SmartContract, this contract is entitled for rewards
* by distributing rewards to all tokenholders, the rewards will get smaller if the dataset size increases (upper limit?)
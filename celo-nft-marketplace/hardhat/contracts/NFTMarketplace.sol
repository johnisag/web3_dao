// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract NFTMarketplace {
    struct Listing{
        uint256 price;
        address seller;
    }

    // Caller must be owner of the NFT token ID
    modifier isNFTOwner(address nftAddress, uint256 tokenId) {
        require(
            IERC721(nftAddress).ownerOf(tokenId) == msg.sender,
            "MRKT: Not the owner"
        );
        _;
    }

    // Price must be more than 0
    modifier validPrice(uint256 _price) {
        require(_price > 0, "MRKT: Price must be > 0");
        _;
    }

    // Specified NFT must not be listed
    modifier isNotListed(address nftAddress, uint256 tokenId) {
        require(
            listings[nftAddress][tokenId].price == 0,
            "MRKT: Already listed"
        );
        _;
    }

    // We will use this later on
    // Specified NFT must be listed
    modifier isListed(address nftAddress, uint256 tokenId) {
        require(listings[nftAddress][tokenId].price > 0, "MRKT: Not listed");
        _;
    }

    // Events
    event ListingCreated(address nftAddress, uint256 tokenId, uint256 price, address seller);
    event ListingUpdated(address nftAddress, uint256 tokenId, uint256 price, address seller);
    event ListingCancelled(address nftAddress, uint256 tokenId, address seller);
    event ListingPurchased(address nftAddress, uint256 tokenId, address seller, address buyer);

    // Contract Address -> (Token ID -> Listing Data)
    mapping(address => mapping(uint256 => Listing)) public listings;

    function createListing(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    )
        external
        isNotListed(nftAddress, tokenId)
        isNFTOwner(nftAddress, tokenId)
        validPrice(price)
    {
        IERC721 nftContract = IERC721(nftAddress);
        require(
            nftContract.isApprovedForAll(msg.sender, address(this)) ||
                nftContract.getApproved(tokenId) == address(this),
            "MRKT: No approval for NFT"
        );
        listings[nftAddress][tokenId] = Listing({
            price: price,
            seller: msg.sender
        });

        emit ListingCreated(nftAddress, tokenId, price, msg.sender);
    }

    function cancelListing(address nftAddress, uint256 tokenId)
        external
        isListed(nftAddress, tokenId)
        isNFTOwner(nftAddress, tokenId)
    {
        // Delete the Listing struct from the mapping
        // Freeing up storage saves gas!
        delete listings[nftAddress][tokenId];

        // Emit the event
        emit ListingCancelled(nftAddress, tokenId, msg.sender);
    }

    function updateListing(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice
    ) external isListed(nftAddress, tokenId) isNFTOwner(nftAddress, tokenId) validPrice(newPrice) {
        // Update the listing price
        listings[nftAddress][tokenId].price = newPrice;

        // Emit the event
        emit ListingUpdated(nftAddress, tokenId, newPrice, msg.sender);
    }

    function purchaseListing(address nftAddress, uint256 tokenId)
        external
        payable
        isListed(nftAddress, tokenId)
    {
        // Load the listing in a local copy
        Listing memory listing = listings[nftAddress][tokenId];

        // Buyer must have sent enough ETH
        require(msg.value == listing.price, "MRKT: Incorrect ETH supplied");

        // Delete listing from storage, save some gas
        delete listings[nftAddress][tokenId];

        // Transfer NFT from seller to buyer
        IERC721(nftAddress).safeTransferFrom(
            listing.seller,
            msg.sender,
            tokenId
        );

        // Transfer ETH sent from buyer to seller
        (bool sent, ) = payable(listing.seller).call{value: msg.value}("");
        require(sent, "Failed to transfer eth");

        // Emit the event
        emit ListingPurchased(nftAddress, tokenId, listing.seller, msg.sender);
    }
}
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("QuiFlixNFT", function () {
  let nftContract;
  let contentContract;
  let owner;
  let producer;
  let buyer;

  beforeEach(async function () {
    [owner, producer, buyer] = await ethers.getSigners();

    // Deploy QuiFlixContent
    const QuiFlixContent = await ethers.getContractFactory("QuiFlixContent");
    contentContract = await QuiFlixContent.deploy(
      producer.address,
      9500, // 95% to producer
      owner.address, // platform
      500  // 5% to platform
    );

    // Deploy QuiFlixNFT
    const QuiFlixNFT = await ethers.getContractFactory("QuiFlixNFT");
    nftContract = await QuiFlixNFT.deploy(
      owner.address, // royalty recipient
      owner.address  // platform fee recipient
    );
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await nftContract.owner()).to.equal(owner.address);
    });

    it("Should have correct name and symbol", async function () {
      expect(await nftContract.name()).to.equal("QuiFlix Film Ticket");
      expect(await nftContract.symbol()).to.equal("QFT");
    });
  });

  describe("Film Creation", function () {
    it("Should create a film successfully", async function () {
      const tx = await nftContract.createFilm(
        "Test Film",
        "A test film description",
        "Action",
        7200, // 2 hours
        Math.floor(Date.now() / 1000),
        "QmTestHash123",
        ethers.parseEther("0.01"),
        "https://api.test.com/metadata/1"
      );

      await expect(tx).to.emit(nftContract, "FilmCreated");
      
      const filmMetadata = await nftContract.getFilmMetadata(0);
      expect(filmMetadata.title).to.equal("Test Film");
      expect(filmMetadata.producer).to.equal(owner.address);
    });

    it("Should not allow non-owner to create film", async function () {
      await expect(
        nftContract.connect(producer).createFilm(
          "Test Film",
          "A test film description",
          "Action",
          7200,
          Math.floor(Date.now() / 1000),
          "QmTestHash123",
          ethers.parseEther("0.01"),
          "https://api.test.com/metadata/1"
        )
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Film Purchase", function () {
    beforeEach(async function () {
      await nftContract.createFilm(
        "Test Film",
        "A test film description",
        "Action",
        7200,
        Math.floor(Date.now() / 1000),
        "QmTestHash123",
        ethers.parseEther("0.01"),
        "https://api.test.com/metadata/1"
      );
    });

    it("Should purchase film successfully", async function () {
      const purchaseTx = await nftContract.connect(buyer).purchaseFilm(0, {
        value: ethers.parseEther("0.01")
      });

      await expect(purchaseTx).to.emit(nftContract, "FilmPurchased");
      
      const owner = await nftContract.ownerOf(0);
      expect(owner).to.equal(buyer.address);
    });

    it("Should not allow purchase with insufficient payment", async function () {
      await expect(
        nftContract.connect(buyer).purchaseFilm(0, {
          value: ethers.parseEther("0.005")
        })
      ).to.be.revertedWith("Insufficient payment");
    });
  });

  describe("Royalty Info", function () {
    beforeEach(async function () {
      // Create a film first
      await nftContract.createFilm(
        "Test Film",
        "A test film description",
        "Action",
        7200,
        Math.floor(Date.now() / 1000),
        "QmTestHash123",
        ethers.parseEther("0.01"),
        "https://api.test.com/metadata/1"
      );
    });

    it("Should return correct royalty info", async function () {
      const salePrice = ethers.parseEther("1");
      const [recipient, royaltyAmount] = await nftContract.royaltyInfo(0, salePrice);
      
      expect(recipient).to.equal(owner.address);
      expect(royaltyAmount).to.equal(ethers.parseEther("0.025")); // 2.5%
    });
  });
});

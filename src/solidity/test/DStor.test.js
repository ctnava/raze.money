/* eslint-disable jest/valid-expect */
const { ethers } = require("hardhat");
const { assert, expect } = require("chai");
const { constructorArgs } = require("../scripts/utils/constructorArgs");
const { txHist } = require("../scripts/utils/utils"); // eslint-disable-line no-unused-vars

describe("DStor", () => {
	let DStor; let PLS; let FissionEngine;
	let deployer, client1, client2, client3, otherClients; // eslint-disable-line no-unused-vars
	const def_uint = 42069; const def_str = "test"; const null_addr = "0x0000000000000000000000000000000000000000";
	const def_pd = { value: ethers.utils.parseUnits("1000000000000", "wei") }; 
	const def_bench = { value: ethers.utils.parseUnits("30030000000000", "wei") }; 
	const def_benchP1 = { value: ethers.utils.parseUnits((30030000000000+1000000000000).toString(), "wei") }; 
	const day = 86400; // seconds
	const def_inputs = ["hash", 42069, ".type", "name", "description"];
	// await Promise.all(array.map(async (element, index) => {}));
	beforeEach(async () => {
		// Get ContractFactory and Signers
		[deployer, client1, client2, client3, ...otherClients] = await ethers.getSigners();

		const DStorFactory = await ethers.getContractFactory("DStor");
		DStor = await DStorFactory.connect(deployer).deploy(...constructorArgs["DStor"]); // Deploy
		const LinkFactory = await ethers.getContractFactory("PolygonLinkSim");
		PLS = await LinkFactory.connect(deployer).deploy(...constructorArgs["PolygonLinkSim"]);
		const FissionEngineFactory = await ethers.getContractFactory("FissionEngine");
		FissionEngine = await FissionEngineFactory.connect(deployer).deploy(PLS.address, DStor.address);
		await DStor.connect(deployer).setFission(FissionEngine.address);
	});
	describe("Deployment", () => {
		it("Should track name, fileCount, and owner", async () => {
			expect(await DStor.name()).to.equal("deadDrop@HemlockStreet");
			expect(await DStor.fileCount()).to.equal(0);
			expect(await DStor.owner()).to.equal(deployer.address);
			const usdQuote = await DStor.quote(42069);
			expect (usdQuote[0].toString()).to.equal("200");
			expect (usdQuote[1].toString()).to.equal("6006");
			const gasQuote = await DStor.gasQuote(42069);
			expect (gasQuote[0].toString()).to.equal("1000000000000");
			expect (gasQuote[1].toString()).to.equal("30030000000000");
			var val;
			val = await DStor.pinningRate();
			expect (val.toString()).to.equal("150");
			val = await DStor.minimumFileSize();
			expect (val.toString()).to.equal("1024");
			val = await DStor.minimumPin();
			expect (val.toString()).to.equal("30");
			expect (await DStor.fissionEngine()).to.equal(FissionEngine.address);
			expect (await DStor.owner()).to.equal(deployer.address);
		});
	});

	describe("Uploads", () => {
		it("Should not allow empty hashes", async () => {
			await expect(DStor.connect(deployer).upload("", def_uint, def_str, def_str, def_str, client3.address, def_bench)).to.be.revertedWith('BAD CALL');
			expect(await DStor.fileCount()).to.equal(0);
		});
		it("Should not allow empty file sizes", async () => {
			await expect(DStor.connect(deployer).upload(def_str, 0, def_str, def_str, def_str, client3.address, def_bench)).to.be.revertedWith('BAD CALL');
			expect(await DStor.fileCount()).to.equal(0);
		});
		it("Should not allow empty file types", async () => {
			await expect(DStor.connect(deployer).upload(def_str, def_uint, "", def_str, def_str, client3.address, def_bench)).to.be.revertedWith('BAD CALL');
			expect(await DStor.fileCount()).to.equal(0);
		});
		it("Should not allow empty file names", async () => {
			await expect(DStor.connect(deployer).upload(def_str, def_uint, def_str, "", def_str, client3.address, def_bench)).to.be.revertedWith('BAD CALL');
			expect(await DStor.fileCount()).to.equal(0);
		});
		it("Should not allow empty file descriptions", async () => {
			await expect(DStor.connect(deployer).upload(def_str, def_uint, def_str, def_str, "", client3.address, def_bench)).to.be.revertedWith('BAD CALL');
			expect(await DStor.fileCount()).to.equal(0);
		});
		it("Should not allow empty recipient field", async () => {
			await expect(DStor.connect(deployer).upload(def_str, def_uint, def_str, def_str, def_str, null_addr, def_bench)).to.be.revertedWith('BAD CALL');
			expect(await DStor.fileCount()).to.equal(0);
		});
		it("Should not allow sends to self", async () => {
			await expect(DStor.connect(deployer).upload(def_str, def_uint, def_str, def_str, def_str, deployer.address, def_bench)).to.be.revertedWith('NO SELF SEND');
			expect(await DStor.fileCount()).to.equal(0);
		});
		it("Should not allow free uploads", async () => {
			await expect(DStor.connect(deployer).upload(...def_inputs, client3.address)).to.be.revertedWith('VALUE LOW');
			expect(await DStor.fileCount()).to.equal(0);
		});
		it("Should not allow underpriced uploads", async () => {
			await expect(DStor.connect(deployer).upload(...def_inputs, client3.address, def_pd)).to.be.revertedWith('VALUE LOW');
			expect(await DStor.fileCount()).to.equal(0);
		});
		it("Should allow proper uploads and set expiration dates based on message value", async () => {
			await DStor.connect(deployer).upload(...def_inputs, client3.address, def_bench);
			expect(await DStor.fileCount()).to.equal(1);
			var fileObject = await DStor.connect(deployer).get(1);
			var uploadTime = parseInt(fileObject.uploadTime.toString());
			const benchExpiration = (uploadTime + (30 * day)).toString();
			expect(await DStor.expirationDates(fileObject.fileHash)).to.equal(benchExpiration);
			
			await DStor.connect(client1).upload(...def_inputs, client3.address, def_benchP1);
			expect(await DStor.fileCount()).to.equal(2);
			fileObject = await DStor.connect(client1).get(2);
			uploadTime = parseInt(fileObject.uploadTime.toString());
			const benchExpirationP1 = (uploadTime + (31 * day)).toString();
			expect(await DStor.expirationDates(fileObject.fileHash)).to.equal(benchExpirationP1);
			
			await DStor.connect(deployer).upload(...def_inputs, client1.address, def_bench);
			expect(await DStor.fileCount()).to.equal(3);
		});
	});

	async function setUp() {
		var files = [];
		const newFile = async (sender, recipient) => {
			const tx = await(await DStor.connect(sender).upload(...def_inputs, recipient.address, def_bench)).wait(1);
			files.push([...def_inputs,  recipient.address, (await ethers.provider.getBlock(tx.blockNumber)).timestamp, sender.address]) ;
		};
		await newFile(deployer, client3);
		await newFile(client1, client3);
		await newFile(deployer, client1);
		return files;
	}

	const getfile = async (signer, fileId) => {
		const raw = await DStor.connect(signer).get(fileId);
		var ref = [];
		raw.forEach((value) => { ref.push(!value._isBigNumber ? value : value.toNumber()) });
		return ref;
	};

	async function retrieveAccessibleFileIds(signer, isSender) {
			const calldata = await DStor.connect(signer).getAccessibleFileIds(isSender);
			var result = [];
			calldata.forEach((id) => {result.push(id.toNumber())});
			return result;
		}

	describe("File Retrieval", () => {
		it("Should allow access to the uploaded files", async () => {
			const files = await setUp();
			assert.deepEqual(await getfile(deployer, 1), files[0]);
			assert.deepEqual(await getfile(client3, 1), files[0]);
			assert.deepEqual(await getfile(client1, 2), files[1]);
			assert.deepEqual(await getfile(client3, 2), files[1]);
			assert.deepEqual(await getfile(deployer, 3), files[2]);
			assert.deepEqual(await getfile(client1, 3), files[2]);
		});

		it("Should return proper file id arrays", async () => {
			await setUp();
			assert.deepEqual(await retrieveAccessibleFileIds(deployer, true), [1,3]);
			assert.deepEqual(await retrieveAccessibleFileIds(deployer, false), []);
			assert.deepEqual(await retrieveAccessibleFileIds(client1, true), [2]);
			assert.deepEqual(await retrieveAccessibleFileIds(client1, false), [3]);
			assert.deepEqual(await retrieveAccessibleFileIds(client3, true), []);
			assert.deepEqual(await retrieveAccessibleFileIds(client3, false), [1,2]);
		});

		it("Should return proper file arrays", async () => {
			await setUp();
			const file1 = await DStor.connect(deployer).get(1);
			const file2 = await DStor.connect(client1).get(2);
			const file3 = await DStor.connect(deployer).get(3);
			var fileBatch1; var fileBatch2;
			fileBatch1 = await DStor.connect(deployer).getAccessibleFiles(true);
			assert.deepEqual(fileBatch1,  [file1, file3]);
			fileBatch2 = await DStor.connect(deployer).getAccessibleFiles(false);
			assert.deepEqual(fileBatch2, []);
			fileBatch1 = await DStor.connect(client1).getAccessibleFiles(true);
			assert.deepEqual(fileBatch1, [file2]);
			fileBatch2 = await DStor.connect(client1).getAccessibleFiles(false);
			assert.deepEqual(fileBatch2, [file3]);
			fileBatch1 = await DStor.connect(client3).getAccessibleFiles(true);
			assert.deepEqual(fileBatch1, []);
			fileBatch2 = await DStor.connect(client3).getAccessibleFiles(false);
			assert.deepEqual(fileBatch2, [file1,  file2]);
		});

		it("Should prevent unauthorized access", async () => {
			await setUp();
			await expect(DStor.connect(client2).get(1)).to.be.reverted;
			await expect(DStor.connect(deployer).get(2)).to.be.reverted;
			await expect(DStor.connect(client3).get(3)).to.be.reverted;
		});
	});

	describe("File Interaction", () => {
		it("Should Disallow empty modifications", async () => {
				const files = await setUp();
				await expect(DStor.connect(deployer).modify(1, "", "", null_addr)).to.be.revertedWith('BAD CALL');
				assert.deepEqual(await getfile(deployer, 1), files[0]);
			});
		it("Should Disallow modifications to send to self", async () => {
			const files = await setUp();
			await expect(DStor.connect(deployer).modify(1, "", "", deployer.address)).to.be.revertedWith('NO SELF SEND');
			assert.deepEqual(await getfile(deployer, 1), files[0]);
		});
		it("Should Disallow modifications by recipient", async () => {
			await setUp();
			await expect(DStor.connect(client3).modify(1, "", "", client2.address)).to.be.revertedWith('ACCESS DENIED');
			await expect(DStor.connect(client3).modify(1, "newName", "", null_addr)).to.be.revertedWith('ACCESS DENIED');
			await expect(DStor.connect(client3).modify(1, "", "newDescription", null_addr)).to.be.revertedWith('ACCESS DENIED');
		});
		it("Should Disallow modifications by randoms", async () => {
			await setUp();
			await expect(DStor.connect(otherClients[0]).modify(1, "", "", client2.address)).to.be.revertedWith('ACCESS DENIED');
			await expect(DStor.connect(otherClients[0]).modify(1, "newName", "", null_addr)).to.be.revertedWith('ACCESS DENIED');
			await expect(DStor.connect(otherClients[0]).modify(1, "", "newDescription", null_addr)).to.be.revertedWith('ACCESS DENIED');
		});
		it("Should Allow file name changes", async () => {
			const files = await setUp();
			await (await DStor.connect(deployer).modify(1, "newName", "", null_addr)).wait(1);
			const newFile = await getfile(deployer, 1);
			files[0][3] = "newName";
			assert.deepEqual(newFile, files[0]);
		});
		it("Should Allow file description changes", async () => {
			const files = await setUp();
			await (await DStor.connect(deployer).modify(1, "", "newDescription", null_addr)).wait(1);
			files[0][4] = "newDescription";
			assert.deepEqual(await getfile(deployer, 1), files[0]);
		});
		it("Should Allow file recipient changes", async () => {
			const files = await setUp();
			await (await DStor.connect(deployer).modify(1, "", "", client2.address)).wait(1);
			files[0][5] = client2.address;
			assert.deepEqual(await getfile(deployer, 1), files[0]);
			assert.deepEqual(await retrieveAccessibleFileIds(client2, false), [1]);
			assert.deepEqual(await retrieveAccessibleFileIds(client3, false), [2]);
		});
		it("Should not allow expiration extension by randoms", async () => {
			await setUp();
			await expect(DStor.connect(deployer).addTime(2, def_pd)).to.be.revertedWith('ACCESS DENIED');
		});
		it("Should not allow free extensions", async () => {
			await setUp();
			await expect(DStor.connect(deployer).addTime(1)).to.be.revertedWith('VALUE LOW'); // reverted
		});
		it("Should not allow underpriced extensions", async () => {
			await setUp();
			await expect(DStor.connect(deployer).addTime(1, { value: ethers.utils.parseUnits("900000000000", "wei") })).to.be.revertedWith('VALUE LOW'); // reverted
		});
		it("Should allow expiration extension by the involved parties", async () => {
			await setUp();
			const expDate = await DStor.expirationDates("hash");
			await (await DStor.connect(deployer).addTime(1, def_pd)).wait(1);
			const newExpDate = await DStor.expirationDates("hash");
			expect (newExpDate.toString()).to.equal((parseInt(expDate.toString()) + day).toString());
		});
	});

	describe("Administrative Functions", () => {
		it("Disallow anybody but the owner to modify the states", async () => {
			await setUp();
			await expect(DStor.connect(client1).setMinFileSize(1)).to.be.revertedWith("Ownable: caller is not the owner");
			await expect(DStor.connect(client1).setPinningRate(1)).to.be.revertedWith("Ownable: caller is not the owner");
			await expect(DStor.connect(client1).setFission(client1.address)).to.be.revertedWith("Ownable: caller is not the owner");
		});
		it("Allow modifications by the owner", async () => {
			await setUp();
			await (await DStor.connect(deployer).setMinFileSize(1)).wait(1);
			await (await DStor.connect(deployer).setPinningRate(1)).wait(1);
			await (await DStor.connect(deployer).setFission(client1.address)).wait(1);
			var val;
			val = await DStor.pinningRate();
			expect (val.toString()).to.equal("1");
			val = await DStor.minimumFileSize();
			expect (val.toString()).to.equal("1");
			expect (await DStor.fissionEngine()).to.equal(client1.address);
		});
	});
});

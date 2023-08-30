const connector = require("./connector");
const BlockSchema = require("./models/block.model");
const UserSchema = require("./models/user.model");
const RefferalSchema = require("./models/refferal.model");
const InboxSchema = require("./models/inbox.model");

const { VERIFY } = require("../services/Utils");

class MongoDB {
  constructor(blockChain) {
    connector.myConnect();
    this.blockChain = blockChain;
    this.promise = {};
    this.resolved = {};
    this.newPromise("connected");
    this.newPromise("loaded");
    this.newPromise("disconnected");

    this.savePromises = [];
    blockChain.emitter.on("onBlockCreated", (block) => {
      const promise = this.onBlockCreated(block.index, block);
      this.savePromises.push(promise);
    });

    connector.on("connected", () => {
      this.load();
      this.resolved["connected"]();
    });

    connector.on("disconnected", () => {
      this.resolved["disconnected"]();
    });
  }

  async onBlockCreated(index, block) {
    while (true) {
      try {
        const new_block = new BlockSchema({ index, block });
        await new_block.save();
        return;
      } catch (err) {
        // console.log("Failed to write block to MongoDB:", block.index);
        console.error("Failed to write block to MongoDB:", block.index, err);
        // break;
      }
    }
  }
  async close() {
    console.log("close MongoDB...");
    await this.wait("loaded");

    console.log(
      "Wait For Saving all blocks to MongoDB",
      this.savePromises.length
    );
    await Promise.all(this.savePromises);

    connector.close();
    await this.wait("disconnected");
    console.log("closed. MongoDB ", new Date().toLocaleString());
  }

  newPromise(event) {
    this.promise[event] = new Promise((resolve) => {
      this.resolved[event] = resolve;
    });
  }

  wait(event) {
    // console.log("wait for event:" + event);
    return this.promise[event];
  }

  async waitForSaving() {
    console.log(
      "Wait For Saving all blocks to MongoDB",
      this.savePromises.length
    );

    await Promise.all(this.savePromises);

    this.savePromises = [];
  }

  async getChainLength() {
    const doc = await BlockSchema.findOne()
      .sort({ field: "asc", _id: -1 })
      .limit(1);

    return doc ? doc.index + 1 : 0;
  }

  async load() {
    // this.clearDB();

    try {
      const chainLength = await this.getChainLength();

      if (chainLength === 0) {
        await this.createGenesisRecord().save();
        return;
      }

      this.blockChain.chain = [];

      const LIMIT = 1000;

      for (let cursor = 0; cursor < chainLength; cursor += LIMIT) {
        const docs = await BlockSchema.find({ index: { $gte: cursor } }).limit(
          LIMIT
        );

        VERIFY(docs, "not read the chain length currecly" + docs);

        docs.forEach((doc) => {
          // console.log("Load block: ", doc.block.index, "/", chainLength - 1);
          this.blockChain.addBlock(doc.block);
        });

        console.log("Loaded blocks: ", this.blockChain.chain.length);
      }

      VERIFY(
        this.blockChain.chain.length === chainLength,
        "not read the chain length currecly"
      );
    } catch (err) {
      // console.log("Failed to load from MongoDB");
      // this.clearDB();
      VERIFY(0, "Failed to load from MongoDB" + err);
    } finally {
      console.log(
        "MongoDB completed loaded blocks: ",
        this.blockChain.chain.length
      );
      this.resolved["loaded"]();
    }
  }

  loadBlock(index) {
    return BlockSchema.find({ index });
  }

  async clearDB() {
    await BlockSchema.deleteMany({});
    await UserSchema.deleteMany({});
    await RefferalSchema.deleteMany({});
    await InboxSchema.deleteMany({});
  }

  async addRefferal(refferal) {
    const doc = new RefferalSchema({ refferal });
    return doc.save();
  }

  // async removeRefferal(refferal) {
  //   return RefferalSchema.deleteMany(refferal);
  // }

  async getRefferals() {
    const docs = await RefferalSchema.find({});

    return docs.map((doc) => doc.refferal);
  }
}

module.exports = MongoDB;

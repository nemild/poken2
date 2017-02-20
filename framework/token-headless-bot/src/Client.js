const redis = require('redis'); //npm install node_redis
const SOFA = require('./SOFA');
const Config = require('./Config');
const Session = require('./Session');

const JSONRPC_VERSION = '2.0';
const JSONRPC_REQUEST_CHANNEL = '_rpc_request';
const JSONRPC_RESPONSE_CHANNEL = '_rpc_response';

class Client {
  constructor(bot) {
    this.bot = bot;
    this.rpcCalls = {};
    this.nextRpcId = 0;

    this.config = new Config(process.argv[2]);
    console.log("Address: "+this.config.address);

    let redisConfig = {
      host: this.config.redis.host,
      port: this.config.redis.port,
      password: this.config.redis.password
    }

    this.subscriber = redis.createClient(redisConfig);
    this.rpcSubscriber = redis.createClient(redisConfig);
    this.publisher = redis.createClient(redisConfig);

    this.subscriber.on("error", function (err) {
        console.log("Error " + err);
    });
    this.rpcSubscriber.on("error", function (err) {
        console.log("Error " + err);
    });
    this.publisher.on("error", function (err) {
        console.log("Error " + err);
    });

    this.subscriber.on("message", (channel, message) => {
      try {
        let wrapped = JSON.parse(message);
        if (wrapped.recipient == this.config.address) {
          let session = new Session(this.bot, wrapped.sender, () => {
            let sofa = SOFA.parse(wrapped.sofa);
            this.bot.onMessage(session, sofa);
          });
        }
      } catch(e) {
        console.log("On Message Error: "+e);
      }
    });
    this.subscriber.subscribe(this.config.address);

    this.rpcSubscriber.on("message", (channel, message) => {
      try {
        message = JSON.parse(message);
        if (message.jsonrpc == JSONRPC_VERSION) {
          let stored = this.rpcCalls[message.id];
          delete this.rpcCalls[message.id];
          let session = new Session(this.bot, stored.sessionAddress, () => {
            stored.callback(session, message.error, message.result);
          });
        }
      } catch(e) {
        console.log("On RPC Message Error: "+e);
      }
    })
    this.rpcSubscriber.subscribe(this.config.address+JSONRPC_RESPONSE_CHANNEL);
  }

  send(session, message) {
    if (typeof message === "string") {
      message = SOFA.Message({body: message})
    }
    this.publisher.publish(this.config.address, JSON.stringify({
      sofa: message.string,
      sender: this.config.address,
      recipient: session.address
    }));
  }

  rpc(session, rpcCall, callback) {
    rpcCall.id = this.getRpcId();
    this.rpcCalls[rpcCall.id] = {sessionAddress: session.address, callback: callback};
    this.publisher.publish(this.config.address+JSONRPC_REQUEST_CHANNEL, JSON.stringify(rpcCall));
  }

  getRpcId() {
    let id = this.nextRpcId;
    this.nextRpcId += 1;
    return id.toString();
  }
}

module.exports = Client;
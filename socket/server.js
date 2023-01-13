var SerialPort = require('serialport');
var xbee_api = require('xbee-api');
var C = xbee_api.constants;
var storage = require("./storage")
require('dotenv').config()

const VALUE_DISABLED = [0x0];
const VALUE_LOW = [0x04];
const SERIAL_PORT = process.env.SERIAL_PORT;

var xbeeAPI = new xbee_api.XBeeAPI({
  api_mode: 2
});

let serialport = new SerialPort(SERIAL_PORT, {
  baudRate: parseInt(process.env.SERIAL_BAUDRATE) || 9600,
}, function (err) {
  if (err) {
    return console.log('Error: ', err.message)
  }
});

serialport.pipe(xbeeAPI.parser);
xbeeAPI.builder.pipe(serialport);


serialport.on("open", function () {
  var frame_obj = { // AT Request to be sent
    type: C.FRAME_TYPE.REMOTE_AT_COMMAND_REQUEST,
    destination64: "FFFFFFFFFFFFFFFF",
    //destination16: "fffe", // optional, "fffe" is default
    //remoteCommandOptions: 0x02, // optional, 0x02 is default
    command: "D0",
    commandParameter: [0x00] // Can either be string or byte array.
  };

  xbeeAPI.builder.write(frame_obj);

  var frame_obj = { // AT Request to be sent
    type: C.FRAME_TYPE.REMOTE_AT_COMMAND_REQUEST,
    destination64: "FFFFFFFFFFFFFFFF",
    //destination16: "fffe", // optional, "fffe" is default
    //remoteCommandOptions: 0x02, // optional, 0x02 is default
    command: "D1",
    commandParameter: [0x00] // Can either be string or byte array.
  };

  xbeeAPI.builder.write(frame_obj);
  var frame_obj = { // AT Request to be sent
    type: C.FRAME_TYPE.REMOTE_AT_COMMAND_REQUEST,
    destination64: "FFFFFFFFFFFFFFFF",
    //destination16: "fffe", // optional, "fffe" is default
    //remoteCommandOptions: 0x02, // optional, 0x02 is default
    command: "D0",
    commandParameter: VALUE_LOW // Can either be string or byte array.
  };

  xbeeAPI.builder.write(frame_obj);

});

// All frames parsed by the XBee will be emitted here

storage.listSensors().then((sensors) => sensors.forEach((sensor) => console.log(sensor.data())))

xbeeAPI.parser.on("data", function (frame) {

  //on new device is joined, register it

  //on packet received, dispatch event
  //let dataReceived = String.fromCharCode.apply(null, frame.data);
  if (C.FRAME_TYPE.ZIGBEE_RECEIVE_PACKET === frame.type) {
    //console.log("C.FRAME_TYPE.ZIGBEE_RECEIVE_PACKET");
    let dataReceived = String.fromCharCode.apply(null, frame.data);
   // console.log(">> ZIGBEE_RECEIVE_PACKET >", dataReceived);
    console.log(frame)
    storage.registerSensor(frame.remote64, dataReceived)
    console.log(parseInt(dataReceived))
    if(parseInt(dataReceived)<200)
    ledrouge(frame.remote16)
    else
    ledverte(frame.remote16);
    //storage.registerSensor(frame.remote64)
  }

  if (C.FRAME_TYPE.NODE_IDENTIFICATION === frame.type) {
    //let dataReceived = String.fromCharCode.apply(null, frame.nodeIdentifier);
    console.log("NODE_IDENTIFICATION");
    storage.registerSensor(frame.remote64)

  } else if (C.FRAME_TYPE.ZIGBEE_IO_DATA_SAMPLE_RX === frame.type) {

    console.log("ZIGBEE_IO_DATA_SAMPLE_RX")
    console.log(frame.analogSamples.AD0)
    storage.registerSample(frame.remote64,frame.analogSamples.AD0 )

  } else if (C.FRAME_TYPE.REMOTE_COMMAND_RESPONSE === frame.type) {
    console.log("REMOTE_COMMAND_RESPONSE")
    console.log(frame);
    console.log(String.fromCharCode.apply(null, frame.commandData));
  }else if (C.FRAME_TYPE.AT_COMMAND_RESPONSE === frame.type) {
    console.log("AT_COMMAND_RESPONSE")
    console.log(frame)
    let dataReceived = String.fromCharCode.apply(null, frame.commandData);
    console.log(dataReceived)
    storage.registerSensor(dataReceived)
  } else {
    console.debug(frame);
    let dataReceived = String.fromCharCode.apply(null, frame.commandData)
    console.log(dataReceived);
  }

});

  ledrouge = function (at) {

    var frame_obj = { // AT Request to be sent
      type: C.FRAME_TYPE.REMOTE_AT_COMMAND_REQUEST,
      destination16: at ,
      //destination16: "fffe", // optional, "fffe" is default
      //remoteCommandOptions: 0x02, // optional, 0x02 is default
      command: "D0",
      commandParameter: VALUE_DISABLED // Can either be string or byte array.
    };
  
    xbeeAPI.builder.write(frame_obj);

    var frame_obj = { // AT Request to be sent
      type: C.FRAME_TYPE.REMOTE_AT_COMMAND_REQUEST,
      destination16: at,
      //destination16: "fffe", // optional, "fffe" is default
      //remoteCommandOptions: 0x02, // optional, 0x02 is default
      command: "D1",
      commandParameter: VALUE_LOW // Can either be string or byte array.
    };
  
    xbeeAPI.builder.write(frame_obj);
  

}

ledverte = function (at) {

  var frame_obj = { // AT Request to be sent
    type: C.FRAME_TYPE.REMOTE_AT_COMMAND_REQUEST,
    destination16: at,
    //destination16: "fffe", // optional, "fffe" is default
    //remoteCommandOptions: 0x02, // optional, 0x02 is default
    command: "D1",
    commandParameter: VALUE_DISABLED // Can either be string or byte array.
  };

  xbeeAPI.builder.write(frame_obj);

  var frame_obj = { // AT Request to be sent
    type: C.FRAME_TYPE.REMOTE_AT_COMMAND_REQUEST,
    destination16: at,
    //destination16: "fffe", // optional, "fffe" is default
    //remoteCommandOptions: 0x02, // optional, 0x02 is default
    command: "D0",
    commandParameter: VALUE_LOW // Can either be string or byte array.
  };

  xbeeAPI.builder.write(frame_obj);


}


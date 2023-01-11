const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();


module.exports.registerSensor = async function (address, distance) {

  const docRef = db.collection('equit').doc(address);

  const sensor = {
    distance: distance,
    adresse_mac_remote64_xbee: address,
    date: Date.now(),
  }

  await docRef.get().then((snapshotDoc)=> {
    if (!snapshotDoc.exists)
      docRef.set(sensor);
    else
      docRef.update(sensor);
  })
}

module.exports.registerSample = async function (dataReceived, sample) {

  const docRef = db.collection('sensors').doc(dataReceived)
    .collection('samples').doc(Date.now().toString());

  const data = {
    value: sample,
    date: Date.now(),
  }
  await docRef.set(data);


}

module.exports.listSensors = function () {

  const docRef = db.collection('sensors');

  return docRef.get()

}


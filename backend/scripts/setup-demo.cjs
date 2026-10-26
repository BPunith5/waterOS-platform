const mongoose = require('mongoose');
const fs = require('fs');

const MONGO_URI = 'mongodb+srv://BPunith:12345678%3A%29@wateros.fan8iud.mongodb.net/waterOS?retryWrites=true&w=majority&appName=WATEROS';

async function main() {
  await mongoose.connect(MONGO_URI);
  const Device = mongoose.model('Device', new mongoose.Schema({}, { strict: false }), 'devices');
  const Tank   = mongoose.model('Tank',   new mongoose.Schema({}, { strict: false }), 'tanks');
  const User   = mongoose.model('User',   new mongoose.Schema({}, { strict: false }), 'users');

  const user = await User.findOne({ email: 'aetosdios.007@gmail.com' }).lean();
  console.log('User found:', user.email);

  // Remove any existing demo tanks
  await Tank.deleteMany({ tankName: 'Demo Tank', userId: user._id });

  const tank = await Tank.create({
    tankName: 'Demo Tank', tankType: 'drinking', capacity: 5000,
    location: 'Rooftop', userId: user._id, fillLevel: 0, currentVolume: 0,
  });
  console.log('Tank created:', tank._id.toString());

  const device = await Device.findOne({ deviceId: 'WTR69S5CJ2DZCQ83' }).select('+secretKey').lean();
  await Device.updateOne(
    { deviceId: 'WTR69S5CJ2DZCQ83' },
    { $set: { status: 'active', userId: user._id, tankId: tank._id, claimedBy: user._id, claimedAt: new Date(), lastSeen: new Date() } }
  );
  console.log('Device activated');

  // Write credentials to mqtt-demo directory (not printed to stdout)
  const creds = { deviceId: device.deviceId, secretKey: device.secretKey, tankId: tank._id.toString() };
  fs.writeFileSync('C:/Users/punee/mqtt-demo/.demo-creds.json', JSON.stringify(creds, null, 2));
  console.log('Credentials saved to C:/Users/punee/mqtt-demo/.demo-creds.json');

  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });

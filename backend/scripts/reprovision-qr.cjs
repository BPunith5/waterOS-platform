// Regenerates QR codes for all existing devices so QR encodes deviceId (not old registrationCode)
const mongoose = require('mongoose');
const QRCode = require('qrcode');

const MONGO_URI = 'mongodb+srv://BPunith:12345678%3A%29@wateros.fan8iud.mongodb.net/waterOS?retryWrites=true&w=majority&appName=WATEROS';

async function generateQr(deviceId) {
  return QRCode.toDataURL(deviceId, { errorCorrectionLevel: 'H', margin: 2, width: 256 });
}

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const Device = mongoose.model('Device', new mongoose.Schema({}, { strict: false }), 'devices');
  const devices = await Device.find({}).lean();
  console.log(`Found ${devices.length} devices`);

  let updated = 0;
  for (const device of devices) {
    const deviceId = device.deviceId;
    if (!deviceId) { console.log(`Skipping device with no deviceId: ${device._id}`); continue; }

    const newQr = await generateQr(deviceId);
    await Device.updateOne(
      { _id: device._id },
      { $set: { registrationCode: deviceId, qrCode: newQr } }
    );
    console.log(`✅ Updated ${deviceId}`);
    updated++;
  }

  console.log(`\nDone — updated ${updated} devices`);
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });

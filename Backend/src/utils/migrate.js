/**
 * MongoDB Migration Script
 * Old DB → New DB
 * Run: node src/utils/migrate.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

const OLD_URI = 'mongodb+srv://cheemamilkshop:cheemamilk@cluster0.cjhatta.mongodb.net/cheema_milk_shop?retryWrites=true&w=majority';
const NEW_URI = 'mongodb+srv://cheemamalik23_db_user:lW51lN8OmzKw82Ds@cheema.qjvreeo.mongodb.net/cheema_milk_shop?retryWrites=true&w=majority';

// Collections jo copy karni hain
const COLLECTIONS = [
  'users',
  'vehicles',
  'routes',
  'routecollections',
  'milkrecords',
  'dispatches',
  'advancetransactions',
  'accountrecords',
  'labreports',
  'purchaseledgers',
  'saleledgers',
  'supplierprofiles',
  'customerprofiles',
  'appsettings',
  'synclogs',
  'purchasedrafts',
];

async function migrate() {
  console.log('🔄 Connecting to OLD database...');
  const oldConn = await mongoose.createConnection(OLD_URI).asPromise();
  console.log('✅ Old DB connected:', oldConn.name);

  console.log('🔄 Connecting to NEW database...');
  const newConn = await mongoose.createConnection(NEW_URI).asPromise();
  console.log('✅ New DB connected:', newConn.name);

  const oldDb = oldConn.db;
  const newDb = newConn.db;

  // Actual collections list fetch karo (sirf jo exist karti hain)
  const existingCollections = await oldDb.listCollections().toArray();
  const existingNames = existingCollections.map(c => c.name);
  console.log('\n📋 Old DB mein collections:', existingNames.join(', ') || 'None found');

  let totalCopied = 0;

  for (const colName of existingNames) {
    try {
      const docs = await oldDb.collection(colName).find({}).toArray();
      if (docs.length === 0) {
        console.log(`⏭  ${colName}: empty, skip`);
        continue;
      }

      // New DB mein pehle se data ho toh clear karo (fresh copy)
      await newDb.collection(colName).deleteMany({});

      // Insert karo
      await newDb.collection(colName).insertMany(docs);
      console.log(`✅ ${colName}: ${docs.length} documents copied`);
      totalCopied += docs.length;
    } catch (err) {
      console.error(`❌ ${colName}: Error — ${err.message}`);
    }
  }

  console.log(`\n🎉 Migration complete! Total documents copied: ${totalCopied}`);

  await oldConn.close();
  await newConn.close();
  process.exit(0);
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});

/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const cyclesCol = app.findCollectionByNameOrId("cycles");
  
  // Check if One-Time already exists to avoid duplication
  try {
    app.findFirstRecordByData("cycles", "name", "One-Time");
  } catch (_) {
    const record = new Record(cyclesCol);
    record.set("name", "One-Time");
    app.save(record);
  }
}, (app) => {
  try {
    const record = app.findFirstRecordByData("cycles", "name", "One-Time");
    if (record) app.delete(record);
  } catch (_) {}
});

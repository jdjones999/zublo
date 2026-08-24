/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const categoriesCol = app.findCollectionByNameOrId("categories");

  // Prevent duplicate creation if Housing already exists
  try {
    app.findFirstRecordByData("categories", "name", "Housing");
  } catch (_) {
    const record = new Record(categoriesCol);
    record.set("name", "Housing");
    app.save(record);
  }
}, (app) => {
  try {
    const record = app.findFirstRecordByData("categories", "name", "Housing");
    if (record) app.delete(record);
  } catch (_) {}
});

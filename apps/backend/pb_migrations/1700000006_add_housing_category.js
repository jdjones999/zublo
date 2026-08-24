/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const categoriesCol = app.findCollectionByNameOrId("categories");

  try {
    app.findFirstRecordByData("categories", "name", "Housing");
  } catch (_) {
    const record = new Record(categoriesCol);
    record.set("name", "Housing");

    // Use saveNoValidate to allow system-seeded categories without an assigned user ID
    app.saveNoValidate(record);
  }
}, (app) => {
  try {
    const record = app.findFirstRecordByData("categories", "name", "Housing");
    if (record) app.delete(record);
  } catch (_) {}
});

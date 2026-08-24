/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const categoriesCol = app.findCollectionByNameOrId("categories");

  try {
    app.findFirstRecordByData("categories", "name", "Housing");
  } catch (_) {
    // Find the primary/first user in the database to satisfy the 'user' requirement
    let firstUser;
    try {
      firstUser = app.findFirstRecordByData("users", "", "");
    } catch (_) {
      // If no users exist yet during initial boot, skip until first user setup
      return;
    }

    if (firstUser) {
      const record = new Record(categoriesCol);
      record.set("name", "Housing");
      record.set("user", firstUser.id);
      app.save(record);
    }
  }
}, (app) => {
  try {
    const record = app.findFirstRecordByData("categories", "name", "Housing");
    if (record) app.delete(record);
  } catch (_) {}
});

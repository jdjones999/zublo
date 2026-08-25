/** @type {import('pocketbase').Migration} */
export const up = async ({ db }) => {
  const collection = await db.collection("subscriptions").findOne({});
  await db.collection("subscriptions").update({
    ...collection,
    schema: [
      ...collection.schema,
      {
        name: "is_income",
        type: "bool",
        required: false,
        system: false,
      },
    ],
  });
};

export const down = async ({ db }) => {
  const collection = await db.collection("subscriptions").findOne({});
  await db.collection("subscriptions").update({
    ...collection,
    schema: collection.schema.filter(
      (field) => field.name !== "is_income"
    ),
  });
};

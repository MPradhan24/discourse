import { acceptance } from "helpers/qunit-helpers";

acceptance("DiscourseCNLToSQL", { loggedIn: true });

test("DiscourseCNLToSQL works", async assert => {
  await visit("/admin/plugins/discourse-CNLToSQL");

  assert.ok(false, "it shows the DiscourseCNLToSQL button");
});

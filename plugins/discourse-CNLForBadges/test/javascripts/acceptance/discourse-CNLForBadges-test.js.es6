import { acceptance } from "helpers/qunit-helpers";

acceptance("DiscourseCNLForBadges", { loggedIn: true });

test("DiscourseCNLForBadges works", async assert => {
  await visit("/admin/plugins/discourse-CNLForBadges");

  assert.ok(false, "it shows the DiscourseCNLForBadges button");
});

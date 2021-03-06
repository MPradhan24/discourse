import selectKit from "helpers/select-kit-helper";
import { acceptance, logIn } from "helpers/qunit-helpers";

acceptance("New Topic");

QUnit.test("accessing new-topic route when logged out", async assert => {
  await visit("/new-topic?title=topic%20title&body=topic%20body");

  assert.ok(exists(".modal.login-modal"), "it shows the login modal");
});

QUnit.test("accessing new-topic route when logged in", async assert => {
  logIn();
  Discourse.reset();

  await visit("/new-topic?title=topic%20title&body=topic%20body&category=bug");

  assert.ok(exists(".composer-fields"), "it opens composer");
  assert.equal(
    find("#reply-title")
      .val()
      .trim(),
    "topic title",
    "it pre-fills topic title"
  );
  assert.equal(
    find(".d-editor-input")
      .val()
      .trim(),
    "topic body",
    "it pre-fills topic body"
  );
  assert.equal(
    selectKit(".category-chooser")
      .header()
      .value(),
    1,
    "it selects desired category"
  );
});
